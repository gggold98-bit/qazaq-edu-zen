import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PLANS = [
  { name: "Free Trial", price: 0, period: "айына", features: ["Adilet AI шектеулі", "5 ҚМЖ үлгісі", "Базалық тақта"], cta: "Бастау", popular: false },
  { name: "Teacher PRO", price: 4900, period: "айына", features: ["Шексіз Adilet AI", "Барлық әдістеме", "Сертификаттау курстары", "+500 ұпай сыйлық"], cta: "PRO алу", popular: true },
  { name: "School License", price: 39000, period: "айына", features: ["50 педагогке дейін", "Admin панель", "Аналитика & есеп", "Жеке менеджер"], cta: "Хабарласу", popular: false },
];

export function Subscriptions() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Өзіңізге қолайлы жоспарды таңдаңыз</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Жылдық төлемде 20% жеңілдік
        </p>

        <div className="mt-6 inline-flex glass rounded-full p-1">
          <button onClick={() => setYearly(false)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!yearly ? "gradient-emerald text-white shadow" : "text-muted-foreground"}`}>
            Айлық
          </button>
          <button onClick={() => setYearly(true)} className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${yearly ? "gradient-emerald text-white shadow" : "text-muted-foreground"}`}>
            Жылдық −20%
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = yearly ? Math.round(p.price * 12 * 0.8) : p.price;
          const per = yearly ? "жылына" : p.period;
          return (
            <div key={p.name} className={`relative glass rounded-3xl p-7 transition-transform hover:-translate-y-1 ${p.popular ? "ring-2 ring-primary shadow-2xl shadow-primary/20" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full gradient-emerald px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg">
                  <Sparkles className="h-3 w-3" /> Танымал
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
                onClick={() => toast.success(`«${p.name}» жоспары таңдалды`)}
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
