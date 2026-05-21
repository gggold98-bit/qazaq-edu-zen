import { motion } from "framer-motion";
import { Users, FileText, Coins, Award, Calendar, Search, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { user, students, lessonPlans, points, certificates, setActiveTab } = useAppStore();
  const t = useT();
  const stats = [
    { label: t("Бақылаудағы оқушылар", "Учеников под наблюдением", "Tracked students"), value: students, icon: Users, accent: "from-emerald-glow to-primary" },
    { label: t("Дайын сабақ жоспарлары", "Готовых планов уроков", "Ready lesson plans"), value: lessonPlans, icon: FileText, accent: "from-blue-500 to-indigo-500" },
    { label: t("Ұпай әмияны", "Кошелёк баллов", "Points wallet"), value: points, icon: Coins, accent: "from-amber-400 to-orange-500" },
    { label: t("Алған сертификаттар", "Полученные сертификаты", "Earned certificates"), value: certificates, icon: Award, accent: "from-violet-500 to-fuchsia-500" },
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
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t(
              "Бүгінгі күн — оқыту мен дамудың жаңа мүмкіндігі. Платформаңызға қош келдіңіз.",
              "Сегодня — новая возможность для обучения и развития. Добро пожаловать на платформу.",
              "Today is a new opportunity to teach and grow. Welcome to your platform.",
            )}
          </p>

          <div className="mt-6 flex max-w-xl items-center gap-2 glass rounded-2xl p-2">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(
                "Заңды тез іздеу: «514 бұйрық», «жалақы», «демалыс»...",
                "Быстрый поиск закона: «приказ 514», «зарплата», «отпуск»...",
                "Quick legal search: 'order 514', 'salary', 'vacation'...",
              )}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("adilet"); }}
            />
            <Button onClick={() => setActiveTab("adilet")} className="gradient-emerald gap-1.5">
              Adilet AI <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass group relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1"
          >
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
            <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-lg`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-3xl font-semibold tracking-tight">{s.value.toLocaleString("kk-KZ")}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Events */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass lg:col-span-2 rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t("Алдағы іс-шаралар", "Предстоящие события", "Upcoming events")}</h3>
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
                <Button variant="ghost" size="sm">{t("Тіркелу", "Записаться", "Register")}</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-2 text-lg font-semibold">{t("Жетістіктер", "Достижения", "Achievements")}</h3>
          <p className="text-sm text-muted-foreground">{t("Сіздің даму деңгейіңіз", "Ваш уровень развития", "Your growth level")}</p>
          <div className="mt-6 space-y-4">
            {[
              { label: t("Adilet AI заңгер", "Adilet AI юрист", "Adilet AI lawyer"), v: 78 },
              { label: t("Әдістемелік оқу", "Методическое обучение", "Methodology training"), v: 62 },
              { label: t("Цифрлық сауаттылық", "Цифровая грамотность", "Digital literacy"), v: 45 },
            ].map((p) => (
              <div key={p.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-semibold">{p.v}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full gradient-emerald rounded-full transition-all" style={{ width: `${p.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
