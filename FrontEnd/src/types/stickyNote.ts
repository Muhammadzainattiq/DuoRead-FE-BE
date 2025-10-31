export type StickyNoteColor = "yellow" | "blue" | "green" | "pink" | "purple" | "orange" | "red";

export type StickyNoteToolType = 
  | "translation" 
  | "definition" 
  | "simplification" 
  | "explanation" 
  | "summary" 
  | "synonym" 
  | "pronunciation" 
  | "chat";

export interface StickyNote {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  selected_text: string;
  tool_output: string;
  tool_type: StickyNoteToolType;
  color: StickyNoteColor;
  coordinates?: { x: number; y: number };
  created_at: string;
  updated_at: string;
}

export interface CreateStickyNoteRequest {
  book_id: string;
  page_number: number;
  selected_text: string;
  tool_output: string;
  tool_type: StickyNoteToolType;
  color?: StickyNoteColor;
  coordinates?: { x: number; y: number };
}

export interface UpdateStickyNoteRequest {
  selected_text?: string;
  tool_output?: string;
  tool_type?: StickyNoteToolType;
  color?: StickyNoteColor;
  coordinates?: { x: number; y: number };
}
