import { useState, useEffect, useRef } from "react";
import { StickyNoteColor, StickyNoteToolType } from "@/types/stickyNote";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveStickyNoteModalProps {
  open: boolean;
  onClose: () => void;
  selectedText: string;
  toolOutput: string;
  toolType: StickyNoteToolType;
  onSave: (data: {
    selected_text: string;
    tool_output: string;
    tool_type: StickyNoteToolType;
    color: StickyNoteColor;
  }) => Promise<void>;
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

export const SaveStickyNoteModal = ({
  open,
  onClose,
  selectedText: initialSelectedText,
  toolOutput: initialToolOutput,
  toolType,
  onSave
}: SaveStickyNoteModalProps) => {
  const [color, setColor] = useState<StickyNoteColor>("yellow");
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [toolOutput, setToolOutput] = useState("");
  const selectedTextRef = useRef<HTMLDivElement>(null);
  const toolOutputRef = useRef<HTMLDivElement>(null);

  // Initialize content when modal opens
  useEffect(() => {
    if (open) {
      setSelectedText(initialSelectedText);
      setToolOutput(initialToolOutput || "Add your notes here...");
      setColor("yellow");
    }
  }, [open, initialSelectedText, initialToolOutput]);

  // Update refs when state changes
  useEffect(() => {
    if (open) {
      if (selectedTextRef.current && selectedText) {
        selectedTextRef.current.textContent = selectedText;
      }
      if (toolOutputRef.current && toolOutput) {
        toolOutputRef.current.textContent = toolOutput;
      }
    }
  }, [open, selectedText, toolOutput]);

  const handleSave = async () => {
    const selectedText = selectedTextRef.current?.textContent?.trim() || "";
    const toolOutput = toolOutputRef.current?.textContent?.trim() || "";

    if (!selectedText || !toolOutput) {
      toast.error("Sticky note cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        selected_text: selectedText,
        tool_output: toolOutput,
        tool_type: toolType,
        color
      });
      toast.success("Sticky note saved");
      onClose();
    } catch (error) {
      toast.error("Failed to save sticky note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent 
        className={`w-[500px] h-[500px] p-0 border-none shadow-2xl ${COLOR_MAP[color]} [&>button]:hidden font-caveat`}
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
          {/* Metadata at top */}
          <div className="flex-shrink-0 flex items-center justify-between text-xs opacity-60 mb-3 pb-2 border-b border-black/10">
            <span className="uppercase font-semibold">{toolType}</span>
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

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-2 px-4 bg-black/10 hover:bg-black/20 rounded transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Sticky Note
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
