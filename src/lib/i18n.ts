import { useAppStore } from "@/lib/store";

export type Lang = "kk" | "ru" | "en";

/**
 * Inline triple-translation helper.
 * Usage: const t = useT(); t("Басты бет", "Главная", "Home")
 */
export function useT() {
  const lang = useAppStore((s) => s.lang);
  return (kk: string, ru: string, en: string) => (lang === "ru" ? ru : lang === "en" ? en : kk);
}

export function useLang() {
  return useAppStore((s) => s.lang);
}
