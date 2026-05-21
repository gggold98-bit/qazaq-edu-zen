import { useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BOOKS = [
  { id: 1, title: "Әліппе", subj: "Қазақ тілі", cycle: "primary", grade: 1 },
  { id: 2, title: "Математика 3", subj: "Математика", cycle: "primary", grade: 3 },
  { id: 3, title: "Дүниетану 4", subj: "Дүниетану", cycle: "primary", grade: 4 },
  { id: 4, title: "Қазақ әдебиеті 6", subj: "Әдебиет", cycle: "middle", grade: 6 },
  { id: 5, title: "Физика 7", subj: "Физика", cycle: "middle", grade: 7 },
  { id: 6, title: "Биология 8", subj: "Биология", cycle: "middle", grade: 8 },
  { id: 7, title: "Тарих 9", subj: "Тарих", cycle: "middle", grade: 9 },
  { id: 8, title: "Информатика 10", subj: "Информатика", cycle: "high", grade: 10 },
  { id: 9, title: "Химия 11", subj: "Химия", cycle: "high", grade: 11 },
  { id: 10, title: "Ағылшын тілі 11", subj: "Тілдер", cycle: "high", grade: 11 },
];

const TABS = [
  { v: "all", l: "Барлығы" },
  { v: "primary", l: "Бастауыш (1–4)" },
  { v: "middle", l: "Орта (5–9)" },
  { v: "high", l: "Жоғары (10–11)" },
];

const COVERS = ["from-emerald-400 to-emerald-600","from-blue-400 to-indigo-600","from-amber-400 to-orange-600","from-rose-400 to-pink-600","from-violet-400 to-fuchsia-600"];

export function LibraryModule() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const items = useMemo(
    () => BOOKS.filter((b) => (tab === "all" || b.cycle === tab) && (b.title + b.subj).toLowerCase().includes(q.toLowerCase())),
    [tab, q],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Кітапхана</h1>
        <p className="mt-1 text-sm text-muted-foreground">Цифрлық оқулықтар каталогы</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Оқулық немесе пәнді іздеу..." value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-10" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="glass">
            {TABS.map((t) => <TabsTrigger key={t.v} value={t.v} className="data-[state=active]:gradient-emerald data-[state=active]:text-white">{t.l}</TabsTrigger>)}
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
              <span className="text-xs text-muted-foreground">{b.grade}-сынып</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">PDF</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-sm text-muted-foreground py-12">Ештеңе табылмады</div>}
      </div>
    </div>
  );
}
