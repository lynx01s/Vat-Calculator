"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  VAT_DIVISOR,
  PriceRow,
  calcRow,
  formatTHB,
  generateDefaultRows,
} from "@/lib/vat";
import { useToast } from "@/lib/useToast";

let _cid = 0;

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Sun: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Reset: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

// ── Toast display ─────────────────────────────────────────────────────────────
function ToastList({ toasts }: { toasts: ReturnType<typeof useToast>["toasts"] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={`
              toast px-4 py-2.5 rounded-xl text-sm font-sans font-medium shadow-lg border
              ${t.type === "success"
                ? "bg-white dark:bg-card-dark border-border dark:border-border-dark text-ink dark:text-ink-light"
                : t.type === "error"
                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
                : "bg-white dark:bg-card-dark border-border dark:border-border-dark text-ink dark:text-ink-light"
              }
            `}
          >
            {t.type === "success" && <span className="text-ok mr-1.5">✓</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Inline edit cell ──────────────────────────────────────────────────────────
function EditableCell({
  row,
  onSave,
  onCancel,
}: {
  row: PriceRow;
  onSave: (gross: number, label: string) => void;
  onCancel: () => void;
}) {
  const [gross, setGross] = useState(String(row.grossPrice));
  const [label, setLabel] = useState(row.label);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const save = () => {
    const val = parseFloat(gross.replace(/,/g, ""));
    if (isNaN(val) || val <= 0) return;
    onSave(val, label.trim() || `฿${formatTHB(val, 0)}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }}
        className="border border-border dark:border-border-dark rounded-lg px-2 py-1 text-xs font-sans bg-surface dark:bg-surface-dark text-ink dark:text-ink-light outline-none focus:border-accent w-28"
        placeholder="Label"
      />
      <input
        ref={inputRef}
        type="number"
        value={gross}
        onChange={(e) => setGross(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }}
        className="border border-border dark:border-border-dark rounded-lg px-2 py-1 text-xs font-mono bg-surface dark:bg-surface-dark text-ink dark:text-ink-light outline-none focus:border-accent w-24"
        placeholder="Amount"
      />
      <button onClick={save} className="p-1.5 rounded-lg bg-accent text-white hover:opacity-80 transition-opacity">
        <Icon.Check />
      </button>
      <button onClick={onCancel} className="p-1.5 rounded-lg border border-border dark:border-border-dark text-muted hover:text-ink dark:hover:text-ink-light transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VATTable() {
  const [rows, setRows] = useState<PriceRow[]>(generateDefaultRows());
  const [dark, setDark] = useState(false);
  const [customAmt, setCustomAmt] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<"label" | "gross" | "net" | "vat" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { toasts, push } = useToast();

  // dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // flash helper
  const flash = (id: string) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1500);
  };

  // sort handler
  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortArrow = ({ col }: { col: typeof sortCol }) => (
    <span className={`ml-1 transition-opacity ${sortCol === col ? "opacity-100" : "opacity-30"}`}>
      {sortCol === col && sortDir === "desc" ? "↓" : "↑"}
    </span>
  );

  // filtered + sorted rows
  const displayRows = [...rows]
    .filter((r) =>
      search.trim() === "" ||
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      String(r.grossPrice).includes(search)
    )
    .sort((a, b) => {
      if (!sortCol) return 0;
      const map: Record<string, number> = {
        label: a.label.localeCompare(b.label),
        gross: a.grossPrice - b.grossPrice,
        net:   a.netPrice - b.netPrice,
        vat:   a.vatAmount - b.vatAmount,
      };
      return sortDir === "asc" ? map[sortCol] : -map[sortCol];
    });

  // add row
  const addRow = useCallback(() => {
    const val = parseFloat(customAmt.replace(/,/g, ""));
    if (isNaN(val) || val <= 0) { setError("Please enter a valid amount."); return; }
    if (val > 10_000_000) { setError("Amount too large (max 10,000,000)."); return; }
    setError("");
    const id = `custom-${++_cid}`;
    const label = customLabel.trim() || `฿${formatTHB(val, 0)}`;
    setRows((p) => [...p, calcRow(val, label, id, true)]);
    setCustomAmt("");
    setCustomLabel("");
    flash(id);
    push("Row added");
  }, [customAmt, customLabel, push]);

  // edit save
  const saveEdit = useCallback((id: string, gross: number, label: string) => {
    setRows((p) => p.map((r) => r.id === id ? calcRow(gross, label, id, r.isCustom) : r));
    setEditingId(null);
    flash(id);
    push("Row updated");
  }, [push]);

  // delete
  const deleteRow = useCallback((id: string) => {
    setRows((p) => p.filter((r) => r.id !== id));
    push("Row removed", "info");
  }, [push]);

  // copy single row
  const copyRow = useCallback((row: PriceRow) => {
    const text = `${row.label}\tGross: ฿${formatTHB(row.grossPrice)}\tNet: ฿${formatTHB(row.netPrice)}\tVAT: ฿${formatTHB(row.vatAmount)}`;
    navigator.clipboard.writeText(text).then(() => push("Copied to clipboard"));
  }, [push]);

  // copy all as TSV
  const copyAll = useCallback(() => {
    const header = "Label\tPrice incl. VAT\tBefore VAT\tVAT Amount";
    const body = rows.map((r) =>
      `${r.label}\t${formatTHB(r.grossPrice)}\t${formatTHB(r.netPrice)}\t${formatTHB(r.vatAmount)}`
    ).join("\n");
    navigator.clipboard.writeText(`${header}\n${body}`).then(() =>
      push(`Copied ${rows.length} rows to clipboard`)
    );
  }, [rows, push]);

  // export CSV
  const exportCSV = useCallback(() => {
    const header = "Label,Price incl. VAT (฿),Before VAT (฿),VAT Amount (฿)";
    const body = rows.map((r) =>
      `"${r.label}",${r.grossPrice.toFixed(2)},${r.netPrice.toFixed(2)},${r.vatAmount.toFixed(2)}`
    ).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vat-prices.csv"; a.click();
    URL.revokeObjectURL(url);
    push("CSV exported");
  }, [rows, push]);

  // export Excel via xlsx
  const exportExcel = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");
      const data = [
        ["Label", "Price incl. VAT (฿)", "Before VAT (฿)", "VAT Amount (฿)"],
        ...rows.map((r) => [r.label, r.grossPrice, r.netPrice, r.vatAmount]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 22 }, { wch: 20 }, { wch: 18 }, { wch: 16 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "VAT Prices");
      XLSX.writeFile(wb, "vat-prices.xlsx");
      push("Excel file exported");
    } catch {
      push("Export failed", "error");
    }
  }, [rows, push]);

  // reset
  const reset = useCallback(() => {
    setRows(generateDefaultRows());
    setSearch("");
    setSortCol(null);
    push("Reset to defaults", "info");
  }, [push]);

  // ── Shared classes ──────────────────────────────────────────────────────────
  const inputCls = "border border-border dark:border-border-dark rounded-xl px-3.5 py-2.5 text-sm font-sans bg-white dark:bg-card-dark text-ink dark:text-ink-light outline-none focus:border-accent transition-colors placeholder:text-muted dark:placeholder:text-muted-dark";
  const btnGhost = "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-medium border border-border dark:border-border-dark text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light hover:border-ink dark:hover:border-ink-light transition-all";

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark transition-colors duration-300 px-4 py-8 md:px-8">
      <ToastList toasts={toasts} />

      {/* ── Header ── */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-muted dark:text-muted-dark uppercase mb-1.5">
              Thai Baht · ÷ {VAT_DIVISOR} · VAT Breakdown
            </p>
            <h1 className="text-3xl md:text-4xl font-sans font-semibold text-ink dark:text-ink-light tracking-tight">
              VAT Price Calculator
            </h1>
          </div>

          {/* toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={copyAll} className={btnGhost} title="Copy all rows as tab-separated">
              <Icon.Copy /><span>Copy all</span>
            </button>
            <button onClick={exportCSV} className={btnGhost} title="Download CSV">
              <Icon.Download /><span>CSV</span>
            </button>
            <button onClick={exportExcel} className={btnGhost} title="Download Excel">
              <Icon.Download /><span>Excel</span>
            </button>
            <button onClick={reset} className={btnGhost} title="Reset to defaults">
              <Icon.Reset /><span>Reset</span>
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className={btnGhost}
              title="Toggle dark mode"
            >
              {dark ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
        </div>

        {/* search bar */}
        <div className="relative mt-5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark">
            <Icon.Search />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter rows by label or amount…"
            className={`${inputCls} w-full pl-9`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:hover:text-ink-light transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border dark:border-border-dark overflow-hidden bg-white dark:bg-card-dark shadow-sm">

          {/* thead */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <button
              onClick={() => handleSort("label")}
              className="col-span-4 text-left text-[10px] font-mono tracking-widest text-muted dark:text-muted-dark uppercase hover:text-ink dark:hover:text-ink-light transition-colors"
            >
              Label <SortArrow col="label" />
            </button>
            <button
              onClick={() => handleSort("gross")}
              className="col-span-3 text-right text-[10px] font-mono tracking-widest text-muted dark:text-muted-dark uppercase hover:text-ink dark:hover:text-ink-light transition-colors"
            >
              Incl. VAT <SortArrow col="gross" />
            </button>
            <button
              onClick={() => handleSort("net")}
              className="col-span-3 text-right text-[10px] font-mono tracking-widest text-muted dark:text-muted-dark uppercase hover:text-ink dark:hover:text-ink-light transition-colors"
            >
              Before VAT <SortArrow col="net" />
            </button>
            <button
              onClick={() => handleSort("vat")}
              className="col-span-2 text-right text-[10px] font-mono tracking-widest text-muted dark:text-muted-dark uppercase hover:text-ink dark:hover:text-ink-light transition-colors"
            >
              VAT <SortArrow col="vat" />
            </button>
          </div>

          {/* rows */}
          <AnimatePresence initial={false}>
            {displayRows.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted dark:text-muted-dark font-sans">
                No rows match your search.
              </div>
            ) : (
              displayRows.map((row, i) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.18 }}
                  className={`
                    grid grid-cols-12 px-5 py-3.5 border-b border-border dark:border-border-dark
                    group relative transition-colors duration-150
                    ${flashId === row.id ? "row-flash" : "hover:bg-surface dark:hover:bg-surface-dark"}
                    ${i % 2 === 0 ? "" : ""}
                  `}
                >
                  {/* row number */}
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted dark:text-muted-dark opacity-40 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* label / edit */}
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    {editingId === row.id ? (
                      <EditableCell
                        row={row}
                        onSave={(g, l) => saveEdit(row.id, g, l)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        {row.isCustom && (
                          <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-accent/10 text-accent leading-none">
                            custom
                          </span>
                        )}
                        <span className="text-sm font-sans text-ink dark:text-ink-light truncate" title={row.label}>
                          {row.label}
                        </span>
                      </>
                    )}
                  </div>

                  {/* gross */}
                  <div className="col-span-3 text-right font-mono text-sm font-medium text-ink dark:text-ink-light self-center">
                    ฿{formatTHB(row.grossPrice)}
                  </div>

                  {/* net — highlighted */}
                  <div className="col-span-3 text-right font-mono text-sm font-semibold self-center" style={{ color: "#6C63FF" }}>
                    ฿{formatTHB(row.netPrice)}
                  </div>

                  {/* vat + actions */}
                  <div className="col-span-2 text-right font-mono text-sm self-center flex items-center justify-end gap-1.5">
                    <span className="text-vat">฿{formatTHB(row.vatAmount)}</span>

                    {/* action buttons — visible on hover */}
                    {editingId !== row.id && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          onClick={() => copyRow(row)}
                          title="Copy row"
                          className="p-1.5 rounded-lg text-muted hover:text-ink dark:hover:text-ink-light hover:bg-surface dark:hover:bg-surface-dark transition-colors"
                        >
                          <Icon.Copy />
                        </button>
                        <button
                          onClick={() => setEditingId(row.id)}
                          title="Edit row"
                          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accentLt dark:hover:bg-accent/10 transition-colors"
                        >
                          <Icon.Edit />
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          title="Delete row"
                          className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Icon.Trash />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* row count bar */}
          <div className="px-5 py-2.5 bg-surface dark:bg-surface-dark flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted dark:text-muted-dark">
              {displayRows.length} of {rows.length} rows
              {search ? ` matching "${search}"` : ""}
            </span>
            <span className="text-[10px] font-mono text-muted dark:text-muted-dark">
              Divisor: {VAT_DIVISOR}
            </span>
          </div>
        </div>

        {/* ── Add custom row panel ── */}
        <div className="mt-5 rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-card-dark p-5 shadow-sm">
          <p className="text-[10px] font-mono tracking-widest text-muted dark:text-muted-dark uppercase mb-4">
            Add custom amount
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-sans text-muted dark:text-muted-dark">Label <span className="opacity-50">(optional)</span></label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRow()}
                placeholder="e.g. Special package"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-sans text-muted dark:text-muted-dark">Amount — ฿ incl. VAT</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark font-mono text-sm">฿</span>
                <input
                  type="number"
                  value={customAmt}
                  onChange={(e) => { setCustomAmt(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && addRow()}
                  placeholder="16500"
                  className={`${inputCls} pl-8 w-full`}
                />
              </div>
            </div>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-sans font-semibold transition-all active:scale-95"
              style={{ background: "#6C63FF", color: "#fff" }}
            >
              <Icon.Plus /> Add row
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-sans text-vat">{error}</p>}
        </div>

        {/* ── Keyboard shortcuts hint ── */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 justify-center">
          {[
            ["Enter", "Add row"],
            ["Hover row", "See copy / edit / delete"],
            ["Click column header", "Sort"],
          ].map(([key, desc]) => (
            <span key={key} className="text-[10px] font-mono text-muted dark:text-muted-dark">
              <span className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark px-1.5 py-0.5 rounded text-[9px] mr-1">{key}</span>
              {desc}
            </span>
          ))}
        </div>

        <p className="text-center text-[10px] font-mono text-muted dark:text-muted-dark mt-6 mb-2">
          Before VAT = Price ÷ {VAT_DIVISOR} · VAT = Price − Before VAT
        </p>
      </div>
    </div>
  );
}
