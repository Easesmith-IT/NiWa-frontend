"use client";

import { useState, useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import {
  addContactLabel,
  createContact,
  deleteContact,
  getContactDuplicates,
  listContacts,
  mergeContacts,
  patchContact,
  removeContactLabel,
  uploadContactImport,
  validateContactImport,
  commitContactImport,
  getContactImport,
  listContactImports,
} from "./contact.api";
import { mapContactRecord } from "./contact.mappers";

const invalidateContactSurfaces = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inbox }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
  ]);
};

export const useContactsQuery = (params?: { search?: string; page?: number; limit?: number }) =>
  useQuery({
    queryKey: [...queryKeys.contacts, params?.search ?? "", params?.page, params?.limit],
    queryFn: async () => {
      const result = await listContacts(params);
      return {
        ...result,
        data: result.data.map(mapContactRecord),
      };
    },
  });

export const useContactImportsQuery = () =>
  useQuery({
    queryKey: [...queryKeys.contacts, "imports"],
    queryFn: async () => {
      return listContactImports();
    },
  });

export const useContactDuplicatesQuery = (params?: {
  field?: "phoneNumber" | "phoneNumberE164" | "waId";
}) =>
  useQuery({
    queryKey: [...queryKeys.contacts, "duplicates", params?.field ?? "phoneNumberE164"],
    queryFn: () => getContactDuplicates(params),
  });

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const usePatchContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: string; payload: Parameters<typeof patchContact>[1] }) =>
      patchContact(contactId, payload),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useAddContactLabelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, labelId }: { contactId: string; labelId: string }) =>
      addContactLabel(contactId, labelId),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useRemoveContactLabelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, labelId }: { contactId: string; labelId: string }) =>
      removeContactLabel(contactId, labelId),
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

export const useMergeContactsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mergeContacts,
    onSuccess: async () => {
      await invalidateContactSurfaces(queryClient);
    },
  });
};

// Contact Import API / Query Hooks
export const useUploadContactImportMutation = () =>
  useMutation({
    mutationFn: (file: File) => uploadContactImport(file),
  });

export const useValidateContactImportMutation = () =>
  useMutation({
    mutationFn: ({ importId, columnMapping }: { importId: string; columnMapping: Record<string, string> }) =>
      validateContactImport(importId, { columnMapping }),
  });

export const useCommitContactImportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) => commitContactImport(importId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.contacts, "imports"] });
    },
  });
};

export const useContactImportStatusQuery = (importId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: [...queryKeys.contacts, "imports", "status", importId],
    queryFn: () => getContactImport(importId!),
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

export const useContactImportPipeline = () => {
  const queryClient = useQueryClient();
  const [activeImportId, setActiveImportId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [statusStep, setStatusStep] = useState<"" | "uploading" | "validating" | "commit" | "polling">("");
  const [pipelineError, setPipelineError] = useState<string>("");

  const uploadMutation = useUploadContactImportMutation();
  const validateMutation = useValidateContactImportMutation();
  const commitMutation = useCommitContactImportMutation();

  const statusQuery = useContactImportStatusQuery(activeImportId, isPolling);

  const activePipelineIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const pollingStartedAtRef = useRef(0);
  const callbacksRef = useRef<ProcessContactImportOptions>({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const processImport = async (file: File, options?: ProcessContactImportOptions) => {
    const pipelineId = ++activePipelineIdRef.current;
    callbacksRef.current = options || {};
    setActiveImportId(null);
    setIsPolling(false);
    pollingStartedAtRef.current = 0;
    setPipelineError("");
    setStatusStep("uploading");

    try {
      // 1. Upload File
      const uploadedRecord = await uploadMutation.mutateAsync(file);
      if (!isMountedRef.current || pipelineId !== activePipelineIdRef.current) return;

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
      if (!isMountedRef.current || pipelineId !== activePipelineIdRef.current) return;

      // 3. Commit Import
      setStatusStep("commit");
      await commitMutation.mutateAsync(newImportId);
      if (!isMountedRef.current || pipelineId !== activePipelineIdRef.current) return;

      // 4. Start Polling
      setStatusStep("polling");
      pollingStartedAtRef.current = Date.now();
      setActiveImportId(newImportId);
      setIsPolling(true);
    } catch (err: unknown) {
      if (!isMountedRef.current || pipelineId !== activePipelineIdRef.current) return;
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
    if (!isPolling || !activeImportId || !isMountedRef.current) return;

    const currentPipelineId = activePipelineIdRef.current;
    const elapsed = Date.now() - pollingStartedAtRef.current;

    // 1. Authoritative 20-second deadline check regardless of statusQuery.data presence
    if (elapsed >= 20000) {
      setIsPolling(false);
      setStatusStep("");
      setActiveImportId(null);
      const timeoutMsg = "Contact import timed out while processing.";
      if (isMountedRef.current && currentPipelineId === activePipelineIdRef.current) {
        setPipelineError(timeoutMsg);
        callbacksRef.current.onError?.(timeoutMsg);
      }
      return;
    }

    // 2. Data evaluation when statusQuery.data is present
    if (!statusQuery.data) return;

    const currentStatus = statusQuery.data.status;

    if (currentStatus === "completed" || currentStatus === "ready") {
      setIsPolling(false);
      setStatusStep("");
      const completedId = activeImportId;
      setActiveImportId(null);
      invalidateContactSurfaces(queryClient);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.contacts, "imports"] });
      if (isMountedRef.current && currentPipelineId === activePipelineIdRef.current) {
        callbacksRef.current.onSuccess?.(completedId);
      }
    } else if (currentStatus === "failed") {
      setIsPolling(false);
      setStatusStep("");
      setActiveImportId(null);
      const errorMsg = "Contact import failed on server.";
      if (isMountedRef.current && currentPipelineId === activePipelineIdRef.current) {
        setPipelineError(errorMsg);
        callbacksRef.current.onError?.(errorMsg);
      }
    }
  }, [
    isPolling,
    activeImportId,
    statusQuery.data,
    statusQuery.dataUpdatedAt,
    statusQuery.errorUpdatedAt,
    statusQuery.fetchStatus,
    queryClient,
  ]);

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
