import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Newspaper } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function Dashboard() {
  const { user } = useAppStore();
  const t = useT();

  const news = [
    {
      date: t("10 мам", "10 мая", "May 10"),
      title: t(
        "ҚР БҒМ: Жаңа оқу жылына дайындық басталды",
        "МОН РК: Стартовала подготовка к новому учебному году",
        "MES RK: Preparation for the new school year has begun",
      ),
      source: t("Білім.kz", "Bilim.kz", "Bilim.kz"),
    },
    {
      date: t("8 мам", "8 мая", "May 8"),
      title: t(
        "Педагогтерге арналған AI құралдары: жаңа тренд",
        "AI-инструменты для педагогов: новый тренд",
        "AI tools for teachers: a new trend",
      ),
      source: t("EdTech KZ", "EdTech KZ", "EdTech KZ"),
    },
    {
      date: t("3 мам", "3 мая", "May 3"),
      title: t(
        "Ұстаздарға арналған республикалық байқау жарияланды",
        "Объявлен республиканский конкурс для учителей",
        "Republican contest for teachers announced",
      ),
      source: t("Ustaz.kz", "Ustaz.kz", "Ustaz.kz"),
    },
  ];

  const events = [
    { date: t("12 мау", "12 июн", "Jun 12"), title: t("Вебинар: Цифрлық сауаттылық", "Вебинар: Цифровая грамотность", "Webinar: Digital Literacy"), tag: t("Вебинар", "Вебинар", "Webinar") },
    { date: t("20 мау", "20 июн", "Jun 20"), title: t("Сертификаттау емтиханы", "Сертификационный экзамен", "Certification exam"), tag: t("Емтихан", "Экзамен", "Exam") },
    { date: t("28 мау", "28 июн", "Jun 28"), title: t("Әдістемелік семинар", "Методический семинар", "Methodology seminar"), tag: t("Семинар", "Семинар", "Seminar") },
  ];

  const monthShort = (s: string) => s.split(" ")[1];
  const dayShort = (s: string) => s.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-10">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="text-sm font-medium text-primary">{t("Қош келдіңіз", "Добро пожаловать", "Welcome")}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {user?.fullName} <span className="text-gradient">{t("мұғалім", "учитель", "teacher")}</span>
          </h1>
        </div>
      </div>

      {/* News + Calendar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("Жаңалықтар", "Новости", "News")}</h3>
          </div>
          <div className="space-y-3">
            {news.map((n) => (
              <div key={n.title} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="gradient-emerald flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-white">
                  <div className="text-[10px] uppercase tracking-wide opacity-80">{monthShort(n.date)}</div>
                  <div className="text-sm font-bold leading-none">{dayShort(n.date)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium leading-snug">{n.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{n.source}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("Күнтізбе", "Календарь", "Calendar")}</h3>
          </div>
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.title} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 p-4">
                <div className="gradient-emerald flex h-14 w-14 flex-col items-center justify-center rounded-xl text-white">
                  <div className="text-[10px] uppercase tracking-wide opacity-80">{monthShort(e.date)}</div>
                  <div className="text-lg font-bold leading-none">{dayShort(e.date)}</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.tag} · {t("онлайн", "онлайн", "online")}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function AstanaClock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Almaty",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return <span>{now}</span>;
}
