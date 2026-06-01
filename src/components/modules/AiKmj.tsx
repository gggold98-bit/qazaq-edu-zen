import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  FileText, BookOpen, Target, Settings2, Sparkles, Loader2, Download, FileCheck2, ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";
import {
  generateKmj, generateBzhb, generateTzhb,
  type KmjInput, type BzhbInput, type TzhbInput,
  type KmjStructured, type BzhbStructured, type TzhbStructured,
} from "@/lib/kmj.functions";
import { downloadKmjDocx, downloadBzhbDocx, downloadTzhbDocx } from "@/lib/docx-builder";
import { toast } from "sonner";

type Section = "kmj" | "bzhb" | "tzhb";

const SUBJECTS = [
  "Математика", "Алгебра", "Геометрия", "Физика", "Химия", "Биология", "География",
  "Информатика", "Қазақ тілі мен әдебиеті", "Орыс тілі мен әдебиеті",
  "Ағылшын тілі", "Қазақстан тарихы", "Дүниежүзі тарихы", "Құқық негіздері", "Жаратылыстану",
];
const GRADES = ["1","2","3","4","5","6","7","8","9","10","11"];
const TERMS = ["1","2","3","4"];

function StepHeader({ n, title, tone }: { n: number; title: string; tone: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${tone}`}>{n}</div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

// ============ KMJ ============
function KmjCreator() {
  const t = useT();
  const run = useServerFn(generateKmj);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KmjStructured | null>(null);

  const [form, setForm] = useState<KmjInput>({
    subject: "", grade: "", section: "", language: "kk",
    topic: "", learningObjective: "", lessonGoals: "",
    lessonType: "Аралас", duration: "45 мин", level: "Аралас", ict: "Иә",
    orientation: "portrait", withImages: false, extraNotes: "",
  });
  const set = <K extends keyof KmjInput>(k: K, v: KmjInput[K]) => setForm((p) => ({ ...p, [k]: v }));
  const required = form.subject && form.grade && form.topic && form.learningObjective && form.lessonGoals;

  const submit = async () => {
    if (!required) { toast.error(t("Барлық міндетті өрістерді толтырыңыз", "Заполните все поля", "Fill required")); return; }
    setLoading(true); setResult(null);
    try {
      const r = await run({ data: form });
      setResult(r.plan);
      toast.success(t("ҚМЖ дайын!", "КСП готов!", "Plan ready!"));
    } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const download = async () => {
    if (!result) return;
    await downloadKmjDocx(result, `QMJ_${form.subject}_${form.grade}_${form.topic}.docx`.replace(/\s+/g, "_"));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5">
          <StepHeader n={1} title={t("Тақырып пен сынып", "Тема и класс", "Topic & class")} tone="bg-rose-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">{t("Пән", "Предмет", "Subject")} *</Label>
              <Select value={form.subject} onValueChange={(v) => set("subject", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Сынып", "Класс", "Grade")} *</Label>
              <Select value={form.grade} onValueChange={(v) => set("grade", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="8" /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Бөлім", "Раздел", "Section")}</Label>
              <Input className="mt-1" value={form.section} onChange={(e) => set("section", e.target.value)} />
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
            <Label className="text-xs">{t("Сабақ тақырыбы", "Тема урока", "Topic")} *</Label>
            <Input className="mt-1" value={form.topic} onChange={(e) => set("topic", e.target.value)} />
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <StepHeader n={2} title={t("Оқу мақсаттары", "Учебные цели", "Goals")} tone="bg-emerald-500" />
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t("Оқыту мақсаты (код + сипаттама)", "Цель обучения", "Objective")} *</Label>
              <Textarea className="mt-1" rows={2} value={form.learningObjective} onChange={(e) => set("learningObjective", e.target.value)} placeholder="10.1.2.3 - ..." />
            </div>
            <div>
              <Label className="text-xs">{t("Сабақ мақсаттары", "Цели урока", "Lesson goals")} *</Label>
              <Textarea className="mt-1" rows={3} value={form.lessonGoals} onChange={(e) => set("lessonGoals", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <StepHeader n={3} title={t("Параметрлер", "Параметры", "Parameters")} tone="bg-amber-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">{t("Сабақ түрі", "Тип урока", "Type")}</Label>
              <Select value={form.lessonType} onValueChange={(v) => set("lessonType", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Аралас", "Теория", "Тәжірибе", "Бекіту"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Ұзақтығы", "Длительность", "Duration")}</Label>
              <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["35 мин", "40 мин", "45 мин", "80 мин"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs">{t("Қосымша тілектер", "Пожелания", "Notes")}</Label>
            <Textarea className="mt-1" rows={2} value={form.extraNotes} onChange={(e) => set("extraNotes", e.target.value)} />
          </div>
        </div>

        <Button onClick={submit} disabled={loading || !required} className="w-full gradient-emerald py-6 text-base font-semibold shadow-lg shadow-primary/30">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          {loading ? t("Дайындалуда...", "Создание...", "...") : t("ҚМЖ құру", "Создать", "Create")}
        </Button>
      </div>

      <div className="space-y-5">
        <div className="glass sticky top-20 rounded-2xl p-6 min-h-[400px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold"><FileText className="h-4 w-4 text-primary" /> {t("Дайын ҚМЖ", "Готовый КСП", "Result")}</h3>
            {result && (
              <Button size="sm" onClick={download} className="gap-1.5 gradient-emerald">
                <Download className="h-3.5 w-3.5" /> Word (.docx)
              </Button>
            )}
          </div>
          {!result && !loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">{t("Формаға деректерді енгізіп, «ҚМЖ құру» батырмасын басыңыз. Нәтиже №130 бұйрыққа сай Word файлы болып жүктеледі.", "Заполните форму. Результат — Word по приказу №130.", "Fill the form. Output: Word per Order #130.")}</p>
            </div>
          )}
          {loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm">{t("AI жасап жатыр...", "ИИ работает...", "AI generating...")}</p>
            </div>
          )}
          {result && <KmjPreview plan={result} />}
        </div>
      </div>
    </div>
  );
}

function KmjPreview({ plan }: { plan: KmjStructured }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-h-[70vh] overflow-auto space-y-3 text-sm">
      <h4 className="font-bold text-base">{plan.header.subject} • {plan.header.grade}-сынып</h4>
      <p className="text-muted-foreground">{plan.header.topic}</p>
      <div className="space-y-1">
        <p className="font-semibold">Оқу мақсаттары:</p>
        <ul className="list-disc pl-5">{plan.learningObjectives?.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Сабақ мақсаттары:</p>
        <ul className="list-disc pl-5">{plan.lessonObjectives?.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
      <p className="font-semibold mt-3">Сабақ кезеңдері:</p>
      {(["start", "middle", "end"] as const).map((k) => (
        <div key={k} className="rounded-lg border border-border/60 p-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{k}</p>
          {plan.stages?.[k]?.map((s, i) => (
            <div key={i} className="mt-1 text-xs">
              <span className="font-medium">{s.stage}</span> ({s.time})
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}

// ============ БЖБ ============
function BzhbCreator() {
  const t = useT();
  const run = useServerFn(generateBzhb);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BzhbStructured | null>(null);

  const [form, setForm] = useState<BzhbInput>({
    subject: "", grade: "", term: "1", section: "", language: "kk",
    learningObjectives: "", duration: "20 мин", totalPoints: "15", extraNotes: "",
  });
  const set = <K extends keyof BzhbInput>(k: K, v: BzhbInput[K]) => setForm((p) => ({ ...p, [k]: v }));
  const required = form.subject && form.grade && form.section && form.learningObjectives;

  const submit = async () => {
    if (!required) { toast.error(t("Барлық өрісті толтыр", "Заполните", "Fill")); return; }
    setLoading(true); setResult(null);
    try {
      const r = await run({ data: form });
      setResult(r.paper);
      toast.success(t("БЖБ дайын!", "СОР готов!", "Ready!"));
    } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const download = async () => {
    if (!result) return;
    await downloadBzhbDocx(result, `BJB_${form.subject}_${form.grade}_T${form.term}.docx`.replace(/\s+/g, "_"));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5">
          <StepHeader n={1} title={t("Бөлім туралы", "О разделе", "Section")} tone="bg-violet-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">{t("Пән", "Предмет", "Subject")} *</Label>
              <Select value={form.subject} onValueChange={(v) => set("subject", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Сынып", "Класс", "Grade")} *</Label>
              <Select value={form.grade} onValueChange={(v) => set("grade", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Тоқсан", "Четверть", "Term")} *</Label>
              <Select value={form.term} onValueChange={(v) => set("term", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TERMS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Тіл", "Язык", "Language")}</Label>
              <Select value={form.language} onValueChange={(v) => set("language", v as BzhbInput["language"])}>
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
            <Label className="text-xs">{t("Бөлім аты", "Название раздела", "Section name")} *</Label>
            <Input className="mt-1" value={form.section} onChange={(e) => set("section", e.target.value)} placeholder={t("Мысалы: «Кинематика»", "Например: «Кинематика»", "e.g. Kinematics")} />
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <StepHeader n={2} title={t("Оқу мақсаттары", "Цели", "Objectives")} tone="bg-emerald-500" />
          <Label className="text-xs">{t("Тексерілетін ОМ кодтары мен сипаттамасы", "Коды и описания ЦО", "Objective codes")} *</Label>
          <Textarea className="mt-1" rows={4} value={form.learningObjectives} onChange={(e) => set("learningObjectives", e.target.value)} placeholder={"10.1.1.1 — ...\n10.1.1.2 — ..."} />
        </div>

        <div className="glass rounded-2xl p-5">
          <StepHeader n={3} title={t("Параметрлер", "Параметры", "Params")} tone="bg-amber-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">{t("Ұзақтығы", "Длительность", "Duration")}</Label>
              <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["15 мин", "20 мин", "25 мин", "30 мин", "40 мин"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Жалпы балл", "Всего баллов", "Total points")}</Label>
              <Input className="mt-1" type="number" value={form.totalPoints} onChange={(e) => set("totalPoints", e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs">{t("Қосымша", "Доп.", "Notes")}</Label>
            <Textarea className="mt-1" rows={2} value={form.extraNotes} onChange={(e) => set("extraNotes", e.target.value)} />
          </div>
        </div>

        <Button onClick={submit} disabled={loading || !required} className="w-full gradient-emerald py-6 text-base font-semibold shadow-lg shadow-primary/30">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileCheck2 className="mr-2 h-5 w-5" />}
          {loading ? t("Дайындалуда...", "...", "...") : t("БЖБ құру", "Создать СОР", "Create FA")}
        </Button>
      </div>

      <div className="space-y-5">
        <div className="glass sticky top-20 rounded-2xl p-6 min-h-[400px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold"><FileCheck2 className="h-4 w-4 text-primary" /> {t("Дайын БЖБ", "Готовый СОР", "Result")}</h3>
            {result && <Button size="sm" onClick={download} className="gap-1.5 gradient-emerald"><Download className="h-3.5 w-3.5" /> Word</Button>}
          </div>
          {!result && !loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
              <FileCheck2 className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">{t("№130 бұйрыққа сай дайын БЖБ кестелі Word файлы.", "Готовый СОР в виде таблицы Word по приказу №130.", "FA table per Order #130.")}</p>
            </div>
          )}
          {loading && <div className="flex h-full min-h-[300px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
          {result && <AssessmentPreview tasks={result.tasks} totalPoints={result.header.totalPoints} />}
        </div>
      </div>
    </div>
  );
}

// ============ ТЖБ ============
function TzhbCreator() {
  const t = useT();
  const run = useServerFn(generateTzhb);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TzhbStructured | null>(null);

  const [form, setForm] = useState<TzhbInput>({
    subject: "", grade: "", term: "1", language: "kk",
    sections: "", learningObjectives: "",
    duration: "40 мин", totalPoints: "20", variants: "2", extraNotes: "",
  });
  const set = <K extends keyof TzhbInput>(k: K, v: TzhbInput[K]) => setForm((p) => ({ ...p, [k]: v }));
  const required = form.subject && form.grade && form.sections && form.learningObjectives;

  const submit = async () => {
    if (!required) { toast.error(t("Барлық өрісті толтыр", "Заполните", "Fill")); return; }
    setLoading(true); setResult(null);
    try {
      const r = await run({ data: form });
      setResult(r.paper);
      toast.success(t("ТЖБ дайын!", "СОЧ готов!", "Ready!"));
    } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const download = async () => {
    if (!result) return;
    await downloadTzhbDocx(result, `TJB_${form.subject}_${form.grade}_T${form.term}.docx`.replace(/\s+/g, "_"));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5">
          <StepHeader n={1} title={t("Тоқсан туралы", "О четверти", "Term info")} tone="bg-blue-500" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">{t("Пән", "Предмет", "Subject")} *</Label>
              <Select value={form.subject} onValueChange={(v) => set("subject", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Сынып", "Класс", "Grade")} *</Label>
              <Select value={form.grade} onValueChange={(v) => set("grade", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Тоқсан", "Четверть", "Term")} *</Label>
              <Select value={form.term} onValueChange={(v) => set("term", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TERMS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Тіл", "Язык", "Language")}</Label>
              <Select value={form.language} onValueChange={(v) => set("language", v as TzhbInput["language"])}>
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
            <Label className="text-xs">{t("Қамтылған бөлімдер", "Разделы", "Sections covered")} *</Label>
            <Textarea className="mt-1" rows={2} value={form.sections} onChange={(e) => set("sections", e.target.value)} placeholder={t("Кинематика, Динамика, ...", "Кинематика, ...", "Kinematics, ...")} />
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <StepHeader n={2} title={t("Оқу мақсаттары", "Цели", "Objectives")} tone="bg-emerald-500" />
          <Label className="text-xs">{t("Тексерілетін ОМ", "ЦО", "Objectives")} *</Label>
          <Textarea className="mt-1" rows={4} value={form.learningObjectives} onChange={(e) => set("learningObjectives", e.target.value)} placeholder={"10.1.1.1 — ..."} />
        </div>

        <div className="glass rounded-2xl p-5">
          <StepHeader n={3} title={t("Параметрлер", "Параметры", "Params")} tone="bg-amber-500" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">{t("Уақыты", "Время", "Duration")}</Label>
              <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["40 мин", "45 мин", "80 мин"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("Балл", "Баллы", "Points")}</Label>
              <Input className="mt-1" type="number" value={form.totalPoints} onChange={(e) => set("totalPoints", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t("Нұсқа саны", "Вариантов", "Variants")}</Label>
              <Select value={form.variants} onValueChange={(v) => set("variants", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{["1","2","3","4"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs">{t("Қосымша", "Доп.", "Notes")}</Label>
            <Textarea className="mt-1" rows={2} value={form.extraNotes} onChange={(e) => set("extraNotes", e.target.value)} />
          </div>
        </div>

        <Button onClick={submit} disabled={loading || !required} className="w-full gradient-emerald py-6 text-base font-semibold shadow-lg shadow-primary/30">
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ClipboardList className="mr-2 h-5 w-5" />}
          {loading ? t("Дайындалуда...", "...", "...") : t("ТЖБ құру", "Создать СОЧ", "Create SA")}
        </Button>
      </div>

      <div className="space-y-5">
        <div className="glass sticky top-20 rounded-2xl p-6 min-h-[400px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold"><ClipboardList className="h-4 w-4 text-primary" /> {t("Дайын ТЖБ", "Готовый СОЧ", "Result")}</h3>
            {result && <Button size="sm" onClick={download} className="gap-1.5 gradient-emerald"><Download className="h-3.5 w-3.5" /> Word</Button>}
          </div>
          {!result && !loading && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
              <ClipboardList className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">{t("№130 бұйрыққа сай дайын ТЖБ нұсқалары — кестелі Word файлы.", "Готовый СОЧ — таблица в Word по приказу №130.", "SA table per Order #130.")}</p>
            </div>
          )}
          {loading && <div className="flex h-full min-h-[300px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-h-[70vh] overflow-auto space-y-3 text-sm">
              {result.variants.map((v, i) => (
                <div key={i} className="rounded-lg border border-border/60 p-2">
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.tasks.length} тапсырма</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssessmentPreview({ tasks, totalPoints }: { tasks: { number: number; level: string; text: string; totalPoints: number }[]; totalPoints: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-h-[70vh] overflow-auto space-y-2 text-sm">
      <p className="text-xs text-muted-foreground">Жалпы балл: {totalPoints}</p>
      {tasks.map((t) => (
        <div key={t.number} className="rounded-lg border border-border/60 p-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">№{t.number} • {t.level}</span>
            <span className="font-bold text-primary">{t.totalPoints} б.</span>
          </div>
          <p className="mt-1 text-xs">{t.text}</p>
        </div>
      ))}
    </motion.div>
  );
}

// ============ EXPORT ============
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
          <p className="text-sm text-muted-foreground">{t("ҚР БҒМ №130 бұйрығына сәйкес кестелі Word нұсқасы", "По приказу №130 МОН РК — Word с таблицами", "Per MoE Order #130 — Word tables")}</p>
        </div>
      </div>

      <Tabs value={section} onValueChange={(v) => setSection(v as Section)}>
        <TabsList className="glass w-full rounded-xl p-1">
          <TabsTrigger value="kmj" className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" /> {t("ҚМЖ жасау", "Создать КСП", "Plan")}
          </TabsTrigger>
          <TabsTrigger value="bzhb" className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
            <FileCheck2 className="mr-2 h-4 w-4" /> {t("БЖБ жасау", "Создать СОР", "FA")}
          </TabsTrigger>
          <TabsTrigger value="tzhb" className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
            <ClipboardList className="mr-2 h-4 w-4" /> {t("ТЖБ жасау", "Создать СОЧ", "SA")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {section === "kmj" && <KmjCreator />}
      {section === "bzhb" && <BzhbCreator />}
      {section === "tzhb" && <TzhbCreator />}
    </div>
  );
}
