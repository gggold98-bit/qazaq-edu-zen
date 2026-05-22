import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { Scale, Send, FileText, Bot, User as UserIcon, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import { adiletChat } from "@/lib/adilet.functions";
import { toast } from "sonner";

interface LegalDoc {
  id: string;
  title: string;
  doc_number: string | null;
  category: string | null;
  content: string;
  added_by: string | null;
}

interface Msg { role: "user" | "assistant"; content: string }

export function AdiletAI() {
  const askAi = useServerFn(adiletChat);

  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Ассалаумағалейкум! Мен — **Әділет AI**, ҚР білім беру заңнамасы бойынша құқықтық кеңесшіңізбін. Сұрағыңызды қойыңыз — мен тек жүйеге жүктелген ресми заңдар мен бұйрықтарға сүйеніп жауап беремін.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDocs = async () => {
    const { data, error } = await supabase
      .from("legal_documents")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Заңдарды жүктеу мүмкін болмады");
      return;
    }
    setDocs(data ?? []);
  };

  useEffect(() => { loadDocs(); }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await askAi({ data: { messages: next.map((m) => ({ role: m.role, content: m.content })) } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      console.error(e);
      toast.error("AI-мен байланыс үзілді");
      setMessages([...next, { role: "assistant", content: "Кешіріңіз, техникалық қате болды." }]);
    } finally {
      setLoading(false);
    }
  };

  const selectedDoc = docs.find((d) => d.id === selectedId);

  return (
    <div className="adilet-theme -m-4 sm:-m-6 lg:-m-8 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#f1f5fb] via-white to-[#e8eef7] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#dbe4f0] bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#0c2a6b] shadow-md">
          <Scale className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0c2a6b] sm:text-2xl">Әділет AI</h1>
            <Badge className="bg-[#1d4ed8] hover:bg-[#1d4ed8]">Ресми</Badge>
          </div>
          <p className="text-sm text-slate-600">
            Қазақстан Республикасының білім беру заңнамасы бойынша құқықтық ИИ-кеңесші
          </p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
          <Sparkles className="h-3.5 w-3.5" /> Онлайн
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar: Knowledge Base */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#dbe4f0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e5ecf5] p-4">
              <div>
                <div className="text-sm font-semibold text-[#0c2a6b]">Білім базасы</div>
                <div className="text-xs text-slate-500">{docs.length} құжат</div>
              </div>
              <FileText className="h-4 w-4 text-[#1d4ed8]" />
            </div>
            <ScrollArea className="h-[360px]">
              <div className="space-y-1 p-2">
                {docs.map((d) => {
                  const isSystem = !d.added_by;
                  const active = selectedId === d.id;
                  return (
                    <div
                      key={d.id}
                      className={`group flex items-start gap-2 rounded-lg p-2.5 text-left text-sm transition-colors ${
                        active ? "bg-[#e8eef7] text-[#0c2a6b]" : "hover:bg-slate-50"
                      }`}
                    >
                      <button onClick={() => setSelectedId(active ? null : d.id)} className="flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          {d.doc_number && (
                            <span className="rounded bg-[#0c2a6b]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#0c2a6b]">
                              {d.doc_number}
                            </span>
                          )}
                          {isSystem && <ShieldCheck className="h-3 w-3 text-emerald-600" />}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-slate-700">
                          {d.title}
                        </div>
                      </button>
                    </div>
                  );
                })}
                {docs.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">Әзірге құжат жоқ</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Main: Chat or Doc Viewer */}
        <section className="flex h-[720px] flex-col rounded-2xl border border-[#dbe4f0] bg-white shadow-sm">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between border-b border-[#e5ecf5] p-5">
                <div>
                  <div className="flex items-center gap-2">
                    {selectedDoc.doc_number && (
                      <Badge variant="outline" className="border-[#0c2a6b]/30 text-[#0c2a6b]">
                        {selectedDoc.doc_number}
                      </Badge>
                    )}
                    {selectedDoc.category && (
                      <span className="text-xs text-slate-500">{selectedDoc.category}</span>
                    )}
                  </div>
                  <h2 className="mt-1 font-semibold text-[#0c2a6b]">{selectedDoc.title}</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  Жабу
                </Button>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                  {selectedDoc.content}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-[#e5ecf5] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c2a6b]">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#0c2a6b]">Құқықтық кеңесші</div>
                  <div className="text-xs text-slate-500">Тек білім базасындағы құжаттарға сүйенеді</div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-5">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          m.role === "assistant" ? "bg-[#0c2a6b] text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          m.role === "assistant"
                            ? "border border-[#e5ecf5] bg-[#f8fafd] text-slate-800"
                            : "bg-[#1d4ed8] text-white"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none prose-headings:text-[#0c2a6b] prose-strong:text-[#0c2a6b]">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c2a6b] text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-[#e5ecf5] bg-[#f8fafd] px-4 py-3 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Заңдарды зерделеп жатыр...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-[#e5ecf5] p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Заңдық сұрағыңызды қазақ тілінде жазыңыз..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    disabled={loading}
                    className="h-11 border-[#dbe4f0] focus-visible:ring-[#1d4ed8]"
                  />
                  <Button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="h-11 gap-2 bg-[#1d4ed8] hover:bg-[#1e40af]"
                  >
                    <Send className="h-4 w-4" /> Жіберу
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  💡 Әділет AI тек жоғарыдағы білім базасына жүктелген заңдар мен бұйрықтарға сүйеніп жауап береді.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
