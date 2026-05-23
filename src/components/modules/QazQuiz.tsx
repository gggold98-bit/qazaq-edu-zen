import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Play, Sparkles, X, Clock, Trophy, Users, Copy, Check,
  ChevronRight, ChevronLeft, ImageIcon, ListChecks, ToggleLeft, History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { genPin, type HostBroadcast, type PlayerBroadcast, type QQQuestion, type QQQuiz, type QType } from "@/lib/qaz-quiz/types";

type View = "list" | "editor" | "history" | "live";

const ANSWER_COLORS = [
  "from-rose-500 to-rose-600",
  "from-sky-500 to-sky-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
];

export function QazQuiz() {
  const t = useT();
  const { user } = useAppStore();
  const [view, setView] = useState<View>("list");
  const [quizzes, setQuizzes] = useState<QQQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<QQQuiz | null>(null);
  const [liveQuiz, setLiveQuiz] = useState<QQQuiz | null>(null);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("qq_quizzes").select("*").eq("owner_id", user.id).order("updated_at", { ascending: false });
    setQuizzes((data ?? []) as QQQuiz[]);
    setLoading(false);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  async function createQuiz() {
    if (!user) return;
    const { data, error } = await supabase
      .from("qq_quizzes")
      .insert({ owner_id: user.id, title: t("Жаңа викторина", "Новая викторина", "New quiz") })
      .select("*").single();
    if (error) { toast.error(error.message); return; }
    await refresh();
    setEditing(data as QQQuiz);
    setView("editor");
  }

  async function deleteQuiz(id: string) {
    if (!confirm(t("Жоюды растайсыз ба?", "Удалить?", "Delete?"))) return;
    await supabase.from("qq_quizzes").delete().eq("id", id);
    await refresh();
  }

  async function startLive(quiz: QQQuiz) {
    const { count } = await supabase.from("qq_questions").select("id", { count: "exact", head: true }).eq("quiz_id", quiz.id);
    if (!count) { toast.error(t("Сұрақтар жоқ", "Нет вопросов", "No questions")); return; }
    setLiveQuiz(quiz);
    setView("live");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Qaz Quiz</h1>
          <p className="text-sm text-muted-foreground">
            {t("Сабақты ойынға айналдыр — Kahoot стилінде", "Превратите урок в игру — в стиле Kahoot", "Turn lessons into Kahoot-style live games")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "list" ? "default" : "outline"} className="rounded-xl" onClick={() => setView("list")}>
            <ListChecks className="mr-2 h-4 w-4" />{t("Викториналарым", "Мои викторины", "My quizzes")}
          </Button>
          <Button variant={view === "history" ? "default" : "outline"} className="rounded-xl" onClick={() => setView("history")}>
            <History className="mr-2 h-4 w-4" />{t("Тарих", "История", "History")}
          </Button>
          <Button className="rounded-xl gradient-emerald text-white" onClick={createQuiz}>
            <Plus className="mr-2 h-4 w-4" />{t("Жаңа", "Создать", "New")}
          </Button>
        </div>
      </div>

      {view === "list" && (
        <QuizList quizzes={quizzes} loading={loading} onEdit={(q) => { setEditing(q); setView("editor"); }} onDelete={deleteQuiz} onStart={startLive} />
      )}
      {view === "history" && <HistoryView />}
      {view === "editor" && editing && (
        <QuizEditor quiz={editing} onClose={() => { setEditing(null); setView("list"); refresh(); }} onStart={(q) => startLive(q)} />
      )}

      <AnimatePresence>
        {view === "live" && liveQuiz && (
          <LiveHost quiz={liveQuiz} onExit={() => { setLiveQuiz(null); setView("list"); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- List ---------------- */
function QuizList({ quizzes, loading, onEdit, onDelete, onStart }: {
  quizzes: QQQuiz[]; loading: boolean;
  onEdit: (q: QQQuiz) => void; onDelete: (id: string) => void; onStart: (q: QQQuiz) => void;
}) {
  const t = useT();
  if (loading) return <p className="text-sm text-muted-foreground">{t("Жүктелуде...", "Загрузка...", "Loading...")}</p>;
  if (!quizzes.length) return (
    <Card className="glass p-10 text-center">
      <Sparkles className="mx-auto h-10 w-10 text-primary" />
      <p className="mt-3 text-lg font-semibold">{t("Әлі викторина жоқ", "Викторин ещё нет", "No quizzes yet")}</p>
      <p className="text-sm text-muted-foreground">{t("«Жаңа» батырмасын басып бастаңыз", "Нажмите «Создать»", "Click New to start")}</p>
    </Card>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((q) => (
        <motion.div key={q.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass group relative overflow-hidden p-5 transition-all hover:shadow-2xl hover:shadow-primary/10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="relative">
              <h3 className="text-lg font-semibold tracking-tight">{q.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{q.description || "—"}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="gradient-emerald flex-1 text-white" onClick={() => onStart(q)}>
                  <Play className="mr-1.5 h-3.5 w-3.5" />{t("Бастау", "Старт", "Start")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- History ---------------- */
function HistoryView() {
  const t = useT();
  const { user } = useAppStore();
  const [items, setItems] = useState<{ id: string; pin: string; status: string; summary: { players?: { nickname: string; score: number }[] }; created_at: string; quiz: { title: string } | null }[]>([]);
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("qq_sessions")
        .select("id,pin,status,summary,created_at,quiz:qq_quizzes(title)")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setItems((data ?? []) as never);
    })();
  }, [user?.id]);
  if (!items.length) return <p className="text-sm text-muted-foreground">{t("Тарих бос", "История пуста", "No history yet")}</p>;
  return (
    <div className="space-y-3">
      {items.map((it) => {
        const top = (it.summary?.players ?? []).slice().sort((a, b) => b.score - a.score).slice(0, 3);
        return (
          <Card key={it.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-semibold">{it.quiz?.title ?? "—"}</div>
              <div className="text-xs text-muted-foreground">PIN {it.pin} · {new Date(it.created_at).toLocaleString()}</div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {top.map((p, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  {["🥇","🥈","🥉"][i]} {p.nickname} · {p.score}
                </span>
              ))}
              <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-wider">{it.status}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Editor ---------------- */
function QuizEditor({ quiz, onClose, onStart }: { quiz: QQQuiz; onClose: () => void; onStart: (q: QQQuiz) => void }) {
  const t = useT();
  const [title, setTitle] = useState(quiz.title);
  const [desc, setDesc] = useState(quiz.description ?? "");
  const [questions, setQuestions] = useState<QQQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("qq_questions").select("*").eq("quiz_id", quiz.id).order("idx");
      setQuestions((data ?? []) as QQQuestion[]);
    })();
  }, [quiz.id]);

  async function saveMeta() {
    await supabase.from("qq_quizzes").update({ title, description: desc }).eq("id", quiz.id);
  }

  async function addQuestion(qtype: QType) {
    const defaults = qtype === "truefalse"
      ? { options: [t("Иә","Да","True"), t("Жоқ","Нет","False")] as string[], correct_index: 0 }
      : { options: ["","","",""] as string[], correct_index: 0 };
    const { data } = await supabase.from("qq_questions").insert({
      quiz_id: quiz.id, idx: questions.length, qtype, text: "", ...defaults, time_limit_sec: 20, points: 1000,
    }).select("*").single();
    if (data) setQuestions([...questions, data as QQQuestion]);
  }

  async function updateQ(q: QQQuestion, patch: Partial<QQQuestion>) {
    const next = { ...q, ...patch };
    setQuestions(questions.map((x) => x.id === q.id ? next : x));
  }
  async function commitQ(q: QQQuestion) {
    setSaving(true);
    await supabase.from("qq_questions").update({
      text: q.text, image_url: q.image_url, options: q.options, correct_index: q.correct_index,
      time_limit_sec: q.time_limit_sec, points: q.points, qtype: q.qtype,
    }).eq("id", q.id);
    setSaving(false);
  }
  async function delQ(id: string) {
    await supabase.from("qq_questions").delete().eq("id", id);
    setQuestions(questions.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-4">
      <Card className="glass space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={async () => { await saveMeta(); onClose(); }}>
            <ChevronLeft className="mr-1 h-4 w-4" />{t("Артқа","Назад","Back")}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={saveMeta}>{t("Сақтау","Сохранить","Save")}</Button>
            <Button className="gradient-emerald text-white" onClick={() => onStart({ ...quiz, title })}>
              <Play className="mr-1.5 h-4 w-4" />{t("Live бастау","Запустить Live","Start Live")}
            </Button>
          </div>
        </div>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveMeta}
          placeholder={t("Атауы","Название","Title")} className="h-12 text-lg font-semibold" />
        <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={saveMeta}
          placeholder={t("Сипаттама","Описание","Description")} rows={2} />
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => addQuestion("multiple")}><ListChecks className="mr-2 h-4 w-4" />{t("Бірнеше нұсқа","Несколько вариантов","Multiple choice")}</Button>
        <Button variant="outline" onClick={() => addQuestion("truefalse")}><ToggleLeft className="mr-2 h-4 w-4" />{t("Ия/Жоқ","Да/Нет","True / False")}</Button>
        <Button variant="outline" onClick={() => addQuestion("image")}><ImageIcon className="mr-2 h-4 w-4" />{t("Сурет","Изображение","Image")}</Button>
        {saving && <span className="self-center text-xs text-muted-foreground">{t("Сақталуда...","Сохранение...","Saving...")}</span>}
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <Card key={q.id} className="glass space-y-3 p-5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">#{i + 1}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{q.qtype}</span>
              <div className="ml-auto flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <Input type="number" min={5} max={120} className="h-8 w-20" value={q.time_limit_sec}
                  onChange={(e) => updateQ(q, { time_limit_sec: Number(e.target.value) })} onBlur={() => commitQ(q)} />
                <span className="text-xs text-muted-foreground">{t("ұпай","очки","pts")}</span>
                <Input type="number" min={100} step={100} className="h-8 w-24" value={q.points}
                  onChange={(e) => updateQ(q, { points: Number(e.target.value) })} onBlur={() => commitQ(q)} />
                <Button size="sm" variant="ghost" onClick={() => delQ(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <Textarea value={q.text} onChange={(e) => updateQ(q, { text: e.target.value })} onBlur={() => commitQ(q)}
              placeholder={t("Сұрақ мәтіні","Текст вопроса","Question text")} rows={2} className="text-base" />
            {q.qtype === "image" && (
              <Input value={q.image_url ?? ""} onChange={(e) => updateQ(q, { image_url: e.target.value })} onBlur={() => commitQ(q)}
                placeholder="https://...jpg" />
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className={`flex items-center gap-2 rounded-xl border-2 p-2 transition-all ${q.correct_index === oi ? "border-primary bg-primary/5" : "border-transparent bg-accent/30"}`}>
                  <button onClick={() => { updateQ(q, { correct_index: oi }); setTimeout(() => commitQ({ ...q, correct_index: oi }), 0); }}
                    className={`h-6 w-6 shrink-0 rounded-full border-2 ${q.correct_index === oi ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                  <Input value={opt} onChange={(e) => {
                      const opts = [...q.options]; opts[oi] = e.target.value; updateQ(q, { options: opts });
                    }} onBlur={() => commitQ(q)}
                    placeholder={`${t("Жауап","Ответ","Option")} ${oi + 1}`} className="border-none bg-transparent" />
                </div>
              ))}
            </div>
          </Card>
        ))}
        {!questions.length && (
          <Card className="glass p-10 text-center text-sm text-muted-foreground">
            {t("Жоғарыдағы батырмамен сұрақ қосыңыз","Добавьте вопрос кнопкой выше","Add a question with the buttons above")}
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------------- Live Host (fullscreen overlay) ---------------- */
type Player = { nickname: string; score: number; answered?: boolean };

function LiveHost({ quiz, onExit }: { quiz: QQQuiz; onExit: () => void }) {
  const t = useT();
  const { user } = useAppStore();
  const [pin] = useState(() => genPin());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QQQuestion[]>([]);
  const [phase, setPhase] = useState<"lobby" | "question" | "reveal" | "podium">("lobby");
  const [idx, setIdx] = useState(0);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { choice: number; ms: number }>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const startMsRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [copied, setCopied] = useState(false);

  // create session + load questions + setup channel
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: qs } = await supabase.from("qq_questions").select("*").eq("quiz_id", quiz.id).order("idx");
      if (!alive) return;
      setQuestions((qs ?? []) as QQQuestion[]);
      const { data: sess, error } = await supabase.from("qq_sessions")
        .insert({ quiz_id: quiz.id, host_id: user!.id, pin, status: "lobby" }).select("*").single();
      if (error) { toast.error(error.message); onExit(); return; }
      setSessionId(sess!.id);

      const ch = supabase.channel(`qq:${pin}`, { config: { broadcast: { self: false }, presence: { key: "host" } } });
      ch.on("broadcast", { event: "player" }, ({ payload }: { payload: PlayerBroadcast }) => {
        if (payload.type === "join") {
          setPlayers((p) => p[payload.nickname] ? p : ({ ...p, [payload.nickname]: { nickname: payload.nickname, score: 0 } }));
        } else if (payload.type === "answer") {
          setAnswers((a) => a[payload.nickname] ? a : ({ ...a, [payload.nickname]: { choice: payload.choice, ms: payload.ms } }));
        }
      });
      await ch.subscribe();
      channelRef.current = ch;
      broadcast({ type: "lobby", pin, quizTitle: quiz.title });
    })();
    return () => {
      alive = false;
      if (tickRef.current) clearInterval(tickRef.current);
      channelRef.current?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function broadcast(payload: HostBroadcast) {
    channelRef.current?.send({ type: "broadcast", event: "host", payload });
  }

  async function startGame() {
    if (!questions.length) return;
    await supabase.from("qq_sessions").update({ status: "running" }).eq("id", sessionId!);
    nextQuestion(0);
  }

  function nextQuestion(i: number) {
    if (i >= questions.length) return endGame();
    const q = questions[i];
    setIdx(i);
    setAnswers({});
    setPlayers((p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, { ...v, answered: false }])));
    setPhase("question");
    setTimeLeft(q.time_limit_sec);
    startMsRef.current = Date.now();
    broadcast({
      type: "question", idx: i, total: questions.length, qtype: q.qtype, text: q.text,
      image_url: q.image_url, options: q.options, time_limit_sec: q.time_limit_sec, serverNow: startMsRef.current,
    });
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const left = q.time_limit_sec - Math.floor((Date.now() - startMsRef.current) / 1000);
      if (left <= 0) { clearInterval(tickRef.current!); reveal(i); }
      else setTimeLeft(left);
    }, 250);
  }

  function reveal(i: number) {
    const q = questions[i];
    // award points: full points if correct, scaled by speed (50%..100%)
    setPlayers((prev) => {
      const next = { ...prev };
      for (const nick of Object.keys(next)) {
        const ans = answers[nick];
        if (ans && ans.choice === q.correct_index) {
          const ratio = Math.max(0, Math.min(1, 1 - (ans.ms / 1000) / q.time_limit_sec));
          const gained = Math.round(q.points * (0.5 + 0.5 * ratio));
          next[nick] = { ...next[nick], score: next[nick].score + gained };
        }
      }
      const board = Object.values(next).sort((a, b) => b.score - a.score).map((p) => ({ nickname: p.nickname, score: p.score }));
      broadcast({ type: "reveal", idx: i, correct_index: q.correct_index, scoreboard: board });
      return next;
    });
    setPhase("reveal");
  }

  async function endGame() {
    setPhase("podium");
    const board = Object.values(players).sort((a, b) => b.score - a.score).map((p) => ({ nickname: p.nickname, score: p.score }));
    broadcast({ type: "podium", players: board });
    if (sessionId) {
      await supabase.from("qq_sessions").update({
        status: "ended", summary: { players: board, totalQuestions: questions.length, finishedAt: new Date().toISOString() },
      }).eq("id", sessionId);
    }
  }

  async function exit() {
    if (sessionId) await supabase.from("qq_sessions").update({ status: "ended" }).eq("id", sessionId);
    channelRef.current?.unsubscribe();
    onExit();
  }

  const playerList = useMemo(() => Object.values(players), [players]);
  const currentQ = questions[idx];
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/play` : "/play";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-[#08110d] via-[#0a1a14] to-[#06140f] text-white">
      {/* Floating bg orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-emerald flex h-10 w-10 items-center justify-center rounded-xl">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/60">Qaz Quiz Live</div>
              <div className="font-semibold">{quiz.title}</div>
            </div>
          </div>
          <Button variant="ghost" onClick={exit} className="text-white hover:bg-white/10"><X className="mr-1.5 h-4 w-4" />{t("Шығу","Выйти","Exit")}</Button>
        </div>

        <AnimatePresence mode="wait">
          {phase === "lobby" && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-10 grid gap-8 lg:grid-cols-2">
              <div>
                <div className="text-sm uppercase tracking-widest text-white/60">{t("Кіру коды","Код входа","Game PIN")}</div>
                <div className="my-4 select-all rounded-3xl border border-white/10 bg-white/5 p-8 text-center font-display text-7xl font-bold tracking-[0.4em] backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] sm:text-8xl">
                  {pin}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <span>{joinUrl}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-white hover:bg-white/10" onClick={() => { navigator.clipboard.writeText(`${joinUrl}?pin=${pin}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <Button onClick={startGame} disabled={!playerList.length}
                  className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg font-semibold shadow-[0_0_40px_-10px_rgba(16,185,129,0.7)] hover:from-emerald-400 hover:to-emerald-500">
                  <Play className="mr-2 h-5 w-5" />{t("Ойынды бастау","Начать игру","Start game")} ({playerList.length})
                </Button>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-white/60">
                  <Users className="h-4 w-4" />{t("Ойыншылар","Игроки","Players")} · {playerList.length}
                </div>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {playerList.map((p) => (
                      <motion.span key={p.nickname} layout initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 font-medium backdrop-blur">
                        {p.nickname}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {!playerList.length && <span className="text-sm text-white/50">{t("Ойыншыларды күтудеміз...","Ждём игроков...","Waiting for players...")}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {phase === "question" && currentQ && (
            <motion.div key={`q-${idx}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-6 space-y-5">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>{t("Сұрақ","Вопрос","Question")} {idx + 1} / {questions.length}</span>
                <div className="flex items-center gap-2">
                  <span>{Object.keys(answers).length} / {playerList.length} {t("жауап","ответили","answered")}</span>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
                  <div className="text-2xl font-semibold leading-tight sm:text-3xl">{currentQ.text}</div>
                  {currentQ.image_url && <img src={currentQ.image_url} alt="" className="mx-auto mt-4 max-h-[300px] rounded-2xl object-contain" />}
                </div>
                <CircleTimer value={timeLeft} max={currentQ.time_limit_sec} />
              </div>
              <div className={`grid gap-3 ${currentQ.options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
                {currentQ.options.map((opt, i) => (
                  <div key={i} className={`rounded-2xl bg-gradient-to-br ${ANSWER_COLORS[i % 4]} p-5 text-lg font-semibold shadow-lg`}>
                    <span className="mr-2 opacity-70">{["▲","◆","●","■"][i]}</span>{opt || `—`}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => reveal(idx)} className="bg-white/10 text-white hover:bg-white/20">
                  {t("Жауапты ашу","Показать ответ","Reveal")}
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "reveal" && currentQ && (
            <motion.div key={`r-${idx}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-6 space-y-5">
              <Card className="bg-white/5 border-white/10 p-6 text-white backdrop-blur-xl">
                <div className="text-sm uppercase tracking-widest text-white/60">{t("Дұрыс жауап","Правильный ответ","Correct answer")}</div>
                <div className="mt-2 text-2xl font-bold text-emerald-400">{currentQ.options[currentQ.correct_index]}</div>
              </Card>
              <Leaderboard players={Object.values(players).sort((a, b) => b.score - a.score)} />
              <div className="flex justify-end gap-2">
                {idx + 1 < questions.length ? (
                  <Button onClick={() => nextQuestion(idx + 1)} className="gradient-emerald text-white">
                    {t("Келесі","Дальше","Next")}<ChevronRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={endGame} className="gradient-emerald text-white">
                    <Trophy className="mr-1.5 h-4 w-4" />{t("Финал","Финал","Finish")}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {phase === "podium" && (
            <Podium players={Object.values(players).sort((a, b) => b.score - a.score)} onExit={exit} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CircleTimer({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="absolute -right-2 -top-2 sm:right-4 sm:top-4">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgb(16,185,129)" strokeWidth="3"
            strokeDasharray={`${pct * 100.5} 100.5`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold">{value}</div>
      </div>
    </div>
  );
}

function Leaderboard({ players }: { players: Player[] }) {
  return (
    <div className="space-y-2">
      {players.slice(0, 8).map((p, i) => (
        <motion.div key={p.nickname} layout
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="w-6 text-center font-bold text-white/70">{i + 1}</span>
            <span className="font-semibold">{p.nickname}</span>
          </div>
          <span className="font-mono font-bold text-emerald-400">{p.score}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Podium({ players, onExit }: { players: Player[]; onExit: () => void }) {
  const t = useT();
  const top = players.slice(0, 3);
  const heights = ["h-40", "h-56", "h-32"];
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 space-y-8">
      <div className="text-center">
        <Trophy className="mx-auto h-10 w-10 text-amber-400" />
        <div className="mt-2 text-4xl font-bold">{t("Жеңімпаздар","Победители","Winners")}</div>
      </div>
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {order.map((rank, slot) => {
          const p = top[rank];
          if (!p) return <div key={slot} className="w-24 sm:w-32" />;
          return (
            <motion.div key={p.nickname} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + slot * 0.2 }}
              className="flex w-24 flex-col items-center sm:w-32">
              <div className="text-3xl">{["🥈","🥇","🥉"][slot]}</div>
              <div className="mt-1 font-semibold">{p.nickname}</div>
              <div className="font-mono text-emerald-400">{p.score}</div>
              <div className={`mt-2 w-full ${heights[slot]} rounded-t-2xl bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_40px_-10px_rgba(16,185,129,0.7)]`} />
            </motion.div>
          );
        })}
      </div>
      {players.length > 3 && (
        <div className="mx-auto max-w-md">
          <Leaderboard players={players.slice(3)} />
        </div>
      )}
      <div className="flex justify-center">
        <Button onClick={onExit} className="gradient-emerald text-white">{t("Аяқтау","Завершить","Done")}</Button>
      </div>
    </motion.div>
  );
}
