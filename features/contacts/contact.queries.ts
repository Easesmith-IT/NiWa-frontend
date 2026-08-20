"use client";

import { useState, useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  addContactLabelV1,
  createContactV1,
  deleteContactV1,
  getContactDuplicatesV1,
  listContactsV1,
  mergeContactsV1,
  patchContactV1,
  removeContactLabelV1,
  uploadContactImportV1,
  validateContactImportV1,
  commitContactImportV1,
  getContactImportV1,
  listContactImportsV1,
} from "./contact.api";
import { mapContactRecordV1 } from "./contact.mappers";

const invalidateContactSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.contacts }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.inbox }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.tasks }),
  ]);
};

export const useContactsV1Query = (params?: { search?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...v1QueryKeys.contacts, params?.search ?? "", params?.page, params?.limit],
    queryFn: async () => {
      const result = await listContactsV1(params);
      return {
        ...result,
        data: result.data.map(mapContactRecordV1),
      };
    },
  });

export const useContactImportsV1Query = () =>
  useQuery({
    queryKey: [...v1QueryKeys.contacts, "imports"],
    queryFn: async () => {
      return listContactImportsV1();
    },
  });

export const useContactDuplicatesV1Query = (params?: {
  field?: "phoneNumber" | "phoneNumberE164" | "waId";
}) =>
  useQuery({
    queryKey: [...v1QueryKeys.contacts, "duplicates", params?.field ?? "phoneNumberE164"],
    queryFn: () => getContactDuplicatesV1(params),
  });

export const useCreateContactV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContactV1,
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const usePatchContactV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: string; payload: Parameters<typeof patchContactV1>[1] }) =>
      patchContactV1(contactId, payload),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useDeleteContactV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContactV1,
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useAddContactLabelV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, labelId }: { contactId: string; labelId: string }) =>
      addContactLabelV1(contactId, labelId),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useRemoveContactLabelV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, labelId }: { contactId: string; labelId: string }) =>
      removeContactLabelV1(contactId, labelId),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useMergeContactsV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mergeContactsV1,
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

// Contact Import API / Query Hooks
export const useUploadContactImportV1Mutation = () =>
  useMutation({
    mutationFn: (file: File) => uploadContactImportV1(file),
  });

export const useValidateContactImportV1Mutation = () =>
  useMutation({
    mutationFn: ({ importId, columnMapping }: { importId: string; columnMapping: Record<string, string> }) =>
      validateContactImportV1(importId, { columnMapping }),
  });

export const useCommitContactImportV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) => commitContactImportV1(importId),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
      queryClient.invalidateQueries({ queryKey: [...v1QueryKeys.contacts, "imports"] });
    },
  });
};

export const useContactImportStatusV1Query = (importId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: [...v1QueryKeys.contacts, "imports", "status", importId],
    queryFn: () => getContactImportV1(importId!),
    enabled: Boolean(importId && enabled),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "ready" || status === "failed") {
        return false;
      }
      return 1000;
    },
  });

export interface ProcessContactImportOptions {
  onSuccess?: (importId: string) => void;
  onError?: (error: string) => void;
}

export const useContactImportPipelineV1 = () => {
  const queryClient = useQueryClient();
  const [activeImportId, setActiveImportId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [statusStep, setStatusStep] = useState<"" | "uploading" | "validating" | "commit" | "polling">("");
  const [pipelineError, setPipelineError] = useState<string>("");

  const uploadMutation = useUploadContactImportV1Mutation();
  const validateMutation = useValidateContactImportV1Mutation();
  const commitMutation = useCommitContactImportV1Mutation();

  const statusQuery = useContactImportStatusV1Query(activeImportId, isPolling);

  const attemptCountRef = useRef(0);
  const callbacksRef = useRef<ProcessContactImportOptions>({});

  const processImport = async (file: File, options?: ProcessContactImportOptions) => {
    callbacksRef.current = options || {};
    setActiveImportId(null);
    setIsPolling(false);
    attemptCountRef.current = 0;
    setPipelineError("");
    setStatusStep("uploading");

    try {
      // 1. Upload File
      const uploadedRecord = await uploadMutation.mutateAsync(file);
      const newImportId = uploadedRecord.id;

      // 2. Validate Import
      setStatusStep("validating");
      await validateMutation.mutateAsync({
        importId: newImportId,
        columnMapping: {
          displayName: "displayName",
          phoneNumber: "phoneNumber",
          email: "email",
        },
      });

      // 3. Commit Import
      setStatusStep("commit");
      await commitMutation.mutateAsync(newImportId);

      // 4. Start Polling
      setStatusStep("polling");
      setActiveImportId(newImportId);
      setIsPolling(true);
    } catch (err: unknown) {
      setStatusStep("");
      const msg = isAxiosError(err)
        ? err.response?.data?.message
        : err instanceof Error
        ? err.message
        : "Failed to process contact file.";
      const finalMsg = msg || "Failed to process contact file.";
      setPipelineError(finalMsg);
      callbacksRef.current.onError?.(finalMsg);
    }
  };

  useEffect(() => {
    if (!isPolling || !activeImportId || !statusQuery.data) return;

    const currentStatus = statusQuery.data.status;

    if (currentStatus === "completed" || currentStatus === "ready") {
      setIsPolling(false);
      setStatusStep("");
      const completedId = activeImportId;
      setActiveImportId(null);
      invalidateContactSurfaces(queryClient);
      queryClient.invalidateQueries({ queryKey: [...v1QueryKeys.contacts, "imports"] });
      callbacksRef.current.onSuccess?.(completedId);
    } else if (currentStatus === "failed") {
      setIsPolling(false);
      setStatusStep("");
      setActiveImportId(null);
      const errorMsg = "Contact import failed on server.";
      setPipelineError(errorMsg);
      callbacksRef.current.onError?.(errorMsg);
    } else {
      attemptCountRef.current += 1;
      if (attemptCountRef.current >= 20) {
        setIsPolling(false);
        setStatusStep("");
        setActiveImportId(null);
        const timeoutMsg = "Contact import timed out while processing.";
        setPipelineError(timeoutMsg);
        callbacksRef.current.onError?.(timeoutMsg);
      }
    }
  }, [isPolling, activeImportId, statusQuery.data, statusQuery.dataUpdatedAt, queryClient]);

  const isProcessing =
    uploadMutation.isPending ||
    validateMutation.isPending ||
    commitMutation.isPending ||
    isPolling;

  let progressText = "";
  if (statusStep === "uploading") progressText = "Uploading file...";
  else if (statusStep === "validating") progressText = "Validating contact columns...";
  else if (statusStep === "commit" || statusStep === "polling") progressText = "Importing contacts into workspace...";

  return {
    processImport,
    isProcessing,
    progressText,
    pipelineError,
  };
};
