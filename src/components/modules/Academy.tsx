import { useState } from "react";
import { Play, CheckCircle2, Award, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const COURSES = [
  { id: 1, title: "Педагогикалық құқық негіздері", hours: 24, lectures: 12, level: "Базалық" },
  { id: 2, title: "Заманауи цифрлық сабақ", hours: 32, lectures: 16, level: "Орта" },
  { id: 3, title: "STEM бағытындағы әдістеме", hours: 40, lectures: 20, level: "Жоғары" },
];

const QUIZ = [
  { q: "514-бұйрық бойынша педагог күнделікті қанша құжат толтырады?", opts: ["1", "2", "3", "5"], a: 1 },
  { q: "«Педагог мәртебесі туралы» заң бойынша сенбілік мәжбүрлеу:", opts: ["Рұқсат етіледі", "Тыйым салынған", "Тек директор шешімімен", "Облыс әкімі бекітеді"], a: 1 },
  { q: "Артық қағазбастылық туралы талап кімге жолданады?", opts: ["Парламентке", "Білім бақылау комитетіне", "Полицияға", "Сотқа тікелей"], a: 1 },
  { q: "Мәжбүрлі жазылым (подписка) — қандай заң бұзу?", opts: ["Әкімшілік", "Сыбайлас жемқорлыққа қарсы заңды", "Еңбек кодексі", "Барлығы"], a: 3 },
  { q: "Педагогтың жұмыс уақыты не үшін арналған?", opts: ["Қосымша есеп беру", "Жиналыс", "Оқыту мен дайындалу", "Әкімшілік тапсырмалар"], a: 2 },
];

export function Academy() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const { user, addPoints, incrementCertificates } = useAppStore();

  const start = () => { setStep(0); setAnswers([]); setQuizOpen(true); };
  const answer = (i: number) => {
    const next = [...answers, i];
    setAnswers(next);
    if (step + 1 < QUIZ.length) setStep(step + 1);
    else {
      const score = next.filter((a, idx) => a === QUIZ[idx].a).length;
      setQuizOpen(false);
      if (score >= 3) {
        addPoints(200);
        incrementCertificates();
        setCertOpen(true);
        toast.success(`+200 ұпай! Сертификат алдыңыз (${score}/5)`);
      } else {
        toast.error(`Өкінішке орай ${score}/5. Қайталап көріңіз`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Академия</h1>
        <p className="mt-1 text-sm text-muted-foreground">Кәсіби сертификаттау курстары</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {COURSES.map((c) => (
          <div key={c.id} className="glass overflow-hidden rounded-2xl">
            <div className="relative flex aspect-video items-center justify-center gradient-hero">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-indigo-deep/40" />
              <button className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur transition-transform hover:scale-110">
                <Play className="ml-1 h-6 w-6 text-primary" />
              </button>
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">{c.level}</span>
            </div>
            <div className="p-5">
              <h3 className="text-base font-semibold">{c.title}</h3>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>{c.hours} сағат</span>
                <span>{c.lectures} дәріс</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass relative overflow-hidden rounded-3xl p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="gradient-emerald flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
            <Award className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">Сертификаттау емтиханы</h3>
            <p className="mt-1 text-sm text-muted-foreground">5 сұрақ · педагогикалық құқық · табысты тапсырғанда +200 ұпай мен сертификат</p>
          </div>
          <Button onClick={start} className="gradient-emerald shadow-lg shadow-primary/30">Емтиханды бастау</Button>
        </div>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">Сұрақ {step + 1} / {QUIZ.length}</div>
            <div className="flex gap-1">
              {QUIZ.map((_, i) => (
                <div key={i} className={`h-1 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <h3 className="text-lg font-semibold leading-snug">{QUIZ[step]?.q}</h3>
          <div className="mt-4 space-y-2">
            {QUIZ[step]?.opts.map((o, i) => (
              <button key={i} onClick={() => answer(i)} className="w-full rounded-xl border border-border bg-card/60 p-3 text-left text-sm transition-all hover:border-primary hover:bg-primary/5">
                {o}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0">
          <Certificate name={user?.fullName ?? ""} onClose={() => setCertOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Certificate({ name, onClose }: { name: string; onClose: () => void }) {
  const id = "QTA-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const print = () => window.print();
  return (
    <div className="relative">
      <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50">
        <X className="h-4 w-4" />
      </button>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-emerald-100 p-12 text-slate-900 shadow-2xl">
        <div className="absolute inset-0 border-[12px] border-double border-emerald-600/30 rounded-2xl pointer-events-none" />
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-700">Qazaq Teachers AI</div>
          <h2 className="mt-3 font-serif text-4xl font-bold">Сертификат</h2>
          <div className="mt-1 text-sm text-slate-600">Кәсіби біліктілікті растайтын құжат</div>

          <div className="my-8">
            <div className="text-sm text-slate-500">Осы куәлік төмендегі тұлғаға беріледі</div>
            <div className="mt-3 font-serif text-3xl font-semibold text-emerald-800">{name}</div>
            <div className="mx-auto mt-2 h-0.5 w-48 bg-emerald-600/40" />
            <p className="mx-auto mt-4 max-w-md text-sm text-slate-600">
              «Педагогикалық құқық негіздері» курсын табысты тәмамдағаны үшін
            </p>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="text-left text-xs text-slate-500">
              <div className="font-semibold text-slate-700">Күні</div>
              <div>{new Date().toLocaleDateString("kk-KZ")}</div>
              <div className="mt-2 font-semibold text-slate-700">ID</div>
              <div>{id}</div>
            </div>
            <div className="flex flex-col items-center">
              <QRGraphic id={id} />
              <div className="mt-1 text-[10px] text-slate-500">QR верификация</div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="font-script text-2xl italic text-emerald-800">Qazaq Teachers</div>
              <div className="mt-1 h-px w-24 bg-slate-400 ml-auto" />
              <div>Платформа директоры</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <Button onClick={print} className="gradient-emerald gap-2"><Printer className="h-4 w-4" /> Басып шығару</Button>
      </div>
    </div>
  );
}

function QRGraphic({ id }: { id: string }) {
  // Deterministic 12x12 pseudo-QR derived from id
  const size = 12;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  return (
    <div className="grid h-20 w-20 grid-cols-12 gap-px rounded bg-white p-1 shadow-inner ring-1 ring-slate-300">
      {cells.map((c, i) => <div key={i} className={c ? "bg-slate-900" : "bg-white"} />)}
    </div>
  );
}
