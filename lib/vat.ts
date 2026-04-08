export const VAT_DIVISOR = 1.2084;
export const VAT_RATE_PERCENT = ((VAT_DIVISOR - 1) * 100).toFixed(2); // ~20.84%

export interface PriceRow {
  id: string;
  label: string;
  grossPrice: number; // price including VAT (the input)
  netPrice: number;   // price before VAT (grossPrice / VAT_DIVISOR)
  vatAmount: number;  // VAT portion
}

export function calcRow(grossPrice: number, label: string, id: string): PriceRow {
  const netPrice = grossPrice / VAT_DIVISOR;
  const vatAmount = grossPrice - netPrice;
  return { id, label, grossPrice, netPrice, vatAmount };
}

export function formatTHB(value: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Generate default price range rows: 15,000 to 18,000 in steps of 500
export function generateDefaultRows(): PriceRow[] {
  const rows: PriceRow[] = [];
  for (let price = 15000; price <= 18000; price += 500) {
    rows.push(calcRow(price, `฿${price.toLocaleString("th-TH")}`, `preset-${price}`));
  }
  return rows;
}
