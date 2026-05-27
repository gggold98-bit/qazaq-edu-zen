import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  FileText, BookOpen, Target, Settings2, Paperclip, Sparkles,
  Clock, Layers, Monitor, Image as ImageIcon, Loader2, Download, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";
import { generateKmj, type KmjInput } from "@/lib/kmj.functions";
import { toast } from "sonner";

type Section = "kmj" | "bzhb" | "tzhb";

const SUBJECTS = [
  "Математика", "Физика", "Химия", "Биология", "География",
  "Информатика", "Қазақ тілі мен әдебиеті", "Орыс тілі мен әдебиеті",
  "Ағылшын тілі", "Қазақстан тарихы", "Дүниежүзі тарихы", "Құқық негіздері",
];
const GRADES = ["1","2","3","4","5","6","7","8","9","10","11"];

interface StepHeaderProps { n: number; title: string; tone: string; }
function StepHeader({ n, title, tone }: StepHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${tone}`}>{n}</div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

function KmjCreator() {
  const t = useT();
  const run = useServerFn(generateKmj);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<KmjInput>({
    subject: "", grade: "", section: "", language: "kk",
    topic: "", learningObjective: "", lessonGoals: "",
    lessonType: "Аралас", duration: "45 мин", level: "Аралас", ict: "Иә",
    orientation: "portrait", withImages: false, extraNotes: "",
  });

  const set = <K extends keyof KmjInput>(k: K, v: KmjInput[K]) => setForm((p) => ({ ...p, [k]: v }));

  const required = form.subject && form.grade && form.topic && form.learningObjective && form.lessonGoals;

  const submit = async () => {
    if (!required) {
      toast.error(t("Барлық міндетті өрістерді толтырыңыз", "Заполните все обязательные поля", "Fill all required fields"));
      return;
    }
    setLoading(true); setResult(null);
    try {
      const r = await run({ data: form });
      setResult(r.markdown);
      toast.success(t("ҚМЖ дайын!", "КСП готов!", "Plan ready!"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `QMJ_${form.topic || "sabaq"}.md`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      {/* FORM */}
      <div className="space-y-5">
        {/* 1. Topic & class */}
        <div className="glass rounded-2xl p-5">
          <StepHeader n={1} title={t("Тақырып пен сынып", "Тема и класс", "Topic & class")} tone="bg-rose-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">{t("Пән", "Предмет", "Subject")} <span className="text-rose-500">*</span></Label>
              <Select value={form.subject} onValueChange={(v) => set("subject", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("Математика, Физика...", "Математика, Физика...", "Math, Physics...")} /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Сынып", "Класс", "Grade")} <span className="text-rose-500">*</span></Label>
              <Select value={form.grade} onValueChange={(v) => set("grade", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="8" /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Бөлім", "Раздел", "Section")} <span className="text-muted-foreground">({t("қалауы бойынша", "по желанию", "optional")})</span></Label>
              <Input className="mt-1" value={form.section} onChange={(e) => set("section", e.target.value)} placeholder="" />
            </div>
            <div>
              <Label className="text-xs">{t("Тіл", "Язык", "Language")}</Label>
              <Select value={form.language} onValueChange={(v) => set("language", v as KmjInput["language"])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kk">Қазақша</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs">{t("Сабақ тақырыбы", "Тема урока", "Lesson topic")} <span className="text-rose-500">*</span></Label>
            <Input className="mt-1" value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder={t("Квадрат теңдеулер", "Квадратные уравнения", "Quadratic equations")} />
          </div>
        </div>

        {/* 2. Learning goals */}
        <div className="glass rounded-2xl p-5">
          <StepHeader n={2} title={t("Оқу мақсаты", "Учебная цель", "Learning goal")} tone="bg-emerald-500" />
          <div className="space-y-3">
            <div>
              <Label className="text-xs flex items-center gap-1.5"><Target className="h-3 w-3" /> {t("Оқыту мақсаты", "Цель обучения", "Learning objective")} <span className="text-rose-500">*</span></Label>
              <Input className="mt-1" value={form.learningObjective} onChange={(e) => set("learningObjective", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {t("Сабақ мақсаттары", "Цели урока", "Lesson goals")} <span className="text-rose-500">*</span></Label>
              <Textarea className="mt-1" rows={4} value={form.lessonGoals} onChange={(e) => set("lessonGoals", e.target.value)} placeholder={t("Әр мақсатты жаңа жолға жазыңыз", "Каждую цель с новой строки", "One goal per line")} />
            </div>
          </div>
        </div>

        {/* 3. Parameters */}
        <div className="glass rounded-2xl p-5">
          <StepHeader n={3} title={t("Параметрлер", "Параметры", "Parameters")} tone="bg-amber-500" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs flex items-center gap-1.5"><Layers className="h-3 w-3" /> {t("Сабақ түрі", "Тип урока", "Lesson type")}</Label>
              <Select value={form.lessonType} onValueChange={(v) => set("lessonType", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Аралас">{t("Аралас", "Смешанный", "Mixed")}</SelectItem>
                  <SelectItem value="Теория">{t("Теория", "Теория", "Theory")}</SelectItem>
                  <SelectItem value="Тәжірибе">{t("Тәжірибе", "Практика", "Practice")}</SelectItem>
                  <SelectItem value="Бекіту">{t("Бекіту", "Закрепление", "Review")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><Clock className="h-3 w-3" /> {t("Ұзақтығы", "Длительность", "Duration")}</Label>
              <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["35 мин", "40 мин", "45 мин", "80 мин (қос сабақ)"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Деңгей", "Уровень", "Level")}</Label>
              <Select value={form.level} onValueChange={(v) => set("level", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Аралас">{t("Аралас", "Смешанный", "Mixed")}</SelectItem>
                  <SelectItem value="Жеңіл">{t("Жеңіл", "Лёгкий", "Easy")}</SelectItem>
                  <SelectItem value="Орташа">{t("Орташа", "Средний", "Medium")}</SelectItem>
                  <SelectItem value="Күрделі">{t("Күрделі", "Сложный", "Hard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><Monitor className="h-3 w-3" /> ИКТ</Label>
              <Select value={form.ict} onValueChange={(v) => set("ict", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Иә">{t("Иә", "Да", "Yes")}</SelectItem>
                  <SelectItem value="Жоқ">{t("Жоқ", "Нет", "No")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs mb-1.5 block">{t("Бағдар", "Ориентация", "Orientation")}</Label>
              <div className="flex gap-2">
                <button onClick={() => set("orientation", "portrait")} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${form.orientation === "portrait" ? "border-primary bg-primary text-white" : "border-border"}`}>{t("Кітаптық", "Книжная", "Portrait")}</button>
                <button onClick={() => set("orientation", "landscape")} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${form.orientation === "landscape" ? "border-primary bg-primary text-white" : "border-border"}`}>{t("Альбомдық", "Альбомная", "Landscape")}</button>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
              <Checkbox id="img" checked={form.withImages} onCheckedChange={(v) => set("withImages", Boolean(v))} className="mt-0.5" />
              <Label htmlFor="img" className="cursor-pointer text-xs leading-relaxed">
                <span className="flex items-center gap-1.5 font-semibold"><ImageIcon className="h-3 w-3" /> {t("Суреттермен жасап шығару", "Сгенерировать с картинками", "Generate with images")}</span>
                <span className="mt-0.5 block text-muted-foreground">{t("Жасанды интеллект сабаққа сәйкес визуалдар таңдап, кезеңдеріне қояды.", "ИИ подберёт изображения по теме.", "AI picks lesson images.")}</span>
              </Label>
            </div>
          </div>
        </div>

        {/* 4. Extras */}
        <div className="glass rounded-2xl p-5">
          <StepHeader n={4} title={t("Файлдар мен тілектер", "Файлы и пожелания", "Files & notes")} tone="bg-blue-500" />
          <Label className="text-xs flex items-center gap-1.5"><Paperclip className="h-3 w-3" /> {t("Қосымша тілектер", "Пожелания", "Notes")}</Label>
          <Textarea className="mt-1" rows={3} value={form.extraNotes} onChange={(e) => set("extraNotes", e.target.value)} placeholder={t("Көбірек топтық жұмыс, практикалық тапсырмалар...", "Больше группового и практики...", "More group work, practice...")} />
        </div>

        <Button onClick={submit} disabled={loading || !required} className="w-full gradient-emerald py-6 text-base font-semibold shadow-lg shadow-primary/30">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          {loading ? t("Дайындалуда...", "Создание...", "Generating...") : t("ҚМЖ құру", "Создать КСП", "Create plan")}
        </Button>
      </div>

      {/* RESULT */}
      <div className="space-y-5">
        <div className="glass sticky top-20 rounded-2xl p-6 min-h-[400px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold"><FileText className="h-4 w-4 text-primary" /> {t("Дайын ҚМЖ", "Готовый КСП", "Generated plan")}</h3>
            {result && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copy} className="gap-1.5">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {t("Көшіру", "Копир.", "Copy")}</Button>
                <Button size="sm" variant="outline" onClick={download} className="gap-1.5"><Download className="h-3.5 w-3.5" /> .md</Button>
              </div>
            )}
          </div>
          {!result && !loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">{t("Форманы толтырып, «ҚМЖ құру» батырмасын басыңыз.", "Заполните форму и нажмите кнопку.", "Fill the form and click generate.")}</p>
            </div>
          )}
          {loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm">{t("AI ҚМЖ-ны дайындап жатыр...", "ИИ создаёт план...", "AI is generating...")}</p>
            </div>
          )}
          {result && (
            <motion.pre
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-border/60 bg-card/40 p-4 text-sm leading-relaxed font-sans"
            >{result}</motion.pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiKmj() {
  const t = useT();
  const [section, setSection] = useState<Section>("kmj");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="gradient-emerald flex h-11 w-11 items-center justify-center rounded-xl shadow-lg shadow-primary/30">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("AI ҚМЖ және БЖБ-ТЖБ", "AI КСП и СОР-СОЧ", "AI Plans & Assessments")}</h1>
          <p className="text-sm text-muted-foreground">{t("Бір клик ішінде сабақ жоспары мен бағалау тапсырмалары", "План урока и оценивание в один клик", "Lesson plans & assessments in one click")}</p>
        </div>
      </div>

      <Tabs value={section} onValueChange={(v) => setSection(v as Section)}>
        <TabsList className="glass w-full rounded-xl p-1">
          <TabsTrigger value="kmj" className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" /> {t("ҚМЖ жасау", "Создать КСП", "Create plan")}
          </TabsTrigger>
          <TabsTrigger value="bzhb" className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
            <Settings2 className="mr-2 h-4 w-4" /> {t("БЖБ жасау", "Создать СОР", "Create FA")}
          </TabsTrigger>
          <TabsTrigger value="tzhb" className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
            <Target className="mr-2 h-4 w-4" /> {t("ТЖБ жасау", "Создать СОЧ", "Create SA")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {section === "kmj" && <KmjCreator />}
      {section === "bzhb" && (
        <div className="glass flex flex-col items-center justify-center rounded-2xl py-20 text-center">
          <Settings2 className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{t("Жуырда қосылады", "Скоро будет добавлено", "Coming soon")}</p>
        </div>
      )}
      {section === "tzhb" && (
        <div className="glass flex flex-col items-center justify-center rounded-2xl py-20 text-center">
          <Target className="mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{t("Жуырда қосылады", "Скоро будет добавлено", "Coming soon")}</p>
        </div>
      )}
    </div>
  );
}
