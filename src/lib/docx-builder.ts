import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageOrientation,
} from "docx";
import { saveAs } from "file-saver";
import type { KmjStructured, BzhbStructured, TzhbStructured, AssessmentTask } from "@/lib/kmj.functions";

const BORDER = { style: BorderStyle.SINGLE, size: 6, color: "888888" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const HEAD_FILL = "D9EAD3";

function p(text: string, opts: { bold?: boolean; size?: number; align?: typeof AlignmentType[keyof typeof AlignmentType] } = {}) {
  return new Paragraph({
    alignment: opts.align,
    children: [new TextRun({ text: text || "", bold: opts.bold, size: opts.size ?? 22, font: "Times New Roman" })],
  });
}

function cell(text: string | Paragraph[], opts: { width?: number; bold?: boolean; fill?: string; align?: typeof AlignmentType[keyof typeof AlignmentType] } = {}) {
  const children = Array.isArray(text) ? text : [p(text, { bold: opts.bold, align: opts.align })];
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    borders: BORDERS,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    children,
  });
}

function headerInfoTable(rows: [string, string][]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 6240],
    rows: rows.map(([k, v]) => new TableRow({
      children: [
        cell(k, { width: 3120, bold: true, fill: HEAD_FILL }),
        cell(v || "—", { width: 6240 }),
      ],
    })),
  });
}

function bulletList(items: string[]): Paragraph[] {
  if (!items?.length) return [p("—")];
  return items.map((t) =>
    new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text: t, size: 22, font: "Times New Roman" })],
    })
  );
}

// ============ KMJ ============
export async function downloadKmjDocx(plan: KmjStructured, filename = "QMJ.docx") {
  const h = plan.header;

  const stageRows = (rows: KmjStructured["stages"]["start"], label: string) => {
    const out: TableRow[] = [];
    out.push(new TableRow({
      children: [cell(label, { bold: true, fill: "B6D7A8" })],
      tableHeader: true,
    }));
    return out;
  };

  // Single stages table
  const stageHeader = new TableRow({
    tableHeader: true,
    children: [
      cell("Сабақ кезеңі", { width: 1800, bold: true, fill: HEAD_FILL }),
      cell("Уақыты", { width: 1200, bold: true, fill: HEAD_FILL }),
      cell("Мұғалім әрекеті", { width: 3000, bold: true, fill: HEAD_FILL }),
      cell("Оқушы әрекеті", { width: 2200, bold: true, fill: HEAD_FILL }),
      cell("Ресурстар", { width: 1160, bold: true, fill: HEAD_FILL }),
    ],
  });

  const allStages = [
    { label: "Сабақтың басы", arr: plan.stages?.start || [] },
    { label: "Сабақтың ортасы", arr: plan.stages?.middle || [] },
    { label: "Сабақтың соңы", arr: plan.stages?.end || [] },
  ];

  const stageRowsAll: TableRow[] = [stageHeader];
  for (const group of allStages) {
    stageRowsAll.push(new TableRow({
      children: [new TableCell({
        columnSpan: 5, borders: BORDERS,
        shading: { fill: "B6D7A8", type: ShadingType.CLEAR, color: "auto" },
        children: [p(group.label, { bold: true })],
      })],
    }));
    for (const s of group.arr) {
      stageRowsAll.push(new TableRow({
        children: [
          cell(s.stage, { width: 1800 }),
          cell(s.time, { width: 1200 }),
          cell(s.teacherActions, { width: 3000 }),
          cell(s.studentActions, { width: 2200 }),
          cell(s.resources, { width: 1160 }),
        ],
      }));
    }
  }

  const stagesTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 1200, 3000, 2200, 1160],
    rows: stageRowsAll,
  });

  const doc = new Document({
    creator: "Qazaq Teachers AI",
    styles: { default: { document: { run: { font: "Times New Roman", size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT }, margin: { top: 1000, right: 1000, bottom: 1000, left: 1200 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Қысқа мерзімді жоспар (ҚМЖ)", bold: true, size: 32, font: "Times New Roman" })] }),
        p(""),
        headerInfoTable([
          ["Мектеп:", h.school],
          ["Күні:", h.date],
          ["Мұғалімнің аты-жөні:", h.teacher],
          ["Сынып:", h.grade],
          ["Пән:", h.subject],
          ["Бөлім:", h.section],
          ["Сабақтың тақырыбы:", h.topic],
          ["Қатысқандар саны:", h.presentCount],
          ["Қатыспағандар саны:", h.absentCount],
        ]),
        p(""),
        p("Осы сабақта қол жеткізілетін оқу мақсаттары", { bold: true, size: 24 }),
        ...bulletList(plan.learningObjectives),
        p(""),
        p("Сабақтың мақсаттары", { bold: true, size: 24 }),
        ...bulletList(plan.lessonObjectives),
        p(""),
        p("Бағалау критерийлері", { bold: true, size: 24 }),
        ...bulletList(plan.assessmentCriteria),
        p(""),
        p("Тілдік мақсаттар", { bold: true, size: 24 }),
        ...bulletList(plan.languageGoals),
        p(""),
        p("Құндылықтарды дарыту", { bold: true, size: 24 }),
        ...bulletList(plan.valueGoals),
        p(""),
        p("Алдыңғы білім", { bold: true, size: 24 }),
        p(plan.priorKnowledge),
        p(""),
        p("Сабақтың барысы", { bold: true, size: 26 }),
        p(""),
        stagesTable,
        p(""),
        p("Саралау (дифференциация)", { bold: true, size: 24 }),
        p(plan.differentiation),
        p(""),
        p("Бағалау", { bold: true, size: 24 }),
        p(plan.assessment),
        p(""),
        p("Денсаулық пен қауіпсіздік ережелерін сақтау", { bold: true, size: 24 }),
        p(plan.safety),
        p(""),
        p("Рефлексия", { bold: true, size: 24 }),
        p(plan.reflection),
        p(""),
        p("Үй тапсырмасы", { bold: true, size: 24 }),
        p(plan.homework),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// ============ Assessments (БЖБ / ТЖБ) ============
function taskTable(tasks: AssessmentTask[]): Table {
  const head = new TableRow({
    tableHeader: true,
    children: [
      cell("№", { width: 600, bold: true, fill: HEAD_FILL, align: AlignmentType.CENTER }),
      cell("Деңгей", { width: 1600, bold: true, fill: HEAD_FILL }),
      cell("ОМ коды", { width: 1400, bold: true, fill: HEAD_FILL }),
      cell("Тапсырма", { width: 4000, bold: true, fill: HEAD_FILL }),
      cell("Дескрипторлар", { width: 1100, bold: true, fill: HEAD_FILL }),
      cell("Балл", { width: 660, bold: true, fill: HEAD_FILL, align: AlignmentType.CENTER }),
    ],
  });
  const rows: TableRow[] = [head];
  for (const t of tasks) {
    const descParas = (t.descriptors || []).map((d) =>
      new Paragraph({
        children: [new TextRun({ text: `• ${d.text} — ${d.points} б.`, size: 22, font: "Times New Roman" })],
      })
    );
    rows.push(new TableRow({
      children: [
        cell(String(t.number), { width: 600, align: AlignmentType.CENTER }),
        cell(t.level, { width: 1600 }),
        cell(t.objectiveCode, { width: 1400 }),
        cell(t.text, { width: 4000 }),
        cell(descParas.length ? descParas : [p("—")], { width: 1100 }),
        cell(String(t.totalPoints), { width: 660, align: AlignmentType.CENTER, bold: true }),
      ],
    }));
  }
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 1600, 1400, 4000, 1100, 660],
    rows,
  });
}

function rubricTable(rubric: { mark: string; range: string }[]): Table {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("Баға", { width: 4680, bold: true, fill: HEAD_FILL }),
          cell("Балл аралығы", { width: 4680, bold: true, fill: HEAD_FILL }),
        ],
      }),
      ...rubric.map((r) =>
        new TableRow({
          children: [
            cell(r.mark, { width: 4680, bold: true }),
            cell(r.range, { width: 4680 }),
          ],
        })
      ),
    ],
  });
}

function objectivesTable(objs: { code: string; description: string }[]): Table {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 7560],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("Код", { width: 1800, bold: true, fill: HEAD_FILL }),
          cell("Оқу мақсаты", { width: 7560, bold: true, fill: HEAD_FILL }),
        ],
      }),
      ...objs.map((o) => new TableRow({
        children: [
          cell(o.code, { width: 1800, bold: true }),
          cell(o.description, { width: 7560 }),
        ],
      })),
    ],
  });
}

export async function downloadBzhbDocx(paper: BzhbStructured, filename = "BJB.docx") {
  const h = paper.header;
  const doc = new Document({
    creator: "Qazaq Teachers AI",
    styles: { default: { document: { run: { font: "Times New Roman", size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, right: 1000, bottom: 1000, left: 1200 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${h.subject} пәнінен ${h.term}-тоқсан бойынша БЖБ`, bold: true, size: 30, font: "Times New Roman" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `«${h.section}» бөлімі`, italics: true, size: 24, font: "Times New Roman" })] }),
        p(""),
        headerInfoTable([
          ["Пән:", h.subject],
          ["Сынып:", h.grade],
          ["Тоқсан:", h.term],
          ["Бөлім:", h.section],
          ["Орындау уақыты:", h.duration],
          ["Жалпы балл:", String(h.totalPoints)],
        ]),
        p(""),
        p("Тексерілетін оқу мақсаттары", { bold: true, size: 24 }),
        objectivesTable(paper.objectives),
        p(""),
        p("Тапсырмалар", { bold: true, size: 24 }),
        taskTable(paper.tasks),
        p(""),
        p("Бағалау рубрикасы", { bold: true, size: 24 }),
        rubricTable(paper.rubric),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export async function downloadTzhbDocx(paper: TzhbStructured, filename = "TJB.docx") {
  const h = paper.header;
  const children: (Paragraph | Table)[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${h.subject} пәнінен ${h.term}-тоқсан бойынша ТЖБ`, bold: true, size: 30, font: "Times New Roman" })] }),
    p(""),
    headerInfoTable([
      ["Пән:", h.subject],
      ["Сынып:", h.grade],
      ["Тоқсан:", h.term],
      ["Қамтылған бөлімдер:", h.sections],
      ["Орындау уақыты:", h.duration],
      ["Жалпы балл:", String(h.totalPoints)],
    ]),
    p(""),
    p("Тексерілетін оқу мақсаттары", { bold: true, size: 24 }),
    objectivesTable(paper.objectives),
    p(""),
  ];
  for (const v of paper.variants) {
    children.push(p(v.name, { bold: true, size: 26 }));
    children.push(taskTable(v.tasks));
    children.push(p(""));
  }
  children.push(p("Бағалау рубрикасы", { bold: true, size: 24 }));
  children.push(rubricTable(paper.rubric));

  const doc = new Document({
    creator: "Qazaq Teachers AI",
    styles: { default: { document: { run: { font: "Times New Roman", size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, right: 1000, bottom: 1000, left: 1200 } } },
      children,
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
