import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Atom, BookOpen, ChevronRight, GraduationCap, Play } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

type TrackKey = "jmb" | "gum";

interface Subject {
  kk: string;
  ru: string;
  en: string;
}

const TRACKS: Record<TrackKey, { title: [string, string, string]; subjects: Subject[] }> = {
  jmb: {
    title: [
      "Жаратылыстану-математикалық бағыт (ЖМБ)",
      "Естественно-математическое направление (ЕМН)",
      "Natural sciences & math track",
    ],
    subjects: [
      { kk: "Математика", ru: "Математика", en: "Mathematics" },
      { kk: "Физика", ru: "Физика", en: "Physics" },
      { kk: "Химия", ru: "Химия", en: "Chemistry" },
      { kk: "Биология", ru: "Биология", en: "Biology" },
      { kk: "География", ru: "География", en: "Geography" },
      { kk: "Информатика", ru: "Информатика", en: "Computer Science" },
      { kk: "Робототехника", ru: "Робототехника", en: "Robotics" },
      { kk: "Экология", ru: "Экология", en: "Ecology" },
    ],
  },
  gum: {
    title: [
      "Гуманитарлық бағыт (Қоғамдық-гуманитарлық бағыт)",
      "Гуманитарное направление (Общественно-гуманитарное)",
      "Humanities track",
    ],
    subjects: [
      { kk: "Қазақ тілі мен әдебиеті", ru: "Казахский язык и литература", en: "Kazakh language & literature" },
      { kk: "Орыс тілі мен әдебиеті", ru: "Русский язык и литература", en: "Russian language & literature" },
      { kk: "Ағылшын тілі", ru: "Английский язык", en: "English language" },
      { kk: "Қазақстан тарихы", ru: "История Казахстана", en: "History of Kazakhstan" },
      { kk: "Дүниежүзі тарихы", ru: "Всемирная история", en: "World history" },
      { kk: "Құқық негіздері", ru: "Основы права", en: "Fundamentals of law" },
      { kk: "Экономика негіздері", ru: "Основы экономики", en: "Fundamentals of economics" },
      { kk: "Психология", ru: "Психология", en: "Psychology" },
    ],
  },
};

const GRADES = [5, 6, 7, 8, 9, 10, 11];

export function AIOlympiad() {
  const t = useT();
  const navigate = useNavigate();
  const [track, setTrack] = useState<TrackKey | null>(null);
  const [openSubject, setOpenSubject] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<{ subject: number; grade: number } | null>(null);

  const title = t("AI Олимпиадаға дайындық", "AI Подготовка к олимпиаде", "AI Olympiad prep");

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        {track && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setTrack(null); setOpenSubject(null); setSelectedGrade(null); }}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          {track && (
            <p className="mt-1 text-sm text-muted-foreground">{t(...TRACKS[track].title)}</p>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!track && (
          <motion.div
            key="tracks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {(Object.keys(TRACKS) as TrackKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTrack(k)}
                className="glass group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-glass-border p-6 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="gradient-emerald flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
                  {k === "jmb" ? <Atom className="h-6 w-6 text-white" /> : <BookOpen className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{t(...TRACKS[k].title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {TRACKS[k].subjects.length} {t("пән", "предметов", "subjects")}
                  </p>
                </div>
                <ChevronRight className="absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </motion.div>
        )}

        {track && (
          <motion.div
            key={track}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {TRACKS[track].subjects.map((s, i) => {
              const isOpen = openSubject === i;
              return (
                <div
                  key={i}
                  className="glass overflow-hidden rounded-2xl border border-glass-border"
                >
                  <button
                    onClick={() => { setOpenSubject(isOpen ? null : i); setSelectedGrade(null); }}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{t(s.kk, s.ru, s.en)}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-glass-border"
                      >
                        <div className="p-4">
                          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {t("Сыныпты таңдаңыз", "Выберите класс", "Select grade")}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {GRADES.map((g) => {
                              const active = selectedGrade?.subject === i && selectedGrade.grade === g;
                              return (
                                <button
                                  key={g}
                                  onClick={() => setSelectedGrade({ subject: i, grade: g })}
                                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                    active
                                      ? "gradient-emerald text-white shadow-lg shadow-primary/30"
                                      : "glass border border-glass-border hover:border-primary/40"
                                  }`}
                                >
                                  {g} {t("сынып", "класс", "grade")}
                                </button>
                              );
                            })}
                          </div>
                          {selectedGrade?.subject === i && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 rounded-xl bg-primary/5 p-4 text-sm"
                            >
                              {track === "jmb" && i === 4 && selectedGrade.grade >= 7 ? (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="text-muted-foreground">
                                    {t(
                                      `География — ${selectedGrade.grade}-сынып. Оқулық бойынша AI 30 сұрақтан тұратын жаңа тест дайындайды.`,
                                      `География — ${selectedGrade.grade} класс. ИИ подготовит новый тест из 30 вопросов по учебнику.`,
                                      `Geography — grade ${selectedGrade.grade}. AI will generate a new 30-question test from the textbook.`,
                                    )}
                                  </div>
                                  <Button
                                    onClick={() =>
                                      navigate({
                                        to: "/test/geography/$grade",
                                        params: { grade: String(selectedGrade.grade) },
                                      })
                                    }
                                    className="gradient-emerald text-white"
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    {t("Тестті бастау", "Начать тест", "Start test")}
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  {t(
                                    `${t(s.kk, s.ru, s.en)} — ${selectedGrade.grade}-сынып. Жуырда ақпарат пайда болады.`,
                                    `${t(s.kk, s.ru, s.en)} — ${selectedGrade.grade} класс. Информация появится в ближайшее время.`,
                                    `${t(s.kk, s.ru, s.en)} — grade ${selectedGrade.grade}. Information coming soon.`,
                                  )}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
