// Mapping from display language names to BCP 47 language codes
// Used for Chrome's Translator API which requires BCP 47 codes

export const LANGUAGE_TO_BCP47: Record<string, string> = {
  "English": "en",
  "Spanish": "es",
  "French": "fr",
  "German": "de",
  "Italian": "it",
  "Portuguese": "pt",
  "Russian": "ru",
  "Chinese (Mandarin)": "zh",
  "Chinese (Cantonese)": "zh-Hant",
  "Japanese": "ja",
  "Korean": "ko",
  "Arabic": "ar",
  "Hindi": "hi",
  "Bengali": "bn",
  "Urdu": "ur",
  "Punjabi": "pa",
  "Turkish": "tr",
  "Persian (Farsi)": "fa",
  "Dutch": "nl",
  "Swedish": "sv",
  "Norwegian": "no",
  "Danish": "da",
  "Finnish": "fi",
  "Polish": "pl",
  "Czech": "cs",
  "Hungarian": "hu",
  "Romanian": "ro",
  "Bulgarian": "bg",
  "Croatian": "hr",
  "Serbian": "sr",
  "Greek": "el",
  "Hebrew": "he",
  "Thai": "th",
  "Vietnamese": "vi",
  "Indonesian": "id",
  "Malay": "ms",
  "Tagalog (Filipino)": "tl",
  "Tamil": "ta",
  "Telugu": "te",
  "Marathi": "mr",
  "Gujarati": "gu",
  "Kannada": "kn",
  "Malayalam": "ml",
  "Odia": "or",
  "Assamese": "as",
  "Punjabi (Gurmukhi)": "pa-Guru",
  "Kashmiri": "ks",
  "Sindhi": "sd",
  "Konkani": "kok",
  "Manipuri": "mni",
  "Bodo": "brx",
  "Sanskrit": "sa",
  "Nepali": "ne",
  "Sinhala": "si",
  "Tibetan": "bo",
  "Burmese": "my",
  "Khmer": "km",
  "Lao": "lo",
  "Mongolian": "mn",
  "Georgian": "ka",
  "Armenian": "hy",
  "Azerbaijani": "az",
  "Kazakh": "kk",
  "Kyrgyz": "ky",
  "Tajik": "tg",
  "Turkmen": "tk",
  "Uzbek": "uz",
  "Uighur": "ug",
  "Tatar": "tt",
  "Bashkir": "ba",
  "Chuvash": "cv",
  "Chechen": "ce",
  "Ingush": "inh",
  "Kabardian": "kbd",
  "Adyghe": "ady",
  "Abkhaz": "ab",
  "Ossetian": "os",
  "Avar": "av",
  "Lak": "lbe",
  "Dargwa": "dar",
  "Lezgin": "lez",
  "Tabasaran": "tab",
  "Rutul": "rut",
  "Tsakhur": "tkr",
  "Aghul": "agx",
  "Udi": "udi",
  "Khinalug": "kjj",
  "Budukh": "bdk",
  "Kryts": "kry",
  "Judeo-Tat": "jdt",
  "Tindi": "tin",
  "Botlikh": "bph",
  "Chamalal": "cji",
  "Bagvalal": "kva",
  "Andi": "ani",
  "Tsez": "ddo",
  "Hinukh": "gin",
  "Khwarshi": "khv",
  "Bezhta": "kap",
  "Hunzib": "huz",
  "Godoberi": "gdo",
  "Karata": "kpt",
  "Akhvakh": "akv",
  "Afrikaans": "af",
  "Swahili": "sw",
  "Yoruba": "yo",
  "Igbo": "ig",
  "Hausa": "ha",
  "Amharic": "am",
  "Somali": "so",
  "Oromo": "om",
  "Tigrinya": "ti",
  "Wolof": "wo",
  "Fulani": "ff",
  "Mandinka": "mnk",
  "Bambara": "bm",
  "Ewe": "ee",
  "Twi": "tw",
  "Ga": "gaa",
  "Zulu": "zu",
  "Xhosa": "xh",
  "Setswana": "tn",
  "Sesotho": "st",
  "Northern Sotho": "nso",
  "Tswana": "tn",
  "Venda": "ve",
  "Tsonga": "ts",
  "Swati": "ss",
  "Ndebele": "nd",
  "Kinyarwanda": "rw",
  "Kirundi": "rn",
  "Luganda": "lg",
  "Luo": "luo",
  "Kikuyu": "ki",
  "Luhya": "luy",
  "Kamba": "kam",
  "Meru": "mer",
  "Embu": "ebu",
  "Tharaka": "thk",
  "Mbeere": "mbr",
  "Gikuyu": "ki",
  "Catalan": "ca",
  "Basque": "eu",
  "Galician": "gl",
  "Welsh": "cy",
  "Irish": "ga",
  "Scottish Gaelic": "gd",
  "Breton": "br",
  "Cornish": "kw",
  "Manx": "gv",
  "Faroese": "fo",
  "Icelandic": "is",
  "Luxembourgish": "lb",
  "Albanian": "sq",
  "Macedonian": "mk",
  "Bosnian": "bs",
  "Montenegrin": "cnr",
  "Slovenian": "sl",
  "Slovak": "sk",
  "Latvian": "lv",
  "Lithuanian": "lt",
  "Estonian": "et",
  "Maltese": "mt",
  "Cypriot Greek": "el-CY",
  "Esperanto": "eo",
  "Interlingua": "ia",
  "Ido": "io",
  "Volapük": "vo",
  "Novial": "nov",
  "Lojban": "jbo",
  "Klingon": "tlh",
  "Quenya": "qya",
  "Sindarin": "sjn",
  "Dothraki": "mis",
  "Valyrian": "mis",
  "High Valyrian": "mis",
  "Other": "und" // undetermined
};

// Reverse mapping from BCP 47 code to display language name
export const BCP47_TO_LANGUAGE: Record<string, string> = Object.fromEntries(
  Object.entries(LANGUAGE_TO_BCP47).map(([key, value]) => [value, key])
);

// Convert display language name or BCP 47 code to BCP 47 code
export function getBCP47Code(languageNameOrCode: string): string | null {
  // If it's already a BCP 47 code (mapped in our language list), return it
  if (BCP47_TO_LANGUAGE[languageNameOrCode]) {
    return languageNameOrCode;
  }
  
  // Otherwise, try to find it in the language name mapping
  const code = LANGUAGE_TO_BCP47[languageNameOrCode] || null;
  
  return code;
}

// Check if Chrome Translator API is available
export function isTranslatorAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 'Translator' in window;
}

// Check if Chrome Prompt API is available
export function isPromptAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 'LanguageModel' in window;
}

// Check if Chrome Writer API is available
export function isWriterAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 'Writer' in window;
}

// Check if Chrome Rewriter API is available
export function isRewriterAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 'Rewriter' in window;
}

// Check if Chrome Summarizer API is available
export function isSummarizerAPIAvailable(): boolean {
  return typeof window !== 'undefined' && 'Summarizer' in window;
}

// Declare Chrome AI API types for TypeScript
declare global {
  interface Window {
    Translator: {
      create(options: {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: (monitor: TranslatorMonitor) => void;
        signal?: AbortSignal;
      }): Promise<TranslatorInstance>;
      availability(options: {
        sourceLanguage: string;
        targetLanguage: string;
      }): Promise<'downloadable' | 'downloading' | 'available' | 'unavailable'>;
    };
    LanguageDetector: {
      create(options?: {
        expectedInputLanguages?: string[];
        monitor?: (monitor: TranslatorMonitor) => void;
      }): Promise<LanguageDetectorInstance>;
      availability(options?: {
        expectedInputLanguages?: string[];
      }): Promise<'downloadable' | 'downloading' | 'available' | 'unavailable'>;
    };
    LanguageModel: {
      create(options?: {
        temperature?: number;
        topK?: number;
        monitor?: (monitor: TranslatorMonitor) => void;
        signal?: AbortSignal;
        initialPrompts?: Array<{
          role: 'system' | 'user' | 'assistant';
          content: string;
        }>;
        expectedInputs?: Array<{
          type: 'text' | 'image' | 'audio';
          languages?: string[];
        }>;
        expectedOutputs?: Array<{
          type: 'text';
          languages?: string[];
        }>;
      }): Promise<LanguageModelSession>;
      availability(): Promise<'downloadable' | 'downloading' | 'available' | 'unavailable'>;
      params(): Promise<{
        defaultTemperature: number;
        maxTemperature: number;
        defaultTopK: number;
        maxTopK: number;
      }>;
    };
    Writer: {
      create(options?: {
        tone?: 'formal' | 'neutral' | 'casual';
        format?: 'markdown' | 'plain-text';
        length?: 'short' | 'medium' | 'long';
        sharedContext?: string;
        expectedInputLanguages?: string[];
        expectedContextLanguages?: string[];
        outputLanguage?: string;
        monitor?: (monitor: TranslatorMonitor) => void;
        signal?: AbortSignal;
      }): Promise<WriterInstance>;
      availability(): Promise<'downloadable' | 'downloading' | 'available' | 'unavailable'>;
    };
    Rewriter: {
      create(options?: {
        tone?: 'more-formal' | 'as-is' | 'more-casual';
        format?: 'as-is' | 'markdown' | 'plain-text';
        length?: 'shorter' | 'as-is' | 'longer';
        sharedContext?: string;
        expectedInputLanguages?: string[];
        expectedContextLanguages?: string[];
        outputLanguage?: string;
        monitor?: (monitor: TranslatorMonitor) => void;
        signal?: AbortSignal;
      }): Promise<RewriterInstance>;
      availability(): Promise<'downloadable' | 'downloading' | 'available' | 'unavailable'>;
    };
    Summarizer: {
      create(options?: {
        type?: 'headline' | 'key-points' | 'teaser' | 'tldr';
        length?: 'short' | 'medium' | 'long';
        format?: 'markdown' | 'plain-text';
        sharedContext?: string;
        expectedInputLanguages?: string[];
        outputLanguage?: string;
        monitor?: (monitor: TranslatorMonitor) => void;
        signal?: AbortSignal;
      }): Promise<SummarizerInstance>;
      availability(options?: {
        type?: 'headline' | 'key-points' | 'teaser' | 'tldr';
        length?: 'short' | 'medium' | 'long';
        format?: 'markdown' | 'plain-text';
        expectedInputLanguages?: string[];
        outputLanguage?: string;
      }): Promise<'downloadable' | 'downloading' | 'available' | 'unavailable'>;
    };
  }

  interface TranslatorMonitor {
    addEventListener(
      event: 'downloadprogress',
      listener: (e: ProgressEvent) => void
    ): void;
  }

  interface TranslatorInstance {
    translate(text: string): Promise<string>;
    translateStreaming(text: string): ReadableStream<string>;
    destroy(): void;
    inputQuota: number;
    measureInputUsage(text: string): Promise<number>;
  }

  interface LanguageDetectorInstance {
    detect(text: string): Promise<Array<{
      detectedLanguage: string;
      confidence: number;
    }>>;
    destroy(): void;
    inputQuota: number;
    measureInputUsage(text: string): Promise<number>;
  }

  interface LanguageModelSession {
    prompt(
      prompt: string,
      options?: {
        signal?: AbortSignal;
        responseConstraint?: any;
        omitResponseConstraintInput?: boolean;
      }
    ): Promise<string>;
    promptStreaming(
      prompt: string,
      options?: {
        signal?: AbortSignal;
        responseConstraint?: any;
      }
    ): ReadableStream<string>;
    append(messages: Array<{
      role: 'user' | 'assistant';
      content: string | Array<{
        type: 'text' | 'image' | 'audio';
        value: string | File | Blob | ArrayBuffer;
      }>;
    }>): Promise<void>;
    clone(options?: {
      signal?: AbortSignal;
    }): Promise<LanguageModelSession>;
    destroy(): void;
    inputUsage: number;
    inputQuota: number;
    measureInputUsage(text: string): Promise<number>;
  }

  interface WriterInstance {
    write(
      prompt: string,
      options?: {
        context?: string;
        signal?: AbortSignal;
      }
    ): Promise<string>;
    writeStreaming(
      prompt: string,
      options?: {
        context?: string;
        signal?: AbortSignal;
      }
    ): ReadableStream<string>;
    destroy(): void;
  }

  interface RewriterInstance {
    rewrite(
      text: string,
      options?: {
        context?: string;
        tone?: 'more-formal' | 'as-is' | 'more-casual';
        signal?: AbortSignal;
      }
    ): Promise<string>;
    rewriteStreaming(
      text: string,
      options?: {
        context?: string;
        tone?: 'more-formal' | 'as-is' | 'more-casual';
        signal?: AbortSignal;
      }
    ): ReadableStream<string>;
    destroy(): void;
  }

  interface SummarizerInstance {
    summarize(
      text: string,
      options?: {
        context?: string;
        signal?: AbortSignal;
      }
    ): Promise<string>;
    summarizeStreaming(
      text: string,
      options?: {
        context?: string;
        signal?: AbortSignal;
      }
    ): ReadableStream<string>;
    destroy(): void;
    inputQuota: number;
    measureInputUsage(text: string): Promise<number>;
  }
}

