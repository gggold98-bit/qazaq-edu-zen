import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface ChatInput {
  messages: { role: "user" | "assistant"; content: string }[];
}

export const adiletChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ChatInput) => d)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "Кешіріңіз, ИИ қызметі әзірге қолжетімсіз.", sources: [] as string[] };
    }

    const { data: docs } = await supabase
      .from("legal_documents")
      .select("title, doc_number, category, content")
      .order("created_at", { ascending: true });

    const knowledge = (docs ?? [])
      .map(
        (d, i) =>
          `### Дереккөз [${i + 1}] — ${d.title}${d.doc_number ? ` (${d.doc_number})` : ""}\n${d.content}`,
      )
      .join("\n\n---\n\n");

    const system = `Сен — Әділет AI, Қазақстан Республикасының педагогтеріне арналған құқықтық кеңесшісің. Жауаптарың ресми, заңгерлік және сыпайы қазақ тілінде болуы керек.

ҚАТАҢ ЕРЕЖЕЛЕР:
1. Сен ТЕК ТӨМЕНДЕГІ БІЛІМ БАЗАСЫНДА келтірілген заңдар мен бұйрықтардың мәтініне сүйеніп жауап беруің керек.
2. Жауапта НАҚТЫ заңның бабына, бұйрықтың/қаулының нөміріне сілтеме жасап отыр (мысалы: "№ 130 бұйрық, 1-тармаққа сәйкес...", "«Педагог мәртебесі туралы» Заңының 15-бабы бойынша...").
3. Егер пайдаланушының сұрағына жауап білім базасында МҮЛДЕ ЖОҚ болса, ешнәрсе ойлап таппа. Дәл осы сөздермен жауап бер:
   "Кешіріңіз, бұл сұрақтың жауабы менің базама жүктелген құжаттарда табылмады. Админ бұл заңды әлі қоспаған болуы мүмкін."
4. Жалпы білімнен, интернеттен, өз болжамыңнан ештеңе қоспа. Тек берілген құжаттар.
5. Жауап соңында "📎 Дереккөздер:" деген жолмен пайдаланған құжаттардың атауы мен нөмірін тізіп бер.

===== БІЛІМ БАЗАСЫ =====
${knowledge || "(база бос)"}
===== БАЗА АЯҚТАЛДЫ =====`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Adilet AI gateway error", resp.status, txt);
      if (resp.status === 429)
        return { reply: "Сұраныстар лимиті асып кетті, кейінірек қайталап көріңіз.", sources: [] };
      if (resp.status === 402)
        return { reply: "Lovable AI кредиттері таусылды. Settings → Workspace → Usage бөлімінен толтырыңыз.", sources: [] };
      return { reply: "AI қызметінде қате болды. Кейінірек қайталап көріңіз.", sources: [] };
    }

    const json = await resp.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "—";
    return { reply, sources: (docs ?? []).map((d) => d.title) };
  });
