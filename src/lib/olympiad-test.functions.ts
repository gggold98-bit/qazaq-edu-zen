import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface OlympiadQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
  imageUrl?: string;
}

export type Lang = "kk" | "ru" | "en";

interface GenInput {
  subject: string; // slug, e.g. "geography", "math"
  grade: number;
  lang?: Lang;
  focusTopics?: string[];
  count?: number;
}

interface SubmitInput {
  subject: string;
  grade: number;
  results: { question: string; topic: string; was_correct: boolean }[];
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// Display labels per subject slug (in three languages).
const SUBJECT_LABEL: Record<string, { kk: string; ru: string; en: string; track: "jmb" | "gum" }> = {
  math:          { kk: "Математика",                 ru: "Математика",                en: "Mathematics",                track: "jmb" },
  physics:       { kk: "Физика",                     ru: "Физика",                    en: "Physics",                    track: "jmb" },
  chemistry:     { kk: "Химия",                      ru: "Химия",                     en: "Chemistry",                  track: "jmb" },
  biology:       { kk: "Биология",                   ru: "Биология",                  en: "Biology",                    track: "jmb" },
  geography:     { kk: "География",                  ru: "География",                 en: "Geography",                  track: "jmb" },
  informatics:   { kk: "Информатика",                ru: "Информатика",               en: "Computer Science",           track: "jmb" },
  robotics:      { kk: "Робототехника",              ru: "Робототехника",             en: "Robotics",                   track: "jmb" },
  ecology:       { kk: "Экология",                   ru: "Экология",                  en: "Ecology",                    track: "jmb" },
  "kazakh-lit":  { kk: "Қазақ тілі мен әдебиеті",    ru: "Казахский язык и литература", en: "Kazakh language & literature", track: "gum" },
  "russian-lit": { kk: "Орыс тілі мен әдебиеті",     ru: "Русский язык и литература", en: "Russian language & literature", track: "gum" },
  english:       { kk: "Ағылшын тілі",               ru: "Английский язык",           en: "English language",           track: "gum" },
  "kz-history":  { kk: "Қазақстан тарихы",           ru: "История Казахстана",        en: "History of Kazakhstan",      track: "gum" },
  "world-history": { kk: "Дүниежүзі тарихы",         ru: "Всемирная история",         en: "World history",              track: "gum" },
  law:           { kk: "Құқық негіздері",            ru: "Основы права",              en: "Fundamentals of law",        track: "gum" },
  economics:     { kk: "Экономика негіздері",        ru: "Основы экономики",          en: "Fundamentals of economics",  track: "gum" },
  psychology:    { kk: "Психология",                 ru: "Психология",                en: "Psychology",                 track: "gum" },
};

export const SUBJECT_SLUGS = Object.keys(SUBJECT_LABEL);

export function subjectLabel(slug: string, lang: Lang): string {
  const s = SUBJECT_LABEL[slug];
  if (!s) return slug;
  return s[lang] ?? s.kk;
}

const LANG_NAMES: Record<Lang, { native: string; teacher: string }> = {
  kk: { native: "қазақ тілінде",  teacher: "Қазақстан мектеп бағдарламасы бойынша" },
  ru: { native: "на русском языке", teacher: "по программе школ Казахстана" },
  en: { native: "in English",     teacher: "based on the Kazakhstani school curriculum" },
};

const VISUAL_SUBJECTS = new Set(["geography", "biology", "chemistry", "physics", "kz-history", "world-history", "ecology", "robotics"]);

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

export const generateOlympiadTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: GenInput) => d)
  .handler(async ({ data, context }): Promise<{ questions: OlympiadQuestion[] }> => {
    const { supabase, userId } = context;
    const subject = String(data.subject);
    const grade = Number(data.grade);
    const lang: Lang = (data.lang as Lang) || "kk";
    const count = data.count ?? 30;
    if (!SUBJECT_LABEL[subject]) throw new Error("Жарамсыз пән");
    if (![5, 6, 7, 8, 9, 10, 11].includes(grade)) throw new Error("Жарамсыз сынып");

    // Try to use uploaded textbook content if present.
    const { data: book } = await supabase
      .from("textbook_content")
      .select("content")
      .eq("subject", subject)
      .eq("grade", grade)
      .maybeSingle();

    const { data: prev } = await supabase
      .from("asked_questions")
      .select("question")
      .eq("user_id", userId)
      .eq("subject", subject)
      .eq("grade", grade)
      .order("created_at", { ascending: false })
      .limit(400);

    const excludeList = (prev ?? []).map((p) => p.question).slice(0, 200);

    const subjName = subjectLabel(subject, lang);
    const focusBlock = data.focusTopics?.length
      ? `\nӘсіресе мына әлсіз тақырыптарға баса назар аудар: ${data.focusTopics.join(", ")}.`
      : "";

    const sourceBlock = book?.content
      ? `\nДЕРЕК КӨЗІ: ТЕК ТӨМЕНДЕГІ ОҚУЛЫҚ МӘТІНІНЕН сұрақ құрастыр.`
      : `\nДЕРЕК КӨЗІ: ${LANG_NAMES[lang].teacher} ${grade}-сынып ${subjName} пәнінің ресми мектеп бағдарламасына (МЖМБС) сүйеніп құрастыр.`;

    const wantImages = VISUAL_SUBJECTS.has(subject);
    const imageRule = wantImages
      ? `\n6. Сұрақтардың шамамен 25%-ы фотомен берілсін. Ондай сұрақтарға міндетті түрде "imageQuery" деген өрісте 2-4 ағылшын сөзімен суретке қажетті визуалды кілт сөздер қой (мысалы: "Tien Shan mountains", "DNA structure", "Roman colosseum"). Тек ${subjName} контекстіндегі нақты нысандар үшін қой.`
      : `\n6. Бұл пәнге сурет қажет емес — "imageQuery" қоспа.`;

    const system = `Сен — ${grade}-сынып ${subjName} пәнінен ҰБТ/олимпиада деңгейіндегі тест құрастырушысың. Сұрақтарды ${LANG_NAMES[lang].native} жаз.${sourceBlock}

ҚАТАҢ ЕРЕЖЕЛЕР:
1. Дәл ${count} сұрақ.
2. Әр сұрақта 4 жауап нұсқасы, тек 1 ғана дұрыс. correctIndex 0..3 арасы.
3. Сұрақтар әртүрлі тақырыптардан алынсын — ${grade}-сынып ${subjName} бағдарламасы шеңберінде.
4. Сұрақтарды мағынасы жағынан араластыр.
5. Төмендегі ҚАЙТАЛАНБАУ ТІЗІМІНДЕГІ сұрақтарды қайта берме (мағынасы жағынан да ұқсамасын).${focusBlock}${imageRule}
7. Деңгей дәл ${grade}-сыныпқа сай болсын — артық қиын немесе тым жеңіл болмасын.
8. Әр сұрақ үшін "topic" өрісінде нақты тарау атауын көрсет (мысалы: "Алгебра — теңдеулер", "Цитология", "Ежелгі Қазақстан тарихы").

ҚАЙТАРЫЛАТЫН JSON ФОРМАТЫ:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"topic":"...","imageQuery":"..."}, ...]}

imageQuery өрісі міндетті емес. Тек JSON қайтар, басқа мәтін қоспа.`;

    const sourceBody = book?.content
      ? `===== ОҚУЛЫҚ (${grade}-сынып ${subjName}) =====\n${book.content.slice(0, 60000)}\n===== ОҚУЛЫҚ АЯҚТАЛДЫ =====`
      : `(Оқулық файлы жүктелмеген — мектеп бағдарламасының жалпы білім стандарттарын пайдалан.)`;

    const userMsg = `${sourceBody}

===== ҚАЙТАЛАНБАУ ТІЗІМІ (бұрын берілген сұрақтар) =====
${excludeList.length ? excludeList.map((q, i) => `${i + 1}. ${q}`).join("\n") : "(бос)"}
===== ТІЗІМ АЯҚТАЛДЫ =====

Енді ${count} жаңа сұрақ құрастыр.`;

    const parsed = await callAI(system, userMsg);
    const raw: unknown[] = Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions: OlympiadQuestion[] = raw
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

export const submitOlympiadTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SubmitInput) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const subject = String(data.subject);
    const grade = Number(data.grade);
    const total = data.results.length;
    const score = data.results.filter((r) => r.was_correct).length;
    const percent = total > 0 ? Math.round((score / total) * 10000) / 100 : 0;

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
        subject,
        grade,
        question: r.question,
        topic: r.topic,
        was_correct: r.was_correct,
      }));
      await supabase.from("asked_questions").insert(rows);
    }

    await supabase.from("test_attempts").insert({
      user_id: userId,
      subject,
      grade,
      score,
      total,
      percent,
      weak_topics: weakTopics,
    });

    return { score, total, percent, weakTopics };
  });
