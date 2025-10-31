import { useState, useEffect, useRef } from "react";
import { Send, Trash2, Bot, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStreamingAI } from "@/hooks/useStreamingAI";

const API_BASE = "https://zainattiq-duoread.hf.space";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface ChatSidebarProps {
  bookId: string | null;
  additionalContext: string[];
  onClose: () => void;
  onContextUsed: () => void;
  onRemoveContext?: (index: number) => void;
  processingMode: 'client' | 'hybrid';
}

const LOADING_MESSAGES = [
  "Fetching Relevant part of Book...",
  "Reading the book...",
  "Analyzing the text...",
  "Thinking...",
  "Generating Response..."
];

export const ChatSidebar = ({ bookId, additionalContext, onClose, onContextUsed, onRemoveContext, processingMode }: ChatSidebarProps) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { streamResponse, isStreaming, streamedText, error, reset } = useStreamingAI();

  useEffect(() => {
    if (bookId) {
      loadHistory();
    }
  }, [bookId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!loading) return;

    // Shuffle loading messages for variety
    const shuffled = [...LOADING_MESSAGES].sort(() => Math.random() - 0.5);
    let currentIndex = 0;
    setLoadingMessage(shuffled[0]);

    let timeoutId: NodeJS.Timeout;

    const scheduleNext = () => {
      // Random duration between 1 second and 4 seconds for each message
      const randomDuration = Math.random() * 3000 + 1000;
      
      timeoutId = setTimeout(() => {
        currentIndex = (currentIndex + 1) % shuffled.length;
        setLoadingMessage(shuffled[currentIndex]);
        scheduleNext();
      }, randomDuration);
    };

    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, [loading]);

  const loadHistory = async () => {
    if (!bookId || !token) return;
    try {
      const response = await axios.get(`${API_BASE}/api/chatHistory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { book_id: bookId }
      });
      const history = response.data.history || [];
      // Reverse if needed to ensure chronological order (oldest first)
      setMessages(history.reverse());
    } catch (error) {
      console.error("Failed to load chat history");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    reset(); // Reset streaming state

    try {
      const context = additionalContext.join("\n\n");
      
      // Use streaming endpoint for chat
      const fullResponse = await streamResponse('/books/chat/stream', {
        message: input,
        context: context,
        book_id: bookId
      }, token);

      const botMessage: Message = {
        role: "bot",
        content: fullResponse
      };
      setMessages((prev) => [...prev, botMessage]);
      
      // Clear context after successful message with context
      if (context) {
        onContextUsed();
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!bookId || !token) return;
    try {
      await axios.delete(`${API_BASE}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { book_id: bookId }
      });
      setMessages([]);
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear chat");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border" data-tour="chat-sidebar">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">DuoRead Agent</h2>
            <p className="text-xs text-muted-foreground">Ask me anything about your book</p>
          </div>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleClear}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>


      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Show message if in client mode */}
          {processingMode === 'client' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="p-3 bg-secondary max-w-[80%]">
                <p className="text-sm text-muted-foreground">
                  You can only use this agent on Hybrid Mode as it includes complex tool calling
                </p>
              </Card>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <Card
                className={`p-3 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                {msg.role === "bot" ? (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="p-3 bg-secondary max-w-[80%]">
                {isStreaming && streamedText ? (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none streaming-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamedText}
                    </ReactMarkdown>
                    <span className="streaming-cursor">|</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">{loadingMessage}</p>
                )}
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        {additionalContext.length > 0 && (
          <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                Added Contexts ({additionalContext.length})
              </span>
              <button
                onClick={onContextUsed}
                className="text-xs hover:text-foreground transition-colors text-muted-foreground"
                aria-label="Clear all contexts"
              >
                Clear all
              </button>
            </div>
            {additionalContext.map((context, idx) => (
              <div
                key={idx}
                className="px-3 py-2 bg-accent/10 rounded-lg text-xs text-muted-foreground border border-accent/20 flex items-start justify-between gap-2"
              >
                <p className="line-clamp-2 flex-1">"{context}"</p>
                <button
                  onClick={() => onRemoveContext?.(idx)}
                  className="flex-shrink-0 hover:text-foreground transition-colors"
                  aria-label="Remove this context"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your book..."
            disabled={loading || processingMode === 'client'}
            data-tour="chat-input"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim() || processingMode === 'client'}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
