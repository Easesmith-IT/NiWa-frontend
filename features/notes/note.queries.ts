import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { v1QueryKeys } from "../../lib/api/v1-query-keys";
import { createNoteV1, deleteNoteV1, listNotesV1, patchNoteV1, pinNoteV1, unpinNoteV1 } from "./note.api";
import { mapNoteRecordV1 } from "./note.mappers";

export const useContactNotesV1Query = (contactId: string) =>
  useQuery({
    enabled: Boolean(contactId),
    queryKey: [...v1QueryKeys.notes, contactId],
    queryFn: async () => {
      const result = await listNotesV1(contactId);
      return {
        ...result,
        data: result.data.map(mapNoteRecordV1),
      };
    },
  });

export const useCreateContactNoteV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: string; payload: Parameters<typeof createNoteV1>[1] }) =>
      createNoteV1(contactId, payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...v1QueryKeys.notes, variables.contactId] }),
        queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
      ]);
    },
  });
};

const invalidateNoteSurfaces = async (
  queryClient: ReturnType<typeof useQueryClient>,
  contactId: string,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...v1QueryKeys.notes, contactId] }),
    queryClient.invalidateQueries({ queryKey: v1QueryKeys.inboxThread }),
  ]);
};

export const usePatchNoteV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: { content: string } }) =>
      patchNoteV1(noteId, payload),
    onSuccess: async (result) => {
      const contactId = String(result.data.contactId ?? "");
      if (contactId) {
        await invalidateNoteSurfaces(queryClient, contactId);
      }
    },
  });
};

export const useDeleteNoteV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNoteV1,
    onSuccess: async (result) => {
      const contactId = String(result.data.contactId ?? "");
      if (contactId) {
        await invalidateNoteSurfaces(queryClient, contactId);
      }
    },
  });
};

export const useSetNotePinnedV1Mutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, pinned }: { noteId: string; pinned: boolean }) =>
      (pinned ? pinNoteV1(noteId) : unpinNoteV1(noteId)),
    onSuccess: async (result) => {
      const contactId = String(result.data.contactId ?? "");
      if (contactId) {
        await invalidateNoteSurfaces(queryClient, contactId);
      }
    },
  });
};
