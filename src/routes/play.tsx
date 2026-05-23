import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { HostBroadcast, PlayerBroadcast } from "@/lib/qaz-quiz/types";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Qaz Quiz — Live game" },
      { name: "description", content: "Join a live Qaz Quiz game with a PIN." },
    ],
  }),
  component: PlayPage,
});

const ANSWER_COLORS = ["from-rose-500 to-rose-600", "from-sky-500 to-sky-600", "from-amber-500 to-amber-600", "from-emerald-500 to-emerald-600"];
const ANSWER_GLYPHS = ["▲", "◆", "●", "■"];

type Phase =
  | { kind: "form" }
  | { kind: "lobby"; quizTitle: string }
  | { kind: "question"; idx: number; total: number; text: string; image_url: string | null; options: string[]; deadline: number; chosen?: number }
  | { kind: "waiting"; chosen: number }
  | { kind: "reveal"; correct: number; chosen?: number; rank?: number; score?: number }
  | { kind: "podium"; players: { nickname: string; score: number }[] };

function PlayPage() {
  const [pin, setPin] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("pin") ?? "" : ""));
  const [nickname, setNickname] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "form" });
  const [joining, setJoining] = useState(false);
  const [tick, setTick] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const questionStartRef = useRef<number>(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { channelRef.current?.unsubscribe(); }, []);

  async function join() {
    if (!/^\d{6}$/.test(pin)) { toast.error("PIN: 6 цифр"); return; }
    if (nickname.trim().length < 2) { toast.error("Nickname"); return; }
    setJoining(true);
    const { data } = await supabase.from("qq_sessions").select("id,status").eq("pin", pin).in("status", ["lobby","running"]).maybeSingle();
    if (!data) { toast.error("Сессия табылмады / Game not found"); setJoining(false); return; }

    const ch = supabase.channel(`qq:${pin}`, { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "host" }, ({ payload }: { payload: HostBroadcast }) => {
      if (payload.type === "lobby") setPhase({ kind: "lobby", quizTitle: payload.quizTitle });
      else if (payload.type === "question") {
        questionStartRef.current = Date.now();
        setPhase({ kind: "question", idx: payload.idx, total: payload.total, text: payload.text, image_url: payload.image_url, options: payload.options, deadline: Date.now() + payload.time_limit_sec * 1000 });
      } else if (payload.type === "reveal") {
        const me = payload.scoreboard.find((p) => p.nickname === nickname.trim());
        const rank = payload.scoreboard.findIndex((p) => p.nickname === nickname.trim()) + 1;
        setPhase((cur) => ({ kind: "reveal", correct: payload.correct_index, chosen: cur.kind === "question" || cur.kind === "waiting" ? (cur as { chosen?: number }).chosen : undefined, rank, score: me?.score });
      } else if (payload.type === "podium") {
        setPhase({ kind: "podium", players: payload.players });
      }
    });
    await ch.subscribe();
    channelRef.current = ch;
    ch.send({ type: "broadcast", event: "player", payload: { type: "join", nickname: nickname.trim() } satisfies PlayerBroadcast });
    setPhase({ kind: "lobby", quizTitle: "" });
    setJoining(false);
  }

  function answer(i: number) {
    if (phase.kind !== "question" || phase.chosen !== undefined) return;
    const ms = Date.now() - questionStartRef.current;
    channelRef.current?.send({ type: "broadcast", event: "player", payload: { type: "answer", idx: phase.idx, choice: i, ms, nickname: nickname.trim() } satisfies PlayerBroadcast });
    setPhase({ kind: "waiting", chosen: i });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08110d] via-[#0a1a14] to-[#06140f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col p-4 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Qaz Quiz</div>
            <div className="font-semibold">Live game</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase.kind === "form" && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="my-auto space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div>
                <Sparkles className="h-8 w-8 text-emerald-400" />
                <h1 className="mt-3 text-3xl font-bold">Қосылу / Присоединиться</h1>
                <p className="text-sm text-white/60">Введите PIN от учителя</p>
              </div>
              <Input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6}
                placeholder="123456" className="h-16 border-white/20 bg-white/5 text-center font-display text-3xl font-bold tracking-[0.5em] text-white placeholder:text-white/30" />
              <Input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="Nickname" className="h-12 border-white/20 bg-white/5 text-center text-lg text-white placeholder:text-white/30" />
              <Button onClick={join} disabled={joining}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg font-semibold shadow-[0_0_40px_-10px_rgba(16,185,129,0.7)] hover:from-emerald-400 hover:to-emerald-500">
                {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : "Кіру / Join"}
              </Button>
            </motion.div>
          )}

          {phase.kind === "lobby" && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="my-auto text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-400" />
              <p className="mt-4 text-xl font-semibold">{nickname}</p>
              <p className="text-sm text-white/60">{phase.quizTitle || "Ойынды күтудеміз..."}</p>
            </motion.div>
          )}

          {phase.kind === "question" && (
            <motion.div key={`q-${phase.idx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="my-auto space-y-4">
              <div className="flex justify-between text-xs text-white/60">
                <span>#{phase.idx + 1} / {phase.total}</span>
                <span className="font-mono">{Math.max(0, Math.ceil((phase.deadline - Date.now()) / 1000))}s</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-lg font-semibold backdrop-blur">
                {phase.text}
                {phase.image_url && <img src={phase.image_url} alt="" className="mx-auto mt-3 max-h-[180px] rounded-xl object-contain" />}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {phase.options.map((opt, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => answer(i)}
                    className={`flex min-h-[80px] items-center justify-center rounded-2xl bg-gradient-to-br ${ANSWER_COLORS[i % 4]} p-4 text-lg font-bold shadow-lg active:opacity-80`}>
                    <span className="mr-2 text-2xl opacity-80">{ANSWER_GLYPHS[i]}</span>{opt || ""}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase.kind === "waiting" && (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="my-auto text-center">
              <div className={`mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br ${ANSWER_COLORS[phase.chosen % 4]} shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)]`} />
              <p className="mt-6 text-xl font-semibold">Жауап жіберілді</p>
              <p className="text-sm text-white/60">Басқа ойыншыларды күтудеміз...</p>
            </motion.div>
          )}

          {phase.kind === "reveal" && (
            <motion.div key="rev" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="my-auto space-y-4 text-center">
              {phase.chosen === phase.correct ? (
                <>
                  <div className="text-6xl">✅</div>
                  <p className="text-3xl font-bold text-emerald-400">Дұрыс!</p>
                </>
              ) : (
                <>
                  <div className="text-6xl">❌</div>
                  <p className="text-2xl font-bold text-rose-400">Қате</p>
                </>
              )}
              {phase.score !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="text-sm text-white/60">Орын</div>
                  <div className="text-3xl font-bold">#{phase.rank}</div>
                  <div className="mt-2 font-mono text-emerald-400">{phase.score} pts</div>
                </div>
              )}
            </motion.div>
          )}

          {phase.kind === "podium" && (
            <motion.div key="pod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="my-auto space-y-4 text-center">
              <Trophy className="mx-auto h-12 w-12 text-amber-400" />
              <p className="text-3xl font-bold">Финал!</p>
              <div className="space-y-2">
                {phase.players.slice(0, 5).map((p, i) => (
                  <div key={p.nickname}
                    className={`flex items-center justify-between rounded-2xl border px-5 py-4 backdrop-blur ${p.nickname === nickname.trim() ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                    <span className="font-semibold">{["🥇","🥈","🥉"][i] ?? `#${i+1}`} {p.nickname}</span>
                    <span className="font-mono text-emerald-400">{p.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* invisible re-render trigger for timer */}
        <span className="hidden">{tick}</span>
      </div>
    </div>
  );
}
