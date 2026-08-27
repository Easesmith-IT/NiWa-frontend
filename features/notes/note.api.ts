import type { ListResponse } from "../../lib/api/api-types";
import { apiClient } from "../../lib/api/api-client";
import type { NoteRecord } from "./note.types";

export const listNotes = async (contactId: string) => {
  const response = await apiClient.get<ListResponse<NoteRecord>>(`/contacts/${contactId}/notes`);
  return response.data;
};

export const createNote = async (
  contactId: string,
  payload: {
    content: string;
    conversationId?: string;
    pinned?: boolean;
  },
) => {
  const response = await apiClient.post<{ data: NoteRecord }>(`/contacts/${contactId}/notes`, {
    content: payload.content,
    conversationId: payload.conversationId,
    pinned: payload.pinned ?? false,
  });
  return response.data;
};

export const patchNote = async (noteId: string, payload: { content: string }) => {
  const response = await apiClient.patch<{ data: NoteRecord }>(`/notes/${noteId}`, payload);
  return response.data;
};

export const deleteNote = async (noteId: string) => {
  const response = await apiClient.delete<{ data: NoteRecord }>(`/notes/${noteId}`);
  return response.data;
};

export const pinNote = async (noteId: string) => {
  const response = await apiClient.post<{ data: NoteRecord }>(`/notes/${noteId}/pin`);
  return response.data;
};

export const unpinNote = async (noteId: string) => {
  const response = await apiClient.post<{ data: NoteRecord }>(`/notes/${noteId}/unpin`);
  return response.data;
};
