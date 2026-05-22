import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

// Kazakhstan public holidays (month is 1-based)
// Source: official non-working days in Kazakhstan
const KZ_HOLIDAYS: { m: number; d: number; kk: string; ru: string; en: string }[] = [
  { m: 1, d: 1, kk: "Жаңа жыл", ru: "Новый год", en: "New Year" },
  { m: 1, d: 2, kk: "Жаңа жыл", ru: "Новый год", en: "New Year" },
  { m: 1, d: 7, kk: "Рождество", ru: "Рождество", en: "Orthodox Christmas" },
  { m: 3, d: 8, kk: "Халықаралық әйелдер күні", ru: "Международный женский день", en: "Women's Day" },
  { m: 3, d: 21, kk: "Наурыз мейрамы", ru: "Наурыз мейрамы", en: "Nauryz" },
  { m: 3, d: 22, kk: "Наурыз мейрамы", ru: "Наурыз мейрамы", en: "Nauryz" },
  { m: 3, d: 23, kk: "Наурыз мейрамы", ru: "Наурыз мейрамы", en: "Nauryz" },
  { m: 5, d: 1, kk: "Қазақстан халқының бірлігі күні", ru: "День единства народа Казахстана", en: "Unity Day" },
  { m: 5, d: 7, kk: "Отан Қорғаушы күні", ru: "День защитника Отечества", en: "Defender's Day" },
  { m: 5, d: 9, kk: "Жеңіс күні", ru: "День Победы", en: "Victory Day" },
  { m: 7, d: 6, kk: "Астана күні", ru: "День столицы", en: "Capital Day" },
  { m: 8, d: 30, kk: "Конституция күні", ru: "День Конституции", en: "Constitution Day" },
  { m: 10, d: 25, kk: "Республика күні", ru: "День Республики", en: "Republic Day" },
  { m: 12, d: 16, kk: "Тәуелсіздік күні", ru: "День Независимости", en: "Independence Day" },
];

const MONTHS_KK = ["Қаңтар","Ақпан","Наурыз","Сәуір","Мамыр","Маусым","Шілде","Тамыз","Қыркүйек","Қазан","Қараша","Желтоқсан"];
const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const DOW_KK = ["Дс","Сс","Ср","Бс","Жм","Сн","Жс"];
const DOW_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const DOW_EN = ["Mo","Tu","We","Th","Fr","Sa","Su"];

export function SchoolCalendar() {
  const t = useT();
  const lang = useAppStore((s) => s.lang);
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth(); // 0-based
  const monthName = (lang === "ru" ? MONTHS_RU : lang === "en" ? MONTHS_EN : MONTHS_KK)[month];
  const dow = lang === "ru" ? DOW_RU : lang === "en" ? DOW_EN : DOW_KK;

  const holidays = useMemo(
    () => KZ_HOLIDAYS.filter((h) => h.m === month + 1),
    [month],
  );

  // Build grid: Monday-first. Find weekday of day 1 (0=Mon..6=Sun)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells.push({ day: d, current: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(year, month, d) });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const d = cells.length - (firstDow + daysInMonth) + 1;
    cells.push({ day: d, current: false, date: new Date(year, month + 1, d) });
  }

  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const isHoliday = (d: Date) =>
    d.getMonth() === month && KZ_HOLIDAYS.some((h) => h.m === d.getMonth() + 1 && h.d === d.getDate());

  const holidayName = (d: Date) => {
    const h = KZ_HOLIDAYS.find((x) => x.m === d.getMonth() + 1 && x.d === d.getDate());
    return h ? (lang === "ru" ? h.ru : lang === "en" ? h.en : h.kk) : "";
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t("Мектеп күнтізбесі", "Школьный календарь", "School calendar")}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="inline-flex items-center rounded-lg bg-accent/60 px-2.5 py-1 text-xs font-medium">
            {monthName}, {year}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {dow.map((d, i) => (
          <div
            key={d}
            className={`pb-1 text-[11px] font-medium ${i >= 5 ? "text-primary" : "text-muted-foreground"}`}
          >
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const weekday = i % 7;
          const weekend = weekday >= 5;
          const holiday = c.current && isHoliday(c.date);
          const today = isToday(c.date);
          return (
            <div
              key={i}
              title={holiday ? holidayName(c.date) : undefined}
              className={[
                "relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                !c.current && "text-muted-foreground/40",
                c.current && !weekend && !holiday && "text-foreground hover:bg-accent/60",
                c.current && weekend && !holiday && "bg-accent/40 text-foreground",
                holiday && "bg-primary/15 font-semibold text-primary",
                today && "ring-2 ring-primary",
              ].filter(Boolean).join(" ")}
            >
              {c.day}
              {holiday && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>

      {holidays.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {t("Мерекелер", "Праздники", "Holidays")}
          </div>
          <ul className="space-y-1 text-xs">
            {holidays.map((h) => (
              <li key={`${h.m}-${h.d}`} className="flex items-center gap-2">
                <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-primary/15 text-[10px] font-semibold text-primary">
                  {h.d}
                </span>
                <span className="text-foreground">
                  {lang === "ru" ? h.ru : lang === "en" ? h.en : h.kk}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
