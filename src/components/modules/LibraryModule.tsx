import { useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";

const COVERS = ["from-emerald-400 to-emerald-600","from-blue-400 to-indigo-600","from-amber-400 to-orange-600","from-rose-400 to-pink-600","from-violet-400 to-fuchsia-600"];

export function LibraryModule() {
  const t = useT();

  const BOOKS = [
    { id: 1,  title: t("Әліппе", "Букварь", "ABC Primer"),                 subj: t("Қазақ тілі", "Казахский язык", "Kazakh"), cycle: "primary", grade: 1 },
    { id: 2,  title: t("Математика 3", "Математика 3", "Mathematics 3"),   subj: t("Математика", "Математика", "Mathematics"), cycle: "primary", grade: 3 },
    { id: 3,  title: t("Дүниетану 4", "Познание мира 4", "World Studies 4"), subj: t("Дүниетану", "Познание мира", "World studies"), cycle: "primary", grade: 4 },
    { id: 4,  title: t("Қазақ әдебиеті 6", "Казахская литература 6", "Kazakh Literature 6"), subj: t("Әдебиет", "Литература", "Literature"), cycle: "middle", grade: 6 },
    { id: 5,  title: t("Физика 7", "Физика 7", "Physics 7"),               subj: t("Физика", "Физика", "Physics"), cycle: "middle", grade: 7 },
    { id: 6,  title: t("Биология 8", "Биология 8", "Biology 8"),           subj: t("Биология", "Биология", "Biology"), cycle: "middle", grade: 8 },
    { id: 7,  title: t("Тарих 9", "История 9", "History 9"),               subj: t("Тарих", "История", "History"), cycle: "middle", grade: 9 },
    { id: 8,  title: t("Информатика 10", "Информатика 10", "Computer Science 10"), subj: t("Информатика", "Информатика", "Computer Science"), cycle: "high", grade: 10 },
    { id: 9,  title: t("Химия 11", "Химия 11", "Chemistry 11"),            subj: t("Химия", "Химия", "Chemistry"), cycle: "high", grade: 11 },
    { id: 10, title: t("Ағылшын тілі 11", "Английский язык 11", "English 11"), subj: t("Тілдер", "Языки", "Languages"), cycle: "high", grade: 11 },
  ];

  const TABS = [
    { v: "all",     l: t("Барлығы",         "Все",            "All") },
    { v: "primary", l: t("Бастауыш (1–4)",  "Начальная (1–4)", "Primary (1–4)") },
    { v: "middle",  l: t("Орта (5–9)",      "Средняя (5–9)",   "Middle (5–9)") },
    { v: "high",    l: t("Жоғары (10–11)",  "Старшая (10–11)", "High (10–11)") },
  ];

  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const items = useMemo(
    () => BOOKS.filter((b) => (tab === "all" || b.cycle === tab) && (b.title + b.subj).toLowerCase().includes(q.toLowerCase())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, q, BOOKS.length],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("AI Кітапхана", "AI Библиотека", "AI Library")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("Цифрлық оқулықтар каталогы", "Каталог цифровых учебников", "Digital textbook catalog")}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("Оқулық немесе пәнді іздеу...", "Поиск учебника или предмета...", "Search a textbook or subject...")} value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-10" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="glass">
            {TABS.map((tb) => <TabsTrigger key={tb.v} value={tb.v} className="data-[state=active]:gradient-emerald data-[state=active]:text-white">{tb.l}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((b, i) => (
          <div key={b.id} className="glass group cursor-pointer overflow-hidden rounded-2xl p-4 transition-transform hover:-translate-y-1">
            <div className={`relative mb-4 flex aspect-[3/4] items-end overflow-hidden rounded-xl bg-gradient-to-br ${COVERS[i % COVERS.length]} p-4 shadow-lg`}>
              <BookOpen className="absolute right-3 top-3 h-5 w-5 text-white/70" />
              <div className="text-white">
                <div className="text-xs opacity-80">{b.subj}</div>
                <div className="text-lg font-semibold leading-tight">{b.title}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{b.grade}-{t("сынып", "класс", "grade")}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">PDF</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-12">{t("Ештеңе табылмады", "Ничего не найдено", "Nothing found")}</div>}
      </div>
    </div>
  );
}
