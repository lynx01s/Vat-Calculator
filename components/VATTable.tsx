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

// ── Icons ──────────────────────────────────────────────────────────────────────
const Ico = {
  Sun:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  Moon:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Copy:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Edit:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Check:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:        () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Reset:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Plus:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Dup:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Info:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

// ── Toast list ─────────────────────────────────────────────────────────────────
function ToastList({ toasts }: { toasts: { id: number; message: string; type: string }[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="px-4 py-2.5 rounded-xl text-xs font-sans font-medium shadow-lg border bg-white dark:bg-[#1C1C26] border-[#E5E5EA] dark:border-[#2A2A38] text-[#111118] dark:text-[#F7F7F9]"
          >
            {t.type === "success" && <span className="text-green-500 mr-1.5">✓</span>}
            {t.type === "error"   && <span className="text-red-400 mr-1.5">✕</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Inline edit ────────────────────────────────────────────────────────────────
function InlineEdit({ row, onSave, onCancel }: {
  row: PriceRow;
  onSave: (gross: number, label: string) => void;
  onCancel: () => void;
}) {
  const [gross, setGross] = useState(String(row.grossPrice));
  const [label, setLabel] = useState(row.label);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const save = () => {
    const v = parseFloat(gross.replace(/,/g, ""));
    if (!isNaN(v) && v > 0) onSave(v, label.trim() || `฿${formatTHB(v, 0)}`);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") onCancel();
  };
  const iCls = "border border-[#E5E5EA] dark:border-[#2A2A38] rounded-lg px-2.5 py-1.5 text-xs font-sans bg-[#F7F7F9] dark:bg-[#111118] text-[#111118] dark:text-[#F7F7F9] outline-none focus:border-[#6C63FF] transition-colors";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input value={label} onChange={e => setLabel(e.target.value)} onKeyDown={onKey}
        className={`${iCls} w-36`} placeholder="Label" />
      <input ref={ref} type="number" value={gross} onChange={e => setGross(e.target.value)} onKeyDown={onKey}
        className={`${iCls} w-28 font-mono`} placeholder="Amount" />
      <button onClick={save}      className="p-1.5 rounded-lg bg-[#6C63FF] text-white hover:opacity-80 transition-opacity"><Ico.Check /></button>
      <button onClick={onCancel}  className="p-1.5 rounded-lg border border-[#E5E5EA] dark:border-[#2A2A38] text-[#8E8EA0] hover:text-[#111118] dark:hover:text-[#F7F7F9] transition-colors"><Ico.X /></button>
      <span className="text-[9px] font-mono text-[#8E8EA0]">Enter · Esc</span>
    </div>
  );
}

// ── VAT detail tooltip ─────────────────────────────────────────────────────────
function VatTooltip({ gross }: { gross: number }) {
  const net = gross / VAT_DIVISOR;
  const vat = gross - net;
  const pct = ((VAT_DIVISOR - 1) * 100).toFixed(2);
  return (
    <div className="absolute z-40 right-0 top-full mt-2 w-52 rounded-xl border border-[#E5E5EA] dark:border-[#2A2A38] bg-white dark:bg-[#1C1C26] shadow-2xl p-3.5">
      <p className="text-[9px] font-mono tracking-widest text-[#8E8EA0] uppercase mb-2.5">Breakdown</p>
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-[#8E8EA0]">Incl. VAT</span>
          <span className="text-[#111118] dark:text-[#F7F7F9] font-medium">฿{formatTHB(gross)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8E8EA0]">Before VAT</span>
          <span className="font-semibold" style={{ color: "#6C63FF" }}>฿{formatTHB(net)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8E8EA0]">VAT ({pct}%)</span>
          <span style={{ color: "#FF6B35" }}>฿{formatTHB(vat)}</span>
        </div>
        <div className="border-t border-[#E5E5EA] dark:border-[#2A2A38] pt-1.5 flex justify-between">
          <span className="text-[#8E8EA0]">VAT share</span>
          <span className="text-[#111118] dark:text-[#F7F7F9]">{(vat / gross * 100).toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8E8EA0]">Net ratio</span>
          <span className="text-[#111118] dark:text-[#F7F7F9]">{(net / gross * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function VATTable() {
  const [rows, setRows]               = useState<PriceRow[]>(generateDefaultRows());
  const [dark, setDark]               = useState(false);
  const [customAmt, setCustomAmt]     = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [error, setError]             = useState("");
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [flashId, setFlashId]         = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [sortCol, setSortCol]         = useState<"label"|"gross"|"net"|"vat"|null>(null);
  const [sortDir, setSortDir]         = useState<"asc"|"desc">("asc");
  const [tooltipId, setTooltipId]     = useState<string | null>(null);
  const [step, setStep]               = useState(500);
  const { toasts, push }              = useToast();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const flash = (id: string) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1400);
  };

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortArrow = ({ col }: { col: typeof sortCol }) => (
    <span className={`ml-0.5 text-[9px] ${sortCol === col ? "opacity-100" : "opacity-20"}`}>
      {sortCol === col && sortDir === "desc" ? "↓" : "↑"}
    </span>
  );

  // Filtered + sorted display rows
  const displayRows = [...rows]
    .filter(r =>
      !search.trim() ||
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

  // ── Row actions ──────────────────────────────────────────────────────────────
  const addRow = useCallback(() => {
    const val = parseFloat(customAmt.replace(/,/g, ""));
    if (isNaN(val) || val <= 0)  { setError("Please enter a valid positive amount."); return; }
    if (val > 10_000_000)        { setError("Amount too large (max ฿10,000,000)."); return; }
    setError("");
    const id = `custom-${++_cid}`;
    const label = customLabel.trim() || `฿${formatTHB(val, 0)}`;
    setRows(p => [...p, calcRow(val, label, id, true)]);
    setCustomAmt(""); setCustomLabel("");
    setTimeout(() => flash(id), 20);
    push("Row added");
  }, [customAmt, customLabel, push]);

  const duplicateRow = useCallback((row: PriceRow) => {
    const id = `custom-${++_cid}`;
    const newRow = calcRow(row.grossPrice, `${row.label} (copy)`, id, true);
    setRows(p => {
      const idx = p.findIndex(r => r.id === row.id);
      const next = [...p]; next.splice(idx + 1, 0, newRow);
      return next;
    });
    setTimeout(() => flash(id), 20);
    push("Row duplicated");
  }, [push]);

  const saveEdit = useCallback((id: string, gross: number, label: string) => {
    setRows(p => p.map(r => r.id === id ? calcRow(gross, label, id, r.isCustom) : r));
    setEditingId(null);
    setTimeout(() => flash(id), 20);
    push("Row updated");
  }, [push]);

  const deleteRow = useCallback((id: string) => {
    setRows(p => p.filter(r => r.id !== id));
    push("Row removed", "info");
  }, [push]);

  const copyRow = useCallback((row: PriceRow) => {
    const text = [
      row.label,
      `฿${formatTHB(row.grossPrice)}`,
      `฿${formatTHB(row.netPrice)}`,
      `฿${formatTHB(row.vatAmount)}`,
    ].join("\t");
    navigator.clipboard.writeText(text).then(() => push("Row copied"));
  }, [push]);

  const copyAll = useCallback(() => {
    const header = "Label\tIncl. VAT\tBefore VAT\tVAT Amount";
    const body = rows.map(r =>
      `${r.label}\t฿${formatTHB(r.grossPrice)}\t฿${formatTHB(r.netPrice)}\t฿${formatTHB(r.vatAmount)}`
    ).join("\n");
    navigator.clipboard.writeText(`${header}\n${body}`).then(() => push(`${rows.length} rows copied`));
  }, [rows, push]);

  const exportCSV = useCallback(() => {
    const header = "Label,Price incl. VAT (฿),Before VAT (฿),VAT Amount (฿)";
    const body = rows.map(r =>
      `"${r.label}",${r.grossPrice.toFixed(2)},${r.netPrice.toFixed(2)},${r.vatAmount.toFixed(2)}`
    ).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "vat-prices.csv"; a.click();
    URL.revokeObjectURL(a.href);
    push("CSV exported");
  }, [rows, push]);

  const exportExcel = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");
      const data = [
        ["Label", "Price incl. VAT (฿)", "Before VAT (฿)", "VAT Amount (฿)"],
        ...rows.map(r => [r.label, r.grossPrice, r.netPrice, r.vatAmount]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [{ wch: 24 }, { wch: 20 }, { wch: 18 }, { wch: 16 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "VAT Prices");
      XLSX.writeFile(wb, "vat-prices.xlsx");
      push("Excel exported");
    } catch { push("Export failed", "error"); }
  }, [rows, push]);

  const reset = useCallback(() => {
    setRows(generateDefaultRows());
    setSearch(""); setSortCol(null); setEditingId(null); setStep(500);
    push("Reset to defaults", "info");
  }, [push]);

  const applyStep = useCallback((newStep: number) => {
    setStep(newStep);
    setRows(p => {
      const customs = p.filter(r => r.isCustom);
      const presets: PriceRow[] = [];
      for (let price = 15000; price <= 18000; price += newStep) {
        presets.push(calcRow(price, `฿${formatTHB(price, 0)}`, `preset-${price}-${newStep}`, false));
      }
      return [...presets, ...customs];
    });
    push(`Step set to ฿${newStep.toLocaleString()}`);
  }, [push]);

  // ── Shared styles ────────────────────────────────────────────────────────────
  const inputCls  = "border border-[#E5E5EA] dark:border-[#2A2A38] rounded-xl px-3.5 py-2.5 text-sm font-sans bg-white dark:bg-[#1C1C26] text-[#111118] dark:text-[#F7F7F9] outline-none focus:border-[#6C63FF] transition-colors placeholder:text-[#8E8EA0]";
  const ghostBtn  = "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-medium border border-[#E5E5EA] dark:border-[#2A2A38] text-[#8E8EA0] hover:text-[#111118] dark:hover:text-[#F7F7F9] hover:border-[#111118] dark:hover:border-[#F7F7F9] transition-all whitespace-nowrap";
  // table cell widths — fixed so nothing overlaps
  const W = { label: "flex-1 min-w-0", gross: "w-36 shrink-0", net: "w-36 shrink-0", vat: "w-32 shrink-0", actions: "w-28 shrink-0" };
  const thCls = "text-[10px] font-mono tracking-widest text-[#8E8EA0] uppercase cursor-pointer select-none hover:text-[#111118] dark:hover:text-[#F7F7F9] transition-colors text-right";

  return (
    <div className="min-h-screen bg-[#F7F7F9] dark:bg-[#111118] transition-colors duration-300 px-4 py-8 md:px-10">
      <ToastList toasts={toasts} />

      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto mb-6">
        <p className="text-[10px] font-mono tracking-widest text-[#8E8EA0] uppercase mb-1.5">
          Thai Baht · ÷ {VAT_DIVISOR} · VAT Breakdown
        </p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-sans font-semibold text-[#111118] dark:text-[#F7F7F9] tracking-tight">
            VAT Price Calculator
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={copyAll}     className={ghostBtn}><Ico.Copy />Copy all</button>
            <button onClick={exportCSV}   className={ghostBtn}><Ico.Download />CSV</button>
            <button onClick={exportExcel} className={ghostBtn}><Ico.Download />Excel</button>
            <button onClick={reset}       className={ghostBtn}><Ico.Reset />Reset</button>
            <button onClick={() => setDark(d => !d)} className={ghostBtn}>
              {dark ? <Ico.Sun /> : <Ico.Moon />}
            </button>
          </div>
        </div>

        {/* Controls row: step buttons + search */}
        <div className="flex gap-3 mt-5 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#8E8EA0] uppercase">Step</span>
            {[250, 500, 1000].map(s => (
              <button key={s} onClick={() => applyStep(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  step === s
                    ? "bg-[#6C63FF] text-white border-[#6C63FF]"
                    : "border-[#E5E5EA] dark:border-[#2A2A38] text-[#8E8EA0] hover:border-[#6C63FF] hover:text-[#6C63FF]"
                }`}>
                ฿{s.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8EA0] pointer-events-none"><Ico.Search /></span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter rows…"
              className={`${inputCls} w-full pl-9 py-2 text-sm`} />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8EA0] hover:text-[#111118] dark:hover:text-[#F7F7F9] transition-colors">
                <Ico.X />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-[#E5E5EA] dark:border-[#2A2A38] overflow-hidden bg-white dark:bg-[#1C1C26] shadow-sm">

          {/* Table header — uses flex with fixed widths, matching rows exactly */}
          <div className="flex items-center px-6 py-3 border-b border-[#E5E5EA] dark:border-[#2A2A38] bg-[#F7F7F9] dark:bg-[#16161F] gap-4">
            <button onClick={() => handleSort("label")}
              className={`${W.label} ${thCls} text-left`}>
              Label <SortArrow col="label" />
            </button>
            <button onClick={() => handleSort("gross")}
              className={`${W.gross} ${thCls}`}>
              Incl. VAT <SortArrow col="gross" />
            </button>
            <button onClick={() => handleSort("net")}
              className={`${W.net} ${thCls}`}>
              Before VAT <SortArrow col="net" />
            </button>
            <button onClick={() => handleSort("vat")}
              className={`${W.vat} ${thCls}`}>
              VAT <SortArrow col="vat" />
            </button>
            <div className={W.actions} /> {/* spacer for action buttons */}
          </div>

          {/* Rows */}
          <AnimatePresence initial={false}>
            {displayRows.length === 0 ? (
              <div className="py-14 text-center text-sm text-[#8E8EA0] font-sans">
                No rows match your filter.
              </div>
            ) : displayRows.map((row, i) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.16 }}
                className={`
                  flex items-center px-6 py-3.5 gap-4 border-b border-[#E5E5EA] dark:border-[#2A2A38]
                  group relative transition-colors duration-100
                  ${flashId === row.id
                    ? "bg-[#EEEDFF] dark:bg-[#2A2845]"
                    : "hover:bg-[#F7F7F9] dark:hover:bg-[#16161F]"}
                `}
              >
                {/* Row number */}
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#8E8EA0] opacity-25 select-none tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Label / inline edit */}
                <div className={`${W.label} min-w-0`}>
                  {editingId === row.id ? (
                    <InlineEdit row={row}
                      onSave={(g, l) => saveEdit(row.id, g, l)}
                      onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      {row.isCustom && (
                        <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#EEEDFF] dark:bg-[#2A2845] text-[#6C63FF] leading-none">
                          custom
                        </span>
                      )}
                      <span className="text-sm font-sans text-[#111118] dark:text-[#F7F7F9] truncate">
                        {row.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Incl. VAT */}
                <div className={`${W.gross} text-right font-mono text-sm font-medium text-[#111118] dark:text-[#F7F7F9] tabular-nums`}>
                  ฿{formatTHB(row.grossPrice)}
                </div>

                {/* Before VAT — highlighted */}
                <div className={`${W.net} text-right font-mono text-sm font-semibold tabular-nums`} style={{ color: "#6C63FF" }}>
                  ฿{formatTHB(row.netPrice)}
                </div>

                {/* VAT amount */}
                <div className={`${W.vat} text-right font-mono text-sm tabular-nums`} style={{ color: "#FF6B35" }}>
                  ฿{formatTHB(row.vatAmount)}
                </div>

                {/* Action buttons — always same width, appear on hover */}
                <div className={`${W.actions} flex items-center justify-end gap-0.5 shrink-0`}>
                  {editingId !== row.id && (
                    <>
                      {/* Tooltip */}
                      <div className="relative">
                        <button
                          onMouseEnter={() => setTooltipId(row.id)}
                          onMouseLeave={() => setTooltipId(null)}
                          className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-[#111118] dark:hover:text-[#F7F7F9] hover:bg-[#F0F0F5] dark:hover:bg-[#2A2A38] transition-colors opacity-0 group-hover:opacity-100"
                          title="Breakdown detail"
                        >
                          <Ico.Info />
                        </button>
                        {tooltipId === row.id && <VatTooltip gross={row.grossPrice} />}
                      </div>
                      <button onClick={() => copyRow(row)}
                        className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-[#111118] dark:hover:text-[#F7F7F9] hover:bg-[#F0F0F5] dark:hover:bg-[#2A2A38] transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy row">
                        <Ico.Copy />
                      </button>
                      <button onClick={() => duplicateRow(row)}
                        className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-[#6C63FF] hover:bg-[#EEEDFF] dark:hover:bg-[#2A2845] transition-colors opacity-0 group-hover:opacity-100"
                        title="Duplicate row">
                        <Ico.Dup />
                      </button>
                      <button onClick={() => setEditingId(row.id)}
                        className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-[#6C63FF] hover:bg-[#EEEDFF] dark:hover:bg-[#2A2845] transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit row">
                        <Ico.Edit />
                      </button>
                      <button onClick={() => deleteRow(row.id)}
                        className="p-1.5 rounded-lg text-[#8E8EA0] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete row">
                        <Ico.Trash />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-2.5 bg-[#F7F7F9] dark:bg-[#16161F] border-t border-[#E5E5EA] dark:border-[#2A2A38]">
            <span className="text-[10px] font-mono text-[#8E8EA0]">
              {displayRows.length} of {rows.length} rows{search ? ` · "${search}"` : ""}
            </span>
            <span className="text-[10px] font-mono text-[#8E8EA0]">
              Divisor {VAT_DIVISOR} · <span style={{ color: "#6C63FF" }}>■</span> Before VAT · <span style={{ color: "#FF6B35" }}>■</span> VAT
            </span>
          </div>
        </div>

        {/* ── Add custom row ── */}
        <div className="mt-4 rounded-2xl border border-[#E5E5EA] dark:border-[#2A2A38] bg-white dark:bg-[#1C1C26] p-5 shadow-sm">
          <p className="text-[10px] font-mono tracking-widest text-[#8E8EA0] uppercase mb-4">
            Add custom amount
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-sans text-[#8E8EA0]">
                Label <span className="opacity-50">(optional)</span>
              </label>
              <input type="text" value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addRow()}
                placeholder="e.g. Premium package"
                className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs font-sans text-[#8E8EA0]">Amount — ฿ incl. VAT</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8EA0] font-mono text-sm pointer-events-none">฿</span>
                <input type="number" value={customAmt}
                  onChange={e => { setCustomAmt(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && addRow()}
                  placeholder="16500"
                  className={`${inputCls} pl-8 w-full`} />
              </div>
            </div>
            <button onClick={addRow}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-sans font-semibold transition-all active:scale-95 bg-[#6C63FF] text-white hover:opacity-90">
              <Ico.Plus /> Add row
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-sans text-[#FF6B35]">{error}</p>}
        </div>

        {/* ── Hints ── */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 justify-center">
          {[
            ["Enter", "Add row"],
            ["Hover row", "Info · Copy · Duplicate · Edit · Delete"],
            ["Step buttons", "Change preset interval"],
            ["Column header", "Sort"],
          ].map(([k, d]) => (
            <span key={k} className="text-[9px] font-mono text-[#8E8EA0]">
              <span className="bg-white dark:bg-[#1C1C26] border border-[#E5E5EA] dark:border-[#2A2A38] px-1.5 py-0.5 rounded mr-1.5 text-[8px]">{k}</span>
              {d}
            </span>
          ))}
        </div>
        <p className="text-center text-[9px] font-mono text-[#8E8EA0] mt-4 mb-1">
          Before VAT = Incl. VAT ÷ {VAT_DIVISOR} · VAT = Incl. VAT − Before VAT
        </p>
      </div>
    </div>
  );
}
