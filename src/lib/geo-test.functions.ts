import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface GeoQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
  imageUrl?: string;
}

interface GenInput {
  grade: number;
  focusTopics?: string[];
  count?: number;
}

const SUBJECT = "geography";

async function callAI(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY жоқ");
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("AI gateway error", resp.status, t);
    if (resp.status === 429) throw new Error("Сұраныстар лимиті асып кетті, кейінірек көріңіз.");
    if (resp.status === 402) throw new Error("AI кредиттері таусылды.");
    throw new Error("AI қатесі: " + resp.status);
  }
  const json = await resp.json();
  const content: string = json.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

export const generateGeoTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: GenInput) => d)
  .handler(async ({ data, context }): Promise<{ questions: GeoQuestion[] }> => {
    const { supabase, userId } = context;
    const grade = Number(data.grade);
    const count = data.count ?? 30;
    if (![7, 8, 9, 10, 11].includes(grade)) throw new Error("Жарамсыз сынып");

    const { data: book } = await supabase
      .from("textbook_content")
      .select("content")
      .eq("subject", SUBJECT)
      .eq("grade", grade)
      .maybeSingle();
    if (!book?.content) throw new Error("Оқулық табылмады");

    const { data: prev } = await supabase
      .from("asked_questions")
      .select("question")
      .eq("user_id", userId)
      .eq("subject", SUBJECT)
      .eq("grade", grade)
      .order("created_at", { ascending: false })
      .limit(400);

    const excludeList = (prev ?? []).map((p) => p.question).slice(0, 200);

    const focusBlock = data.focusTopics?.length
      ? `\nӘсіресе мына әлсіз тақырыптарға баса назар аудар: ${data.focusTopics.join(", ")}.`
      : "";

    const system = `Сен — ${grade}-сынып география пәнінен ҰБТ деңгейіндегі олимпиада тест құрастырушысың. ТЕК ТӨМЕНДЕГІ ОҚУЛЫҚ МӘТІНІНЕН сұрақ құрастыр. Қазақ тілінде, ${grade}-сынып бағдарламасы деңгейінде.

ҚАТАҢ ЕРЕЖЕЛЕР:
1. Дәл ${count} сұрақ.
2. Әр сұрақта 4 жауап нұсқасы, тек 1 ғана дұрыс.
3. Сұрақтар әртүрлі бөлімдерден алынсын (литосфера, атмосфера, гидросфера, биосфера, экономика, картография т.б. — оқулықта барларынан).
4. Сұрақтарды араластыр.
5. Төмендегі ҚАЙТАЛАНБАУ ТІЗІМІНДЕГІ сұрақтарды қайта берме (мағынасы жағынан да ұқсамасын).${focusBlock}
6. Сұрақтардың шамамен 30%-ы фотомен берілсін. Ондай сұрақтарға міндетті түрде "imageQuery" деген өрісте 2-4 ағылшын сөзімен суретке қажетті визуалды кілт сөздер қой (мысалы: "Caspian Sea coast", "Tien Shan mountains", "tropical rainforest", "volcano eruption", "river delta"). Тек география контекстіндегі нақты нысандар мен табиғи құбылыстар үшін қой. Сұрақ мәтіні фотоға сүйеніп жауап беруге мүмкіндік берсін (мысалы: "Суретте қандай табиғат зонасы бейнеленген?").

ҚАЙТАРЫЛАТЫН JSON ФОРМАТЫ:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"topic":"Литосфера","imageQuery":"Tien Shan mountains"}, ...]}

imageQuery өрісі міндетті емес, тек суретке байланысты сұрақтарға қой.
Тек JSON қайтар, басқа мәтін қоспа.`;

    const user = `===== ОҚУЛЫҚ (${grade}-сынып) =====
${book.content.slice(0, 60000)}
===== ОҚУЛЫҚ АЯҚТАЛДЫ =====

===== ҚАЙТАЛАНБАУ ТІЗІМІ (бұрын берілген сұрақтар) =====
${excludeList.length ? excludeList.map((q, i) => `${i + 1}. ${q}`).join("\n") : "(бос)"}
===== ТІЗІМ АЯҚТАЛДЫ =====

Енді ${count} жаңа сұрақ құрастыр.`;

    const parsed = await callAI(system, user);
    const raw: unknown[] = Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions: GeoQuestion[] = raw
      .map((q) => q as Record<string, unknown>)
      .filter((q) => {
        const opts = q.options;
        return (
          typeof q.question === "string" &&
          Array.isArray(opts) &&
          opts.length === 4 &&
          typeof q.correctIndex === "number" &&
          q.correctIndex >= 0 &&
          q.correctIndex < 4
        );
      })
      .map((q) => {
        const imageQuery = typeof q.imageQuery === "string" ? q.imageQuery.trim() : "";
        return {
          question: String(q.question),
          options: (q.options as unknown[]).map((o) => String(o)),
          correctIndex: Number(q.correctIndex),
          topic: typeof q.topic === "string" ? q.topic : "Жалпы",
          imageUrl: imageQuery
            ? `https://loremflickr.com/640/360/${encodeURIComponent(imageQuery)}?lock=${Math.abs(hashStr(imageQuery))}`
            : undefined,
        };
      })
      .slice(0, count);

    if (questions.length === 0) throw new Error("AI сұрақ құрастыра алмады, қайталап көріңіз.");
    return { questions };
  });

interface SubmitInput {
  grade: number;
  results: { question: string; topic: string; was_correct: boolean }[];
}

export const submitGeoTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SubmitInput) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const grade = Number(data.grade);
    const total = data.results.length;
    const score = data.results.filter((r) => r.was_correct).length;
    const percent = total > 0 ? Math.round((score / total) * 10000) / 100 : 0;

    // weak topics: topics with >= 50% wrong
    const byTopic = new Map<string, { ok: number; bad: number }>();
    for (const r of data.results) {
      const t = r.topic || "Жалпы";
      const e = byTopic.get(t) ?? { ok: 0, bad: 0 };
      if (r.was_correct) e.ok++;
      else e.bad++;
      byTopic.set(t, e);
    }
    const weakTopics = Array.from(byTopic.entries())
      .filter(([, v]) => v.bad >= v.ok && v.bad > 0)
      .map(([t, v]) => ({ topic: t, wrong: v.bad, total: v.ok + v.bad }));

    if (data.results.length) {
      const rows = data.results.map((r) => ({
        user_id: userId,
        subject: SUBJECT,
        grade,
        question: r.question,
        topic: r.topic,
        was_correct: r.was_correct,
      }));
      await supabase.from("asked_questions").insert(rows);
    }

    await supabase.from("test_attempts").insert({
      user_id: userId,
      subject: SUBJECT,
      grade,
      score,
      total,
      percent,
      weak_topics: weakTopics,
    });

    return { score, total, percent, weakTopics };
  });
