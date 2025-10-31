import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Upload, Book, MessageSquare, StickyNote, Eye, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for element to highlight
  position?: string;
  icon?: React.ReactNode;
  context?: "library" | "book"; // Which page should this step show on
  action?: () => void; // Action to perform before showing this step
  autoAction?: () => Promise<void>; // Automatic action to perform for demo
  waitAfterAction?: number; // How long to wait after auto action
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
  hasBooks?: boolean;
  onOpenFirstBook?: () => void;
  isInBook?: boolean; // Track if we're currently in book mode
  isPdfReady?: boolean; // Track if PDF is fully loaded
}

const getTourSteps = (hasBooks: boolean, onOpenFirstBook?: () => void): TourStep[] => {
  return [
    {
      id: "welcome",
      title: "Welcome to DuoRead! 🎉",
      description: "Let's take a quick tour to help you get started. I'll show you the key features in about 1 minute.",
      position: "center",
      context: "library",
      icon: <Book className="w-8 h-8" />
    },
    {
      id: "upload",
      title: "Upload Your Books 📚",
      description: "Click 'Upload Book' to add PDFs to your library. Maximum file size is 10MB. Your books will be processed automatically.",
      targetElement: "[data-tour='upload-button']",
      position: "bottom",
      context: "library",
      icon: <Upload className="w-6 h-6" />
    },
    ...(hasBooks ? [
      {
        id: "read",
        title: "Open & Read Books 📖",
        description: "Click 'Read' on any book to open it. Once inside, you'll see powerful reading tools.",
        targetElement: "[data-tour='read-button']",
        position: "bottom",
        context: "library" as const,
        icon: <Eye className="w-6 h-6" />,
        action: onOpenFirstBook
      },
      {
        id: "mode-toggle",
        title: "Choose Your Mode ⚡",
        description: "Switch between Offline mode (local browser AI) and Hybrid mode (server AI). Offline mode is fast and private, while Hybrid mode offers more features like the DuoRead Agent!",
        targetElement: "[data-tour='mode-toggle']",
        position: "top",
        context: "book" as const,
        icon: <ArrowLeftRight className="w-6 h-6" />,
        autoAction: async () => {
          console.log('Mode toggle step - no action needed, just highlight');
          // No need to wait or do anything, just display the highlight
          // The highlight will be shown by the tour system automatically
        },
        waitAfterAction: 1000
      },
      {
        id: "select-word",
        title: "Select a Word 📝",
        description: "Select a single word to get word-specific actions like synonyms, definitions, and pronunciations!",
        position: "bottom",
        context: "book" as const,
        icon: <Book className="w-6 h-6" />,
        autoAction: async () => {
          // Select a single word
          console.log('Waiting for PDF to be fully loaded...');
          
          // Wait a bit for text layer to be rendered
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Attempting to select a word...');
          
          // Find all text spans in the PDF
          const textSpans = document.querySelectorAll('.react-pdf__Page__textContent span');
          console.log('Found text spans:', textSpans.length);
          
          if (textSpans.length > 0) {
            // Find the first span with actual text content
            for (let i = 0; i < textSpans.length; i++) {
              const span = textSpans[i] as HTMLElement;
              if (span.textContent && span.textContent.trim().length > 0) {
                const text = span.textContent.trim();
                // Check if it's a single word
                if (text.split(/\s+/).length === 1) {
                  console.log('Selecting word:', text);
                  const range = document.createRange();
                  range.selectNodeContents(span);
                  
                  const selection = window.getSelection();
                  if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Trigger a mouseup event to trigger the toolbar
                    const mouseUpEvent = new MouseEvent('mouseup', {
                      bubbles: true,
                      cancelable: true,
                      view: window
                    });
                    span.dispatchEvent(mouseUpEvent);
                  }
                  break;
                }
              }
            }
          }
        },
        waitAfterAction: 2000
      },
      {
        id: "select-text",
        title: "Select Text 📝",
        description: "Now select multiple words to see different actions like translate, simplify, and explain!",
        position: "bottom",
        context: "book" as const,
        icon: <Book className="w-6 h-6" />,
        autoAction: async () => {
          // Select multiple words
          console.log('Attempting to select text...');
          
          // Wait a bit
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find all text spans in the PDF
          const textSpans = document.querySelectorAll('.react-pdf__Page__textContent span');
          
          if (textSpans.length > 2) {
            // Select first few spans for multi-word selection
            const startSpan = textSpans[0] as HTMLElement;
            const endSpan = textSpans[Math.min(3, textSpans.length - 1)] as HTMLElement;
            
            if (startSpan && endSpan && startSpan.textContent && endSpan.textContent) {
              console.log('Selecting text from multiple spans');
              const range = document.createRange();
              range.setStartBefore(startSpan);
              range.setEndAfter(endSpan);
              
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Trigger a mouseup event to trigger the toolbar
                const mouseUpEvent = new MouseEvent('mouseup', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                startSpan.dispatchEvent(mouseUpEvent);
              }
            }
          }
        },
        waitAfterAction: 2000
      },
      {
        id: "sticky-notes",
        title: "Save Your Insights 📝",
        description: "Click the 'Sticky Note' button on the toolbar to save this text with your insights. You can add notes, choose colors, and organize your learning!",
        targetElement: "[data-tour='toolbar-sticky-note']",
        position: "bottom",
        context: "book" as const,
        icon: <StickyNote className="w-6 h-6" />,
        autoAction: async () => {
          console.log('Looking for save note button in floating toolbar...');
          // Wait for toolbar to be visible and user sees the highlight
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Find the save note button
          const saveNoteButton = document.querySelector("[data-tour='toolbar-sticky-note']") as HTMLElement;
          console.log('Found save note button:', saveNoteButton);
          
          if (saveNoteButton) {
            console.log('Clicking save note button...');
            saveNoteButton.click();
            
            // Wait for modal to open
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Find the save button in the modal dialog
            const modalSaveButtons = document.querySelectorAll('[role="dialog"] button');
            for (let btn of modalSaveButtons) {
              const text = btn.textContent?.trim() || '';
              if (text.includes('Save') && (text.includes('Sticky') || text.includes('Note'))) {
                console.log('Found save button in modal:', btn);
                await new Promise(resolve => setTimeout(resolve, 300));
                (btn as HTMLElement).click();
                break;
              }
            }
          } else {
            console.log('Save note button not found on toolbar');
          }
        },
        waitAfterAction: 1500
      },
      {
        id: "view-sticky-notes",
        title: "View Your Sticky Notes 📝",
        description: "You saved a sticky note! Click the button here anytime to view all your saved notes organized by book and page.",
        targetElement: "[data-tour='sticky-note-button']",
        position: "top",
        context: "book" as const,
        icon: <StickyNote className="w-6 h-6" />,
        autoAction: async () => {
          console.log('Checking sticky notes sidebar...');
          // Wait a bit to show the highlight first
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find the sticky notes button
          const stickyButton = document.querySelector("[data-tour='sticky-note-button']") as HTMLElement;
          if (!stickyButton) {
            console.log('Sticky notes button not found');
            return;
          }
          
          // Check if sidebar is already visible by looking for the sidebar element
          const sidebar = document.querySelector('div[class*="w-80 fixed"][style*="right"]');
          const isSidebarOpen = sidebar && getComputedStyle(sidebar as HTMLElement).display !== 'none';
          
          console.log('Sidebar is open:', isSidebarOpen);
          
          // Only open if not already open
          if (!isSidebarOpen) {
            console.log('Opening sticky notes sidebar...');
            stickyButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log('Sidebar already open');
          }
        },
        waitAfterAction: 1000
      },
      {
        id: "add-to-chat",
        title: "Add Context to Chat 💬",
        description: "Select text and click 'Add to Chat' to send it to the DuoRead Agent. This helps the agent understand what you're reading!",
        targetElement: "[data-tour='toolbar-add-to-chat']",
        position: "right",
        context: "book" as const,
        icon: <MessageSquare className="w-6 h-6" />,
        autoAction: async () => {
          console.log('Waiting for toolbar...');
          // Wait a moment for the toolbar to be visible from previous step
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Find the add to chat button
          const addToChatButton = document.querySelector("[data-tour='toolbar-add-to-chat']") as HTMLElement;
          console.log('Found add to chat button:', addToChatButton);
          
          if (addToChatButton) {
            console.log('Clicking add to chat button...');
            addToChatButton.click();
            
            // Wait a bit for the click to register
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Clear the text selection to remove the highlight rectangle
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log('Add to chat button not found on toolbar');
          }
        },
        waitAfterAction: 1500
      },
      {
        id: "chat",
        title: "Ask the DuoRead Agent 💬",
        description: "Now ask the agent anything about your book! The chat sidebar is highlighted. Type your question in the input box at the bottom.",
        targetElement: "[data-tour='chat-sidebar']",
        position: "right",
        context: "book" as const,
        icon: <MessageSquare className="w-6 h-6" />,
        autoAction: async () => {
          console.log('Looking for chat input...');
          
          // Wait for chat input to be ready
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Find the chat input using the data-tour attribute
          let chatInput = document.querySelector('[data-tour="chat-input"]') as HTMLInputElement;
          
          console.log('Found chat input:', chatInput);
          
          if (chatInput) {
            const message = "Help me understand this part of the book";
            
            // Focus and set value
            chatInput.focus();
            chatInput.value = message;
            
            // Trigger React onChange using the proper method for Input element
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(chatInput, message);
              const inputEvent = new Event('input', { bubbles: true });
              chatInput.dispatchEvent(inputEvent);
            }
            
            // Also try setting value directly
            const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (setValue) {
              setValue.call(chatInput, message);
              chatInput.dispatchEvent(new Event('input', { bubbles: true }));
              chatInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Wait a bit for value to register
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Find and click the send button (it's the sibling button after the input)
            let sendButton = chatInput.parentElement?.querySelector('button[type="button"]:has([class*="Send"])') as HTMLButtonElement;
            
            if (!sendButton) {
              // Try to find button in the same parent div
              const container = chatInput.parentElement;
              if (container) {
                sendButton = container.querySelector('button:has(svg)') as HTMLButtonElement;
              }
            }
            
            if (!sendButton) {
              // Fallback: search for button with Send icon
              const allButtons = document.querySelectorAll('button');
              for (let btn of allButtons) {
                if (btn.querySelector('svg') || btn.textContent?.includes('Send')) {
                  sendButton = btn as HTMLButtonElement;
                  break;
                }
              }
            }
            
            console.log('Found send button:', sendButton);
            if (sendButton) {
              sendButton.click();
              await new Promise(resolve => setTimeout(resolve, 300));
            } else {
              console.log('Send button not found');
            }
          } else {
            console.log('Chat input not found');
          }
        },
        waitAfterAction: 2000
      },
      {
        id: "complete",
        title: "You're All Set! 🚀",
        description: "You now know how to use DuoRead! Try selecting text to see the tools in action, or go back to upload more books.",
        position: "center",
        context: "book" as const,
        icon: <Book className="w-8 h-8" />
      }
    ] : [
      {
        id: "complete",
        title: "You're All Set! 🚀",
        description: "Start by uploading your first book, then come back here to learn about all the reading features!",
        position: "center",
        context: "library" as const,
        icon: <Book className="w-8 h-8" />
      }
    ])
  ];
};

export const OnboardingTour = ({ onComplete, onSkip, hasBooks = false, onOpenFirstBook, isInBook = false, isPdfReady = false }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [hasExecutedAction, setHasExecutedAction] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const prevStepIdRef = useRef<string | null>(null);
  
  // Memoize the tour steps so they don't change on every render
  const tourSteps = useMemo(() => getTourSteps(hasBooks, onOpenFirstBook), [hasBooks, onOpenFirstBook]);
  
  // Filter steps based on current context
  const visibleSteps = useMemo(() => {
    // If we're in the book and have steps that require book context, show only book steps
    if (isInBook) {
      return tourSteps.filter(step => step.context === "book" || !step.context);
    }
    return tourSteps;
  }, [isInBook, tourSteps]);
  
  // Adjust position for tooltip based on step position
  const getTooltipPosition = () => {
    if (currentStepData.position === "top") {
      return { justifyContent: 'flex-end' as const, alignItems: 'flex-start' as const };
    } else if (currentStepData.position === "bottom") {
      return { justifyContent: 'flex-end' as const, alignItems: 'flex-end' as const };
    } else if (currentStepData.position === "left") {
      return { justifyContent: 'flex-start' as const, alignItems: 'center' as const };
    } else if (currentStepData.position === "right") {
      return { justifyContent: 'flex-end' as const, alignItems: 'center' as const };
    }
    return { justifyContent: 'center' as const, alignItems: 'center' as const };
  };

  useEffect(() => {
    const step = visibleSteps[currentStep];
    
    const executeStep = async () => {
      // Wait for PDF to be ready if this is a book-related autoAction step
      // BUT skip PDF wait for mode-toggle step as it's in the header
      if (step?.autoAction && isInBook && !isPdfReady && step.id !== 'mode-toggle') {
        console.log('Waiting for PDF to be ready...');
        return; // Don't execute yet, will retry when isPdfReady changes
      }
      
      // Execute action if this step has one (like opening a book) - only once
      if (step?.action && !hasExecutedAction) {
        step.action();
        setHasExecutedAction(true);
      }
      
      // Execute auto action if this step has one (like selecting text, clicking buttons)
      if (step?.autoAction && !hasExecutedAction) {
        // If step has a target element, show highlight first, then execute action
        // BUT skip highlight for sticky notes step (will show after opening)
        if (step.targetElement && step.position && step.id !== 'view-sticky-notes') {
          // For mode-toggle, wait a bit to ensure element is rendered
          if (step.id === 'mode-toggle') {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const element = document.querySelector(step.targetElement!);
          if (element) {
            const rect = element.getBoundingClientRect();
            const padding = 10;
            
            setOverlayStyle({
              top: `${rect.top - padding}px`,
              left: `${rect.left - padding}px`,
              width: `${rect.width + padding * 2}px`,
              height: `${rect.height + padding * 2}px`,
              borderRadius: '8px'
            });
          }
        }
        
        setIsExecutingAction(true);
        
        // Execute the auto action (it will wait internally if needed)
        await step.autoAction();
        
        // Wait after the action if specified
        if (step.waitAfterAction) {
          await new Promise(resolve => setTimeout(resolve, step.waitAfterAction));
        }
        
        setHasExecutedAction(true);
      }
      
      // Show overlay for steps without autoAction (manual user interaction)
      if (step?.targetElement && step.position && !step.autoAction && !isExecutingAction) {
        const element = document.querySelector(step.targetElement!);
        if (element) {
          const rect = element.getBoundingClientRect();
          const padding = 10;
          
          setOverlayStyle({
            top: `${rect.top - padding}px`,
            left: `${rect.left - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`,
            borderRadius: '8px'
          });
        } else {
          setOverlayStyle({});
        }
      } else if (!step.autoAction && !isExecutingAction) {
        setOverlayStyle({});
      }
      
      // For sticky notes step: clear highlight when sidebar is open or after auto action completes
      if (step?.id === 'view-sticky-notes') {
        if (hasExecutedAction) {
          setOverlayStyle({});
        } else if (isExecutingAction) {
          // Check periodically if sidebar is open
          setTimeout(() => {
            const sidebar = document.querySelector('div[class*="w-80 fixed"][style*="right"]');
            const isSidebarOpen = sidebar && getComputedStyle(sidebar as HTMLElement).display !== 'none';
            if (isSidebarOpen) {
              setOverlayStyle({});
            }
          }, 1000);
        }
      }
      
      // For add-to-chat step: clear highlight after button is clicked and text selection is cleared
      if (step?.id === 'add-to-chat' && hasExecutedAction) {
        setOverlayStyle({});
      }
      
      // For chat step: keep overlay visible to highlight the chat sidebar
      if (step?.id === 'chat' && hasExecutedAction) {
        // Keep overlay visible to show the chat sidebar has context
        const element = document.querySelector(step.targetElement!);
        if (element) {
          const rect = element.getBoundingClientRect();
          const padding = 10;
          setOverlayStyle({
            top: `${rect.top - padding}px`,
            left: `${rect.left - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`,
            borderRadius: '8px'
          });
        }
      }
    };
    
    executeStep();
  }, [currentStep, visibleSteps, hasExecutedAction, isExecutingAction, isInBook, isPdfReady]);

  // Reset action execution when moving to a new step
  useEffect(() => {
    setHasExecutedAction(false);
    setIsExecutingAction(false);
  }, [currentStep]);

  // Close sticky notes sidebar when leaving the view-sticky-notes step
  useEffect(() => {
    const currentStepData = visibleSteps[currentStep];
    const currentStepId = currentStepData?.id;
    
    // If we just moved away from the view-sticky-notes step, close the sidebar
    if (prevStepIdRef.current === 'view-sticky-notes' && currentStepId !== 'view-sticky-notes') {
      console.log('Closing sticky notes sidebar...');
      setTimeout(() => {
        const stickyButton = document.querySelector("[data-tour='sticky-note-button']") as HTMLElement;
        if (stickyButton) {
          // Check if sidebar is open before clicking
          const sidebar = document.querySelector('div[class*="w-80 fixed"][style*="right"]');
          const isSidebarOpen = sidebar && getComputedStyle(sidebar as HTMLElement).display !== 'none';
          if (isSidebarOpen) {
            stickyButton.click();
          }
        }
      }, 100);
    }
    
    // Update ref for next step
    prevStepIdRef.current = currentStepId;
  }, [currentStep, visibleSteps]);

  const handleNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsExecutingAction(false);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const currentStepData = visibleSteps[currentStep];
  const showOverlay = currentStepData?.targetElement && currentStepData.position;

  // Check if current step has autoAction
  const hasAutoAction = !!currentStepData.autoAction;
  // Some autoAction steps still need blur overlay (like chat step), but NOT mode-toggle or upload
  const showBlurOverlay = (hasAutoAction && currentStepData?.id === 'chat') || (!hasAutoAction && currentStepData?.id !== 'upload' && currentStepData?.id !== 'mode-toggle');
  
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Full dark overlay with cutout for highlighted element */}
      {showBlurOverlay && showOverlay && Object.keys(overlayStyle).length > 0 && (
        <>
          {/* Top overlay - stops before the highlighted element */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              top: 0,
              left: 0,
              width: `${parseFloat(overlayStyle.left as string)}px`,
              height: `${parseFloat(overlayStyle.top as string)}px`,
              pointerEvents: 'auto'
            }}
          />
          {/* Top overlay - after the highlighted element */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              top: 0,
              left: `${parseFloat(overlayStyle.left as string) + parseFloat(overlayStyle.width as string)}px`,
              right: 0,
              height: `${parseFloat(overlayStyle.top as string)}px`,
              pointerEvents: 'auto'
            }}
          />
          {/* Bottom overlay - stops before the highlighted element */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              top: `${parseFloat(overlayStyle.top as string) + parseFloat(overlayStyle.height as string)}px`,
              left: 0,
              width: `${parseFloat(overlayStyle.left as string)}px`,
              bottom: 0,
              pointerEvents: 'auto'
            }}
          />
          {/* Bottom overlay - after the highlighted element */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              top: `${parseFloat(overlayStyle.top as string) + parseFloat(overlayStyle.height as string)}px`,
              left: `${parseFloat(overlayStyle.left as string) + parseFloat(overlayStyle.width as string)}px`,
              right: 0,
              bottom: 0,
              pointerEvents: 'auto'
            }}
          />
          {/* Left overlay */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              top: `${parseFloat(overlayStyle.top as string)}px`,
              left: 0,
              width: `${parseFloat(overlayStyle.left as string)}px`,
              height: `${parseFloat(overlayStyle.height as string)}px`,
              pointerEvents: 'auto'
            }}
          />
          {/* Right overlay */}
          <div
            className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              top: `${parseFloat(overlayStyle.top as string)}px`,
              left: `${parseFloat(overlayStyle.left as string) + parseFloat(overlayStyle.width as string)}px`,
              right: 0,
              height: `${parseFloat(overlayStyle.height as string)}px`,
              pointerEvents: 'auto'
            }}
          />
        </>
      )}
      
      {/* Border highlight - show for all steps with target */}
      {showOverlay && Object.keys(overlayStyle).length > 0 && (
        <div
          className="absolute border-4 border-primary rounded-lg bg-transparent transition-all duration-300 pointer-events-auto"
          style={overlayStyle}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      
      {/* Full overlay for center-positioned steps */}
      {showBlurOverlay && !showOverlay && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Tooltip */}
      <div 
        className="absolute inset-0 pointer-events-none p-4"
        style={{
          display: 'flex',
          ...getTooltipPosition()
        }}
      >
        <div
          className={`bg-background rounded-lg shadow-2xl border-2 border-primary p-6 max-w-md pointer-events-auto ${
            currentStepData.position === "center" ? "w-full max-w-lg" : ""
          }`}
          style={{
            animation: "fadeIn 0.3s ease-in-out",
            marginBottom: currentStepData.position === "bottom" ? '20px' : currentStepData.position === "top" ? '60px' : '0',
            marginRight: (currentStepData.position === "bottom" || currentStepData.position === "top") ? '20px' : '0',
            marginLeft: currentStepData.position === "left" ? '20px' : '0',
            marginTop: currentStepData.position === "left" || currentStepData.position === "right" ? '20px' : '0'
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              {currentStepData.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2 gap-2">
                <h3 className="text-xl font-bold truncate">{currentStepData.title}</h3>
                <button
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  title="Skip tour"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border gap-2">
                <div className="flex gap-2 min-w-0">
                  {Array.from({ length: visibleSteps.length }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all flex-shrink-0 ${
                        index === currentStep
                          ? "w-8 bg-primary"
                          : "w-2 bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="gap-2"
                  >
                    {currentStep === visibleSteps.length - 1 ? "Get Started" : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

