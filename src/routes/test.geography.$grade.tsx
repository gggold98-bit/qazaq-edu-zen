import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import {
  generateGeoTest,
  submitGeoTest,
  type GeoQuestion,
} from "@/lib/geo-test.functions";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/test/geography/$grade")({
  component: GeoTestPage,
  head: () => ({
    meta: [{ title: "География тесті — Qazaq Teachers AI" }],
  }),
});

type Phase = "loading" | "test" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function GeoTestPage() {
  const { grade: gradeStr } = Route.useParams();
  const grade = Number(gradeStr);
  const navigate = useNavigate();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const authReady = useAppStore((s) => s.authReady);

  const genFn = useServerFn(generateGeoTest);
  const subFn = useServerFn(submitGeoTest);

  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeoQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    percent: number;
    weakTopics: { topic: string; wrong: number; total: number }[];
  } | null>(null);

  const load = async (focusTopics?: string[]) => {
    setPhase("loading");
    setError(null);
    setResult(null);
    setCurrent(0);
    try {
      const r = await genFn({ data: { grade, focusTopics, count: 30 } });
      const qs = shuffle(r.questions);
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setPhase("test");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Қате");
      setPhase("result");
    }
  };

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      navigate({ to: "/" });
      return;
    }
    if (![7, 8, 9, 10, 11].includes(grade)) {
      navigate({ to: "/" });
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user, grade]);

  const answered = answers.filter((a) => a >= 0).length;

  const submit = async () => {
    setSubmitting(true);
    try {
      const results = questions.map((q, i) => ({
        question: q.question,
        topic: q.topic,
        was_correct: answers[i] === q.correctIndex,
      }));
      const r = await subFn({ data: { grade, results } });
      setResult(r);
      setPhase("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Жіберу қатесі");
    } finally {
      setSubmitting(false);
    }
  };

  const exit = () => {
    void router.invalidate();
    navigate({ to: "/" });
  };

  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-0 dark:from-emerald-950/40 dark:via-background dark:to-sky-950/40 sm:p-4 lg:p-6">
      {/* Responsive stage: full screen on mobile, 16:9 on desktop */}
      <div className="relative h-full w-full max-w-[1600px] lg:h-auto lg:[aspect-ratio:16/9]">
        <div className="relative flex h-full w-full flex-col overflow-hidden border-glass-border bg-background/80 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:rounded-2xl sm:border lg:rounded-3xl">
          {/* top bar */}
          <div className="z-10 flex shrink-0 items-center justify-between gap-2 border-b border-glass-border bg-background/70 px-3 py-2.5 backdrop-blur sm:px-6 sm:py-3">
            <Button variant="ghost" size="sm" onClick={exit} className="gap-1.5 px-2 sm:px-3">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Шығу</span>
            </Button>
            <div className="hidden truncate text-sm font-medium text-muted-foreground sm:block">
              География · {grade}-сынып
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {phase === "test"
                ? `${current + 1} / ${questions.length}`
                : phase === "loading"
                ? "…"
                : "Нәтиже"}
            </div>
          </div>

          {/* progress bar */}
          {phase === "test" && (
            <div className="h-1 w-full shrink-0 bg-muted/40">
              <div
                className="gradient-emerald h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col">
            <AnimatePresence mode="wait">
              {phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center sm:p-8"
                >
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <h2 className="text-xl font-semibold sm:text-2xl">AI сұрақтарды құрастыруда…</h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Жүктелген оқулық негізінде {grade}-сыныпқа арналған 30 жаңа сұрақ дайындалуда. Бұл 10–20 секунд алады.
                  </p>
                </motion.div>
              )}

              {phase === "test" && questions[current] && (
                <motion.div
                  key={`q-${current}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto flex max-w-4xl flex-col gap-5">
                      <div>
                        <div className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {questions[current].topic}
                        </div>
                        <h2 className="text-lg font-semibold leading-snug sm:text-2xl lg:text-3xl">
                          {current + 1}. {questions[current].question}
                        </h2>
                      </div>
                      {questions[current].imageUrl && (
                        <div className="overflow-hidden rounded-2xl border border-glass-border bg-muted/30">
                          <img
                            src={questions[current].imageUrl}
                            alt="Сұраққа қатысты фото"
                            className="mx-auto block max-h-[200px] w-auto object-contain sm:max-h-[260px]"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                        {questions[current].options.map((opt, i) => {
                          const active = answers[current] === i;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                const next = [...answers];
                                next[current] = i;
                                setAnswers(next);
                              }}
                              className={`group flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all sm:p-4 ${
                                active
                                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                  : "border-glass-border bg-card/40 hover:border-primary/40 hover:bg-accent/40"
                              }`}
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${
                                  active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="pt-0.5 text-sm leading-snug sm:pt-1 sm:text-base">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sticky bottom bar */}
                  <div className="shrink-0 border-t border-glass-border bg-background/80 backdrop-blur">
                    <div className="mx-auto flex max-w-4xl flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2 sm:flex-row-reverse sm:justify-end">
                        <div className="text-xs tabular-nums text-muted-foreground">
                          {answered} / {questions.length}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                          disabled={current === 0}
                          className="sm:hidden"
                        >
                          ← Алдыңғы
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                        disabled={current === 0}
                        className="hidden sm:inline-flex"
                      >
                        ← Алдыңғы
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const unanswered = questions.length - answered;
                            const msg =
                              unanswered > 0
                                ? `Тестті қазір аяқтайсыз ба? ${unanswered} сұраққа жауап берілмеген, олар қате болып есептеледі.`
                                : "Тестті аяқтап, нәтижені көресіз бе?";
                            if (confirm(msg)) void submit();
                          }}
                          disabled={submitting}
                          className="flex-1 sm:flex-none"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Аяқтау"}
                        </Button>
                        {current < questions.length - 1 ? (
                          <Button
                            size="sm"
                            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                            disabled={answers[current] < 0}
                            className="flex-1 sm:flex-none"
                          >
                            Келесі →
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={submit}
                            disabled={answers[current] < 0 || submitting}
                            className="gradient-emerald flex-1 text-white sm:flex-none"
                          >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Нәтиже"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 overflow-y-auto p-8"
                >
                  {error && !result ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <XCircle className="h-12 w-12 text-destructive" />
                      <h2 className="text-2xl font-semibold">Қате</h2>
                      <p className="max-w-md text-sm text-muted-foreground">{error}</p>
                      <Button onClick={() => load()}>Қайталау</Button>
                    </div>
                  ) : result ? (
                    <ResultView
                      result={result}
                      questions={questions}
                      answers={answers}
                      onRetry={() => load()}
                      onFocus={() => load(result.weakTopics.map((w) => w.topic))}
                      onExit={exit}
                    />
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultView({
  result,
  questions,
  answers,
  onRetry,
  onFocus,
  onExit,
}: {
  result: { score: number; total: number; percent: number; weakTopics: { topic: string; wrong: number; total: number }[] };
  questions: GeoQuestion[];
  answers: number[];
  onRetry: () => void;
  onFocus: () => void;
  onExit: () => void;
}) {
  const pass = result.percent >= 60;
  const wrongList = useMemo(
    () =>
      questions
        .map((q, i) => ({ q, i, ok: answers[i] === q.correctIndex }))
        .filter((x) => !x.ok),
    [questions, answers],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl border border-glass-border p-5">
          <div className="text-xs uppercase text-muted-foreground">Дұрыс жауаптар</div>
          <div className="mt-2 text-3xl font-bold">{result.score} / {result.total}</div>
        </div>
        <div className={`glass rounded-2xl border p-5 ${pass ? "border-emerald-400/40" : "border-orange-400/40"}`}>
          <div className="text-xs uppercase text-muted-foreground">Пайыз</div>
          <div className="mt-2 text-3xl font-bold">{result.percent}%</div>
        </div>
        <div className="glass rounded-2xl border border-glass-border p-5">
          <div className="text-xs uppercase text-muted-foreground">Әлсіз тақырыптар</div>
          <div className="mt-2 text-3xl font-bold">{result.weakTopics.length}</div>
        </div>
      </div>

      {result.weakTopics.length > 0 && (
        <div className="glass rounded-2xl border border-glass-border p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> AI ұсынады: осы тақырыптарды пысықтаңыз
          </div>
          <div className="flex flex-wrap gap-2">
            {result.weakTopics.map((w) => (
              <span key={w.topic} className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-700 dark:text-orange-300">
                {w.topic} ({w.wrong}/{w.total})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onRetry} className="gradient-emerald text-white">Жаңа тест (30 басқа сұрақ)</Button>
        {result.weakTopics.length > 0 && (
          <Button onClick={onFocus} variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> Әлсіз тақырыптар бойынша қосымша тест
          </Button>
        )}
        <Button variant="ghost" onClick={onExit}>Басты бетке</Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Толық талдау</h3>
        {questions.map((q, i) => {
          const ok = answers[i] === q.correctIndex;
          return (
            <div
              key={i}
              className={`rounded-2xl border p-4 ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}
            >
              <div className="flex items-start gap-2">
                {ok ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-destructive" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">{i + 1}. {q.question}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Тақырып: {q.topic}</div>
                  <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                    {q.options.map((o, oi) => (
                      <div
                        key={oi}
                        className={`rounded-lg px-3 py-1 ${
                          oi === q.correctIndex
                            ? "bg-emerald-500/15 font-semibold"
                            : oi === answers[i]
                            ? "bg-destructive/15"
                            : ""
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {o}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
