import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eraser, Undo2, Redo2, Trash2, Play, Pause, RotateCcw, Volume2, VolumeX,
  Pencil, Settings, Mic, MicOff, Sparkles, Users, Shuffle, AlertTriangle, Timer as TimerIcon,
  Maximize2, Minimize2, X, PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6", "#111827", "#ffffff"];
const DEFAULT_NAMES = [
  "Айдана", "Бекзат", "Дария", "Ерасыл", "Жания", "Зере",
  "Ислам", "Қарлығаш", "Мадияр", "Нұрислам", "Перизат", "Санжар",
  "Томирис", "Ұлжан", "Ясмина", "Әли",
];

/* =========================================================
   Audio engine — Web Audio synth + master mute
   ========================================================= */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private alarmNodes: { osc: OscillatorNode; gain: GainNode } | null = null;
  private tickActive = false;
  muted = false;

  private ensure() {
    if (!this.ctx) {
      const Ctx = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.6;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.6;
    if (m) this.stopAlarm();
  }

  private blip(freq: number, dur = 0.08, type: OscillatorType = "sine", vol = 0.3) {
    if (this.muted) return;
    const ctx = this.ensure();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(this.master!);
    o.start();
    o.stop(ctx.currentTime + dur);
  }

  click() { this.blip(620, 0.05, "square", 0.18); }
  erase() { this.blip(200, 0.12, "sawtooth", 0.18); }
  tick()  { this.blip(900, 0.03, "square", 0.12); }
  fanfare() {
    if (this.muted) return;
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, "triangle", 0.35), i * 110));
  }

  startAlarm() {
    if (this.muted || this.alarmNodes) return;
    const ctx = this.ensure();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 880;
    g.gain.value = 0.18;
    o.connect(g).connect(this.master!);
    o.start();
    // siren effect
    const start = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      o.frequency.setValueAtTime(i % 2 ? 1100 : 700, start + i * 0.15);
    }
    o.stop(start + 0.9);
    this.alarmNodes = { osc: o, gain: g };
    o.onended = () => { this.alarmNodes = null; };
  }
  stopAlarm() {
    if (this.alarmNodes) {
      try { this.alarmNodes.osc.stop(); } catch { /* ignore */ }
      this.alarmNodes = null;
    }
  }

  isTickActive() { return this.tickActive; }
  setTickActive(v: boolean) { this.tickActive = v; }
}

const audio = new AudioEngine();

/* =========================================================
   Module shell
   ========================================================= */
export function Whiteboard() {
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(75);
  const [violations, setViolations] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      audio.setMuted(next);
      return next;
    });
  };

  const tools = (
    <div className="space-y-6">
      <NoiseMonitor
        threshold={noiseThreshold}
        violations={violations}
        onViolation={() => setViolations((v) => v + 1)}
      />
      <LessonTimer />
      <StudentPicker />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-3 bg-background p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">AI Интерактивті тақта</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleMute} className="rounded-full gap-1.5">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{muted ? "Дыбыс өшірулі" : "Дыбыс қосулы"}</span>
            </Button>
            <Button
              variant={panelOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setPanelOpen((p) => !p)}
              className={`rounded-full gap-1.5 ${panelOpen ? "gradient-emerald" : ""}`}
            >
              <PanelRightOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Құралдар</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="rounded-full gap-1.5">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFullscreen(false)} className="rounded-full gap-1.5">
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Шығу</span>
            </Button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <Canvas fullscreen onToggleFullscreen={() => setFullscreen(false)} />

          <AnimatePresence>
            {panelOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPanelOpen(false)}
                  className="absolute inset-0 bg-black/20"
                />
                <motion.aside
                  initial={{ x: 380, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 380, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 28 }}
                  className="absolute right-0 top-0 bottom-0 w-[360px] max-w-[92vw] overflow-y-auto rounded-2xl glass-strong p-3 shadow-2xl"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Сабақ құралдары</span>
                    <button
                      onClick={() => setPanelOpen(false)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-primary/15"
                      aria-label="Жабу"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {tools}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </div>

        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          threshold={noiseThreshold}
          onThresholdChange={setNoiseThreshold}
          violations={violations}
          onResetViolations={() => setViolations(0)}
          muted={muted}
          onMutedChange={(v) => { setMuted(v); audio.setMuted(v); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Интерактивті тақта</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Мұғалімдерге арналған премиум құралдар жинағы: тақта, шуыл өлшегіш, оқушы таңдағыш.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFullscreen(true)} className="rounded-full gap-1.5">
            <Maximize2 className="h-4 w-4" /> Толық экран
          </Button>
          <Button variant="outline" size="sm" onClick={toggleMute} className="rounded-full gap-1.5">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? "Дыбыс өшірулі" : "Дыбыс қосулы"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)} className="rounded-full gap-1.5">
            <Settings className="h-4 w-4" /> Баптаулар
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Canvas fullscreen={false} onToggleFullscreen={() => setFullscreen(true)} />
        </div>
        <div className="space-y-6">
          <NoiseMonitor
            threshold={noiseThreshold}
            violations={violations}
            onViolation={() => setViolations((v) => v + 1)}
          />
          <LessonTimer />
        </div>
      </div>

      <StudentPicker />

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        threshold={noiseThreshold}
        onThresholdChange={setNoiseThreshold}
        violations={violations}
        onResetViolations={() => setViolations(0)}
        muted={muted}
        onMutedChange={(v) => { setMuted(v); audio.setMuted(v); }}
      />
    </div>
  );
}

/* =========================================================
   Canvas
   ========================================================= */
type Tool = "pen" | "eraser";

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#6366f1");
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<Tool>("pen");
  const drawing = useRef(false);
  const history = useRef<ImageData[]>([]);
  const redo = useRef<ImageData[]>([]);

  // refs so pointer handlers don't re-bind on each state change (prevents lag)
  const colorRef = useRef(color);
  const widthRef = useRef(width);
  const toolRef = useRef<Tool>(tool);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { widthRef.current = width; }, [width]);
  useEffect(() => { toolRef.current = tool; }, [tool]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const rect = c.parentElement!.getBoundingClientRect();
      const data = c.toDataURL();
      c.width = rect.width;
      c.height = 460;
      const img = new Image();
      img.onload = () => c.getContext("2d")?.drawImage(img, 0, 0);
      img.src = data;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const ctx = () => canvasRef.current!.getContext("2d")!;

  const snap = useCallback(() => {
    const c = canvasRef.current!;
    history.current.push(ctx().getImageData(0, 0, c.width, c.height));
    if (history.current.length > 30) history.current.shift();
    redo.current = [];
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    snap();
    drawing.current = true;
    const { x, y } = pos(e);
    const g = ctx();
    g.beginPath();
    g.moveTo(x, y);
    g.lineCap = "round";
    g.lineJoin = "round";
    if (toolRef.current === "eraser") {
      g.globalCompositeOperation = "destination-out";
      g.strokeStyle = "rgba(0,0,0,1)";
      g.lineWidth = Math.max(widthRef.current * 4, 12);
    } else {
      g.globalCompositeOperation = "source-over";
      g.strokeStyle = colorRef.current;
      g.lineWidth = widthRef.current;
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const { x, y } = pos(e);
    const g = ctx();
    g.lineTo(x, y);
    g.stroke();
  };
  const onUp = () => {
    if (drawing.current) drawing.current = false;
  };

  const clear = () => {
    snap();
    audio.erase();
    const c = canvasRef.current!;
    ctx().clearRect(0, 0, c.width, c.height);
  };
  const undo = () => {
    if (!history.current.length) return;
    audio.click();
    const c = canvasRef.current!;
    redo.current.push(ctx().getImageData(0, 0, c.width, c.height));
    ctx().putImageData(history.current.pop()!, 0, 0);
  };
  const redoF = () => {
    if (!redo.current.length) return;
    audio.click();
    const c = canvasRef.current!;
    history.current.push(ctx().getImageData(0, 0, c.width, c.height));
    ctx().putImageData(redo.current.pop()!, 0, 0);
  };
  const pickTool = (t: Tool) => {
    audio.click();
    if (t === "eraser") audio.erase();
    setTool(t);
  };

  return (
    <div className="glass rounded-2xl p-4 relative">
      <div className="mb-3 flex items-center gap-2">
        <Pencil className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Интерактивті тақта</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Құрал: <b className="text-foreground">{tool === "pen" ? "Қалам" : "Өшіргіш"}</b>
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white relative">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          className="block h-[460px] w-full touch-none"
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
        />

        {/* Floating glass toolbar */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 22 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 glass-strong rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl shadow-indigo-deep/30"
        >
          <ToolBtn active={tool === "pen"} onClick={() => pickTool("pen")} label="Қалам">
            <Pencil className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn active={tool === "eraser"} onClick={() => pickTool("eraser")} label="Өшіргіш">
            <Eraser className="h-4 w-4" />
          </ToolBtn>
          <div className="mx-1 h-6 w-px bg-border" />
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setColor(c); setTool("pen"); audio.click(); }}
                aria-label={c}
                className={`h-6 w-6 rounded-full border-2 ${color === c && tool === "pen" ? "border-foreground" : "border-white/60"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="mx-1 h-6 w-px bg-border" />
          <div className="flex w-32 items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8">{width}px</span>
            <Slider value={[width]} onValueChange={(v) => setWidth(v[0])} min={1} max={30} step={1} />
          </div>
          <div className="mx-1 h-6 w-px bg-border" />
          <ToolBtn onClick={undo} label="Артқа"><Undo2 className="h-4 w-4" /></ToolBtn>
          <ToolBtn onClick={redoF} label="Алға"><Redo2 className="h-4 w-4" /></ToolBtn>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={clear}
            className="ml-1 inline-flex items-center gap-1 rounded-full bg-destructive/90 px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Тақтаны тазалау
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function ToolBtn({ children, active, onClick, label }: { children: React.ReactNode; active?: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active ? "bg-primary text-primary-foreground shadow-md" : "bg-white/60 dark:bg-white/10 text-foreground hover:bg-primary/15"
      }`}
    >
      {children}
    </motion.button>
  );
}

/* =========================================================
   Noise Monitor (click-to-start, smoothed)
   ========================================================= */
function NoiseMonitor({ threshold, violations, onViolation }: { threshold: number; violations: number; onViolation: () => void }) {
  const [level, setLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [alert, setAlert] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedRef = useRef(0);
  const cooldownRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    analyserRef.current = null;
    setRunning(false);
    setLevel(0);
    smoothedRef.current = 0;
    audio.stopAlarm();
    setAlert(false);
  }, []);

  const start = async () => {
    setPermError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      src.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        const db = Math.min(100, Math.max(20, 20 + 80 * Math.min(1, rms * 6)));
        // exponential smoothing
        smoothedRef.current = smoothedRef.current * 0.82 + db * 0.18;
        const display = smoothedRef.current;
        setLevel(display);

        if (display > threshold) {
          if (Date.now() > cooldownRef.current) {
            cooldownRef.current = Date.now() + 4000;
            onViolation();
            setAlert(true);
            audio.startAlarm();
            setTimeout(() => setAlert(false), 2200);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
      setRunning(true);
    } catch (e) {
      setPermError("Микрофонға қол жеткізу рұқсат етілмеген. Браузер баптауларынан рұқсат беріңіз.");
      console.error(e);
    }
  };

  useEffect(() => () => stop(), [stop]);

  const safe = level < threshold * 0.6;
  const warn = level >= threshold * 0.6 && level < threshold;
  const status = safe
    ? { txt: "Тыныш", color: "bg-emerald-500", text: "text-emerald-500", ring: "ring-emerald-500/40" }
    : warn
    ? { txt: "Жұмыс деңгейі", color: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500/40" }
    : { txt: "Шулы! Тәртіп бұзылды", color: "bg-red-500", text: "text-red-500", ring: "ring-red-500/40" };

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Шуыл өлшегіш</h3>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          Ереже бұзу: <b className="text-foreground tabular-nums">{violations}</b>
        </span>
      </div>

      <div className="flex items-end gap-3">
        <div className="text-4xl font-semibold tabular-nums">{Math.round(level)} <span className="text-base font-normal text-muted-foreground">дБ</span></div>
        <div className={`mb-1 text-sm font-medium ${status.text}`}>{status.txt}</div>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full ${status.color}`}
          animate={{ width: `${Math.min(100, level)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>Шек: {threshold} дБ</span>
        <span>100</span>
      </div>

      {permError && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{permError}</p>
      )}

      <div className="mt-4 flex gap-2">
        {!running ? (
          <Button onClick={start} className="flex-1 gradient-emerald gap-1.5">
            <Mic className="h-4 w-4" /> Бақылауды бастау
          </Button>
        ) : (
          <Button onClick={stop} variant="outline" className="flex-1 gap-1.5">
            <MicOff className="h-4 w-4" /> Тоқтату
          </Button>
        )}
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="pointer-events-none absolute inset-x-3 top-3 rounded-xl bg-red-500/95 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg"
          >
            🚨 Тәртіп бұзылды!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   Timer
   ========================================================= */
function LessonTimer() {
  const [seconds, setSeconds] = useState(300);
  const [left, setLeft] = useState(300);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setLeft((s) => {
      if (s <= 1) { setRunning(false); audio.fanfare(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(i);
  }, [running]);
  const set = (s: number) => { setSeconds(s); setLeft(s); setRunning(false); audio.click(); };
  const m = Math.floor(left / 60).toString().padStart(2, "0");
  const s = (left % 60).toString().padStart(2, "0");
  const pct = seconds ? (left / seconds) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <TimerIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Таймер</h3>
      </div>
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" className="fill-none stroke-muted" strokeWidth="6" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(pct * 276.46) / 100} 276.46`} transform="rotate(-90 50 50)" className="transition-all" />
        </svg>
        <div className="text-3xl font-semibold tabular-nums">{m}:{s}</div>
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {[180, 300, 600].map((sec) => (
          <Button key={sec} size="sm" variant="outline" onClick={() => set(sec)}>{sec / 60} мин</Button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => { setRunning(!running); audio.click(); }} className="flex-1 gradient-emerald gap-1.5">
          {running ? <><Pause className="h-4 w-4" /> Тоқтату</> : <><Play className="h-4 w-4" /> Бастау</>}
        </Button>
        <Button variant="outline" onClick={() => set(seconds)}><RotateCcw className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

/* =========================================================
   Student Picker — Wheel of Fortune
   ========================================================= */
function StudentPicker() {
  const [raw, setRaw] = useState(DEFAULT_NAMES.join("\n"));
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const tickIntervalRef = useRef<number | null>(null);

  const names = useMemo(
    () => raw.split(/\n|,/g).map((s) => s.trim()).filter(Boolean),
    [raw],
  );
  const palette = ["#6366f1", "#8b5cf6", "#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#14b8a6", "#ec4899"];

  const spin = () => {
    if (spinning || names.length < 2) return;
    audio.click();
    const idx = Math.floor(Math.random() * names.length);
    const slice = 360 / names.length;
    // pointer at top (12 o'clock). target middle of slice.
    const target = 360 * 6 + (360 - (idx * slice + slice / 2));
    const final = angle + target - (angle % 360);
    setSpinning(true);
    setWinner(null);
    setShowWinner(false);
    setAngle(final);

    // ticking
    let interval = 60;
    const startedAt = Date.now();
    const duration = 4500;
    const schedule = () => {
      if (audio.muted) return;
      audio.tick();
      interval = 60 + ((Date.now() - startedAt) / duration) * 240;
      tickIntervalRef.current = window.setTimeout(schedule, interval);
    };
    schedule();

    window.setTimeout(() => {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
      setSpinning(false);
      setWinner(names[idx]);
      setShowWinner(true);
      setConfetti(true);
      audio.fanfare();
      window.setTimeout(() => setConfetti(false), 2200);
    }, duration);
  };

  useEffect(() => () => { if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current); }, []);

  const reset = () => { setRaw(""); setWinner(null); toast.success("Тізім тазартылды"); };
  const loadDemo = () => { setRaw(DEFAULT_NAMES.join("\n")); toast.success("Демо тізім жүктелді"); };

  const size = 320;
  const r = size / 2;
  const slice = names.length ? (2 * Math.PI) / names.length : 0;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Оқушыны таңдау — Сәттілік дөңгелегі</h3>
        <Sparkles className="ml-auto h-4 w-4 text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Оқушылар тізімі (әр аты жаңа жолға)</label>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            placeholder="Айдана&#10;Бекзат&#10;Дария..."
            className="mt-1 font-mono text-sm"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={spin}
              disabled={spinning || names.length < 2}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4" /> Оқушыны таңдау
            </motion.button>
            <Button variant="outline" size="sm" onClick={reset} className="rounded-full"><Trash2 className="mr-1 h-4 w-4" /> Тазалау</Button>
            <Button variant="ghost" size="sm" onClick={loadDemo} className="rounded-full">Демо тізім</Button>
            <span className="ml-auto text-xs text-muted-foreground">Барлығы: <b className="text-foreground">{names.length}</b></span>
          </div>
        </div>

        <div className="relative mx-auto" style={{ width: size, height: size + 24 }}>
          {/* pointer */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10">
            <svg width="28" height="32" viewBox="0 0 28 32">
              <polygon points="14,32 0,4 28,4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
          <motion.svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            animate={{ rotate: angle }}
            transition={{ duration: spinning ? 4.5 : 0, ease: [0.17, 0.67, 0.2, 1] }}
            className="drop-shadow-2xl mt-6"
          >
            {names.length === 0 ? (
              <circle cx={r} cy={r} r={r - 4} fill="#e5e7eb" />
            ) : (
              names.map((name, i) => {
                const a0 = i * slice - Math.PI / 2;
                const a1 = a0 + slice;
                const x0 = r + (r - 4) * Math.cos(a0);
                const y0 = r + (r - 4) * Math.sin(a0);
                const x1 = r + (r - 4) * Math.cos(a1);
                const y1 = r + (r - 4) * Math.sin(a1);
                const large = slice > Math.PI ? 1 : 0;
                const mid = a0 + slice / 2;
                const tx = r + (r - 60) * Math.cos(mid);
                const ty = r + (r - 60) * Math.sin(mid);
                return (
                  <g key={`${name}-${i}`}>
                    <path
                      d={`M${r},${r} L${x0},${y0} A${r - 4},${r - 4} 0 ${large} 1 ${x1},${y1} Z`}
                      fill={palette[i % palette.length]}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#fff"
                      fontSize="13"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${(mid * 180) / Math.PI + 90} ${tx} ${ty})`}
                    >
                      {name.length > 12 ? name.slice(0, 11) + "…" : name}
                    </text>
                  </g>
                );
              })
            )}
            <circle cx={r} cy={r} r={28} fill="#111827" />
            <circle cx={r} cy={r} r={20} fill="#fff" />
          </motion.svg>
        </div>
      </div>

      {/* Winner popup */}
      <Dialog open={showWinner} onOpenChange={setShowWinner}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Таңдалған оқушы</DialogTitle>
            <DialogDescription>Тақтаға шақырылатын оқушы:</DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="my-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-500 px-6 py-8 text-4xl font-bold text-white shadow-xl"
          >
            {winner}
          </motion.div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowWinner(false)} className="gradient-emerald">Тақтаға оралу</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confetti */}
      <AnimatePresence>
        {confetti && (
          <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {Array.from({ length: 70 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ y: -40, x: `${50 + (Math.random() * 30 - 15)}vw`, opacity: 1, rotate: 0 }}
                animate={{ y: "110vh", x: `${Math.random() * 100}vw`, rotate: Math.random() * 720, opacity: 0 }}
                transition={{ duration: 2 + Math.random() * 1.5, ease: "easeOut" }}
                className="absolute h-2 w-2 rounded-sm"
                style={{ background: palette[i % palette.length] }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   Settings modal
   ========================================================= */
function SettingsModal({
  open, onOpenChange, threshold, onThresholdChange, violations, onResetViolations, muted, onMutedChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  threshold: number;
  onThresholdChange: (n: number) => void;
  violations: number;
  onResetViolations: () => void;
  muted: boolean;
  onMutedChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Баптаулар</DialogTitle>
          <DialogDescription>Шуыл өлшегіш пен дыбыс параметрлерін реттеңіз.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <label className="font-medium">Шуыл шегі</label>
              <span className="tabular-nums text-muted-foreground">{threshold} дБ</span>
            </div>
            <Slider value={[threshold]} onValueChange={(v) => onThresholdChange(v[0])} min={40} max={95} step={1} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Бұл деңгейден жоғары болса, ескерту іске қосылады. Қалыпты сынып үшін 70–80 дБ ұсынылады.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              Барлық дыбысты өшіру
            </div>
            <button
              onClick={() => onMutedChange(!muted)}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${muted ? "bg-muted" : "bg-primary"}`}
              aria-label="Mute toggle"
            >
              <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${muted ? "" : "translate-x-5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-card/40 px-3 py-2.5">
            <div className="text-sm">
              <div className="font-medium">Ереже бұзу есептегіші</div>
              <div className="text-xs text-muted-foreground tabular-nums">Қазіргі мән: {violations}</div>
            </div>
            <Button variant="outline" size="sm" onClick={onResetViolations} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Нөлдеу
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="gradient-emerald">Жабу</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
