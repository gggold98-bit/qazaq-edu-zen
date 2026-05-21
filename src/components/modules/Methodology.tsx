import { useState } from "react";
import { FileText, Presentation, ClipboardList, Lock, Download, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export function Methodology() {
  const t = useT();
  const ITEMS = [
    { id: "qmj-1", type: "ҚМЖ",            typeLabel: t("ҚМЖ", "КСП", "Short plan"),            title: t("Математика 5-сынып ҚМЖ жинағы", "Сборник КСП по математике, 5 класс", "Math grade 5 short-plan set"), size: "2.4 MB", cost: 0 },
    { id: "qmj-2", type: "ҚМЖ",            typeLabel: t("ҚМЖ", "КСП", "Short plan"),            title: t("Қазақ тілі 7-сынып, II тоқсан", "Казахский язык 7 класс, II четверть", "Kazakh language grade 7, term II"), size: "1.8 MB", cost: 50 },
    { id: "qmj-3", type: "ҚМЖ",            typeLabel: t("ҚМЖ", "КСП", "Short plan"),            title: t("Биология 9-сынып толық ҚМЖ", "Биология 9 класс — полный КСП", "Biology grade 9 full short-plan"),     size: "3.1 MB", cost: 120 },
    { id: "test-1", type: "Тесттер",       typeLabel: t("Тесттер", "Тесты", "Tests"),           title: t("ҰБТ дайындық тесттері (Тарих)", "Тесты подготовки к ЕНТ (История)", "UNT prep tests (History)"),         size: "900 KB", cost: 80 },
    { id: "test-2", type: "Тесттер",       typeLabel: t("Тесттер", "Тесты", "Tests"),           title: t("Физика 10-сынып БЖБ/ТЖБ", "Физика 10 класс СОР/СОЧ", "Physics grade 10 quizzes/exams"),             size: "1.2 MB", cost: 60 },
    { id: "test-3", type: "Тесттер",       typeLabel: t("Тесттер", "Тесты", "Tests"),           title: t("Ағылшын тілі, А2 деңгейі", "Английский язык, уровень A2", "English, A2 level"),                       size: "750 KB", cost: 0 },
    { id: "pres-1", type: "Презентациялар", typeLabel: t("Презентациялар", "Презентации", "Slides"), title: t("Заманауи педагогика негіздері", "Основы современной педагогики", "Foundations of modern pedagogy"), size: "5.6 MB", cost: 100 },
    { id: "pres-2", type: "Презентациялар", typeLabel: t("Презентациялар", "Презентации", "Slides"), title: t("STEM сабақтары — практикум", "Уроки STEM — практикум", "STEM lessons — workshop"),                size: "8.2 MB", cost: 150 },
    { id: "pres-3", type: "Презентациялар", typeLabel: t("Презентациялар", "Презентации", "Slides"), title: t("Цифрлық құралдар шолуы", "Обзор цифровых инструментов", "Digital tools overview"),                size: "4.4 MB", cost: 0 },
  ];

  const TABS = [
    { value: "all",            label: t("Барлығы",        "Все",          "All"),    icon: FileText },
    { value: "ҚМЖ",            label: t("ҚМЖ",            "КСП",          "Short plans"), icon: FileText },
    { value: "Тесттер",        label: t("Тесттер",        "Тесты",        "Tests"),  icon: ClipboardList },
    { value: "Презентациялар", label: t("Презентациялар", "Презентации",  "Slides"), icon: Presentation },
  ];

  const [tab, setTab] = useState("all");
  const { unlockedItems, unlockItem, spendPoints, points } = useAppStore();
  const filtered = tab === "all" ? ITEMS : ITEMS.filter((i) => i.type === tab);

  const handleUnlock = async (it: (typeof ITEMS)[number]) => {
    if (unlockedItems.includes(it.id) || it.cost === 0) {
      toast.success(t(`«${it.title}» жүктелуде...`, `«${it.title}» загружается...`, `"${it.title}" downloading...`));
      return;
    }
    const ok = await spendPoints(it.cost);
    if (!ok) {
      toast.error(t("Ұпай жеткіліксіз", "Недостаточно баллов", "Not enough points"));
      return;
    }
    await unlockItem(it.id);
    toast.success(t(`Ашылды! −${it.cost} ұпай`, `Открыто! −${it.cost} баллов`, `Unlocked! −${it.cost} points`));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("Әдістемелік кабинет", "Методический кабинет", "Methodology cabinet")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("Сабаққа дайын материалдар жинағы", "Готовые материалы для уроков", "Ready-to-use lesson materials")}</p>
        </div>
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-semibold">{points} {t("ұпай", "баллов", "points")}</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass rounded-xl p-1">
          {TABS.map((tb) => (
            <TabsTrigger key={tb.value} value={tb.value} className="rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
              <tb.icon className="mr-2 h-4 w-4" />
              {tb.label}
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
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">{it.typeLabel}</span>
                {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="line-clamp-2 text-base font-semibold">{it.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{it.size}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  {it.cost === 0 ? (
                    <span className="font-medium text-primary">{t("Тегін", "Бесплатно", "Free")}</span>
                  ) : unlocked ? (
                    <span className="text-primary">✓ {t("Ашылды", "Открыто", "Unlocked")}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground"><Coins className="h-3.5 w-3.5" />{it.cost} {t("ұпай", "баллов", "pts")}</span>
                  )}
                </div>
                <Button size="sm" variant={unlocked ? "default" : "outline"} onClick={() => handleUnlock(it)} className={unlocked ? "gradient-emerald gap-1.5" : "gap-1.5"}>
                  {unlocked ? <Download className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {unlocked ? t("Жүктеу", "Скачать", "Download") : t("Ашу", "Открыть", "Unlock")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
