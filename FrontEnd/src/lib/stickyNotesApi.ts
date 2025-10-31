import axios from "axios";
import { StickyNote, CreateStickyNoteRequest, UpdateStickyNoteRequest } from "@/types/stickyNote";

const API_BASE = "https://zainattiq-duoread.hf.space";

export const stickyNotesApi = {
  createNote: async (data: CreateStickyNoteRequest, token: string): Promise<StickyNote> => {
    const response = await axios.post(
      `${API_BASE}/sticky-notes/`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.note;
  },

  getBookNotes: async (bookId: string, token: string, pageNumber?: number): Promise<StickyNote[]> => {
    const params = pageNumber ? { page_number: pageNumber } : {};
    const response = await axios.get(
      `${API_BASE}/sticky-notes/book/${bookId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params
      }
    );
    return response.data.notes;
  },

  getNote: async (noteId: string, token: string): Promise<StickyNote> => {
    const response = await axios.get(
      `${API_BASE}/sticky-notes/${noteId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.note;
  },

  updateNote: async (noteId: string, data: UpdateStickyNoteRequest, token: string): Promise<StickyNote> => {
    const response = await axios.put(
      `${API_BASE}/sticky-notes/${noteId}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.note;
  },

  deleteNote: async (noteId: string, token: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/sticky-notes/${noteId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
};
