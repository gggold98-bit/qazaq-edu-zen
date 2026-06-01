import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ============ Shared types ============
export interface KmjInput {
  subject: string;
  grade: string;
  section?: string;
  language: "kk" | "ru" | "en";
  topic: string;
  learningObjective: string;
  lessonGoals: string;
  lessonType: string;
  duration: string;
  level: string;
  ict: string;
  orientation: "portrait" | "landscape";
  withImages: boolean;
  extraNotes?: string;
}

export interface KmjStage {
  stage: string;
  time: string;
  teacherActions: string;
  studentActions: string;
  resources: string;
}

export interface KmjStructured {
  header: {
    school: string;
    date: string;
    teacher: string;
    grade: string;
    subject: string;
    topic: string;
    section: string;
    presentCount: string;
    absentCount: string;
  };
  learningObjectives: string[]; // codes + descriptions
  lessonObjectives: string[];
  assessmentCriteria: string[];
  languageGoals: string[];
  valueGoals: string[];
  priorKnowledge: string;
  stages: {
    start: KmjStage[];
    middle: KmjStage[];
    end: KmjStage[];
  };
  differentiation: string;
  assessment: string;
  safety: string;
  reflection: string;
  homework: string;
}

export interface BzhbInput {
  subject: string;
  grade: string;
  term: string; // 1..4
  section: string;
  language: "kk" | "ru" | "en";
  learningObjectives: string; // user-entered codes/descriptions
  duration: string; // e.g. "20 мин"
  totalPoints: string; // e.g. "15"
  extraNotes?: string;
}

export interface AssessmentTask {
  number: number;
  level: string; // Білу / Түсіну / Қолдану / ЖОДД
  objectiveCode: string;
  text: string;
  descriptors: { text: string; points: number }[];
  totalPoints: number;
}

export interface BzhbStructured {
  header: {
    subject: string;
    grade: string;
    term: string;
    section: string;
    duration: string;
    totalPoints: number;
  };
  objectives: { code: string; description: string }[];
  criteria: { code: string; description: string; level: string }[];
  tasks: AssessmentTask[];
  rubric: { mark: string; range: string }[];
}

export interface TzhbInput {
  subject: string;
  grade: string;
  term: string;
  language: "kk" | "ru" | "en";
  sections: string; // covered sections list
  learningObjectives: string;
  duration: string; // "40 мин"
  totalPoints: string;
  variants: string; // "1" or "2"
  extraNotes?: string;
}

export interface TzhbStructured {
  header: {
    subject: string;
    grade: string;
    term: string;
    sections: string;
    duration: string;
    totalPoints: number;
  };
  objectives: { code: string; description: string }[];
  variants: { name: string; tasks: AssessmentTask[] }[];
  rubric: { mark: string; range: string }[];
}

// ============ AI helper ============
async function callAI(system: string, user: string, json = true): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY жоқ");
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!resp.ok) {
    if (resp.status === 429) throw new Error("Сұраныстар лимиті асып кетті, кейінірек көріңіз.");
    if (resp.status === 402) throw new Error("AI кредиттері таусылды.");
    throw new Error("AI қатесі: " + resp.status);
  }
  const j = await resp.json();
  const content: string = j.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI бос жауап қайтарды");
  return content;
}

function langName(l: "kk" | "ru" | "en") {
  return l === "ru" ? "русском" : l === "en" ? "English" : "қазақ";
}

function parseJson<T>(raw: string): T {
  // Strip markdown fences if any
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

// ============ KMJ ============
export const generateKmj = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: KmjInput) => d)
  .handler(async ({ data }) => {
    const ln = langName(data.language);
    const system = `Сен — Қазақстан Республикасы Білім министрінің 2022 жылғы 12 тамыздағы №130 бұйрығы (жаңартылған мазмұндағы орта білім беру стандарты) талаптарына сәйкес қысқа мерзімді жоспар (ҚМЖ) жасайтын тәжірибелі әдіскер-мұғалімсің. Жауапты ${ln} тілінде, ТЕК таза JSON форматта (Markdown емес) қайтар.

JSON схема:
{
  "header": {"school":"","date":"","teacher":"","grade":"","subject":"","topic":"","section":"","presentCount":"","absentCount":""},
  "learningObjectives": ["10.1.2.3 - сипаттама..."],
  "lessonObjectives": ["Барлық оқушылар ...", "Көпшілігі ...", "Кейбірі ..."],
  "assessmentCriteria": ["...","...","..."],
  "languageGoals": ["Пәндік лексика: ...", "Диалог: ..."],
  "valueGoals": ["..."],
  "priorKnowledge": "...",
  "stages": {
    "start": [{"stage":"Ұйымдастыру","time":"0-3 мин","teacherActions":"...","studentActions":"...","resources":"..."}],
    "middle": [{"stage":"Жаңа материалды түсіндіру","time":"3-25 мин","teacherActions":"...","studentActions":"...","resources":"..."}],
    "end": [{"stage":"Рефлексия","time":"35-40 мин","teacherActions":"...","studentActions":"...","resources":"..."}]
  },
  "differentiation": "...",
  "assessment": "Қалыптастырушы бағалау: ...",
  "safety": "Қауіпсіздік ережелері: ...",
  "reflection": "Сабақ бойынша рефлексия сұрақтары: ...",
  "homework": "..."
}

Талаптар:
- Оқу мақсаттарының кодтары мен сипаттамалары МЖМБС-ке сай нақты болсын.
- Сабақ кезеңдері (start/middle/end) кестелік құрылым үшін бөлек берілсін.
- Әр кезеңде уақыт, мұғалім мен оқушы әрекеттері, ресурстар көрсетілсін.
- Дифференциация үш деңгейде көрсетілсін.
- Қалыптастырушы бағалау нақты дескрипторлармен.`;

    const user = `Кіріс:
Пән: ${data.subject}
Сынып: ${data.grade}
Бөлім: ${data.section || "автоматты түрде анықта"}
Тақырып: ${data.topic}
Оқыту мақсаты: ${data.learningObjective}
Сабақ мақсаттары: ${data.lessonGoals}
Сабақ түрі: ${data.lessonType}
Ұзақтығы: ${data.duration}
Деңгей: ${data.level}
ИКТ: ${data.ict}
Қосымша: ${data.extraNotes || "-"}

JSON-ды бір ғана нысан ретінде қайтар.`;

    const raw = await callAI(system, user, true);
    const parsed = parseJson<KmjStructured>(raw);
    return { plan: parsed };
  });

// ============ БЖБ ============
export const generateBzhb = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: BzhbInput) => d)
  .handler(async ({ data }) => {
    const ln = langName(data.language);
    const totalPts = parseInt(data.totalPoints) || 15;
    const system = `Сен — Қазақстан Республикасы Білім министрінің 2022 жылғы 12 тамыздағы №130 бұйрығына (критериалды бағалау ережелеріне) сай БЖБ (бөлім/тоқсан бойынша жиынтық бағалау - СОР) тапсырмаларын жасайтын әдіскерсің. ${ln} тілінде, ТЕК JSON қайтар.

Схема:
{
  "header": {"subject":"","grade":"","term":"","section":"","duration":"","totalPoints":${totalPts}},
  "objectives": [{"code":"10.1.2.3","description":"..."}],
  "criteria": [{"code":"А","description":"...","level":"Білу және түсіну"}],
  "tasks": [
    {
      "number":1,
      "level":"Білу және түсіну",
      "objectiveCode":"10.1.2.3",
      "text":"Тапсырманың толық мәтіні...",
      "descriptors":[{"text":"... көрсетеді","points":1},{"text":"... түсіндіреді","points":1}],
      "totalPoints":2
    }
  ],
  "rubric":[
    {"mark":"\"5\" - өте жақсы","range":"13-15 балл"},
    {"mark":"\"4\" - жақсы","range":"10-12 балл"},
    {"mark":"\"3\" - қанағаттанарлық","range":"6-9 балл"},
    {"mark":"\"2\" - қанағаттанарсыз","range":"0-5 балл"}
  ]
}

Талаптар:
- 4-6 тапсырма, Блум таксономиясы бойынша деңгейлерге бөлінген (Білу, Түсіну, Қолдану, ЖОДД-Талдау/Синтез/Бағалау).
- Әр тапсырма нақты ОМ кодына сілтеме жасасын.
- Дескрипторлар балл саны бойынша нақты әрі тексеруге ыңғайлы.
- Барлық тапсырманың жалпы баллы ${totalPts}-ге тең болсын.`;

    const user = `Кіріс:
Пән: ${data.subject}
Сынып: ${data.grade}
Тоқсан: ${data.term}
Бөлім: ${data.section}
Оқу мақсаттары: ${data.learningObjectives}
Ұзақтығы: ${data.duration}
Жалпы балл: ${totalPts}
Қосымша: ${data.extraNotes || "-"}

JSON қайтар.`;
    const raw = await callAI(system, user, true);
    return { paper: parseJson<BzhbStructured>(raw) };
  });

// ============ ТЖБ ============
export const generateTzhb = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: TzhbInput) => d)
  .handler(async ({ data }) => {
    const ln = langName(data.language);
    const totalPts = parseInt(data.totalPoints) || 20;
    const variantCount = Math.max(1, Math.min(4, parseInt(data.variants) || 2));
    const system = `Сен — Қазақстан Республикасы Білім министрінің 2022 жылғы 12 тамыздағы №130 бұйрығына сай ТЖБ (тоқсандық жиынтық бағалау - СОЧ) тапсырмаларын жасайтын әдіскерсің. ${ln} тілінде, ТЕК JSON қайтар.

Схема:
{
  "header":{"subject":"","grade":"","term":"","sections":"","duration":"","totalPoints":${totalPts}},
  "objectives":[{"code":"","description":""}],
  "variants":[
    {
      "name":"1-нұсқа",
      "tasks":[
        {"number":1,"level":"Білу","objectiveCode":"","text":"...","descriptors":[{"text":"","points":1}],"totalPoints":1}
      ]
    }
  ],
  "rubric":[
    {"mark":"\"5\" - өте жақсы","range":"..."},
    {"mark":"\"4\" - жақсы","range":"..."},
    {"mark":"\"3\" - қанағаттанарлық","range":"..."},
    {"mark":"\"2\" - қанағаттанарсыз","range":"..."}
  ]
}

Талаптар:
- ${variantCount} нұсқа жаса, әр нұсқада 6-10 тапсырма болсын.
- Тапсырмалар тоқсан барысында өтілген бөлімдерді қамтуы тиіс.
- Блум таксономиясы бойынша 4 деңгейге бөл: Білу/Түсіну, Қолдану, ЖОДД.
- Әр нұсқаның жалпы баллы ${totalPts}-ге тең.
- Дескрипторлар нақты және балл бойынша бөлінсін.`;

    const user = `Кіріс:
Пән: ${data.subject}
Сынып: ${data.grade}
Тоқсан: ${data.term}
Бөлімдер: ${data.sections}
ОМ: ${data.learningObjectives}
Ұзақтығы: ${data.duration}
Жалпы балл: ${totalPts}
Нұсқа саны: ${variantCount}
Қосымша: ${data.extraNotes || "-"}

JSON қайтар.`;
    const raw = await callAI(system, user, true);
    return { paper: parseJson<TzhbStructured>(raw) };
  });
