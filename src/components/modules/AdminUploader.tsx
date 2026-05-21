import { useState } from "react";
import { Upload, Video, FileText, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

interface CourseItem { id: string; title: string; type: "video" | "doc"; url: string }

export function AdminUploader() {
  const t = useT();
  const [items, setItems] = useState<CourseItem[]>([
    { id: "1", title: t("Кіріспе дәріс — Педагогика негіздері", "Вводная лекция — Основы педагогики", "Intro lecture — Pedagogy basics"), type: "video", url: "intro-pedagogy.mp4" },
    { id: "2", title: t("ҚМЖ үлгісі — Математика", "Шаблон КСП — Математика", "Short-plan template — Math"), type: "doc", url: "math-qmj.pdf" },
  ]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"video" | "doc">("video");
  const [desc, setDesc] = useState("");

  const add = () => {
    if (!title || !url) return toast.error(t("Атау мен сілтемені толтырыңыз", "Заполните название и ссылку", "Fill in title and URL"));
    setItems([{ id: Date.now().toString(), title, type, url }, ...items]);
    setTitle(""); setUrl(""); setDesc("");
    toast.success(t("Жүйеге қосылды", "Добавлено в систему", "Added to system"));
  };
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="gradient-emerald flex h-11 w-11 items-center justify-center rounded-xl shadow-lg shadow-primary/30">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Admin жүктеу панелі", "Панель загрузки Admin", "Admin upload panel")}</h1>
          <p className="text-sm text-muted-foreground">{t("Жаңа курс материалдарын қосу", "Добавление новых материалов курса", "Add new course materials")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">{t("Жаңа материал қосу", "Добавить новый материал", "Add a new material")}</h3>
          <div className="space-y-4">
            <div>
              <Label>{t("Тип", "Тип", "Type")}</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button onClick={() => setType("video")} className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${type === "video" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <Video className="h-4 w-4" /> {t("Видео курс (mp4)", "Видео курс (mp4)", "Video course (mp4)")}
                </button>
                <button onClick={() => setType("doc")} className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${type === "doc" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <FileText className="h-4 w-4" /> {t("Құжат / PDF", "Документ / PDF", "Document / PDF")}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="t">{t("Атауы", "Название", "Title")}</Label>
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Курс атауы", "Название курса", "Course title")} />
            </div>
            <div>
              <Label htmlFor="u">{t("Сілтеме (storage URL)", "Ссылка (storage URL)", "Link (storage URL)")}</Label>
              <Input id="u" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://.../file.mp4" />
            </div>
            <div>
              <Label htmlFor="d">{t("Сипаттама", "Описание", "Description")}</Label>
              <Textarea id="d" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("Қысқаша сипаттама...", "Краткое описание...", "Short description...")} rows={3} />
            </div>
            <Button onClick={add} className="w-full gradient-emerald gap-2"><Upload className="h-4 w-4" /> {t("Жүктеу", "Загрузить", "Upload")}</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">{t("Қолданыстағы материалдар", "Существующие материалы", "Existing materials")} ({items.length})</h3>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${i.type === "video" ? "bg-blue-500/15 text-blue-500" : "bg-amber-500/15 text-amber-500"}`}>
                  {i.type === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{i.url}</div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
