import { useState, useEffect } from "react";
import { BookLibrary } from "@/components/BookLibrary";
import { PDFViewer } from "@/components/PDFViewer";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [hasBooks, setHasBooks] = useState(false);
  const [firstBookId, setFirstBookId] = useState<string | null>(null);
  const [isOpeningBook, setIsOpeningBook] = useState(false);
  const [prevInBook, setPrevInBook] = useState(false);
  const [tourKey, setTourKey] = useState(0); // Key to remount tour on context change
  const [isPdfReady, setIsPdfReady] = useState(false);
  const { hasCompletedOnboarding, markOnboardingComplete } = useAuth();

  useEffect(() => {
    // Show tour only if user is logged in and hasn't completed onboarding
    if (!hasCompletedOnboarding()) {
      setShowTour(true);
    }
  }, [hasCompletedOnboarding]);

  // Detect when we transition from library to book and reset tour
  useEffect(() => {
    const inBook = !!selectedBook;
    if (inBook && !prevInBook && showTour) {
      // Transitioned to book view - restart tour at first book step
      setTourKey(prev => prev + 1);
    }
    setPrevInBook(inBook);
  }, [selectedBook, showTour, prevInBook]);
  
  // Reset PDF ready state when book changes
  useEffect(() => {
    setIsPdfReady(false);
  }, [selectedBook]);

  const handleTourComplete = () => {
    markOnboardingComplete();
    setShowTour(false);
  };

  const handleTourSkip = () => {
    markOnboardingComplete();
    setShowTour(false);
  };

  const handleOpenFirstBook = () => {
    if (firstBookId && !isOpeningBook) {
      setIsOpeningBook(true);
      setShowTour(false); // Hide tour temporarily while opening book
      setSelectedBook(firstBookId);
      // Wait longer for book to open and PDF to load
      setTimeout(() => {
        setIsOpeningBook(false);
        setShowTour(true);
      }, 2000);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      {showTour && (
        <OnboardingTour 
          key={tourKey}
          onComplete={handleTourComplete} 
          onSkip={handleTourSkip}
          hasBooks={hasBooks}
          onOpenFirstBook={handleOpenFirstBook}
          isInBook={!!selectedBook}
          isPdfReady={isPdfReady}
        />
      )}
      {selectedBook ? (
        <PDFViewer bookId={selectedBook} onBack={() => setSelectedBook(null)} onPdfReady={() => setIsPdfReady(true)} />
      ) : (
        <BookLibrary 
          onSelectBook={setSelectedBook}
          onBooksLoaded={setHasBooks}
          setFirstBookId={setFirstBookId}
        />
      )}
    </div>
  );
};

export default Index;
