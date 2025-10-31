import { StickyNote, StickyNoteColor } from "@/types/stickyNote";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StickyNote as StickyNoteIcon, X } from "lucide-react";

interface StickyNotesSidebarProps {
  notes: StickyNote[];
  onNoteClick: (note: StickyNote) => void;
  onClose: () => void;
}

const COLOR_MAP: Record<StickyNoteColor, string> = {
  yellow: "bg-yellow-200 border-yellow-400 !text-yellow-900",
  blue: "bg-blue-200 border-blue-400 !text-blue-900",
  green: "bg-green-200 border-green-400 !text-green-900",
  pink: "bg-pink-200 border-pink-400 !text-pink-900",
  purple: "bg-purple-200 border-purple-400 !text-purple-900",
  orange: "bg-orange-200 border-orange-400 !text-orange-900",
  red: "bg-red-200 border-red-400 !text-red-900"
};

export const StickyNotesSidebar = ({ notes, onNoteClick, onClose }: StickyNotesSidebarProps) => {
  // Calculate dynamic font size for list items
  const getDynamicFontSize = (note: StickyNote) => {
    const totalLength = note.selected_text.length + note.tool_output.length;
    if (totalLength > 300) return "text-xs";
    if (totalLength > 150) return "text-sm";
    return "text-base";
  };

  return (
    <div className="w-full h-full border-l border-border bg-card flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Sticky Notes ({notes.length})</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNoteIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sticky notes yet</p>
            </div>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onNoteClick(note)}
                className={`w-full aspect-square p-3 rounded-lg border-2 transition-all hover:shadow-md text-left flex flex-col font-caveat ${COLOR_MAP[note.color]} ${getDynamicFontSize(note)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {note.tool_type}
                  </span>
                  <span className="text-xs opacity-70">
                    Page {note.page_number}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium line-clamp-3 mb-1">
                    {note.selected_text}
                  </p>
                  <p className="opacity-80 line-clamp-3">
                    {note.tool_output}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
