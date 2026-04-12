export const DEFAULT_VAT_RATE = 20.84; // percent

export interface PriceRow {
  id: string;
  label: string;
  grossPrice: number;
  netPrice: number;
  vatAmount: number;
  isCustom: boolean;
  pinned: boolean;
}

/** vatRate is a percentage, e.g. 20.84 means 20.84% */
export function calcRow(
  grossPrice: number,
  label: string,
  id: string,
  vatRate: number,
  isCustom = false,
  pinned = false
): PriceRow {
  const divisor = 1 + vatRate / 100;
  const netPrice = grossPrice / divisor;
  const vatAmount = grossPrice - netPrice;
  return { id, label, grossPrice, netPrice, vatAmount, isCustom, pinned };
}

export function formatTHB(value: number, decimals = 2): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function generateDefaultRows(vatRate: number, step = 500): PriceRow[] {
  const rows: PriceRow[] = [];
  for (let price = 15000; price <= 18000; price += step) {
    rows.push(calcRow(price, `฿${formatTHB(price, 0)}`, `preset-${price}-${step}`, vatRate, false));
  }
  return rows;
}
