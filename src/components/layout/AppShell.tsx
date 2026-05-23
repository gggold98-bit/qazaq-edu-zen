import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Scale,
  BookOpen,
  PenTool,
  Library,
  GraduationCap,
  CreditCard,
  LogOut,
  Coins,
  Moon,
  Sun,
  Menu,
  X,
  FileText,
  Trophy,
  HelpCircle,
  Clock,
} from "lucide-react";
import { useAppStore, type TabKey } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dashboard, AstanaClock } from "@/components/modules/Dashboard";
import { AdiletAI } from "@/components/modules/AdiletAI";
import { Methodology } from "@/components/modules/Methodology";
import { Whiteboard } from "@/components/modules/Whiteboard";
import { LibraryModule } from "@/components/modules/LibraryModule";
import { ComingSoon } from "@/components/modules/ComingSoon";
import { Subscriptions } from "@/components/modules/Subscriptions";
import { AIOlympiad } from "@/components/modules/AIOlympiad";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function AppShell() {
  const {
    user, logout, activeTab, setActiveTab, points, theme, toggleTheme,
    lang, setLang,
  } = useAppStore();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "dashboard",      label: t("Басты бет",                "Главная",                  "Home"),                 icon: LayoutDashboard },
    { key: "adilet",         label: t("Adilet AI",                "Adilet AI",                "Adilet AI"),            icon: Scale },
    { key: "ai-kmj-bzhb",    label: t("AI ҚМЖ және БЖБ-ТЖБ",      "AI КСП и СОР-СОЧ",         "AI Plans & Assessments"), icon: FileText },
    { key: "ai-olympiad",    label: t("AI Олимпиадаға дайындық",  "AI Подготовка к олимпиаде","AI Olympiad prep"),     icon: Trophy },
    { key: "courses-podcasts",label: t("Курстар және Подкасттар",  "Курсы и Подкасты",         "Courses & Podcasts"),   icon: GraduationCap },
    { key: "qaz-quiz",       label: t("Qaz Quiz",                 "Qaz Quiz",                 "Qaz Quiz"),             icon: HelpCircle },
    { key: "methodology",    label: t("Әдістемелік кабинет",      "Методический кабинет",     "Methodology cabinet"),  icon: BookOpen },
    { key: "whiteboard",     label: t("AI Интерактивті тақта",    "AI Интерактивная доска",   "AI Interactive board"), icon: PenTool },
    { key: "library",        label: t("AI Кітапхана",             "AI Библиотека",            "AI Library"),           icon: Library },
    { key: "subscriptions",  label: t("Жазылымдар",               "Подписки",                 "Subscriptions"),        icon: CreditCard },
  ];

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="glass-strong flex h-full flex-col border-r border-glass-border lg:rounded-none">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="gradient-emerald flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/30">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">Qazaq Teachers</div>
                <div className="text-[11px] text-muted-foreground">{t("AI экожүйе", "AI экосистема", "AI ecosystem")}</div>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {NAV.map((n) => {
              const active = activeTab === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => { setActiveTab(n.key); setMobileOpen(false); }}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 -z-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <n.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{n.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3">
            <Button variant="outline" onClick={logout} className="w-full justify-start gap-2 rounded-xl">
              <LogOut className="h-4 w-4" />
              {t("Шығу", "Выйти", "Sign out")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-glass-border px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="glass hidden items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold sm:flex">
              <Coins className="h-4 w-4 text-primary" />
              <span>{points.toLocaleString("kk-KZ")} {t("ұпай", "баллов", "points")}</span>
            </div>

            <div className="glass hidden items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold sm:flex" title={t("Астана уақыты", "Время Астаны", "Astana time")}>
              <Clock className="h-4 w-4 text-primary" />
              <AstanaClock />
            </div>

            <Select value={lang} onValueChange={(v) => setLang(v as "kk" | "ru" | "en")}>
              <SelectTrigger className="h-9 w-[80px] rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kk">KZ</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback className="gradient-emerald text-xs font-semibold text-white">
                {initials(user.fullName) || "QT"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "adilet" && <AdiletAI />}
              {activeTab === "ai-kmj-bzhb" && <ComingSoon title={t("AI ҚМЖ және БЖБ-ТЖБ", "AI КСП и СОР-СОЧ", "AI Plans & Assessments")} />}
              {activeTab === "ai-olympiad" && <AIOlympiad />}
              {activeTab === "courses-podcasts" && <ComingSoon title={t("Курстар және Подкасттар", "Курсы и Подкасты", "Courses & Podcasts")} />}
              {activeTab === "qaz-quiz" && <ComingSoon title={t("Qaz Quiz", "Qaz Quiz", "Qaz Quiz")} />}
              {activeTab === "methodology" && <Methodology />}
              {activeTab === "whiteboard" && <Whiteboard />}
              {activeTab === "library" && <LibraryModule />}
              {activeTab === "subscriptions" && <Subscriptions />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
