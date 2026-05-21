import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/lib/store";
import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Qazaq Teachers AI — Ұстаздарға арналған экожүйе" },
      { name: "description", content: "Adilet AI заңгер, әдістемелік кабинет, интерактивті тақта және сертификаттау курстары — қазақстандық педагогтерге арналған премиум платформа." },
    ],
  }),
});

function Index() {
  const user = useAppStore((s) => s.user);
  return (
    <>
      {user ? <AppShell /> : <AuthGate />}
      <Toaster position="top-right" richColors />
    </>
  );
}
