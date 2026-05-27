import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const generateKmj = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: KmjInput) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY жоқ");

    const langName = data.language === "ru" ? "орыс" : data.language === "en" ? "ағылшын" : "қазақ";

    const system = `Сен — Қазақстан мектебінің тәжірибелі мұғалімі әрі әдіскері. Мемлекеттік стандартқа сай толыққанды қысқа мерзімді жоспар (ҚМЖ) жасайсың. Жауапты ${langName} тілінде, нақты Markdown форматта қайтар.

ҚМЖ құрылымы:
# Қысқа мерзімді жоспар (ҚМЖ)

**Пән:** ...
**Сынып:** ...
**Бөлім:** ...
**Сабақтың тақырыбы:** ...
**Ұзақтығы:** ...
**Деңгей:** ...

## Оқыту мақсаты
...

## Сабақ мақсаттары
- ...

## Күтілетін нәтиже
- ...

## Сабақтың барысы

### 1. Ұйымдастыру кезеңі (5 мин)
...

### 2. Білімді өзектендіру (7 мин)
...

### 3. Жаңа сабақ (15 мин)
...

### 4. Бекіту / Тәжірибе (10 мин)
...

### 5. Рефлексия және бағалау (5 мин)
...

### 6. Үй тапсырмасы (3 мин)
...

## Дифференциация
- Қабілетті оқушыларға: ...
- Қолдау қажет оқушыларға: ...

## Бағалау критерийлері
- ...

## Ресурстар мен ИКТ
- ...`;

    const user = `Кіріс мәліметтер:
- Пән: ${data.subject}
- Сынып: ${data.grade}
- Бөлім: ${data.section || "-"}
- Тіл: ${langName}
- Тақырып: ${data.topic}
- Оқыту мақсаты: ${data.learningObjective}
- Сабақ мақсаттары: ${data.lessonGoals}
- Сабақ түрі: ${data.lessonType}
- Ұзақтығы: ${data.duration}
- Деңгей: ${data.level}
- ИКТ: ${data.ict}
- Бағдар: ${data.orientation}
- Суреттермен: ${data.withImages ? "иә" : "жоқ"}
- Қосымша тілектер: ${data.extraNotes || "-"}

Толық, дайын күйде басып шығаруға болатын ҚМЖ жаса.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!resp.ok) {
      if (resp.status === 429) throw new Error("Сұраныстар лимиті асып кетті, кейінірек көріңіз.");
      if (resp.status === 402) throw new Error("AI кредиттері таусылды.");
      throw new Error("AI қатесі: " + resp.status);
    }
    const json = await resp.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("AI бос жауап қайтарды");
    return { markdown: content };
  });
