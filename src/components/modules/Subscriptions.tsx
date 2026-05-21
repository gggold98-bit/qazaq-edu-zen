import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export function Subscriptions() {
  const t = useT();
  const [yearly, setYearly] = useState(false);

  const monthly = t("айына", "в месяц", "per month");
  const yearlyLabel = t("жылына", "в год", "per year");

  const PLANS = [
    {
      name: "Free Trial",
      price: 0,
      features: [
        t("Adilet AI шектеулі", "Adilet AI ограниченно", "Adilet AI limited"),
        t("5 ҚМЖ үлгісі", "5 шаблонов КСП", "5 short-plan templates"),
        t("Базалық тақта", "Базовая доска", "Basic whiteboard"),
      ],
      cta: t("Бастау", "Начать", "Start"),
      popular: false,
    },
    {
      name: "Teacher PRO",
      price: 4900,
      features: [
        t("Шексіз Adilet AI", "Безлимитный Adilet AI", "Unlimited Adilet AI"),
        t("Барлық әдістеме", "Вся методика", "All methodology"),
        t("Сертификаттау курстары", "Сертификационные курсы", "Certification courses"),
        t("+500 ұпай сыйлық", "+500 баллов в подарок", "+500 bonus points"),
      ],
      cta: t("PRO алу", "Получить PRO", "Get PRO"),
      popular: true,
    },
    {
      name: "School License",
      price: 39000,
      features: [
        t("50 педагогке дейін", "До 50 педагогов", "Up to 50 teachers"),
        t("Admin панель", "Панель Admin", "Admin panel"),
        t("Аналитика & есеп", "Аналитика и отчёты", "Analytics & reports"),
        t("Жеке менеджер", "Личный менеджер", "Dedicated manager"),
      ],
      cta: t("Хабарласу", "Связаться", "Contact"),
      popular: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("Өзіңізге қолайлы жоспарды таңдаңыз", "Выберите подходящий план", "Choose a plan that fits you")}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("Жылдық төлемде 20% жеңілдік", "Скидка 20% при годовой оплате", "20% off on annual billing")}
        </p>

        <div className="mt-6 inline-flex glass rounded-full p-1">
          <button onClick={() => setYearly(false)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!yearly ? "gradient-emerald text-white shadow" : "text-muted-foreground"}`}>
            {t("Айлық", "Месяц", "Monthly")}
          </button>
          <button onClick={() => setYearly(true)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${yearly ? "gradient-emerald text-white shadow" : "text-muted-foreground"}`}>
            {t("Жылдық −20%", "Год −20%", "Yearly −20%")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = yearly ? Math.round(p.price * 12 * 0.8) : p.price;
          const per = yearly ? yearlyLabel : monthly;
          return (
            <div key={p.name} className={`relative glass rounded-3xl p-7 transition-transform hover:-translate-y-1 ${p.popular ? "ring-2 ring-primary shadow-2xl shadow-primary/20" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full gradient-emerald px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg">
                  <Sparkles className="h-3 w-3" /> {t("Танымал", "Популярно", "Popular")}
                </div>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{price.toLocaleString("kk-KZ")}</span>
                <span className="text-sm text-muted-foreground">₸ / {per}</span>
              </div>
              <ul className="my-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => toast.success(t(`«${p.name}» жоспары таңдалды`, `Выбран план «${p.name}»`, `Plan "${p.name}" selected`))}
                className={`w-full ${p.popular ? "gradient-emerald shadow-lg shadow-primary/30" : ""}`}
                variant={p.popular ? "default" : "outline"}
              >
                {p.cta}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
