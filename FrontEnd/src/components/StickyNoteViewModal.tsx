import { useState, useRef, useEffect } from "react";
import { StickyNote, StickyNoteColor } from "@/types/stickyNote";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Trash2, Pencil, X, Save } from "lucide-react";
import { toast } from "sonner";

interface StickyNoteViewModalProps {
  note: StickyNote | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (noteId: string, updates: { selected_text?: string; tool_output?: string; color?: StickyNoteColor }) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

const COLOR_OPTIONS: StickyNoteColor[] = ["yellow", "blue", "green", "pink", "purple", "orange", "red"];

const COLOR_MAP: Record<StickyNoteColor, string> = {
  yellow: "bg-yellow-200 border-yellow-400 !text-gray-900",
  blue: "bg-blue-200 border-blue-400 !text-gray-900",
  green: "bg-green-200 border-green-400 !text-gray-900",
  pink: "bg-pink-200 border-pink-400 !text-gray-900",
  purple: "bg-purple-200 border-purple-400 !text-gray-900",
  orange: "bg-orange-200 border-orange-400 !text-gray-900",
  red: "bg-red-200 border-red-400 !text-gray-900"
};

export const StickyNoteViewModal = ({ note, open, onClose, onUpdate, onDelete }: StickyNoteViewModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [color, setColor] = useState<StickyNoteColor>("yellow");
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [toolOutput, setToolOutput] = useState("");
  const selectedTextRef = useRef<HTMLDivElement>(null);
  const toolOutputRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic font size based on content length
  const getDynamicFontSize = () => {
    if (!note) return "text-base";
    const totalLength = note.selected_text.length + note.tool_output.length;
    if (totalLength > 800) return "text-xs";
    if (totalLength > 500) return "text-sm";
    if (totalLength > 200) return "text-base";
    return "text-lg";
  };

  // Initialize content when modal opens or note changes
  useEffect(() => {
    if (open && note) {
      setSelectedText(note.selected_text);
      setToolOutput(note.tool_output);
      setColor(note.color);
      setIsEditing(false);
    }
  }, [open, note]);

  // Update refs when state changes and in edit mode
  useEffect(() => {
    if (open && isEditing) {
      if (selectedTextRef.current && selectedText) {
        selectedTextRef.current.textContent = selectedText;
      }
      if (toolOutputRef.current && toolOutput) {
        toolOutputRef.current.textContent = toolOutput;
      }
    }
  }, [open, isEditing, selectedText, toolOutput]);

  const handleSave = async () => {
    if (!note) return;
    
    const selectedText = selectedTextRef.current?.textContent?.trim() || "";
    const toolOutput = toolOutputRef.current?.textContent?.trim() || "";

    if (!selectedText || !toolOutput) {
      toast.error("Sticky note cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await onUpdate(note.id, {
        selected_text: selectedText,
        tool_output: toolOutput,
        color
      });
      toast.success("Sticky note updated");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update sticky note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    if (!confirm("Are you sure you want to delete this sticky note?")) return;
    
    setLoading(true);
    try {
      await onDelete(note.id);
      toast.success("Sticky note deleted");
      onClose();
    } catch (error) {
      toast.error("Failed to delete sticky note");
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} modal={true}>
      <DialogContent 
        className={`w-[500px] h-[500px] p-0 border-none shadow-2xl ${COLOR_MAP[isEditing ? color : note.color]} [&>button]:hidden font-caveat`}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {/* Top action buttons */}
        <div className="absolute top-3 right-3 z-10 flex gap-1">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 transition-colors flex items-center justify-center"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sticky note content */}
        <div 
          className="h-full flex flex-col p-6 overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            <>
              {/* Metadata at top */}
              <div className="flex-shrink-0 flex items-center justify-between text-xs opacity-60 mb-3 pb-2 border-b border-black/10">
                <span className="uppercase font-semibold">{note.tool_type}</span>
              </div>

              {/* Editable content area */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0">
                <div className="flex-shrink-0">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">Selected Text</p>
                  <div
                    ref={selectedTextRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="text-base font-medium leading-relaxed outline-none focus:bg-black/5 rounded p-2 min-h-[60px] max-h-[100px] overflow-y-auto"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData('text/plain');
                      document.execCommand('insertText', false, text);
                    }}
                  />
                </div>

                <div className="flex-shrink-0">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">Note</p>
                  <div
                    ref={toolOutputRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="text-base whitespace-pre-wrap leading-relaxed outline-none focus:bg-black/5 rounded p-2 min-h-[150px] max-h-[220px] overflow-y-auto"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData('text/plain');
                      document.execCommand('insertText', false, text);
                    }}
                  />
                </div>
              </div>

              {/* Color picker and save button */}
              <div className="flex-shrink-0 mt-4 pt-3 border-t border-black/10 space-y-3">
                <div>
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-2">Color</p>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption}
                        onClick={() => setColor(colorOption)}
                        className={`w-8 h-8 rounded border-2 border-black/20 transition-all ${COLOR_MAP[colorOption]} ${
                          color === colorOption ? "ring-2 ring-black ring-offset-1" : ""
                        }`}
                        title={colorOption}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="py-2 px-4 bg-black/10 hover:bg-black/20 rounded transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Metadata at top */}
              <div className="flex-shrink-0 flex items-center justify-between text-xs opacity-60 mb-3 pb-2 border-b border-black/10">
                <span className="uppercase font-semibold">{note.tool_type}</span>
              </div>

              {/* Note content */}
              <div className={`flex-1 overflow-y-auto space-y-3 pr-2 min-h-0 ${getDynamicFontSize()}`}>
                <div className="flex-shrink-0">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">Selected Text</p>
                  <p className="font-medium leading-relaxed break-words max-h-[100px] overflow-y-auto">{note.selected_text}</p>
                </div>

                <div className="flex-shrink-0">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">Note</p>
                  <p className="whitespace-pre-wrap leading-relaxed break-words max-h-[220px] overflow-y-auto">{note.tool_output}</p>
                </div>
              </div>

              {/* Metadata at bottom */}
              <div className="flex-shrink-0 mt-4 pt-3 border-t border-black/10 flex justify-between items-center">
                <p className="text-xs opacity-50">
                  Page {note.page_number}
                </p>
                <p className="text-xs opacity-50">
                  Created {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
