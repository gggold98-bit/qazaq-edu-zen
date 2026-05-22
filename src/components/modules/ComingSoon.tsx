import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";

interface ComingSoonProps {
  title: string;
  subtitle?: string;
}

export function ComingSoon({ title, subtitle }: ComingSoonProps) {
  const t = useT();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass relative flex min-h-[420px] flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-glass-border p-10 text-center"
      >
        <div className="gradient-emerald flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Жуырда ақпарат пайда болады", "Информация появится в ближайшее время", "Information coming soon")}
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {t(
            "Бұл бөлім дайындалу үстінде. Жақын арада толық мазмұнмен қолжетімді болады.",
            "Этот раздел в разработке. Скоро будет доступен с полным содержанием.",
            "This section is being prepared. It will be available with full content soon.",
          )}
        </p>
      </motion.div>
    </div>
  );
}
