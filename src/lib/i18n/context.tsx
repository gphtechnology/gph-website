import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { id } from "./id";
import { en } from "./en";

export type Language = "id" | "en";

const dictionaries = { id, en };

const STORAGE_KEY = "gph-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof id;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable (private mode, etc.) — language just
      // won't persist across reloads.
    }
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: dictionaries[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
