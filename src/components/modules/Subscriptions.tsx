import { useT } from "@/lib/i18n";
import { ComingSoon } from "@/components/modules/ComingSoon";

export function Subscriptions() {
  const t = useT();
  return (
    <ComingSoon
      title={t("Жазылымдар", "Подписки", "Subscriptions")}
      subtitle={t(
        "Тарифтер мен жазылым жоспарлары жуырда жарияланады.",
        "Тарифы и планы подписок появятся в ближайшее время.",
        "Pricing and subscription plans coming soon.",
      )}
    />
  );
}
