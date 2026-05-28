import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { SchoolCalendar } from "@/components/modules/SchoolCalendar";
import { fetchPedagogNews } from "@/lib/news.functions";

export function Dashboard() {
  const { user } = useAppStore();
  const t = useT();

  const getNews = useServerFn(fetchPedagogNews);
  const { data, isLoading } = useQuery({
    queryKey: ["pedagog-news"],
    queryFn: () => getNews(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
  const news = data?.items ?? [];

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
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("Жаңалықтар", "Новости", "News")}</h3>
            </div>
            <a
              href="https://pedagog-kz.kz/category/news"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Pedagog-KZ <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-card/40" />
                ))}
              </div>
            )}

            {!isLoading && news.length === 0 && (
              <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                {t(
                  "Жаңалықтарды жүктеу мүмкін болмады.",
                  "Не удалось загрузить новости.",
                  "Could not load news right now.",
                )}
              </div>
            )}

            {news.map((n) => (
              <a
                key={n.url}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors hover:border-primary/40 hover:bg-card/70"
              >
                {n.image ? (
                  <div
                    className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-border/60"
                    style={{ backgroundImage: `url(${n.image})` }}
                  />
                ) : (
                  <div className="gradient-emerald flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-white">
                    <Newspaper className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-snug group-hover:text-primary">
                    {n.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Pedagog-KZ</span>
                    {n.date && <span className="opacity-60">· {n.date}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <SchoolCalendar />
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
