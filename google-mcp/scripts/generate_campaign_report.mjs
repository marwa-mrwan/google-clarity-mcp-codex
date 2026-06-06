import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SpreadsheetFile,
  Workbook,
} from "../node_modules_runtime/@oai/artifact-tool/dist/artifact_tool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function styleTitle(sheet, cellRange, title, subtitle) {
  sheet.getRange(cellRange).merge();
  const titleRange = sheet.getRange(cellRange);
  titleRange.values = [[`${title}\n${subtitle}`]];
  titleRange.format.fill = "#0f172a";
  titleRange.format.font = { bold: true, size: 16, color: "#ffffff", name: "Arial" };
  titleRange.format.wrapText = true;
  titleRange.format.rowHeightPx = 52;
  titleRange.format.horizontalAlignment = "center";
  titleRange.format.verticalAlignment = "center";
}

function styleHeader(range) {
  range.format.fill = "#dbeafe";
  range.format.font = { bold: true, size: 11, color: "#0f172a", name: "Arial" };
  range.format.wrapText = true;
  range.format.horizontalAlignment = "center";
  range.format.verticalAlignment = "center";
  range.format.rowHeightPx = 26;
  range.format.borders = { preset: "outside", style: "thin", color: "#93c5fd" };
}

function styleBody(range) {
  range.format.font = { size: 10, color: "#1f2937", name: "Arial" };
  range.format.wrapText = true;
  range.format.verticalAlignment = "center";
  range.format.horizontalAlignment = "right";
  range.format.borders = { preset: "outside", style: "thin", color: "#e5e7eb" };
}

function shadeAlternating(sheet, startRow, endRow, lastCol) {
  for (let row = startRow; row <= endRow; row += 1) {
    if ((row - startRow) % 2 === 1) {
      sheet.getRange(`A${row}:${lastCol}${row}`).format.fill = "#f8fafc";
    }
  }
}

async function main() {
  const summaryRows = [
    ["Item", "Value", "Notes"],
    ["Report Date", "2026-04-27", "Analysis through end of day 27 April 2026"],
    ["Campaign Window", "2026-04-14 to 2026-04-27", "Google Ads + Search Terms"],
    ["Top Campaign", "اورام الثدي - الغده - الكبد", "471 clicks, 28 conversions, 7479.11 EGP spend"],
    ["Weak Campaign", "بنكرياس - قولون - مراره", "32 clicks, 0 conversions, 1857.49 EGP spend"],
    ["Best Ad Group", "اورام الكبد", "173 clicks, 19 conversions, CPA about 124.5 EGP"],
    ["Second Best Ad Group", "الغدة الدرقيه", "117 clicks, 6 conversions, CPA about 320 EGP"],
    ["Underperforming Ad Group", "أورام الثدي", "171 clicks, 3 conversions, CPA about 979 EGP"],
    ["Immediate Budget Move", "Shift spend from pancreas/colon/stomach/gallbladder to liver + thyroid", "Priority: High"],
    ["Tracking Limitation", "GA4/GSC mapping for kerollousmedhat.com was not usable from current connector", "Ads and search terms are reliable"],
  ];

  const keywordActionRows = [
    ["Keyword / Search Term", "Type", "Current Signal", "Clicks", "Conversions", "Cost EGP", "Action", "Priority", "Reason"],
    ["افضل دكتور اورام في مصر", "Search Term", "NONE", 2, 1, 17.46, "Add as Exact", "High", "Only new search term with direct conversion and strong doctor intent"],
    ["دكتور اورام كبد بالقاهرة", "Search Term", "ADDED", 3, 1, 52.25, "Keep + strengthen ad copy", "High", "Converted and geo intent is strong"],
    ["اورام الغدة الدرقية", "Search Term", "ADDED", 11, 1, 175.19, "Keep core Exact", "High", "Best thyroid search term by volume and conversion"],
    ["عملية الغدة الدرقية", "Search Term", "NONE", 8, 0, 107.15, "Add as Exact + Phrase test", "High", "Strong procedural intent, enough clicks to test"],
    ["استئصال الغدة الدرقية", "Search Term", "ADDED", 2, 0, 40.74, "Keep + pin in ad headline", "High", "Core procedure term; already proven in keyword data"],
    ["دكتور اورام ثدي", "Search Term", "ADDED", 5, 0, 132.46, "Keep, no expansion yet", "Medium", "High intent but no search-term conversion yet"],
    ["دكتور اورام في الدقي", "Search Term", "NONE", 1, 1, 10.76, "Add as Exact if location targeting fits", "Medium", "Conversion exists but sample is very small"],
    ["علاج سرطان الكبد", "Search Term", "ADDED", 3, 0, 85.31, "Keep but lower bid pressure", "Medium", "Relevant, but search-term conversion not shown here"],
    ["علاج ورم حميد في الغدة الدرقية", "Search Term", "NONE", 4, 0, 47.22, "Add as Negative Phrase", "High", "Benign/informational intent"],
    ["علاج سرطان الثدي", "Search Term", "ADDED", 7, 0, 131.41, "Reduce bid", "Medium", "Traffic exists but no conversion yet"],
    ["علاج كانسر الثدي", "Search Term", "NONE", 3, 0, 49.50, "Do not add", "Medium", "Alternative wording with no conversion"],
    ["اشرف الزيات اورام", "Search Term", "NONE", 3, 0, 52.09, "Add competitor negative", "High", "Competitor intent"],
    ["افضل دكتور اورام ثدي في طنطا", "Search Term", "NONE", 2, 0, 36.24, "Add location negative if not targeted", "Medium", "Out-of-area query"],
    ["العلاج الهرموني لسرطان الثدي", "Search Term", "NONE", 2, 0, 17.89, "Add informational negative", "High", "Treatment research intent, not booking intent"],
    ["دلالات اورام الغدة الدرقية", "Search Term", "NONE", 2, 0, 24.86, "Add informational negative", "High", "Diagnostic marker intent"],
    ["كم تكلفة عملية استئصال الغدة الدرقية", "Search Term", "NONE", 2, 0, 38.31, "Negative or separate pricing test", "Medium", "Price-only intent"],
    ["متى يجب استئصال الغدة الدرقية", "Search Term", "NONE", 2, 0, 37.90, "Add informational negative", "High", "Research intent"],
    ["استئصال القولون", "Keyword/Search Term", "ADDED", 1, 0, 59.55, "Pause", "High", "High CPC, no conversions, weak campaign"],
    ["كيف يتم التبرز بعد استئصال القولون", "Search Term", "NONE", 2, 0, 112.08, "Add negative phrase", "High", "Pure informational after-surgery query"],
    ["ورم القناة المرارية الحميد", "Search Term", "NONE", 2, 0, 112.02, "Add negative phrase", "High", "Benign intent, expensive, no conversion"],
    ["ورم على البنكرياس", "Keyword/Search Term", "ADDED", 1, 0, 75.44, "Pause", "High", "Expensive, no conversion"],
    ["ورم المعدة الحميد", "Keyword/Search Term", "ADDED", 1, 0, 70.12, "Pause + negative benign", "High", "Benign intent and expensive"],
    ["افضل دكتور جراحة اورام القولون", "Search Term", "NONE", 1, 0, 88.78, "Do not add yet", "Medium", "Intent is strong but CPC is very high and no conversion"],
    ["هل ورم البنكرياس خطير", "Search Term", "NONE", 1, 0, 86.02, "Add informational negative", "High", "Research intent and expensive"],
    ["طريقة علاج سرطان القولون", "Search Term", "NONE", 1, 0, 80.22, "Add informational negative", "High", "Treatment research intent"],
    ["سعر جلسة الكيماوي لسرطان القولون", "Search Term", "NONE", 1, 0, 70.01, "Add pricing/chemo negative", "High", "Not aligned with surgical lead intent"],
  ];

  const adImprovementRows = [
    ["Ad Group", "Current Issue", "Change Required", "Example Headline 1", "Example Headline 2", "Example Description", "Priority"],
    ["اورام الكبد", "Strong performance but headlines include broad generic variants", "Pin the main search terms in top positions and reduce generic headlines", "علاج أورام الكبد", "دكتور أورام كبد بالقاهرة", "تشخيص دقيق وخطة علاج واضحة لحالات أورام الكبد مع د. كيرلس مدحت.", "High"],
    ["اورام الكبد", "Name inconsistency", "Unify doctor name across all ads and pages", "د. كيرلس مدحت", "استشارة متخصصة لأورام الكبد", "احجز الآن لتقييم الحالة وتحديد الإجراء المناسب.", "High"],
    ["الغدة الدرقيه", "Best procedural terms are not leading the ad strongly enough", "Pin procedure-first headlines", "استئصال الغدة الدرقية", "عملية الغدة الدرقية", "خبرة في جراحات الغدة الدرقية مع تقييم دقيق واختيار التدخل المناسب.", "High"],
    ["الغدة الدرقيه", "Arabic typo in current RSA", "Replace 'اسشر' with 'استشر' and remove weak generic lines", "دكتور جراحة الغدة الدرقية", "علاج أورام الغدة الدرقية", "احجز مع د. كيرلس مدحت لتقييم الحالة ووضع خطة علاج مناسبة.", "High"],
    ["أورام الثدي", "High clicks, low conversion efficiency", "Shift message from awareness to booking intent and remove weak broad messaging", "دكتور أورام ثدي", "جراحة أورام الثدي", "تقييم دقيق لحالات أورام الثدي وخطة علاج واضحة مع متابعة متخصصة.", "High"],
    ["أورام الثدي", "Search terms include competitor and informational traffic", "Tighten copy around consultation and surgical decision", "احجزي كشفك الآن", "استشارة متخصصة للثدي", "احجزي الآن مع د. كيرلس مدحت لتحديد أنسب إجراء علاجي.", "High"],
    ["أورام المعدة", "Landing page mismatch and zero conversions", "Either pause or point only to dedicated stomach messaging if retained", "علاج أورام المعدة", "جراحة أورام المعدة", "استشارة متخصصة لحالات أورام المعدة مع تقييم واضح للحالة.", "High"],
    ["اورام القولون", "Very high CPC and informational search terms", "Pause current ad group or rebuild with narrow surgical intent only", "استئصال ورم القولون", "دكتور جراحة أورام القولون", "احجز تقييمًا واضحًا وخيارات علاج مناسبة لحالات أورام القولون.", "High"],
    ["أورام البنكرياس", "Expensive clicks without results", "Pause until better terms or conversion evidence appear", "علاج أورام البنكرياس", "جراحة أورام البنكرياس", "رعاية متخصصة لحالات البنكرياس مع تقييم دقيق قبل أي إجراء.", "High"],
    ["All active RSAs", "Formatting issues", "Fix typos: 'الجراحةالعامة' -> 'الجراحة العامة', 'خبرةفي' -> 'خبرة في'", "", "", "", "High"],
  ];

  const negativePatternRows = [
    ["Negative Theme", "Use As", "Examples from Search Terms"],
    ["Competitors", "Negative Phrase", "اشرف الزيات اورام / دكتور تامر النحاس اورام / دكتور هاني وليم اورام"],
    ["Informational", "Negative Phrase", "كيف / هل / متى / ما هو / ما هي / دلالات / اعراض / انواع"],
    ["Benign Intent", "Negative Phrase", "الحميد / ورم المعدة الحميد / ورم القناة المرارية الحميد"],
    ["Price-Only", "Negative Phrase", "كم تكلفة / سعر جلسة الكيماوي"],
    ["Content Intent", "Negative Phrase", "فيديو / تجربتي"],
    ["Chemo/Non-surgical Research", "Negative Phrase", "العلاج الهرموني / الكيماوي / العلاج الموجه"],
  ];

  const notesRows = [
    ["Note", "Detail"],
    ["Search Terms Scope", "Pulled from live Google Ads search_term_view for campaigns 23757943429 and 23769413978 through 2026-04-27."],
    ["Decision Rule", "Add only terms with conversion or strong commercial/doctor/procedure intent plus enough click volume."],
    ["Campaign Recommendation", "Keep scaling liver and thyroid. Limit stomach/colon/pancreas/gallbladder until conversions appear."],
    ["Site Recommendation", "Mobile speed remains weak; slower landing can suppress paid conversion rate."],
  ];

  const workbook = Workbook.create();
  const summarySheet = workbook.worksheets.add("Summary");
  styleTitle(summarySheet, "A1:C2", "ملخص تعديلات حملة د. كيرلس مدحت", "الفترة: 14 إلى 27 أبريل 2026");
  summarySheet.getRange(`A4:C${summaryRows.length + 3}`).values = summaryRows;
  styleHeader(summarySheet.getRange("A4:C4"));
  styleBody(summarySheet.getRange(`A5:C${summaryRows.length + 3}`));
  shadeAlternating(summarySheet, 5, summaryRows.length + 3, "C");
  summarySheet.getRange("A:A").format.columnWidthPx = 190;
  summarySheet.getRange("B:B").format.columnWidthPx = 210;
  summarySheet.getRange("C:C").format.columnWidthPx = 420;
  summarySheet.freezePanes.freezeRows(4);

  const keywordSheet = workbook.worksheets.add("Keyword Actions");
  styleTitle(keywordSheet, "A1:I2", "إجراءات الكلمات والـ Search Terms", "إضافة - إيقاف - استبعاد - تخفيض");
  keywordSheet.getRange(`A4:I${keywordActionRows.length + 3}`).values = keywordActionRows;
  styleHeader(keywordSheet.getRange("A4:I4"));
  styleBody(keywordSheet.getRange(`A5:I${keywordActionRows.length + 3}`));
  shadeAlternating(keywordSheet, 5, keywordActionRows.length + 3, "I");
  keywordSheet.getRange("A:A").format.columnWidthPx = 220;
  keywordSheet.getRange("B:B").format.columnWidthPx = 105;
  keywordSheet.getRange("C:C").format.columnWidthPx = 100;
  keywordSheet.getRange("D:F").format.columnWidthPx = 90;
  keywordSheet.getRange("G:G").format.columnWidthPx = 170;
  keywordSheet.getRange("H:H").format.columnWidthPx = 80;
  keywordSheet.getRange("I:I").format.columnWidthPx = 360;
  keywordSheet.freezePanes.freezeRows(4);
  keywordSheet.getRange(`H5:H${keywordActionRows.length + 3}`).conditionalFormats.add('containsText', {
    text: 'High',
    format: { fill: '#dcfce7', font: { color: '#166534', bold: true } },
  });
  keywordSheet.getRange(`G5:G${keywordActionRows.length + 3}`).conditionalFormats.add('containsText', {
    text: 'Pause',
    format: { fill: '#fee2e2', font: { color: '#991b1b', bold: true } },
  });
  keywordSheet.getRange(`G5:G${keywordActionRows.length + 3}`).conditionalFormats.add('containsText', {
    text: 'Negative',
    format: { fill: '#ffedd5', font: { color: '#9a3412', bold: true } },
  });
  keywordSheet.getRange(`G5:G${keywordActionRows.length + 3}`).conditionalFormats.add('containsText', {
    text: 'Add',
    format: { fill: '#dbeafe', font: { color: '#1d4ed8', bold: true } },
  });

  const adSheet = workbook.worksheets.add("Ad Improvements");
  styleTitle(adSheet, "A1:G2", "تحسينات الإعلانات", "صياغة أقوى وربط أفضل مع نية البحث");
  adSheet.getRange(`A4:G${adImprovementRows.length + 3}`).values = adImprovementRows;
  styleHeader(adSheet.getRange("A4:G4"));
  styleBody(adSheet.getRange(`A5:G${adImprovementRows.length + 3}`));
  shadeAlternating(adSheet, 5, adImprovementRows.length + 3, "G");
  adSheet.getRange("A:A").format.columnWidthPx = 145;
  adSheet.getRange("B:B").format.columnWidthPx = 250;
  adSheet.getRange("C:C").format.columnWidthPx = 250;
  adSheet.getRange("D:E").format.columnWidthPx = 180;
  adSheet.getRange("F:F").format.columnWidthPx = 320;
  adSheet.getRange("G:G").format.columnWidthPx = 80;
  adSheet.freezePanes.freezeRows(4);
  adSheet.getRange(`G5:G${adImprovementRows.length + 3}`).conditionalFormats.add('containsText', {
    text: 'High',
    format: { fill: '#dcfce7', font: { color: '#166534', bold: true } },
  });

  const negativeSheet = workbook.worksheets.add("Negative Themes");
  styleTitle(negativeSheet, "A1:C2", "أنماط الكلمات السلبية", "لاستبعاد الزيارات غير المؤهلة");
  negativeSheet.getRange(`A4:C${negativePatternRows.length + 3}`).values = negativePatternRows;
  styleHeader(negativeSheet.getRange("A4:C4"));
  styleBody(negativeSheet.getRange(`A5:C${negativePatternRows.length + 3}`));
  shadeAlternating(negativeSheet, 5, negativePatternRows.length + 3, "C");
  negativeSheet.getRange("A:A").format.columnWidthPx = 180;
  negativeSheet.getRange("B:B").format.columnWidthPx = 130;
  negativeSheet.getRange("C:C").format.columnWidthPx = 420;
  negativeSheet.freezePanes.freezeRows(4);

  const notesSheet = workbook.worksheets.add("Notes");
  styleTitle(notesSheet, "A1:B2", "ملاحظات تنفيذية", "نطاق البيانات وحدود الربط الحالية");
  notesSheet.getRange(`A4:B${notesRows.length + 3}`).values = notesRows;
  styleHeader(notesSheet.getRange("A4:B4"));
  styleBody(notesSheet.getRange(`A5:B${notesRows.length + 3}`));
  shadeAlternating(notesSheet, 5, notesRows.length + 3, "B");
  notesSheet.getRange("A:A").format.columnWidthPx = 180;
  notesSheet.getRange("B:B").format.columnWidthPx = 520;
  notesSheet.freezePanes.freezeRows(4);

  const outputDir = path.resolve(__dirname, "..", "outputs", "campaign-report-20260427");
  await fs.mkdir(outputDir, { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  const outPath = path.join(outputDir, "kirolos-medhat-campaign-report-2026-04-27.xlsx");
  await output.save(outPath);
  console.log(outPath);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
