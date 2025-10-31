import { useState, useEffect, useRef } from "react";
import { Upload, Book, Trash2, Eye, Loader2, User, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StickyNote as StickyNoteType, StickyNoteColor } from "@/types/stickyNote";
import { stickyNotesApi } from "@/lib/stickyNotesApi";
import { StickyNoteViewModal } from "./StickyNoteViewModal";
import { ThemeToggle } from "./ThemeToggle";

interface Book {
  id: string;
  title: string;
  description?: string;
  book_language?: string;
  created_at: string;
  page_count: number;
  status?: "processed" | "processing";
  is_processed?: boolean;
  embedding_count?: number;
  ready_for_search?: boolean;
}

interface BookLibraryProps {
  onSelectBook: (bookId: string) => void;
  onBooksLoaded?: (hasBooks: boolean) => void;
  setFirstBookId?: (bookId: string | null) => void;
}

const API_BASE = "https://zainattiq-duoread.hf.space";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to validate file
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.type !== "application/pdf") {
    return { isValid: false, error: "Please select a PDF file" };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}` 
    };
  }
  
  return { isValid: true };
};

const COLOR_MAP: Record<StickyNoteColor, string> = {
  yellow: "bg-yellow-200 border-yellow-400 !text-yellow-900",
  blue: "bg-blue-200 border-blue-400 !text-blue-900",
  green: "bg-green-200 border-green-400 !text-green-900",
  pink: "bg-pink-200 border-pink-400 !text-pink-900",
  purple: "bg-purple-200 border-purple-400 !text-purple-900",
  orange: "bg-orange-200 border-orange-400 !text-orange-900",
  red: "bg-red-200 border-red-400 !text-red-900"
};

export const BookLibrary = ({ onSelectBook, onBooksLoaded, setFirstBookId }: BookLibraryProps) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [checkingBookId, setCheckingBookId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    book_language: "English",
    file: null as File | null
  });
  const [showStickyNotesModal, setShowStickyNotesModal] = useState(false);
  const [selectedBookForNotes, setSelectedBookForNotes] = useState<Book | null>(null);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteType[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [selectedNote, setSelectedNote] = useState<StickyNoteType | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [processingBooks, setProcessingBooks] = useState<Set<string>>(new Set());
  const [isCheckingStatuses, setIsCheckingStatuses] = useState(false);
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const fetchBooks = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE}/books/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const initialBooks = response.data.books || [];
      setBooks(initialBooks);
      
      // Check status for all books to get real-time status
      setIsCheckingStatuses(true);
      const statusPromises = initialBooks.map(async (book: Book) => {
        try {
          const statusData = await checkBookStatus(book.id);
          if (statusData) {
            return {
              ...book,
              status: statusData.status,
              is_processed: statusData.is_processed,
              embedding_count: statusData.embedding_count,
              ready_for_search: statusData.ready_for_search
            };
          }
        } catch (error) {
          console.error(`Failed to check status for book ${book.id}:`, error);
        }
        return book;
      });
      
      const booksWithStatus = await Promise.all(statusPromises);
      console.log("Books with status:", booksWithStatus); // Debug log
      setBooks(booksWithStatus);
      setIsCheckingStatuses(false);
      
      // Notify parent about books status
      if (onBooksLoaded) {
        const processedBooks = booksWithStatus.filter((book: Book) => book.is_processed);
        onBooksLoaded(processedBooks.length > 0);
        if (setFirstBookId && processedBooks.length > 0) {
          setFirstBookId(processedBooks[0].id);
        }
      }
      
      // Start polling for books that are still processing
      const processingBookIds = booksWithStatus
        .filter((book: Book) => book.status === "processing" && !book.is_processed)
        .map((book: Book) => book.id);
      
      console.log("Processing book IDs:", processingBookIds); // Debug log
      
      processingBookIds.forEach((bookId: string) => {
        if (!pollingIntervalsRef.current.has(bookId)) {
          startStatusPolling(bookId);
        }
      });
    } catch (error) {
      toast.error("Failed to load books");
      setIsCheckingStatuses(false);
    }
  };

  const checkBookStatus = async (bookId: string): Promise<Book | null> => {
    if (!token) return null;
    try {
      const response = await axios.get(`${API_BASE}/books/${bookId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Return the status data which contains the book information
      return response.data;
    } catch (error) {
      console.error("Failed to check book status:", error);
      return null;
    }
  };

  const startStatusPolling = (bookId: string) => {
    if (pollingIntervalsRef.current.has(bookId)) {
      console.log(`Already polling for book ${bookId}`);
      return; // Already polling
    }
    
    setProcessingBooks(prev => new Set(prev).add(bookId));
    
    const interval = setInterval(async () => {
      const statusData = await checkBookStatus(bookId);
      
      if (statusData) {
        console.log(`Status for book ${bookId}:`, statusData); // Debug log
        
        // Update the book in the books array with the status data
        setBooks(prevBooks => 
          prevBooks.map(book => 
            book.id === bookId 
              ? { 
                  ...book, 
                  status: statusData.status,
                  is_processed: statusData.is_processed,
                  embedding_count: statusData.embedding_count,
                  ready_for_search: statusData.ready_for_search
                }
              : book
          )
        );
        
        // If processing is complete, stop polling
        if (statusData.status === "processed") {
          console.log(`Book ${bookId} is processed, stopping polling and refreshing books list`);
          stopStatusPolling(bookId);
          toast.success(`"${statusData.title || 'Book'}" is ready for reading!`);
          // Refresh books list to get the latest data
          await fetchBooks();
        }
      }
    }, 3000); // Poll every 3 seconds
    
    // Store interval in ref
    pollingIntervalsRef.current.set(bookId, interval);
  };

  const stopStatusPolling = (bookId: string) => {
    console.log(`Attempting to stop polling for book ${bookId}`);
    const interval = pollingIntervalsRef.current.get(bookId);
    if (interval) {
      console.log(`Clearing interval for book ${bookId}`);
      clearInterval(interval);
      pollingIntervalsRef.current.delete(bookId);
    }
    setProcessingBooks(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookId);
      return newSet;
    });
  };

  const handleBookSelect = async (bookId: string) => {
    if (!token) return;
    setCheckingBookId(bookId);
    
    try {
      const statusResponse = await axios.get(`${API_BASE}/books/${bookId}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statusResponse.data.status === "processed" && statusResponse.data.is_processed) {
        onSelectBook(bookId);
      } else {
        toast.error("Book is still processing. Please wait and try again.");
      }
    } catch (error) {
      toast.error("Failed to check book status");
    } finally {
      setCheckingBookId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        // Auto-detect title from filename (remove .pdf extension)
        const autoTitle = file.name.replace(/\.pdf$/i, '');
        setUploadForm({ 
          ...uploadForm, 
          file,
          title: uploadForm.title || autoTitle // Only set if title is empty
        });
      } else {
        toast.error(validation.error || "Invalid file");
        // Clear the input
        e.target.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        const autoTitle = file.name.replace(/\.pdf$/i, '');
        setUploadForm({ 
          ...uploadForm, 
          file,
          title: uploadForm.title || autoTitle
        });
      } else {
        toast.error(validation.error || "Invalid file");
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !token) {
      toast.error("Please provide a title and select a PDF file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadForm.file);

    const params = new URLSearchParams({
      title: uploadForm.title,
      ...(uploadForm.description && { description: uploadForm.description }),
      ...(uploadForm.book_language && { book_language: uploadForm.book_language })
    });

    try {
      const response = await axios.post(`${API_BASE}/books/upload?${params}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      const uploadedBook = response.data.book;
      
      toast.success("Book uploaded successfully! Processing in background...");
      setShowUpload(false);
      setUploadForm({ title: "", description: "", book_language: "English", file: null });
      
      // Refresh books list to include the new book
      await fetchBooks();
      
      // Start polling for this book if it's processing
      if (uploadedBook && uploadedBook.status === "processing") {
        startStatusPolling(uploadedBook.id);
      }
    } catch (error) {
      toast.error("Failed to upload book");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!token) return;
    setDeletingBookId(bookId);
    try {
      // Stop polling for this book
      stopStatusPolling(bookId);
      
      await axios.delete(`${API_BASE}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Book deleted");
      await fetchBooks();
    } catch (error) {
      toast.error("Failed to delete book");
    } finally {
      setDeletingBookId(null);
    }
  };

  const handleViewStickyNotes = async (book: Book) => {
    if (!token) return;
    setSelectedBookForNotes(book);
    setShowStickyNotesModal(true);
    setLoadingNotes(true);
    
    try {
      const notes = await stickyNotesApi.getBookNotes(book.id, token);
      // Sort by created_at in descending order (latest first)
      const sortedNotes = notes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setStickyNotes(sortedNotes);
    } catch (error) {
      toast.error("Failed to load sticky notes");
      setStickyNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleNoteClick = (note: StickyNoteType) => {
    setSelectedNote(note);
    setShowNoteModal(true);
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
      setShowNoteModal(false);
      toast.success("Sticky note deleted");
    } catch (error) {
      throw error;
    }
  };

  useState(() => {
    fetchBooks();
  });

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      pollingIntervalsRef.current.clear();
    };
  }, []);

  return (
    <div className="h-full flex flex-col p-6 bg-background overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          My Library
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" onClick={() => navigate("/profile")} className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)} className="gap-2" data-tour="upload-button">
            <Upload className="w-4 h-4" />
            Upload Book
          </Button>
        </div>
      </div>

      {showUpload && (
        <Card className="p-6 mb-6 shadow-[var(--shadow-medium)]">
          <h2 className="text-xl font-semibold mb-6">Upload New Book</h2>
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : uploadForm.file
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file')?.click()}
            >
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className={`w-12 h-12 mx-auto mb-4 ${uploadForm.file ? 'text-primary' : 'text-muted-foreground'}`} />
              {uploadForm.file ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-primary">{uploadForm.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    File selected successfully • {formatFileSize(uploadForm.file.size)} • Click to change
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">
                    {isDragging ? 'Drop your PDF here' : 'Choose PDF or Drag & Drop'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag your PDF file here
                    <br />
                    <span className="text-xs text-muted-foreground/70">
                      Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Other Input Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Auto-detected from filename"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Book description (optional)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={uploadForm.book_language}
                  onChange={(e) => setUploadForm({ ...uploadForm, book_language: e.target.value })}
                  placeholder="e.g., English, Spanish"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleUpload} disabled={isUploading || !uploadForm.file} className="flex-1">
                {isUploading ? "Uploading..." : "Upload Book"}
              </Button>
              <Button onClick={() => setShowUpload(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isCheckingStatuses && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking book statuses...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <Card key={book.id} className="p-4 hover:shadow-[var(--shadow-strong)] transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-16 bg-gradient-to-br from-primary to-primary-glow rounded flex items-center justify-center flex-shrink-0">
                <Book className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{book.title}</h3>
                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {book.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {book.book_language} • {book.page_count} pages
                  {book.status === "processing" && (
                    <span className="ml-2 inline-flex items-center gap-1 text-orange-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing...
                    </span>
                  )}
                  {book.status === "processed" && book.is_processed && (
                    <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                      ✓ Ready
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                onClick={() => handleBookSelect(book.id)} 
                className="flex-1 gap-2" 
                data-tour="read-button"
                disabled={
                  deletingBookId === book.id || 
                  checkingBookId === book.id || 
                  book.status === "processing" || 
                  !book.is_processed
                }
              >
                {checkingBookId === book.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : book.status === "processing" || !book.is_processed ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Read
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleViewStickyNotes(book)}
                data-tour="sticky-note-button"
                disabled={deletingBookId === book.id}
                title="View Sticky Notes"
              >
                <StickyNote className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => handleDelete(book.id)}
                disabled={deletingBookId === book.id}
              >
                {deletingBookId === book.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {books.length === 0 && !showUpload && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Book className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No books yet. Upload your first book to get started!</p>
            <Button onClick={() => setShowUpload(true)} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Book
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Notes Modal */}
      <Dialog open={showStickyNotesModal} onOpenChange={setShowStickyNotesModal}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Sticky Notes - {selectedBookForNotes?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {loadingNotes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : stickyNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StickyNote className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
                <p className="text-muted-foreground">No sticky notes yet for this book</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Open the book and create sticky notes while reading
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {stickyNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleNoteClick(note)}
                    className={`aspect-square p-4 rounded-lg border-2 transition-all hover:shadow-lg text-left flex flex-col font-caveat ${COLOR_MAP[note.color]}`}
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
                      <p className="text-sm font-medium line-clamp-4 mb-1">
                        {note.selected_text}
                      </p>
                      <p className="text-sm opacity-80 line-clamp-4">
                        {note.tool_output}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/10">
                      <p className="text-xs opacity-60">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Sticky Note View/Edit Modal */}
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
