import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../lib/api/query-keys";
import { createNote, deleteNote, listNotes, patchNote, pinNote, unpinNote } from "./note.api";
import { mapNoteRecord } from "./note.mappers";

export const useContactNotesQuery = (contactId: string) =>
  useQuery({
    enabled: Boolean(contactId),
    queryKey: [...queryKeys.notes, contactId],
    queryFn: async () => {
      const result = await listNotes(contactId);
      return {
        ...result,
        data: result.data.map(mapNoteRecord),
      };
    },
  });

export const useCreateContactNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: string; payload: Parameters<typeof createNote>[1] }) =>
      createNote(contactId, payload),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...queryKeys.notes, variables.contactId] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
      ]);
    },
  });
};

const invalidateNoteSurfaces = async (
  queryClient: ReturnType<typeof useQueryClient>,
  contactId: string,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...queryKeys.notes, contactId] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.inboxThread }),
  ]);
};

export const usePatchNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: { content: string } }) =>
      patchNote(noteId, payload),
    onSuccess: async (result) => {
      const contactId = String(result.data.contactId ?? "");
      if (contactId) {
        await invalidateNoteSurfaces(queryClient, contactId);
      }
    },
  });
};

export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: async (result) => {
      const contactId = String(result.data.contactId ?? "");
      if (contactId) {
        await invalidateNoteSurfaces(queryClient, contactId);
      }
    },
  });
};

export const useSetNotePinnedMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, pinned }: { noteId: string; pinned: boolean }) =>
      (pinned ? pinNote(noteId) : unpinNote(noteId)),
    onSuccess: async (result) => {
      const contactId = String(result.data.contactId ?? "");
      if (contactId) {
        await invalidateNoteSurfaces(queryClient, contactId);
      }
    },
  });
};
