import { useEffect, useRef, useState } from "react";
import { Eraser, Undo2, Redo2, Trash2, Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useT } from "@/lib/i18n";

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#ef4444", "#6366f1", "#111827", "#ffffff"];

export function Whiteboard() {
  const t = useT();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("AI Интерактивті тақта", "AI Интерактивная доска", "AI Interactive board")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("Сабақ беруге арналған құралдар жинағы", "Набор инструментов для проведения уроков", "Toolkit for teaching lessons")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><Canvas /></div>
        <div className="space-y-6"><NoiseMonitor /><LessonTimer /></div>
      </div>
    </div>
  );
}

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#16a34a");
  const [width, setWidth] = useState(4);
  const drawing = useRef(false);
  const history = useRef<ImageData[]>([]);
  const redo = useRef<ImageData[]>([]);

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

  const snap = () => {
    const c = canvasRef.current!;
    history.current.push(ctx().getImageData(0, 0, c.width, c.height));
    if (history.current.length > 30) history.current.shift();
    redo.current = [];
  };

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
    g.strokeStyle = color;
    g.lineWidth = width;
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const { x, y } = pos(e);
    const g = ctx();
    g.lineTo(x, y);
    g.stroke();
  };
  const onUp = () => { drawing.current = false; };

  const clear = () => { snap(); const c = canvasRef.current!; ctx().clearRect(0, 0, c.width, c.height); };
  const undo = () => {
    if (!history.current.length) return;
    const c = canvasRef.current!;
    redo.current.push(ctx().getImageData(0, 0, c.width, c.height));
    ctx().putImageData(history.current.pop()!, 0, 0);
  };
  const redoF = () => {
    if (!redo.current.length) return;
    const c = canvasRef.current!;
    history.current.push(ctx().getImageData(0, 0, c.width, c.height));
    ctx().putImageData(redo.current.pop()!, 0, 0);
  };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-label={c} className={`h-7 w-7 rounded-full border-2 transition-transform ${color === c ? "scale-110 border-foreground" : "border-white/50"}`} style={{ background: c }} />
          ))}
        </div>
        <div className="flex w-40 items-center gap-2">
          <span className="text-xs text-muted-foreground">{width}px</span>
          <Slider value={[width]} onValueChange={(v) => setWidth(v[0])} min={1} max={30} step={1} />
        </div>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" variant="outline" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={redoF}><Redo2 className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => setColor("#ffffff")}><Eraser className="h-4 w-4" /></Button>
          <Button size="sm" variant="destructive" onClick={clear}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="block h-[460px] w-full touch-none"
        />
      </div>
    </div>
  );
}

function NoiseMonitor() {
  const t = useT();
  const [level, setLevel] = useState(35);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setLevel(20 + Math.random() * 75), 600);
    return () => clearInterval(i);
  }, [running]);
  const status =
    level < 45 ? { txt: t("Тыныш", "Тихо", "Quiet"), color: "bg-emerald-500", text: "text-emerald-500" } :
    level < 70 ? { txt: t("Жұмыс деңгейі", "Рабочий уровень", "Working level"), color: "bg-amber-500", text: "text-amber-500" } :
    { txt: t("Шулы! Назар аударыңыз", "Шумно! Обратите внимание", "Loud! Get attention"), color: "bg-red-500", text: "text-red-500" };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{t("Сынып шу мониторы", "Монитор шума в классе", "Classroom noise monitor")}</h3>
      </div>
      <div className="text-4xl font-semibold tabular-nums">{Math.round(level)} <span className="text-base font-normal text-muted-foreground">{t("дБ", "дБ", "dB")}</span></div>
      <div className={`mt-1 text-sm font-medium ${status.text}`}>{status.txt}</div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${status.color}`} style={{ width: `${Math.min(100, level)}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>0</span><span>45 {t("қауіпсіз", "норма", "safe")}</span><span>70 {t("жұмыс", "работа", "work")}</span><span>100</span>
      </div>
      <Button onClick={() => setRunning(!running)} variant="outline" className="mt-4 w-full">
        {running ? t("Тоқтату", "Остановить", "Stop") : t("Бастау", "Запустить", "Start")}
      </Button>
    </div>
  );
}

function LessonTimer() {
  const t = useT();
  const [seconds, setSeconds] = useState(300);
  const [left, setLeft] = useState(300);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setLeft((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000);
    return () => clearInterval(i);
  }, [running]);
  const set = (s: number) => { setSeconds(s); setLeft(s); setRunning(false); };
  const m = Math.floor(left / 60).toString().padStart(2, "0");
  const s = (left % 60).toString().padStart(2, "0");
  const pct = seconds ? (left / seconds) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-3 font-semibold">{t("Сабақ таймері", "Таймер урока", "Lesson timer")}</h3>
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" className="fill-none stroke-muted" strokeWidth="6" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(pct * 276.46) / 100} 276.46`} transform="rotate(-90 50 50)" className="transition-all" />
        </svg>
        <div className="text-3xl font-semibold tabular-nums">{m}:{s}</div>
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {[180, 300, 600].map((sec) => (
          <Button key={sec} size="sm" variant="outline" onClick={() => set(sec)}>{sec / 60} {t("мин", "мин", "min")}</Button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setRunning(!running)} className="flex-1 gradient-emerald gap-1.5">
          {running ? <><Pause className="h-4 w-4" /> {t("Тоқтату", "Пауза", "Pause")}</> : <><Play className="h-4 w-4" /> {t("Бастау", "Старт", "Start")}</>}
        </Button>
        <Button variant="outline" onClick={() => set(seconds)}><RotateCcw className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
