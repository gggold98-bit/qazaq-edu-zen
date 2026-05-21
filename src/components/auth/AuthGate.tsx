import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.83z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}

export function AuthGate() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) toast.error(error.message || "Кіру сәтсіз аяқталды");
    else toast.success("Қош келдіңіз!");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Құпиясөз кемінде 6 таңбадан тұруы керек");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name || email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message || "Тіркелу сәтсіз");
    else toast.success("Тіркелу сәтті! Email-ге растау сілтемесі жіберілді.");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google арқылы кіру сәтсіз: " + (result.error.message ?? ""));
      return;
    }
    if (result.redirected) return; // browser will navigate
    setBusy(false);
    toast.success("Google арқылы кірдіңіз");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-deep/40 blur-[140px]" />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden flex-col justify-between p-12 lg:flex"
        >
          <div className="flex items-center gap-3">
            <div className="gradient-emerald flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Qazaq Teachers AI</div>
              <div className="text-xs text-muted-foreground">Ұстаздарға арналған экожүйе</div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Ұстаздың <span className="text-gradient">құқығы</span> мен
              <br />әдістемесі бір жерде.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Adilet AI заңгер, әдістемелік кабинет, интерактивті тақта және
              кәсіби сертификаттау курстары — бәрі бір премиум-платформада.
            </p>
            <div className="flex gap-3">
              {["514-бұйрық", "Заң қорғауы", "AI көмекші"].map((t) => (
                <span key={t} className="glass rounded-full px-4 py-1.5 text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">© 2026 Qazaq Teachers AI. Барлық құқықтар қорғалған.</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center p-6 sm:p-10"
        >
          <div className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="gradient-emerald flex h-10 w-10 items-center justify-center rounded-xl">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="text-base font-semibold">Qazaq Teachers AI</div>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">Қош келдіңіз</h2>
            <p className="mt-1 text-sm text-muted-foreground">Аккаунтыңызға кіріңіз немесе жаңадан тіркеліңіз</p>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")} className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Жүйеге кіру</TabsTrigger>
                <TabsTrigger value="register">Жаңадан тіркелу</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <FieldEmail email={email} setEmail={setEmail} />
                  <FieldPassword password={password} setPassword={setPassword} showPass={showPass} setShowPass={setShowPass} />
                  <Button type="submit" disabled={busy} className="h-11 w-full gradient-emerald font-semibold shadow-lg shadow-primary/30">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Кіру"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Толық аты-жөні</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" placeholder="Атыңыз Тегіңіз" value={name} onChange={(e) => setName(e.target.value)} className="h-11 pl-10" />
                    </div>
                  </div>
                  <FieldEmail email={email} setEmail={setEmail} />
                  <FieldPassword password={password} setPassword={setPassword} showPass={showPass} setShowPass={setShowPass} />
                  <Button type="submit" disabled={busy} className="h-11 w-full gradient-emerald font-semibold shadow-lg shadow-primary/30">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Тіркелу"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              немесе
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={handleGoogle}
              className="h-11 w-full gap-3 rounded-xl border-2 font-medium shadow-sm hover:bg-accent/40"
            >
              <GoogleIcon />
              Google аккаунтымен кіру
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FieldEmail({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email (Gmail)</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="email" type="email" autoComplete="email" required placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 pl-10" />
      </div>
    </div>
  );
}

function FieldPassword({ password, setPassword, showPass, setShowPass }: { password: string; setPassword: (v: string) => void; showPass: boolean; setShowPass: (v: boolean) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Құпиясөз</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="password" type={showPass ? "text" : "password"} required minLength={6} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 px-10" />
        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
