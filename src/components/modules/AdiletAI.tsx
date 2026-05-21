import { useRef, useState } from "react";
import { Scale, Send, Copy, Printer, Sparkles, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";


interface Msg { role: "user" | "ai"; text: string }

const KNOWLEDGE = [
  {
    q: "«Педагог мәртебесі туралы» Заң — 15-бап",
    a: "Педагог қызметкерлерге қосымша құжаттарды жүргізуге, жиналыстарға қатысуға және оқу процесінен тыс іс-шараларға тартуға тыйым салынады. Жұмыс уақыты тек оқыту мен дайындалуға арналады.",
  },
  {
    q: "ҚР БҒМ 514-бұйрық",
    a: "Педагогтер тек 2 күнделікті құжатты толтырады: 1) Электронды немесе қағаз күнделік (журнал), 2) Қысқа мерзімді жоспар (ҚМЖ). Басқа есеп беру түрлерін талап етуге болмайды.",
  },
  {
    q: "Сенбілік жұмыстар туралы",
    a: "Сенбі күнгі жалпы жинау, көгалдандыру, мерекелерге дайындық сияқты жұмыстарға педагогтерді мәжбүрлеп тарту заңсыз болып табылады.",
  },
  {
    q: "Жазылым (подписка) және жарна",
    a: "Қандай да бір баспасөзге, газеттерге немесе қорларға педагогтерді мәжбүрлеп жаздыруға тыйым салынады. Бұл — Сыбайлас жемқорлыққа қарсы заңды бұзу.",
  },
];

export function AdiletAI() {
  const t = useT();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: t(
      "Сәлеметсіз бе! Мен — Adilet AI, ҚР білім беру және еңбек құқығы бойынша көмекшіңіз. Сұрағыңызды қойыңыз.",
      "Здравствуйте! Я — Adilet AI, ваш помощник по образовательному и трудовому праву РК. Задайте свой вопрос.",
      "Hello! I'm Adilet AI, your assistant for Kazakhstan's education and labor law. Ask me anything.",
    ) },
  ]);
  const [input, setInput] = useState("");

  const ask = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      const match = KNOWLEDGE.find((k) =>
        userMsg.toLowerCase().split(/\s+/).some((w) => k.q.toLowerCase().includes(w) || k.a.toLowerCase().includes(w)),
      );
      const reply = match
        ? `${t("Заң негізінде жауап", "Ответ на основании закона", "Answer based on law")}:\n\n${match.a}\n\n📎 ${t("Дереккөз", "Источник", "Source")}: ${match.q}`
        : t(
            "Сұрағыңыз бойынша нақты дереккөз табылмады. «514 бұйрық», «сенбілік», «жазылым» немесе «педагог мәртебесі» тақырыптарын қарап көріңіз.",
            "По вашему вопросу источник не найден. Попробуйте темы: «приказ 514», «субботник», «подписка», «статус педагога».",
            "No source found for your query. Try: 'order 514', 'Saturday work', 'subscription', 'teacher status'.",
          );
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Chat */}
      <div className="glass flex h-[680px] flex-col rounded-2xl lg:col-span-3">
        <div className="flex items-center gap-3 border-b border-glass-border p-5">
          <div className="gradient-emerald flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/30">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold">{t("Adilet AI — Құқықтық заңгер", "Adilet AI — Правовой консультант", "Adilet AI — Legal counsel")}</div>
            <div className="text-xs text-muted-foreground">{t("ҚР Білім беру мен еңбек заңнамасы", "Образовательное и трудовое право РК", "Kazakhstan education & labor law")}</div>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" /> {t("Онлайн", "Онлайн", "Online")}
          </span>
        </div>


        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "ai" ? "gradient-emerald text-white" : "bg-muted"}`}>
                {m.role === "ai" ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === "ai" ? "bg-card border" : "gradient-emerald text-white"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-glass-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("Заң туралы сұрақ қойыңыз...", "Задайте вопрос о законе...", "Ask a question about the law...")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              className="h-11"
            />
            <Button onClick={ask} className="h-11 gradient-emerald gap-2">
              <Send className="h-4 w-4" /> {t("Жіберу", "Отправить", "Send")}
            </Button>

          </div>
        </div>
      </div>

      {/* Side */}
      <div className="space-y-6 lg:col-span-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-semibold">{t("Маңызды заң баптары", "Важные статьи закона", "Key legal articles")}</h3>
          <Accordion type="single" collapsible className="w-full">
            {KNOWLEDGE.map((k, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-border/60">
                <AccordionTrigger className="text-left text-sm">{k.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{k.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <ComplaintConstructor />
      </div>
    </div>
  );
}

function ComplaintConstructor() {
  const t = useT();
  const { user } = useAppStoreCompat();
  const [school, setSchool] = useState("");
  const [director, setDirector] = useState("");
  const [teacher, setTeacher] = useState(user?.fullName ?? "");
  const [violation, setViolation] = useState<string>("");
  const [generated, setGenerated] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const generate = () => {
    if (!school || !director || !violation) {
      toast.error(t("Барлық өрістерді толтырыңыз", "Заполните все поля", "Fill in all fields"));
      return;
    }

    const date = new Date().toLocaleDateString("kk-KZ");
    const text = `ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ
БІЛІМ БЕРУ САЛАСЫНДАҒЫ БАҚЫЛАУ КОМИТЕТІНЕ

Арыз иесі: ${teacher}
Мекеме: ${school}
Басшы: ${director}

АРЫЗ

Мен, ${teacher}, ${school} мекемесінде педагог болып жұмыс істеймін.
Соңғы кезеңде басшылықтан мынадай заңсыз әрекетке тап болдым:

«${violation}»

Бұл әрекет:
• «Педагог мәртебесі туралы» ҚР Заңының 15-бабын,
• ҚР БҒМ 514-бұйрығының талаптарын,
• Еңбек кодексінің 23-бабын бұзады.

Жоғарыда баяндалғанға сүйеніп, өтінемін:
1. Аталған факт бойынша тексеру жүргізуді;
2. Кінәлі тұлғаларды жауапқа тартуды;
3. Маған жазбаша жауап жіберуді.

Күні: ${date}
Қолы: _______________ (${teacher})`;
    setGenerated(text);
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    toast.success(t("Көшірілді", "Скопировано", "Copied"));
  };

  const print = () => {
    if (!generated) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<pre style="font-family:Georgia,serif;padding:40px;white-space:pre-wrap;line-height:1.6">${generated.replace(/</g, "&lt;")}</pre>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-1 font-semibold">{t("Ресми шағым конструкторы", "Конструктор официальной жалобы", "Official complaint builder")}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{t("Заңды формада хат құрастырыңыз", "Составьте письмо в законной форме", "Compose a letter in legal form")}</p>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">{t("Мектеп атауы", "Название школы", "School name")}</Label>
          <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder={t("№1 жалпы білім беретін мектеп", "Школа №1", "School No. 1")} />
        </div>
        <div>
          <Label className="text-xs">{t("Директор", "Директор", "Director")}</Label>
          <Input value={director} onChange={(e) => setDirector(e.target.value)} placeholder={t("А.Ә.Т.", "Ф.И.О.", "Full name")} />
        </div>
        <div>
          <Label className="text-xs">{t("Педагог", "Педагог", "Teacher")}</Label>
          <Input value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{t("Бұзушылық түрі", "Тип нарушения", "Violation type")}</Label>
          <Select value={violation} onValueChange={setViolation}>
            <SelectTrigger><SelectValue placeholder={t("Таңдаңыз", "Выберите", "Select")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Сенбі күні мәжбүрлі тазалау жұмыстарына тарту">{t("Сенбі күні мәжбүрлі тазалау", "Принуждение к субботнику", "Forced Saturday work")}</SelectItem>
              <SelectItem value="Артық қағазбастылық пен есеп беруді талап ету">{t("Артық қағазбастылық", "Излишняя бюрократия", "Excess paperwork")}</SelectItem>
              <SelectItem value="Газет-журналдарға мәжбүрлі жазылу">{t("Мәжбүрлі жазылу", "Принудительная подписка", "Forced subscription")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate} className="w-full gradient-emerald">{t("Хат құрастыру", "Сформировать письмо", "Generate letter")}</Button>



        {generated && (
          <>
            <div ref={ref} className="max-h-64 overflow-y-auto rounded-xl border bg-card/60 p-4 font-serif text-xs leading-relaxed whitespace-pre-wrap">
              {generated}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={copy} className="gap-2"><Copy className="h-4 w-4" /> Көшіру</Button>
              <Button variant="outline" onClick={print} className="gap-2"><Printer className="h-4 w-4" /> PDF басу</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
