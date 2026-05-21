import { useState } from "react";
import { FileText, Presentation, ClipboardList, Lock, Download, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

const ITEMS = [
  { id: "qmj-1", type: "ҚМЖ", title: "Математика 5-сынып ҚМЖ жинағы", size: "2.4 MB", cost: 0 },
  { id: "qmj-2", type: "ҚМЖ", title: "Қазақ тілі 7-сынып, II тоқсан", size: "1.8 MB", cost: 50 },
  { id: "qmj-3", type: "ҚМЖ", title: "Биология 9-сынып толық ҚМЖ", size: "3.1 MB", cost: 120 },
  { id: "test-1", type: "Тесттер", title: "ҰБТ дайындық тесттері (Тарих)", size: "900 KB", cost: 80 },
  { id: "test-2", type: "Тесттер", title: "Физика 10-сынып БЖБ/ТЖБ", size: "1.2 MB", cost: 60 },
  { id: "test-3", type: "Тесттер", title: "Ағылшын тілі, А2 деңгейі", size: "750 KB", cost: 0 },
  { id: "pres-1", type: "Презентациялар", title: "Заманауи педагогика негіздері", size: "5.6 MB", cost: 100 },
  { id: "pres-2", type: "Презентациялар", title: "STEM сабақтары — практикум", size: "8.2 MB", cost: 150 },
  { id: "pres-3", type: "Презентациялар", title: "Цифрлық құралдар шолуы", size: "4.4 MB", cost: 0 },
];

const TABS = [
  { value: "all", label: "Барлығы", icon: FileText },
  { value: "ҚМЖ", label: "ҚМЖ", icon: FileText },
  { value: "Тесттер", label: "Тесттер", icon: ClipboardList },
  { value: "Презентациялар", label: "Презентациялар", icon: Presentation },
];

export function Methodology() {
  const [tab, setTab] = useState("all");
  const { unlockedItems, unlockItem, spendPoints, points } = useAppStore();
  const filtered = tab === "all" ? ITEMS : ITEMS.filter((i) => i.type === tab);

  const handleUnlock = async (it: (typeof ITEMS)[number]) => {
    if (unlockedItems.includes(it.id) || it.cost === 0) {
      toast.success(`«${it.title}» жүктелуде...`);
      return;
    }
    const ok = await spendPoints(it.cost);
    if (!ok) {
      toast.error("Ұпай жеткіліксіз");
      return;
    }
    await unlockItem(it.id);
    toast.success(`Ашылды! −${it.cost} ұпай`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Әдістемелік кабинет</h1>
          <p className="mt-1 text-sm text-muted-foreground">Сабаққа дайын материалдар жинағы</p>
        </div>
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-semibold">{points} ұпай</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass rounded-xl p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
              <t.icon className="mr-2 h-4 w-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => {
          const unlocked = unlockedItems.includes(it.id) || it.cost === 0;
          return (
            <div key={it.id} className="glass group relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1">
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">{it.type}</span>
                {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="line-clamp-2 text-base font-semibold">{it.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{it.size}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  {it.cost === 0 ? (
                    <span className="font-medium text-primary">Тегін</span>
                  ) : unlocked ? (
                    <span className="text-primary">✓ Ашылды</span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground"><Coins className="h-3.5 w-3.5" />{it.cost} ұпай</span>
                  )}
                </div>
                <Button size="sm" variant={unlocked ? "default" : "outline"} onClick={() => handleUnlock(it)} className={unlocked ? "gradient-emerald gap-1.5" : "gap-1.5"}>
                  {unlocked ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {unlocked ? "Жүктеу" : "Ашу"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
