import type { ExportData } from "@/app/actions/export/get-export-data";

/**
 * Generate a PDF report for the given month's transactions.
 *
 * Uses dynamic import to keep jspdf out of the main bundle.
 * Japanese text is rendered using the built-in Helvetica font with
 * Unicode support via jspdf-autotable.
 */
export async function generatePdf(data: ExportData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Title
  doc.setFontSize(18);
  doc.text(`AssetLens Monthly Report`, 14, 20);

  doc.setFontSize(12);
  doc.text(`Period: ${data.month}`, 14, 28);

  // Summary section
  doc.setFontSize(14);
  doc.text("Summary", 14, 40);

  autoTable(doc, {
    startY: 44,
    head: [["Item", "Amount"]],
    body: [
      ["Income", `+${data.summary.totalIncome.toLocaleString()}`],
      ["Expense", `-${data.summary.totalExpense.toLocaleString()}`],
      ["Balance", `${data.summary.balance.toLocaleString()}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10, halign: "right" },
    columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
    margin: { left: 14 },
    tableWidth: 80,
  });

  // Category breakdown
  const summaryEndY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;
  doc.setFontSize(14);
  doc.text("Category Breakdown", 14, summaryEndY);

  if (data.categoryBreakdown.length > 0) {
    autoTable(doc, {
      startY: summaryEndY + 4,
      head: [["Category", "Amount", "%"]],
      body: data.categoryBreakdown.map((c) => [
        c.category,
        `${c.amount.toLocaleString()}`,
        `${((c.amount / data.summary.totalExpense) * 100).toFixed(1)}%`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
      },
      margin: { left: 14 },
      tableWidth: 120,
    });
  }

  // Transaction table
  const catEndY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;
  doc.setFontSize(14);
  doc.text("Transactions", 14, catEndY);

  autoTable(doc, {
    startY: catEndY + 4,
    head: [["Date", "Type", "Category", "Description", "Store", "Amount"]],
    body: data.transactions.map((t) => [
      t.date,
      t.type === "収入" ? "Income" : "Expense",
      t.category,
      t.description,
      t.storeName,
      t.amount.toLocaleString(),
    ]),
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 16 },
      5: { halign: "right" },
    },
    margin: { left: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `AssetLens - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
  }

  return doc.output("blob");
}
