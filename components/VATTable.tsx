"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  VAT_DIVISOR,
  VAT_RATE_PERCENT,
  PriceRow,
  calcRow,
  formatTHB,
  generateDefaultRows,
} from "@/lib/vat";

let customIdCounter = 0;

export default function VATTable() {
  const [rows, setRows] = useState<PriceRow[]>(generateDefaultRows());
  const [customInput, setCustomInput] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [error, setError] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<string | null>(null);

  const addCustomRow = useCallback(() => {
    const val = parseFloat(customInput.replace(/,/g, ""));
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (val > 10_000_000) {
      setError("Amount too large.");
      return;
    }
    setError("");
    const id = `custom-${++customIdCounter}`;
    const label = customLabel.trim() || `Custom ฿${formatTHB(val)}`;
    const newRow = calcRow(val, label, id);
    setRows((prev) => [...prev, newRow]);
    setCustomInput("");
    setCustomLabel("");
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 1800);
  }, [customInput, customLabel]);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setRows(generateDefaultRows());
    setCustomInput("");
    setCustomLabel("");
    setError("");
  }, []);

  const totals = rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.grossPrice,
      net: acc.net + r.netPrice,
      vat: acc.vat + r.vatAmount,
    }),
    { gross: 0, net: 0, vat: 0 }
  );

  return (
    <div className="min-h-screen bg-surface px-4 py-10 md:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-mono tracking-widest text-muted uppercase mb-2">
              Price Breakdown Tool
            </p>
            <h1
              className="text-4xl md:text-5xl font-display font-bold text-ink leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              VAT Calculator
            </h1>
            <p className="mt-2 text-muted font-body text-sm">
              Prices divided by{" "}
              <span className="font-mono text-ink font-medium">{VAT_DIVISOR}</span>{" "}
              · ~{VAT_RATE_PERCENT}% VAT · Thai Baht (฿)
            </p>
          </div>
          <button
            onClick={resetToDefaults}
            className="text-xs font-mono tracking-wide text-muted hover:text-ink border border-border hover:border-ink rounded-full px-4 py-2 transition-all duration-200"
          >
            Reset to defaults
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            { label: "Total (incl. VAT)", value: totals.gross, accent: false },
            { label: "Total before VAT", value: totals.net, accent: false },
            { label: "Total VAT", value: totals.vat, accent: true },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl px-5 py-4 border"
              style={{
                background: card.accent ? "#0D0D0F" : "#FFFFFF",
                borderColor: card.accent ? "#0D0D0F" : "#E4E3DF",
              }}
            >
              <p
                className="text-xs font-mono tracking-wide mb-1"
                style={{ color: card.accent ? "#8A8A8E" : "#8A8A8E" }}
              >
                {card.label}
              </p>
              <p
                className="text-xl md:text-2xl font-display font-semibold"
                style={{ color: card.accent ? "#C8F135" : "#0D0D0F", letterSpacing: "-0.02em" }}
              >
                ฿{formatTHB(card.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-0 border-b border-border px-6 py-3 bg-surface">
            <div className="col-span-4 text-xs font-mono tracking-widest text-muted uppercase">
              Label
            </div>
            <div className="col-span-3 text-right text-xs font-mono tracking-widest text-muted uppercase">
              Price incl. VAT
            </div>
            <div className="col-span-3 text-right text-xs font-mono tracking-widest text-muted uppercase">
              Before VAT
            </div>
            <div className="col-span-2 text-right text-xs font-mono tracking-widest text-muted uppercase">
              VAT amount
            </div>
          </div>

          {/* Rows */}
          <AnimatePresence initial={false}>
            {rows.map((row, i) => {
              const isHighlighted = highlightId === row.id;
              const isActive = activeRow === row.id;
              const isCustom = row.id.startsWith("custom-");

              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onMouseEnter={() => setActiveRow(row.id)}
                  onMouseLeave={() => setActiveRow(null)}
                  className="grid grid-cols-12 gap-0 px-6 py-4 border-b border-border relative transition-colors duration-150 group"
                  style={{
                    background: isHighlighted
                      ? "#F0FAD1"
                      : isActive
                      ? "#FAFAF8"
                      : "transparent",
                  }}
                >
                  {/* Row number */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted opacity-40">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Label */}
                  <div className="col-span-4 flex items-center gap-2">
                    {isCustom && (
                      <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-vat/10 text-vat leading-none">
                        custom
                      </span>
                    )}
                    <span className="font-body text-sm text-ink truncate">{row.label}</span>
                  </div>

                  {/* Price incl VAT */}
                  <div className="col-span-3 text-right font-mono text-sm font-medium text-ink">
                    ฿{formatTHB(row.grossPrice)}
                  </div>

                  {/* Before VAT */}
                  <div className="col-span-3 text-right font-mono text-sm text-muted">
                    ฿{formatTHB(row.netPrice)}
                  </div>

                  {/* VAT Amount */}
                  <div className="col-span-2 text-right font-mono text-sm flex items-center justify-end gap-2">
                    <span style={{ color: "#C84E00" }}>฿{formatTHB(row.vatAmount)}</span>
                    {isCustom && (
                      <button
                        onClick={() => removeRow(row.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted hover:text-red-500"
                        title="Remove row"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Totals row */}
          <div className="grid grid-cols-12 gap-0 px-6 py-4 bg-ink">
            <div className="col-span-4 text-xs font-mono tracking-widest text-muted uppercase">
              Total ({rows.length} items)
            </div>
            <div className="col-span-3 text-right font-mono text-sm font-semibold text-white">
              ฿{formatTHB(totals.gross)}
            </div>
            <div className="col-span-3 text-right font-mono text-sm text-muted">
              ฿{formatTHB(totals.net)}
            </div>
            <div className="col-span-2 text-right font-mono text-sm font-medium" style={{ color: "#C8F135" }}>
              ฿{formatTHB(totals.vat)}
            </div>
          </div>
        </div>

        {/* Custom input panel */}
        <div className="mt-6 bg-card rounded-2xl border border-border p-6">
          <p className="text-xs font-mono tracking-widest text-muted uppercase mb-4">
            Add custom amount
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs text-muted font-body">Label (optional)</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomRow()}
                placeholder="e.g. Special rate"
                className="border border-border rounded-xl px-4 py-3 text-sm font-body text-ink bg-surface outline-none focus:border-ink transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-xs text-muted font-body">Amount (฿ incl. VAT)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">
                  ฿
                </span>
                <input
                  type="number"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addCustomRow()}
                  placeholder="16,500"
                  className="w-full border border-border rounded-xl pl-8 pr-4 py-3 text-sm font-mono text-ink bg-surface outline-none focus:border-ink transition-colors"
                />
              </div>
            </div>
            <button
              onClick={addCustomRow}
              className="px-6 py-3 rounded-xl text-sm font-display font-semibold transition-all duration-150 active:scale-95"
              style={{ background: "#C8F135", color: "#0D0D0F" }}
            >
              Add row
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-vat font-body">{error}</p>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs font-mono text-muted mt-8 mb-4">
          Formula: Price before VAT = Price incl. VAT ÷ {VAT_DIVISOR} · VAT = Price incl. VAT − Price before VAT
        </p>
      </div>
    </div>
  );
}
