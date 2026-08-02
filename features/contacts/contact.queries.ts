import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import {
  addContactLabelV1,
  createContactV1,
  deleteContactV1,
  getContactDuplicatesV1,
  importContactsV1,
  listContactsV1,
  mergeContactsV1,
  patchContactV1,
  removeContactLabelV1,
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

export const useContactsV1Query = (params?: { search?: string }) =>
  useQuery({
    queryKey: [...v1QueryKeys.contacts, params?.search ?? ""],
    queryFn: async () => {
      const result = await listContactsV1(params);
      return {
        ...result,
        data: result.data.map(mapContactRecordV1),
      };
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

export const useImportContactsV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importContactsV1,
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
