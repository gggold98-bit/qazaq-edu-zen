import { useState } from "react";
import { FileText, Presentation, ClipboardList, Lock, Download, Coins, MapPin, FolderOpen, UserCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

type SectionKey = "aqmola" | "documents" | "pedagog";

export function Methodology() {
  const t = useT();
  const [section, setSection] = useState<SectionKey>("aqmola");
  const { unlockedItems, unlockItem, spendPoints, points } = useAppStore();

  const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "aqmola",    label: t("Ақмола облысы", "Акмолинская область", "Akmola region"),     icon: MapPin },
    { key: "documents", label: t("Дайын құжаттар", "Готовые документы", "Ready documents"),   icon: FolderOpen },
    { key: "pedagog",   label: t("Педагог құжаттары", "Педагогические документы", "Pedagogical documents"), icon: UserCircle },
  ];

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

  const DOCS_TABS = [
    { value: "all",            label: t("Барлығы",        "Все",          "All"),    icon: FileText },
    { value: "ҚМЖ",            label: t("ҚМЖ",            "КСП",          "Short plans"), icon: FileText },
    { value: "Тесттер",        label: t("Тесттер",        "Тесты",        "Tests"),  icon: ClipboardList },
    { value: "Презентациялар", label: t("Презентациялар", "Презентации",  "Slides"), icon: Presentation },
  ];

  const [docTab, setDocTab] = useState("all");
  const filtered = docTab === "all" ? ITEMS : ITEMS.filter((i) => i.type === docTab);

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

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
      <Clock className="mb-4 h-12 w-12 text-muted-foreground/60" />
      <h3 className="text-lg font-semibold text-muted-foreground">{t("Ақпарат жуырда пайда болады", "Информация скоро появится", "Information coming soon")}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">{t("Бұл бөлімде жаңа материалдар жуырда қосылады. Қайта келіп көріңіз!", "Новые материалы скоро будут добавлены в этот раздел. Заходите позже!", "New materials will be added to this section soon. Check back later!")}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("Әдістемелік кабинет", "Методический кабинет", "Methodology cabinet")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("Сабаққа дайын материалдар жинағы", "Готовые материалы для уроков", "Ready-to-use lesson materials")}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 px-6 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("Қолданыстағы ұпай", "Доступно баллов", "Available points")}</p>
            <p className="text-xl font-bold text-primary">{points} {t("ұпай", "баллов", "points")}</p>
          </div>
          <div className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
            {t("Қорғалған", "Защищено", "Protected")}
          </div>
        </div>
      </div>

      {/* Main section tabs */}
      <Tabs value={section} onValueChange={(v) => setSection(v as SectionKey)}>
        <TabsList className="glass w-full rounded-xl p-1">
          {SECTIONS.map((sec) => (
            <TabsTrigger key={sec.key} value={sec.key} className="flex-1 rounded-lg data-[state=active]:gradient-emerald data-[state=active]:text-white">
              <sec.icon className="mr-2 h-4 w-4" />
              {sec.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {section === "aqmola" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="font-medium">{t("Ақмола облысының әдістемелік кабинеті", "Методический кабинет Акмолинской области", "Akmola region methodology cabinet")}</span>
          </div>
          {renderPlaceholder()}
        </div>
      )}

      {section === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span className="font-medium">{t("Дайын құжаттар — КТЖ, ҚМЖ, презентациялар, жұмыс дәптерлері", "Готовые документы — КТП, КСП, презентации, рабочие тетради", "Ready documents — long/short plans, presentations, workbooks")}</span>
          </div>
          {renderPlaceholder()}
        </div>
      )}

      {section === "pedagog" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
            <UserCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{t("Педагог құжаттары", "Педагогические документы", "Pedagogical documents")}</span>
          </div>
          {renderPlaceholder()}
        </div>
      )}
    </div>
  );
}
