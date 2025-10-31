import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  "English",
  "Spanish", 
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Urdu",
  "Punjabi",
  "Turkish",
  "Persian (Farsi)",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Croatian",
  "Serbian",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Tagalog (Filipino)",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Odia",
  "Assamese",
  "Punjabi (Gurmukhi)",
  "Kashmiri",
  "Sindhi",
  "Konkani",
  "Manipuri",
  "Bodo",
  "Sanskrit",
  "Nepali",
  "Sinhala",
  "Tibetan",
  "Burmese",
  "Khmer",
  "Lao",
  "Mongolian",
  "Georgian",
  "Armenian",
  "Azerbaijani",
  "Kazakh",
  "Kyrgyz",
  "Tajik",
  "Turkmen",
  "Uzbek",
  "Uighur",
  "Tatar",
  "Bashkir",
  "Chuvash",
  "Chechen",
  "Ingush",
  "Kabardian",
  "Adyghe",
  "Abkhaz",
  "Ossetian",
  "Avar",
  "Lak",
  "Dargwa",
  "Lezgin",
  "Tabasaran",
  "Rutul",
  "Tsakhur",
  "Aghul",
  "Udi",
  "Khinalug",
  "Budukh",
  "Kryts",
  "Judeo-Tat",
  "Tindi",
  "Botlikh",
  "Chamalal",
  "Bagvalal",
  "Andi",
  "Tsez",
  "Hinukh",
  "Khwarshi",
  "Bezhta",
  "Hunzib",
  "Godoberi",
  "Karata",
  "Akhvakh",
  "Afrikaans",
  "Swahili",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Amharic",
  "Somali",
  "Oromo",
  "Tigrinya",
  "Wolof",
  "Fulani",
  "Mandinka",
  "Bambara",
  "Ewe",
  "Twi",
  "Ga",
  "Zulu",
  "Xhosa",
  "Setswana",
  "Sesotho",
  "Northern Sotho",
  "Tswana",
  "Venda",
  "Tsonga",
  "Swati",
  "Ndebele",
  "Kinyarwanda",
  "Kirundi",
  "Luganda",
  "Luo",
  "Kikuyu",
  "Luhya",
  "Kamba",
  "Meru",
  "Embu",
  "Tharaka",
  "Mbeere",
  "Gikuyu",
  "Catalan",
  "Basque",
  "Galician",
  "Welsh",
  "Irish",
  "Scottish Gaelic",
  "Breton",
  "Cornish",
  "Manx",
  "Faroese",
  "Icelandic",
  "Luxembourgish",
  "Albanian",
  "Macedonian",
  "Bosnian",
  "Montenegrin",
  "Slovenian",
  "Slovak",
  "Latvian",
  "Lithuanian",
  "Estonian",
  "Maltese",
  "Cypriot Greek",
  "Esperanto",
  "Interlingua",
  "Ido",
  "Volapük",
  "Novial",
  "Lojban",
  "Klingon",
  "Quenya",
  "Sindarin",
  "Dothraki",
  "Valyrian",
  "High Valyrian",
  "Other"
];

interface LanguageSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const LanguageSelector = ({ 
  value, 
  onValueChange, 
  placeholder = "Select language...",
  disabled = false 
}: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {LANGUAGES.map((language) => (
                <CommandItem
                  key={language}
                  value={language}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === language ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
