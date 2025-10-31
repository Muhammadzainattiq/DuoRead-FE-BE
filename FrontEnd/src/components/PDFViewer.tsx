import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, MessageSquare, ArrowLeft, PanelLeftClose, PanelLeft, ZoomIn, ZoomOut, Maximize, Minimize, RotateCw, Maximize2, StickyNote, Volume2, Pause, Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FloatingToolbar } from "./FloatingToolbar";
import { ChatSidebar } from "./ChatSidebar";
import { StickyNotesSidebar } from "./StickyNotesSidebar";
import { StickyNoteViewModal } from "./StickyNoteViewModal";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { StickyNote as StickyNoteType, StickyNoteColor } from "@/types/stickyNote";
import { stickyNotesApi } from "@/lib/stickyNotesApi";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_BASE = "https://zainattiq-duoread.hf.space";

interface PDFViewerProps {
  bookId: string;
  onBack: () => void;
  onPdfReady?: () => void;
}

export const PDFViewer = ({ bookId, onBack, onPdfReady }: PDFViewerProps) => {
  const { token } = useAuth();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [selectedText, setSelectedText] = useState("");
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showPagesSidebar, setShowPagesSidebar] = useState(true);
  const [chatContext, setChatContext] = useState<string[]>([]);
  const [bookTitle, setBookTitle] = useState("");
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteType[]>([]);
  const [showStickyNotesSidebar, setShowStickyNotesSidebar] = useState(false);
  const [selectedNote, setSelectedNote] = useState<StickyNoteType | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPageText, setCurrentPageText] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [sidebarPageStart, setSidebarPageStart] = useState(1);
  const [sidebarPageEnd, setSidebarPageEnd] = useState(20); // Show only 20 pages at a time
  const [isLoadingSidebarPages, setIsLoadingSidebarPages] = useState(false);
  const [isLoadingPDF, setIsLoadingPDF] = useState(true);
  const [pdfContainerBounds, setPdfContainerBounds] = useState<DOMRect | null>(null);
  const [bookLanguage, setBookLanguage] = useState<string>("English");
  const [processingMode, setProcessingMode] = useState<'client' | 'hybrid'>('client');

  useEffect(() => {
    loadPDF();
    loadBookInfo();
    loadStickyNotes();
  }, [bookId]);

  const loadBookInfo = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookTitle(response.data.book.title);
      setBookLanguage(response.data.book.book_language || "English");
    } catch (error) {
      console.error("Failed to load book info:", error);
    }
  };

  const loadStickyNotes = async () => {
    if (!token) return;
    try {
      const notes = await stickyNotesApi.getBookNotes(bookId, token);
      // Sort by created_at in descending order (latest first)
      const sortedNotes = notes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setStickyNotes(sortedNotes);
    } catch (error) {
      console.error("Failed to load sticky notes");
    }
  };

  const loadPDF = async () => {
    if (!token) return;
    setIsLoadingPDF(true);
    try {
      const response = await axios.get(`${API_BASE}/books/${bookId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const url = URL.createObjectURL(response.data);
      setPdfUrl(url);
    } catch (error) {
      toast.error("Failed to load PDF");
    } finally {
      setIsLoadingPDF(false);
    }
  };


  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        setSelectedText(text);
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setShowToolbar(true);
      }
    } else {
      setShowToolbar(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection]);

  // Update PDF container bounds on scroll and resize
  useEffect(() => {
    const handleScroll = () => {
      updatePdfContainerBounds();
    };

    const handleResize = () => {
      updatePdfContainerBounds();
    };

    const pdfContainer = pdfContainerRef.current;
    if (pdfContainer) {
      pdfContainer.addEventListener('scroll', handleScroll);
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (pdfContainer) {
        pdfContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updatePdfContainerBounds = () => {
    if (pdfContainerRef.current) {
      const bounds = pdfContainerRef.current.getBoundingClientRect();
      setPdfContainerBounds(bounds);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    // Reset sidebar pagination when document loads
    setSidebarPageStart(1);
    setSidebarPageEnd(Math.min(20, numPages));
    
    // Automatically fit to width when document loads
    if (containerRef.current?.clientWidth) {
      setPageWidth(containerRef.current.clientWidth - 64);
      setScale(1.0);
    }
    
    // Update PDF container bounds after a short delay to ensure rendering is complete
    setTimeout(updatePdfContainerBounds, 100);
    
    // Notify parent that PDF is ready
    if (onPdfReady) {
      setTimeout(() => {
        onPdfReady();
      }, 500);
    }
    
    // Show performance warning for very large PDFs
    if (numPages > 500) {
      toast.warning(`Large PDF detected (${numPages} pages). Performance may be slower. Consider using pagination controls.`);
    }
  };

  const handleAddToChat = (text: string) => {
    setChatContext((prev) => [...prev, text]);
    setShowToolbar(false);
    setShowChat(true);
  };

  const isSingleWord = selectedText.trim().split(/\s+/).length === 1;

  const handleSaveStickyNote = async (noteData: {
    selected_text: string;
    tool_output: string;
    tool_type: any;
    color: StickyNoteColor;
  }) => {
    if (!token) return;
    try {
      const newNote = await stickyNotesApi.createNote(
        {
          book_id: bookId,
          page_number: pageNumber,
          ...noteData
        },
        token
      );
      // Add new note at the beginning (latest first)
      setStickyNotes((prev) => [newNote, ...prev]);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateStickyNote = async (
    noteId: string,
    updates: { selected_text?: string; tool_output?: string; color?: StickyNoteColor }
  ) => {
    if (!token) return;
    try {
      const updatedNote = await stickyNotesApi.updateNote(noteId, updates, token);
      setStickyNotes((prev) => prev.map((note) => (note.id === noteId ? updatedNote : note)));
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteStickyNote = async (noteId: string) => {
    if (!token) return;
    try {
      await stickyNotesApi.deleteNote(noteId, token);
      setStickyNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      throw error;
    }
  };

  const handleNoteClick = (note: StickyNoteType) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  // Extract text from the current page
  const extractPageText = useCallback(async () => {
    if (!pdfUrl) return "";
    
    try {
      const pdf = await pdfjs.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      return text;
    } catch (error) {
      console.error("Failed to extract text:", error);
      return "";
    }
  }, [pdfUrl, pageNumber]);

  // Update page text when page changes
  useEffect(() => {
    const updateText = async () => {
      const text = await extractPageText();
      setCurrentPageText(text);
    };
    updateText();
  }, [pageNumber, extractPageText]);

  // TTS Functions
  const handleReadPage = async () => {
    if (!('speechSynthesis' in window)) {
      toast.error("Text-to-speech not supported in your browser");
      return;
    }

    // Stop any existing speech
    window.speechSynthesis.cancel();

    const text = currentPageText || await extractPageText();
    if (!text || text.trim().length === 0) {
      toast.error("No text found on this page");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      toast.error("Speech synthesis error");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    toast.success("Reading page aloud");
  };

  const handlePauseTTS = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResumeTTS = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  // Cleanup on unmount or page change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Stop reading when page changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  }, [pageNumber]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
    setPageWidth(undefined);
    setTimeout(updatePdfContainerBounds, 100);
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
    setPageWidth(undefined);
    setTimeout(updatePdfContainerBounds, 100);
  };

  const handleFitToWidth = () => {
    setPageWidth(containerRef.current?.clientWidth ? containerRef.current.clientWidth - 64 : 800);
    setScale(1.0);
    setTimeout(updatePdfContainerBounds, 100);
  };

  const handleFitToPage = () => {
    setPageWidth(undefined);
    setScale(1.0);
    setTimeout(updatePdfContainerBounds, 100);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePageJump = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const page = parseInt(formData.get("page") as string);
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  // Pagination functions for sidebar
  const handleSidebarPageChange = (newPage: number) => {
    setPageNumber(newPage);
    // Update sidebar pagination to keep current page visible
    const pagesPerView = 20;
    const halfView = Math.floor(pagesPerView / 2);
    const newStart = Math.max(1, newPage - halfView);
    const newEnd = Math.min(numPages, newStart + pagesPerView - 1);
    
    if (newPage < sidebarPageStart || newPage > sidebarPageEnd) {
      setSidebarPageStart(newStart);
      setSidebarPageEnd(newEnd);
    }
  };

  const loadMoreSidebarPages = () => {
    if (sidebarPageEnd < numPages) {
      setIsLoadingSidebarPages(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        const pagesToAdd = Math.min(20, numPages - sidebarPageEnd);
        setSidebarPageEnd(prev => prev + pagesToAdd);
        setIsLoadingSidebarPages(false);
      }, 300);
    }
  };

  const loadPreviousSidebarPages = () => {
    if (sidebarPageStart > 1) {
      setIsLoadingSidebarPages(true);
      setTimeout(() => {
        const pagesToAdd = Math.min(20, sidebarPageStart - 1);
        setSidebarPageStart(prev => prev - pagesToAdd);
        setIsLoadingSidebarPages(false);
      }, 300);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Cleanup PDF URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="h-full flex">
      {/* Pages Sidebar */}
      {showPagesSidebar && (
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-sm">Pages</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPagesSidebar(false)}>
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {/* Load Previous Pages Button */}
              {sidebarPageStart > 1 && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPreviousSidebarPages}
                    disabled={isLoadingSidebarPages}
                    className="w-full"
                  >
                    {isLoadingSidebarPages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      `Load Previous Pages (${Math.min(20, sidebarPageStart - 1)})`
                    )}
                  </Button>
                </div>
              )}

              {/* Render only visible pages */}
              {Array.from({ length: sidebarPageEnd - sidebarPageStart + 1 }, (_, i) => sidebarPageStart + i).map((page) => (
                <button
                  key={page}
                  onClick={() => handleSidebarPageChange(page)}
                  className={`w-full p-3 rounded-lg border-2 transition-all hover:border-primary/50 hover:bg-accent/5 ${
                    pageNumber === page
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Page {page}</span>
                    {pageNumber === page && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <div className="w-full aspect-[3/4] bg-muted rounded overflow-hidden shadow-sm">
                    {pdfUrl && (
                      <Document file={pdfUrl}>
                        <Page
                          pageNumber={page}
                          width={200}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    )}
                  </div>
                </button>
              ))}

              {/* Load More Pages Button */}
              {sidebarPageEnd < numPages && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreSidebarPages}
                    disabled={isLoadingSidebarPages}
                    className="w-full"
                  >
                    {isLoadingSidebarPages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      `Load More Pages (${Math.min(20, numPages - sidebarPageEnd)})`
                    )}
                  </Button>
                </div>
              )}

              {/* Page Info */}
              <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
                Showing pages {sidebarPageStart}-{sidebarPageEnd} of {numPages}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      <div ref={containerRef} className={`flex-1 flex flex-col ${showChat ? "mr-80" : ""} overflow-hidden`}>
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            {!showPagesSidebar && (
              <Button variant="ghost" size="sm" onClick={() => setShowPagesSidebar(true)}>
                <PanelLeft className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">{bookTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Processing Mode Toggle */}
            <div className="flex items-center gap-2 border border-border rounded-lg p-1" data-tour="mode-toggle">
              <Button
                variant={processingMode === 'client' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setProcessingMode('client')}
                className="h-8 text-xs"
                title="Process AI tasks locally in the browser"
              >
                Offline
              </Button>
              <Button
                variant={processingMode === 'hybrid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setProcessingMode('hybrid')}
                className="h-8 text-xs"
                title="Process AI tasks on the server"
              >
                Hybrid
              </Button>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => setShowStickyNotesSidebar(!showStickyNotesSidebar)} data-tour="sticky-note-button">
              <StickyNote className="w-4 h-4 mr-2" />
              Sticky Notes ({stickyNotes.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)} data-tour="chat-button">
              <MessageSquare className="w-4 h-4 mr-2" />
              {showChat ? "Hide" : "Open"} DuoRead Agent
            </Button>
          </div>
        </div>

        {/* Toolbar with zoom and view controls */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 p-2 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 3.0}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={handleFitToWidth} title="Fit to width">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitToPage} title="Fit to page">
              <Maximize className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate} title="Rotate">
              <RotateCw className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            {/* TTS Controls */}
            {!isReading ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReadPage} 
                title="Read page aloud"
                className="gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-xs">Read Page</span>
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePauseTTS} 
                    title="Pause reading"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResumeTTS} 
                    title="Resume reading"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStopTTS} 
                  title="Stop reading"
                >
                  <Square className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <form onSubmit={handlePageJump} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page</span>
              <Input
                type="number"
                name="page"
                min={1}
                max={numPages}
                defaultValue={pageNumber}
                className="w-16 h-8 text-sm"
              />
              <span className="text-sm text-muted-foreground">of {numPages}</span>
            </form>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--canvas-bg)] relative">
          <div ref={pdfContainerRef} className="min-h-full flex items-center justify-center p-8 overflow-auto">
            {isLoadingPDF ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            ) : pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-[var(--shadow-strong)] rounded-lg overflow-hidden"
                />
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-muted-foreground">Failed to load PDF</p>
                <Button onClick={loadPDF} variant="outline">
                  Retry
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-between p-4 border-t border-border bg-card">
          <Button
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            disabled={pageNumber <= 1}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <p className="text-sm font-medium">
            Page {pageNumber} of {numPages}
          </p>
          <Button
            onClick={() => setPageNumber((prev) => Math.min(numPages, prev + 1))}
            disabled={pageNumber >= numPages}
            variant="outline"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {showToolbar && (
          <FloatingToolbar
            selectedText={selectedText}
            position={toolbarPosition}
            isSingleWord={isSingleWord}
            onAddToChat={handleAddToChat}
            onClose={() => setShowToolbar(false)}
            bookId={bookId}
            pageNumber={pageNumber}
            onSaveStickyNote={handleSaveStickyNote}
            pdfContainerBounds={pdfContainerBounds}
            bookLanguage={bookLanguage}
            processingMode={processingMode}
          />
        )}
      </div>

      {showStickyNotesSidebar && (
        <div 
          className="w-80 fixed top-0 bottom-0 z-40 transition-all duration-300"
          style={{ right: showChat ? '320px' : '0' }}
        >
          <StickyNotesSidebar
            notes={stickyNotes}
            onNoteClick={handleNoteClick}
            onClose={() => setShowStickyNotesSidebar(false)}
          />
        </div>
      )}

      {showChat && (
        <div className="w-80 fixed right-0 top-0 bottom-0 z-40" data-tour="chat-sidebar">
          <ChatSidebar
            bookId={bookId}
            additionalContext={chatContext}
            onClose={() => setShowChat(false)}
            onContextUsed={() => setChatContext([])}
            onRemoveContext={(index) => 
              setChatContext((prev) => prev.filter((_, i) => i !== index))
            }
            processingMode={processingMode}
          />
        </div>
      )}

      <StickyNoteViewModal
        note={selectedNote}
        open={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setSelectedNote(null);
        }}
        onUpdate={handleUpdateStickyNote}
        onDelete={handleDeleteStickyNote}
      />
    </div>
  );
};
