import { useState } from "react";
import { Upload, Video, FileText, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CourseItem { id: string; title: string; type: "video" | "doc"; url: string }

export function AdminUploader() {
  const [items, setItems] = useState<CourseItem[]>([
    { id: "1", title: "Кіріспе дәріс — Педагогика негіздері", type: "video", url: "intro-pedagogy.mp4" },
    { id: "2", title: "ҚМЖ үлгісі — Математика", type: "doc", url: "math-qmj.pdf" },
  ]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"video" | "doc">("video");
  const [desc, setDesc] = useState("");

  const add = () => {
    if (!title || !url) return toast.error("Атау мен сілтемені толтырыңыз");
    setItems([{ id: Date.now().toString(), title, type, url }, ...items]);
    setTitle(""); setUrl(""); setDesc("");
    toast.success("Жүйеге қосылды");
  };
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="gradient-emerald flex h-11 w-11 items-center justify-center rounded-xl shadow-lg shadow-primary/30">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin жүктеу панелі</h1>
          <p className="text-sm text-muted-foreground">Жаңа курс материалдарын қосу</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">Жаңа материал қосу</h3>
          <div className="space-y-4">
            <div>
              <Label>Тип</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button onClick={() => setType("video")} className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${type === "video" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <Video className="h-4 w-4" /> Видео курс (mp4)
                </button>
                <button onClick={() => setType("doc")} className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${type === "doc" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <FileText className="h-4 w-4" /> Құжат / PDF
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="t">Атауы</Label>
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Курс атауы" />
            </div>
            <div>
              <Label htmlFor="u">Сілтеме (storage URL)</Label>
              <Input id="u" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://.../file.mp4" />
            </div>
            <div>
              <Label htmlFor="d">Сипаттама</Label>
              <Textarea id="d" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Қысқаша сипаттама..." rows={3} />
            </div>
            <Button onClick={add} className="w-full gradient-emerald gap-2"><Upload className="h-4 w-4" /> Жүктеу</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold">Қолданыстағы материалдар ({items.length})</h3>
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
