import type { V1ListResponse } from "../../lib/api/v1-types";
import { v1ApiClient } from "../../lib/api/v1-client";
import type { NoteRecordV1 } from "./note.types";

export const listNotesV1 = async (contactId: string) => {
  const response = await v1ApiClient.get<V1ListResponse<NoteRecordV1>>(`/contacts/${contactId}/notes`);
  return response.data;
};

export const createNoteV1 = async (
  contactId: string,
  payload: {
    content: string;
    conversationId?: string;
    pinned?: boolean;
  },
) => {
  const response = await v1ApiClient.post<{ data: NoteRecordV1 }>(`/contacts/${contactId}/notes`, {
    content: payload.content,
    conversationId: payload.conversationId,
    pinned: payload.pinned ?? false,
  });
  return response.data;
};

export const patchNoteV1 = async (noteId: string, payload: { content: string }) => {
  const response = await v1ApiClient.patch<{ data: NoteRecordV1 }>(`/notes/${noteId}`, payload);
  return response.data;
};

export const deleteNoteV1 = async (noteId: string) => {
  const response = await v1ApiClient.delete<{ data: NoteRecordV1 }>(`/notes/${noteId}`);
  return response.data;
};

export const pinNoteV1 = async (noteId: string) => {
  const response = await v1ApiClient.post<{ data: NoteRecordV1 }>(`/notes/${noteId}/pin`);
  return response.data;
};

export const unpinNoteV1 = async (noteId: string) => {
  const response = await v1ApiClient.post<{ data: NoteRecordV1 }>(`/notes/${noteId}/unpin`);
  return response.data;
};
