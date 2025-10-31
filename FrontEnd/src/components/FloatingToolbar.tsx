import { useState, useEffect } from "react";
import { 
  Languages, 
  BookOpen, 
  Volume2, 
  Shuffle, 
  Lightbulb, 
  MessageSquare,
  FileText,
  Sparkles,
  Copy,
  StickyNote as StickyNoteIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { SaveStickyNoteModal } from "./SaveStickyNoteModal";
import { StickyNoteColor, StickyNoteToolType } from "@/types/stickyNote";
import { useStreamingAI } from "@/hooks/useStreamingAI";
import { 
  getBCP47Code, 
  isTranslatorAPIAvailable,
  isPromptAPIAvailable,
  isWriterAPIAvailable,
  isRewriterAPIAvailable,
  isSummarizerAPIAvailable
} from "@/lib/languageMapping";

const API_BASE = "https://zainattiq-duoread.hf.space";

interface FloatingToolbarProps {
  selectedText: string;
  position: { x: number; y: number };
  isSingleWord: boolean;
  onAddToChat: (text: string) => void;
  onClose: () => void;
  bookId: string;
  pageNumber: number;
  onSaveStickyNote: (data: {
    selected_text: string;
    tool_output: string;
    tool_type: StickyNoteToolType;
    color: StickyNoteColor;
  }) => Promise<void>;
  pdfContainerBounds?: DOMRect | null;
  bookLanguage?: string;
  processingMode: 'client' | 'hybrid';
}

export const FloatingToolbar = ({
  selectedText,
  position,
  isSingleWord,
  onAddToChat,
  onClose,
  bookId,
  pageNumber,
  onSaveStickyNote,
  pdfContainerBounds,
  bookLanguage,
  processingMode
}: FloatingToolbarProps) => {
  const { token, user } = useAuth();
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showSaveStickyNoteModal, setShowSaveStickyNoteModal] = useState(false);
  const { streamResponse, isStreaming, streamedText, error, reset } = useStreamingAI();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug log for PDF container bounds and positioning
  useEffect(() => {
    if (pdfContainerBounds) {
      console.log('PDF Container Bounds:', pdfContainerBounds);
      console.log('Window Dimensions:', windowDimensions);
      console.log('Selected Text Position:', position);
    }
  }, [pdfContainerBounds, windowDimensions, position]);

  const handleSynonym = async () => {
    if (!token) {
      toast.error("Authentication required for synonyms");
      return;
    }

    setLoading(true);
    setShowResult(true);
    setLoadingMessage("Reading text...");
    
    try {
      if (processingMode === 'client') {
        // Check if Chrome Prompt API is available
        if (isPromptAPIAvailable()) {
          console.log("Client mode - Prompt API available, trying Chrome synonyms...");
          // Use Chrome's built-in Prompt API
          try {
            await handleChromeSynonyms();
          } catch (chromeError) {
            console.log("Chrome synonyms failed, falling back to backend:", chromeError);
            // Fallback to backend API on error
            await handleBackendSynonyms(token);
          }
      } else {
          console.log("Client mode - Prompt API not available, using backend...");
          // Fallback to backend API if Chrome Prompt API is not available
          await handleBackendSynonyms(token);
        }
      } else {
        console.log("Hybrid mode - using backend API for synonyms");
        await handleBackendSynonyms(token);
      }
      setLoadingMessage("");
    } catch (error) {
      console.error("Synonyms error:", error);
      toast.error("Unable to get synonyms");
      
      // Show "No Synonyms Found" as final fallback
        setResult({
          type: "synonym",
        data: { noSynonymsFound: true }
        });
      setLoadingMessage("");
    } finally {
        setLoading(false);
      }
  };

  const handleChromeSynonyms = async () => {
    console.log("handleChromeSynonyms called for word:", selectedText);
    
    try {
      // Check availability of the Language Model
      console.log("Checking LanguageModel.availability...");
      const availability = await window.LanguageModel.availability();
      console.log("LanguageModel availability status:", availability);

      let session;
      
      if (availability === "unavailable") {
        console.log("Prompt API unavailable - model cannot be downloaded");
        throw new Error("Prompt API not available");
      } else if (availability === "downloadable") {
        console.log("Model is downloadable - starting download");
        setLoadingMessage("Downloading AI model (first time only)...");
        // Model needs to be downloaded
        session = await window.LanguageModel.create({
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, session created");
      } else if (availability === "downloading") {
        console.log("Model is already downloading in progress");
        setLoadingMessage("Model download in progress...");
        // Model is already downloading
        session = await window.LanguageModel.create({
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, session created");
      } else if (availability === "available") {
        console.log("Model is ready and available");
        // Model is ready
        setLoadingMessage("Getting synonyms...");
        session = await window.LanguageModel.create();
        console.log("Session created successfully");
      } else {
        console.log("Unknown availability status:", availability);
        throw new Error("Unknown model availability status");
      }

      // Define JSON Schema for structured output
      const schema = {
        type: "array",
        items: {
          type: "string"
        }
      };

      // Create a prompt to get synonyms
      const prompt = `Generate 5-10 synonyms for the word "${selectedText}". Return only a JSON array of synonym words, nothing else.`;
      
      console.log("Prompting model for synonyms with schema...");
      // Use structured output to get a clean array of synonyms
      const result = await session.prompt(prompt, {
        responseConstraint: schema,
        omitResponseConstraintInput: false
      });
      
      console.log("Model response received:", result);
      
      // Parse the JSON array response
      const synonymsArray = JSON.parse(result);
      console.log("Parsed synonyms array:", synonymsArray);
      
      if (Array.isArray(synonymsArray) && synonymsArray.length > 0) {
        // Format the response to match the expected structure
        const synonyms = {
          noun: {
            syn: synonymsArray
          },
          fromLLM: true // Flag to indicate this came from LLM
        };

        console.log("Setting synonyms result with", synonymsArray.length, "synonyms");
        setResult({
          type: "synonym",
          data: synonyms
        });
        setShowResult(true);
      } else {
        console.error("No synonyms received from Prompt API or invalid format");
        throw new Error("No synonyms received from Prompt API");
      }

      // Clean up session
      console.log("Cleaning up session...");
      session.destroy();
      console.log("Session destroyed successfully");
    } catch (error) {
      console.error("Chrome synonyms error:", error);
      console.error("Error details:", error.message);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  };

  const handleBackendSynonyms = async (authToken: string) => {
    console.log("handleBackendSynonyms called for word:", selectedText);
    
    try {
      setLoadingMessage("Getting synonyms from AI...");
      
      const response = await axios.post(
        `${API_BASE}/books/synonyms`,
        {
          word: selectedText,
          language: "English"
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      console.log("Backend synonyms response:", response.data);

      if (response.data.success && response.data.synonyms && response.data.synonyms.length > 0) {
        // Format the response to match the expected structure
        const synonyms = {
          noun: {
            syn: response.data.synonyms
          },
          fromLLM: true // Flag to indicate this came from LLM
        };

        console.log("Setting backend synonyms result with", response.data.synonyms.length, "synonyms");
        setResult({
          type: "synonym",
          data: synonyms
        });
        setShowResult(true);
      } else {
        console.error("Backend returned no synonyms");
        throw new Error("No synonyms received from backend");
      }
    } catch (error) {
      console.error("Backend synonyms error:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  const handleDefinition = async () => {
    setLoading(true);
    setShowResult(true);
    setLoadingMessage("Getting definition...");
    
    // In offline/client mode, directly call Prompt API for definitions
    if (processingMode === 'client') {
      await handleLLMDefinition();
      return;
    }
    
    // In hybrid mode, try Words API first, then fallback to LLM
    try {
      // First try the Words API
      const response = await axios.get(
        `https://wordsapiv1.p.rapidapi.com/words/${selectedText}/definitions`,
        {
          headers: {
            "x-rapidapi-key": "2b9c0e2c71mshb674076e6888a18p14e7f1jsn04a9d2ed6407",
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com"
          }
        }
      );
      
      // Debug logging
      console.log('Words API Response:', response.data);
      
      // Check if definitions array is empty or doesn't exist
      if (!response.data.definitions || response.data.definitions.length === 0) {
        console.log('No definitions found, calling LLM...');
        // Fallback to LLM-based definition
        await handleLLMDefinition();
      } else {
        console.log('Definitions found, using Words API result');
        setResult({
          type: "definition",
          data: response.data
        });
        setShowResult(true);
        setLoading(false);
      }
    } catch (error) {
      console.log('Words API error:', error);
      console.log('Error type:', error.name);
      console.log('Error message:', error.message);
      
      // Check for various error types that should trigger LLM fallback
      const shouldFallbackToLLM = 
        // HTTP errors
        error.response?.status === 404 || 
        error.response?.status === 400 ||
        error.response?.status === 403 ||
        error.response?.status === 500 ||
        // Network errors
        error.name === 'NetworkError' ||
        error.name === 'TypeError' ||
        error.message?.includes('CORS') ||
        error.message?.includes('cors') ||
        error.message?.includes('Cross-Origin') ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network request failed') ||
        // Other common API errors
        error.code === 'NETWORK_ERROR' ||
        error.code === 'CORS_ERROR';
      
      if (shouldFallbackToLLM) {
        console.log('Words API failed, calling LLM fallback...');
        await handleLLMDefinition();
      } else {
        console.log('Words API failed with unexpected error, still calling LLM...');
        await handleLLMDefinition();
      }
    } finally {
      setLoadingMessage("");
    }
  };

  const handleLLMDefinition = async () => {
    if (!token) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      if (processingMode === 'client') {
        // Check if Chrome Prompt API is available
        if (isPromptAPIAvailable()) {
          console.log("Client mode - Prompt API available, trying Chrome definition...");
          // Use Chrome's built-in Prompt API
          try {
            await handleChromeDefinition();
          } catch (chromeError) {
            console.log("Chrome definition failed, falling back to backend:", chromeError);
            // Fallback to backend API on error
            await handleBackendDefinition(token);
          }
        } else {
          console.log("Client mode - Prompt API not available, using backend...");
          // Fallback to backend API if Chrome Prompt API is not available
          await handleBackendDefinition(token);
        }
      } else {
        console.log("Hybrid mode - using backend API for definition");
        await handleBackendDefinition(token);
      }
    } catch (error) {
      console.error("Definition error:", error);
      toast.error("Unable to get definition from AI");
      
      // Show "No Definition Found" as final fallback
      setResult({
        type: "definition",
        data: { definitions: [], noDefinitionFound: true }
      });
      setShowResult(true);
      setLoading(false);
    }
  };

  const handleChromeDefinition = async () => {
    console.log("handleChromeDefinition called for word:", selectedText);
    
    try {
      // Check availability of the Language Model
      console.log("Checking LanguageModel.availability...");
      const availability = await window.LanguageModel.availability();
      console.log("LanguageModel availability status:", availability);

      let session;
      
      if (availability === "unavailable") {
        console.log("Prompt API unavailable - model cannot be downloaded");
        throw new Error("Prompt API not available");
      } else if (availability === "downloadable") {
        console.log("Model is downloadable - starting download");
        setLoadingMessage("Downloading AI model (first time only)...");
        // Model needs to be downloaded
        session = await window.LanguageModel.create({
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, session created");
      } else if (availability === "downloading") {
        console.log("Model is already downloading in progress");
        setLoadingMessage("Model download in progress...");
        // Model is already downloading
        session = await window.LanguageModel.create({
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, session created");
      } else if (availability === "available") {
        console.log("Model is ready and available");
        setLoadingMessage("Getting definition...");
        // Model is ready
        session = await window.LanguageModel.create();
        console.log("Session created successfully");
      } else {
        console.log("Unknown availability status:", availability);
        throw new Error("Unknown model availability status");
      }

      // Create a prompt to get word definition
      const prompt = `You are a professional lexicographer. Provide a clear and comprehensive definition of the word "${selectedText}".

Rules:
1. Provide the primary definition of the word
2. Include the part of speech (noun, verb, adjective, adverb, etc.)
3. If there are multiple meanings, provide the most common one
4. Use clear, accessible language
5. Provide examples or context when helpful
6. Return only the definition, no meta-commentary
7. Format: Start with the part of speech in parentheses, then the definition

Word: ${selectedText}

Definition:`;
      
      console.log("Prompting model to get definition...");
      const result = await session.prompt(prompt);
      
      console.log("Model response received:", result);
      
      if (result && result.trim()) {
        // Extract part of speech if provided
        const partsOfSpeech = ["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection"];
        let partOfSpeech = "noun"; // default
        let definition = result.trim();
        
        // Try to extract part of speech from response
        for (const pos of partsOfSpeech) {
          if (result.toLowerCase().includes(pos)) {
            partOfSpeech = pos;
            // Try to clean up the definition if it includes the part of speech
            definition = definition.replace(new RegExp(`\\(${pos}\\)`, 'i'), '').trim();
            break;
          }
        }
        
        // Format the response to match the expected structure
        const llmDefinition = {
          definitions: [{
            definition: definition,
            partOfSpeech: partOfSpeech
          }],
          word: selectedText,
          fromLLM: true // Flag to indicate this came from LLM
        };

        console.log("Setting definition result");
        setResult({
          type: "definition",
          data: llmDefinition
        });
        setShowResult(true);
        setLoading(false);
      } else {
        console.error("No definition received from Prompt API");
        throw new Error("No definition received from Prompt API");
      }

      // Clean up session
      console.log("Cleaning up session...");
      session.destroy();
      console.log("Session destroyed successfully");
    } catch (error) {
      console.error("Chrome definition error:", error);
      console.error("Error details:", error.message);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  };

  const handleBackendDefinition = async (authToken: string) => {
    console.log("handleBackendDefinition called for word:", selectedText);
    
    try {
      const response = await axios.post(
        `${API_BASE}/books/definition`,
        {
          word: selectedText,
          language: "English"
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      console.log("Backend definition response:", response.data);

      if (response.data.success && response.data.definition) {
        // Format the LLM response to match the expected structure
        const llmDefinition = {
          definitions: [{
            definition: response.data.definition,
            partOfSpeech: "noun" // Default part of speech for LLM definitions
          }],
          word: response.data.word,
          fromLLM: true // Flag to indicate this came from LLM
        };

        console.log("Setting backend definition result");
        setResult({
          type: "definition",
          data: llmDefinition
        });
        setShowResult(true);
        setLoading(false);
      } else {
        throw new Error("No definition received from backend");
      }
    } catch (error) {
      console.error("Backend definition error:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  const handlePronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      toast.success("Reading aloud");
    } else {
      toast.error("Text-to-speech not supported");
    }
  };

  const handleTranslate = async () => {
    if (!user) return;
    setLoading(true);
    setShowResult(true);
    setLoadingMessage("Reading Text...");
    reset(); // Reset streaming state
    
    setTimeout(() => {
      setLoadingMessage(isSingleWord ? "Translating word..." : "Translating...");
    }, 1000);

    try {
      if (processingMode === 'client') {
        // Check if Chrome Translator API is available
        if (isTranslatorAPIAvailable()) {
          console.log("Client mode - Translator API available, trying Chrome translation...");
          // Use Chrome's built-in Translator API
          await handleChromeTranslation();
        } else {
          // Fallback to backend API if Chrome Translator API is not available
          console.log("Client mode - Translator API not available, using backend...");
          if (!token) {
            toast.error("Authentication required for translation");
            setShowResult(false);
            return;
          }
          await handleBackendTranslation(token);
        }
      } else {
        console.log("Hybrid mode - using backend API for translation");
        if (!token) {
          toast.error("Authentication required for translation");
          setShowResult(false);
          return;
        }
        await handleBackendTranslation(token);
      }
      setLoadingMessage("");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed");
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChromeTranslation = async () => {
    // Get BCP 47 codes for both source and target languages
    const sourceLanguageCode = getBCP47Code(bookLanguage || "English");
    const targetLanguageCode = getBCP47Code(user!.native_language);
    
    if (!sourceLanguageCode) {
      toast.error("Unsupported book language");
      return;
    }
    
    if (!targetLanguageCode) {
      toast.error("Unsupported target language");
      return;
    }

    // If source and target are the same, show error
    if (sourceLanguageCode === targetLanguageCode) {
      toast.error("Source and target languages are the same");
      setShowResult(false);
      return;
    }

    try {
      // Check availability of translation models
      const availability = await window.Translator.availability({
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLanguageCode,
      });

      let translator;
      let downloadProgress = 0;

      if (availability === "unavailable") {
        // Fallback to backend API
        if (token) {
          await handleBackendTranslation(token);
          return;
        } else {
          toast.error("Translation not available for this language pair");
          setShowResult(false);
          return;
        }
      } else if (availability === "available") {
        // Model is ready, create translator directly
        translator = await window.Translator.create({
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLanguageCode,
        });
      } else {
        // Model needs to be downloaded
        setLoadingMessage("Downloading translation model...");
        translator = await window.Translator.create({
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLanguageCode,
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              downloadProgress = progress;
              setLoadingMessage(`Downloading translation model: ${progress}%`);
            });
          },
        });
      }

      // Perform translation
      setLoadingMessage("Translating...");
      const translation = await translator.translate(selectedText);

      setResult({
        type: "translate",
        data: translation,
      });

      // Clean up translator
      translator.destroy();
    } catch (error) {
      console.error("Translation failed:", error);
      throw error;
    }
  };

  const handleBackendTranslation = async (authToken: string) => {
    try {
      // Use dedicated single word endpoint for single words, streaming for longer texts
      if (isSingleWord) {
      const response = await axios.post(
          `${API_BASE}/books/translate-word`,
        {
            word: selectedText,
          current_language: "auto",
            to_language: user!.native_language
        },
        {
          headers: {
              Authorization: `Bearer ${authToken}`
          }
        }
      );

      setResult({
        type: "translate",
          data: response.data.translated_word
        });
      } else {
        // Use streaming for longer texts
        const fullResponse = await streamResponse('/books/translate/stream', {
          text: selectedText,
          current_language: "auto",
          to_language: user!.native_language
        }, authToken);

        setResult({
          type: "translate",
          data: fullResponse
        });
      }
    } catch (error) {
      console.error("Backend translation failed:", error);
      throw error;
    }
  };

  const handleSimplify = async () => {
    if (!token) {
      toast.error("Authentication required for simplification");
      return;
    }

    setLoading(true);
    setShowResult(true);
    setLoadingMessage("Reading text...");
    reset(); // Reset streaming state
    
    try {
      if (processingMode === 'client') {
        // Check if Chrome Rewriter API is available
        if (isRewriterAPIAvailable()) {
          console.log("Client mode - Rewriter API available, trying Chrome simplify...");
          // Use Chrome's built-in Rewriter API
          try {
            await handleChromeRewriterSimplify();
          } catch (chromeError) {
            console.log("Chrome Rewriter simplify failed, falling back to backend:", chromeError);
            // Fallback to backend API on error
            await handleBackendSimplify(token);
          }
        } else {
          console.log("Client mode - Rewriter API not available, using backend...");
          // Fallback to backend API if Chrome Rewriter API is not available
          await handleBackendSimplify(token);
        }
      } else {
        console.log("Hybrid mode - using backend API for simplify");
        await handleBackendSimplify(token);
      }
      setLoadingMessage("");
    } catch (error) {
      console.error("Simplify error:", error);
      toast.error("Simplification failed");
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChromeRewriterSimplify = async () => {
    console.log("handleChromeRewriterSimplify called for text:", selectedText);
    
    try {
      // Check availability of the Rewriter API
      console.log("Checking Rewriter.availability...");
      const availability = await window.Rewriter.availability();
      console.log("Rewriter availability status:", availability);

      let rewriter;
      
      if (availability === "unavailable") {
        console.log("Rewriter API unavailable - model cannot be downloaded");
        throw new Error("Rewriter API not available");
      } else if (availability === "downloadable") {
        console.log("Model is downloadable - starting download");
        setLoadingMessage("Downloading AI model (first time only)...");
        // Model needs to be downloaded
        rewriter = await window.Rewriter.create({
          tone: 'as-is',
          format: 'plain-text',
          length: 'as-is',
          sharedContext: 'This is for simplifying text using simpler, easier-to-understand language while preserving the original meaning and key information. Use simpler words, maintain context, and make it accessible.',
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, rewriter created");
      } else if (availability === "downloading") {
        console.log("Model is already downloading in progress");
        setLoadingMessage("Model download in progress...");
        // Model is already downloading
        rewriter = await window.Rewriter.create({
          tone: 'as-is',
          format: 'plain-text',
          length: 'as-is',
          sharedContext: 'This is for simplifying text using simpler, easier-to-understand language while preserving the original meaning and key information. Use simpler words, maintain context, and make it accessible.',
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, rewriter created");
      } else if (availability === "available") {
        console.log("Model is ready and available");
        // Model is ready
        setLoadingMessage("Simplifying text...");
        rewriter = await window.Rewriter.create({
          tone: 'as-is',
          format: 'plain-text',
          length: 'as-is',
          sharedContext: 'This is for simplifying text using simpler, easier-to-understand language while preserving the original meaning and key information. Use simpler words, maintain context, and make it accessible.'
        });
        console.log("Rewriter created successfully");
      } else {
        console.log("Unknown availability status:", availability);
        throw new Error("Unknown rewriter availability status");
      }

      console.log("Using Rewriter API to simplify text with streaming...");
      
      // Use streaming to get the simplified text
      const stream = rewriter.rewriteStreaming(selectedText, {
        context: 'Simplify this text using simpler, easier-to-understand language while preserving the original meaning and key information. Use simpler words and shorter sentences, maintain context, and make it accessible.',
        tone: 'as-is'
      });
      
      console.log("Stream received, starting to read...");
      
      let fullSimplified = '';
      let isFirstChunk = true;
      
      // Use for await loop to iterate through the stream chunks
      for await (const chunk of stream) {
        fullSimplified += chunk;
        
        // On first chunk, stop loading state to show streaming content
        if (isFirstChunk) {
          console.log("First chunk received, stopping loader");
          setLoading(false);
          setLoadingMessage("");
          isFirstChunk = false;
        }
        
        console.log("Received chunk:", chunk.substring(0, 50) + "...");
        
        // Update result in real-time for streaming display
        setResult({
          type: "simplify",
          data: fullSimplified
        });
        setShowResult(true);
      }
      
      console.log("Full simplified text received, length:", fullSimplified.length);
      
      if (fullSimplified && fullSimplified.trim()) {
        console.log("Setting final simplified result");
        setResult({
          type: "simplify",
          data: fullSimplified.trim()
        });
        setShowResult(true);
      } else {
        console.error("No simplified text received from Rewriter API");
        throw new Error("No simplified text received from Rewriter API");
      }

      // Clean up rewriter
      console.log("Cleaning up rewriter...");
      rewriter.destroy();
      console.log("Rewriter destroyed successfully");
    } catch (error) {
      console.error("Chrome Rewriter simplify error:", error);
      console.error("Error details:", error.message);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  };

  const handleBackendSimplify = async (authToken: string) => {
    console.log("handleBackendSimplify called for text:", selectedText);
    
    try {
      setLoadingMessage("Simplifying text...");
      
      const fullResponse = await streamResponse('/books/simplify/stream', {
          text: selectedText
      }, authToken);

      console.log("Backend simplify response received");
      setResult({
        type: "simplify",
        data: fullResponse
      });
      setShowResult(true);
    } catch (error) {
      console.error("Backend simplify error:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  const handleExplain = async () => {
    if (!token) {
      toast.error("Authentication required for explanation");
      return;
    }

    setLoading(true);
    setShowResult(true);
    setLoadingMessage("Reading text...");
    reset(); // Reset streaming state
    
    try {
      if (processingMode === 'client') {
        // Check if Chrome Writer API is available
        if (isWriterAPIAvailable()) {
          console.log("Client mode - Writer API available, trying Chrome explain...");
          // Use Chrome's built-in Writer API
          try {
            await handleChromeWriterExplain();
          } catch (chromeError) {
            console.log("Chrome Writer explain failed, falling back to backend:", chromeError);
            // Fallback to backend API on error
            await handleBackendExplain(token);
          }
        } else {
          console.log("Client mode - Writer API not available, using backend...");
          // Fallback to backend API if Chrome Writer API is not available
          await handleBackendExplain(token);
        }
      } else {
        console.log("Hybrid mode - using backend API for explain");
        await handleBackendExplain(token);
      }
      setLoadingMessage("");
    } catch (error) {
      console.error("Explain error:", error);
      toast.error("Explanation failed");
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChromeWriterExplain = async () => {
    console.log("handleChromeWriterExplain called for text:", selectedText);
    
    try {
      // Check availability of the Writer API
      console.log("Checking Writer.availability...");
      const availability = await window.Writer.availability();
      console.log("Writer availability status:", availability);

      let writer;
      
      if (availability === "unavailable") {
        console.log("Writer API unavailable - model cannot be downloaded");
        throw new Error("Writer API not available");
      } else if (availability === "downloadable") {
        console.log("Model is downloadable - starting download");
        setLoadingMessage("Downloading AI model (first time only)...");
        // Model needs to be downloaded
        writer = await window.Writer.create({
          tone: 'formal',
          format: 'plain-text',
          length: 'short',
          sharedContext: 'This is for providing comprehensive educational explanations of text passages to help readers understand concepts, context, and implications. Important: The explanation should not be greater than 3x the size of the given text.',
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, writer created");
      } else if (availability === "downloading") {
        console.log("Model is already downloading in progress");
        setLoadingMessage("Model download in progress...");
        // Model is already downloading
        writer = await window.Writer.create({
          tone: 'formal',
          format: 'plain-text',
          length: 'short',
          sharedContext: 'This is for providing comprehensive educational explanations of text passages to help readers understand concepts, context, and implications. Important: The explanation should not be greater than 3x the size of the given text.',
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, writer created");
      } else if (availability === "available") {
        console.log("Model is ready and available");
        // Model is ready
        setLoadingMessage("Explaining text...");
        writer = await window.Writer.create({
          tone: 'formal',
          format: 'plain-text',
          length: 'short',
          sharedContext: 'This is for providing comprehensive educational explanations of text passages to help readers understand concepts, context, and implications. Important: The explanation should not be greater than 3x the size of the given text.'
        });
        console.log("Writer created successfully");
      } else {
        console.log("Unknown availability status:", availability);
        throw new Error("Unknown writer availability status");
      }

      // Create a prompt for explanation
      const prompt = `Provide a comprehensive explanation of the following text that helps readers understand the concepts, context, and implications. Analyze the depth and complexity to determine appropriate length. For simple concepts, provide clear explanations with essential context. For complex concepts, provide detailed explanations with background, examples, and implications. Include relevant context and connections to broader concepts. Use clear, accessible language while preserving intellectual depth. Important: The explanation should not be greater than 3x the size of the given text.`;
      
      console.log("Using Writer API to explain text with streaming...");
      
      // Use streaming to get the explanation
      const stream = writer.writeStreaming(prompt, {
        context: `Text to explain:\n\n${selectedText}`
      });
      
      console.log("Stream received, starting to read...");
      
      let fullExplanation = '';
      let isFirstChunk = true;
      
      // Use for await loop to iterate through the stream chunks
      for await (const chunk of stream) {
        fullExplanation += chunk;
        
        // On first chunk, stop loading state to show streaming content
        if (isFirstChunk) {
          console.log("First chunk received, stopping loader");
          setLoading(false);
          setLoadingMessage("");
          isFirstChunk = false;
        }
        
        console.log("Received chunk:", chunk.substring(0, 50) + "...");
        
        // Update result in real-time for streaming display
        setResult({
          type: "explain",
          data: fullExplanation
        });
        setShowResult(true);
      }
      
      console.log("Full explanation received, length:", fullExplanation.length);
      
      if (fullExplanation && fullExplanation.trim()) {
        console.log("Setting final explanation result");
        setResult({
          type: "explain",
          data: fullExplanation.trim()
        });
        setShowResult(true);
      } else {
        console.error("No explanation received from Writer API");
        throw new Error("No explanation received from Writer API");
      }

      // Clean up writer
      console.log("Cleaning up writer...");
      writer.destroy();
      console.log("Writer destroyed successfully");
    } catch (error) {
      console.error("Chrome Writer explain error:", error);
      console.error("Error details:", error.message);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  };

  const handleBackendExplain = async (authToken: string) => {
    console.log("handleBackendExplain called for text:", selectedText);
    
    try {
      setLoadingMessage("Explaining text...");
      
      const fullResponse = await streamResponse('/books/explain/stream', {
          text: selectedText
      }, authToken);

      console.log("Backend explain response received");
      setResult({
        type: "explain",
        data: fullResponse
      });
      setShowResult(true);
    } catch (error) {
      console.error("Backend explain error:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  const handleSummarize = async () => {
    if (!token) {
      toast.error("Authentication required for summarization");
      return;
    }

    setLoading(true);
    setShowResult(true);
    setLoadingMessage("Reading text...");
    reset(); // Reset streaming state
    
    try {
      if (processingMode === 'client') {
        // Check if Chrome Summarizer API is available
        if (isSummarizerAPIAvailable()) {
          console.log("Client mode - Summarizer API available, trying Chrome summarize...");
          // Use Chrome's built-in Summarizer API
          try {
            await handleChromeSummarizerSummarize();
          } catch (chromeError) {
            console.log("Chrome Summarizer failed, falling back to backend:", chromeError);
            // Fallback to backend API on error
            await handleBackendSummarize(token);
          }
        } else {
          console.log("Client mode - Summarizer API not available, using backend...");
          // Fallback to backend API if Chrome Summarizer API is not available
          await handleBackendSummarize(token);
        }
      } else {
        console.log("Hybrid mode - using backend API for summarize");
        await handleBackendSummarize(token);
      }
      setLoadingMessage("");
    } catch (error) {
      console.error("Summarize error:", error);
      toast.error("Summarization failed");
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChromeSummarizerSummarize = async () => {
    console.log("handleChromeSummarizerSummarize called for text:", selectedText);
    
    try {
      // Check availability of the Summarizer API
      console.log("Checking Summarizer.availability...");
      const availability = await window.Summarizer.availability({
        type: 'tldr',
        length: 'medium',
        format: 'plain-text'
      });
      console.log("Summarizer availability status:", availability);

      let summarizer;
      
      if (availability === "unavailable") {
        console.log("Summarizer API unavailable - model cannot be downloaded");
        throw new Error("Summarizer API not available");
      } else if (availability === "downloadable") {
        console.log("Model is downloadable - starting download");
        setLoadingMessage("Downloading AI model (first time only)...");
        // Model needs to be downloaded
        summarizer = await window.Summarizer.create({
          type: 'tldr',
          length: 'medium',
          format: 'plain-text',
          sharedContext: 'Create a comprehensive summary that captures the key information, main points, and essential meaning of the text. Identify and preserve main ideas, maintain original context, and use clear, concise language.',
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, summarizer created");
      } else if (availability === "downloading") {
        console.log("Model is already downloading in progress");
        setLoadingMessage("Model download in progress...");
        // Model is already downloading
        summarizer = await window.Summarizer.create({
          type: 'tldr',
          length: 'medium',
          format: 'plain-text',
          sharedContext: 'Create a comprehensive summary that captures the key information, main points, and essential meaning of the text. Identify and preserve main ideas, maintain original context, and use clear, concise language.',
          monitor(monitor) {
            monitor.addEventListener("downloadprogress", (e: any) => {
              const progress = Math.floor(e.loaded * 100);
              console.log(`Model download progress: ${progress}%`);
              setLoadingMessage(`Downloading AI model: ${progress}%`);
            });
          },
        });
        console.log("Model download completed, summarizer created");
      } else if (availability === "available") {
        console.log("Model is ready and available");
        // Model is ready
        setLoadingMessage("Summarizing text...");
        summarizer = await window.Summarizer.create({
          type: 'tldr',
          length: 'medium',
          format: 'plain-text',
          sharedContext: 'Create a comprehensive summary that captures the key information, main points, and essential meaning of the text. Identify and preserve main ideas, maintain original context, and use clear, concise language.'
        });
        console.log("Summarizer created successfully");
      } else {
        console.log("Unknown availability status:", availability);
        throw new Error("Unknown summarizer availability status");
      }

      console.log("Using Summarizer API to summarize text with streaming...");
      
      // Use streaming to get the summary
      const stream = summarizer.summarizeStreaming(selectedText);
      
      console.log("Stream received, starting to read...");
      
      let fullSummary = '';
      let isFirstChunk = true;
      
      // Use for await loop to iterate through the stream chunks
      for await (const chunk of stream) {
        fullSummary += chunk;
        
        // On first chunk, stop loading state to show streaming content
        if (isFirstChunk) {
          console.log("First chunk received, stopping loader");
          setLoading(false);
          setLoadingMessage("");
          isFirstChunk = false;
        }
        
        console.log("Received chunk:", chunk.substring(0, 50) + "...");
        
        // Update result in real-time for streaming display
        setResult({
          type: "summarize",
          data: fullSummary
        });
        setShowResult(true);
      }
      
      console.log("Full summary received, length:", fullSummary.length);
      
      if (fullSummary && fullSummary.trim()) {
        console.log("Setting final summary result");
        setResult({
          type: "summarize",
          data: fullSummary.trim()
        });
        setShowResult(true);
      } else {
        console.error("No summary received from Summarizer API");
        throw new Error("No summary received from Summarizer API");
      }

      // Clean up summarizer
      console.log("Cleaning up summarizer...");
      summarizer.destroy();
      console.log("Summarizer destroyed successfully");
    } catch (error) {
      console.error("Chrome Summarizer error:", error);
      console.error("Error details:", error.message);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      throw error;
    }
  };

  const handleBackendSummarize = async (authToken: string) => {
    console.log("handleBackendSummarize called for text:", selectedText);
    
    try {
      setLoadingMessage("Summarizing text...");
      
      const fullResponse = await streamResponse('/books/summarize/stream', {
          text: selectedText
      }, authToken);

      console.log("Backend summarize response received");
      setResult({
        type: "summarize",
        data: fullResponse
      });
      setShowResult(true);
    } catch (error) {
      console.error("Backend summarize error:", error);
      console.error("Error details:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  const getTextToCopy = () => {
    if (!result) return "";

    switch (result.type) {
      case "synonym":
        if (result.data.noSynonymsFound) {
          return `No Synonyms Found\n\nThe word "${selectedText}" synonyms were not found in the dictionary or AI.`;
        }
        let synonymText = "Synonyms & Related Words";
        if (result.data.fromLLM) {
          synonymText += " (AI Generated)";
        }
        synonymText += "\n\n";
        Object.entries(result.data).forEach(([pos, words]: [string, any]) => {
          if (pos === 'fromLLM') return; // Skip the flag
          synonymText += `${pos.toUpperCase()}\n`;
          if (words.syn) {
            synonymText += `Synonyms: ${words.syn.join(", ")}\n`;
          }
          if (words.ant) {
            synonymText += `Antonyms: ${words.ant.join(", ")}\n`;
          }
          synonymText += "\n";
        });
        return synonymText;

      case "definition":
        if (result.data.noDefinitionFound) {
          return `No Definition Found\n\nThe word "${selectedText}" was not found in the dictionary or AI.`;
        }
        let defText = "Definition";
        if (result.data.fromLLM) {
          defText += " (AI Generated)";
        }
        defText += "\n\n";
        result.data.definitions?.forEach((def: any, idx: number) => {
          defText += `${def.partOfSpeech}: ${def.definition}\n`;
        });
        return defText;

      default:
        return result.data;
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = getTextToCopy();
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const getToolTypeFromResult = (): StickyNoteToolType => {
    if (!result) return "chat";
    switch (result.type) {
      case "translate": return "translation";
      case "definition": return "definition";
      case "simplify": return "simplification";
      case "explain": return "explanation";
      case "summarize": return "summary";
      case "synonym": return "synonym";
      default: return "chat";
    }
  };

  const handleOpenSaveStickyNote = () => {
    setShowSaveStickyNoteModal(true);
  };

  const handleDirectStickyNote = () => {
    setShowSaveStickyNoteModal(true);
  };

  const renderResult = () => {
    if (!result) return null;

    switch (result.type) {
      case "synonym":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-primary">Synonyms & Related Words</h3>
              {result.data.fromLLM && (
                <span className="ai-generated-badge">
                  AI Generated
                </span>
              )}
            </div>
            {result.data.noSynonymsFound ? (
              <div className="no-definition-found">
                <p className="main-message">No Synonyms Found</p>
                <p className="sub-message">
                  The word "{selectedText}" synonyms were not found in the dictionary or AI.
                </p>
              </div>
            ) : (
              Object.entries(result.data).map(([pos, words]: [string, any]) => {
                if (pos === 'fromLLM') return null; // Skip the flag
                return (
                  <div key={pos}>
                    <p className="text-sm font-medium text-accent capitalize mb-1">{pos}</p>
                    {words.syn && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Synonyms: </span>
                        <span className="text-sm">{words.syn.join(", ")}</span>
                      </div>
                    )}
                    {words.ant && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Antonyms: </span>
                        <span className="text-sm">{words.ant.join(", ")}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );

        case "definition":
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-primary">Definition</h3>
                {result.data.fromLLM && (
                  <span className="ai-generated-badge">
                    AI Generated
                  </span>
                )}
              </div>
              {result.data.noDefinitionFound ? (
                <div className="no-definition-found">
                  <p className="main-message">No Definition Found</p>
                  <p className="sub-message">
                    The word "{selectedText}" was not found in the dictionary or AI.
                  </p>
                </div>
              ) : (
                result.data.definitions?.map((def: any, idx: number) => (
                  <div key={idx}>
                    <p className="text-sm font-medium text-accent capitalize">{def.partOfSpeech}</p>
                    <p className="text-sm">{def.definition}</p>
                  </div>
                ))
              )}
            </div>
          );

      default:
        return (
          <div className="space-y-2">
            <h3 className="font-semibold text-primary capitalize">{result.type}</h3>
            <p className="text-sm streaming-text">{result.data}</p>
          </div>
        );
    }
  };

  // Calculate optimal position to keep toolbar centered and within viewport
  const getOptimalPosition = () => {
    // Dynamic toolbar width based on content
    const margin = 20; // Margin from screen edges
    const baseToolbarWidth = showResult ? 600 : 300; // Wider when showing results
    const maxAvailableWidth = windowDimensions.width - margin * 2; // Available width minus margins
    const toolbarWidth = Math.min(baseToolbarWidth, maxAvailableWidth); // Never exceed available space
    
    // Calculate the ideal centered position
    const idealX = position.x;
    
    // Always use window bounds for absolute positioning to prevent off-screen
    const minX = margin + toolbarWidth / 2;
    const maxX = windowDimensions.width - margin - toolbarWidth / 2;
    const centerX = windowDimensions.width / 2;
    
    // Calculate the toolbar's left and right edges if positioned at idealX
    const toolbarLeft = idealX - toolbarWidth / 2;
    const toolbarRight = idealX + toolbarWidth / 2;
    
    let finalX = idealX;
    
    // Check if toolbar would go off-screen
    if (toolbarLeft < margin) {
      // Toolbar would go off left edge - position it at minimum safe position
      finalX = minX;
      console.log('Toolbar would go off left edge, positioning at minX:', minX);
    } else if (toolbarRight > windowDimensions.width - margin) {
      // Toolbar would go off right edge - position it at maximum safe position
      finalX = maxX;
      console.log('Toolbar would go off right edge, positioning at maxX:', maxX);
    }
    
    // If toolbar fits, try to keep it centered on the selection, but ensure it stays within bounds
    if (finalX === idealX) {
      // Toolbar fits at ideal position, but let's ensure it's not too close to edges
      const distanceFromCenter = Math.abs(idealX - centerX);
      const maxDistanceFromCenter = (maxX - minX) / 2;
      
      // If we're very close to an edge, slide towards center
      if (idealX < minX + toolbarWidth * 0.3) {
        // Close to left edge - slide towards center
        finalX = Math.max(minX, idealX + distanceFromCenter * 0.4);
      } else if (idealX > maxX - toolbarWidth * 0.3) {
        // Close to right edge - slide towards center
        finalX = Math.min(maxX, idealX - distanceFromCenter * 0.4);
      }
    }
    
    // Final clamp to ensure we're still within bounds
    finalX = Math.max(minX, Math.min(maxX, finalX));
    
    // Debug logging
    console.log('Positioning Debug:', {
      idealX,
      toolbarLeft: idealX - toolbarWidth / 2,
      toolbarRight: idealX + toolbarWidth / 2,
      minX,
      maxX,
      centerX,
      finalX,
      toolbarWidth,
      windowWidth: windowDimensions.width,
      margin,
      pdfContainerBounds: pdfContainerBounds ? {
        left: pdfContainerBounds.left,
        right: pdfContainerBounds.right,
        width: pdfContainerBounds.width
      } : null
    });
    
    return {
      x: finalX,
      y: position.y - 60
    };
  };

  const optimalPosition = getOptimalPosition();

  return (
    <div
      className="fixed z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        left: `${optimalPosition.x}px`,
        top: `${optimalPosition.y}px`,
        transform: "translateX(-50%)"
      }}
    >
      <Card className="shadow-[var(--shadow-strong)] border-2 border-primary/20">
        {!showResult ? (
          <div className="flex items-center gap-1 p-2">
            {isSingleWord ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSynonym}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Shuffle className="w-4 h-4" />
                  Synonym
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTranslate}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Languages className="w-4 h-4" />
                  Translate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDefinition}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <BookOpen className="w-4 h-4" />
                  Define
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePronunciation}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Volume2 className="w-4 h-4" />
                  Pronounce
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDirectStickyNote}
                  className="gap-2 hover:bg-accent/10"
                  data-tour="toolbar-sticky-note"
                >
                  <StickyNoteIcon className="w-4 h-4" />
                  Sticky Note
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTranslate}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Languages className="w-4 h-4" />
                  Translate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSimplify}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Sparkles className="w-4 h-4" />
                  Simplify
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleExplain}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Lightbulb className="w-4 h-4" />
                  Explain
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSummarize}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <FileText className="w-4 h-4" />
                  Summarize
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePronunciation}
                  disabled={loading}
                  className="gap-2 hover:bg-primary/10"
                >
                  <Volume2 className="w-4 h-4" />
                  Read Aloud
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDirectStickyNote}
                  className="gap-2 hover:bg-accent/10"
                  data-tour="toolbar-sticky-note"
                >
                  <StickyNoteIcon className="w-4 h-4" />
                  Sticky Note
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onAddToChat(selectedText);
                toast.success("Added to chat context");
              }}
              className="gap-2 hover:bg-accent/10"
              data-tour="toolbar-add-to-chat"
            >
              <MessageSquare className="w-4 h-4" />
              Add to Chat
            </Button>
          </div>
        ) : (
          <div className="p-4 w-[90vw] max-w-2xl">
            {loading && loadingMessage ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-lg font-medium text-primary animate-pulse">
                  {loadingMessage}
                </p>
                {isStreaming && streamedText && (
                  <div className="streaming-container">
                    <div className="streaming-text">
                      {streamedText}
                      <span className="streaming-cursor">|</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                  <ScrollArea className="h-full">
                    {renderResult()}
                  </ScrollArea>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => setShowResult(false)} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button size="sm" onClick={handleOpenSaveStickyNote} variant="outline" className="gap-2">
                    <StickyNoteIcon className="w-4 h-4" />
                    Save Note
                  </Button>
                  <Button size="sm" onClick={handleCopy} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={onClose} variant="outline">
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      <SaveStickyNoteModal
        open={showSaveStickyNoteModal}
        onClose={() => setShowSaveStickyNoteModal(false)}
        selectedText={selectedText}
        toolOutput={result ? getTextToCopy() : ""}
        toolType={result ? getToolTypeFromResult() : "chat"}
        onSave={onSaveStickyNote}
      />
    </div>
  );
};
