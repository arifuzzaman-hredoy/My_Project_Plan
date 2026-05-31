"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Language } from "@/data/types";

type AppState = {
  lang: Language;
  setLang: (lang: Language) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  done: Record<string, boolean>;
  toggleDone: (id: string) => void;
};

const Context = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [dark, setDarkState] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedLang = localStorage.getItem("roadmap-lang") as Language | null;
    const storedTheme = localStorage.getItem("roadmap-theme");
    const storedDone = localStorage.getItem("roadmap-done");
    if (storedLang) setLangState(storedLang);
    if (storedTheme) setDarkState(storedTheme === "dark");
    if (storedDone) setDone(JSON.parse(storedDone));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("roadmap-theme", dark ? "dark" : "light");
  }, [dark]);

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        localStorage.setItem("roadmap-lang", next);
      },
      dark,
      setDark: setDarkState,
      done,
      toggleDone: (id) => {
        setDone((current) => {
          const next = { ...current, [id]: !current[id] };
          localStorage.setItem("roadmap-done", JSON.stringify(next));
          return next;
        });
      },
    }),
    [dark, done, lang],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAppState() {
  const context = useContext(Context);
  if (!context)
    throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
