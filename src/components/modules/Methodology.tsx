import { useState } from "react";
import { MapPin, FolderOpen, UserCircle, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n";

type SectionKey = "aqmola" | "documents" | "pedagog";

export function Methodology() {
  const t = useT();
  const [section, setSection] = useState<SectionKey>("aqmola");

  const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "aqmola",    label: t("Ақмола облысы", "Акмолинская область", "Akmola region"),     icon: MapPin },
    { key: "documents", label: t("Дайын құжаттар", "Готовые документы", "Ready documents"),   icon: FolderOpen },
    { key: "pedagog",   label: t("Педагог құжаттары", "Педагогические документы", "Pedagogical documents"), icon: UserCircle },
  ];

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
      <Clock className="mb-4 h-12 w-12 text-muted-foreground/60" />
      <h3 className="text-lg font-semibold text-muted-foreground">{t("Ақпарат жуырда пайда болады", "Информация скоро появится", "Information coming soon")}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">{t("Бұл бөлімде жаңа материалдар жуырда қосылады. Қайта келіп көріңіз!", "Новые материалы скоро будут добавлены в этот раздел. Заходите позже!", "New materials will be added to this section soon. Check back later!")}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("Әдістемелік кабинет", "Методический кабинет", "Methodology cabinet")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("Сабаққа дайын материалдар жинағы", "Готовые материалы для уроков", "Ready-to-use lesson materials")}</p>
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
