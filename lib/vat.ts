export const VAT_DIVISOR = 1.2084;

export interface PriceRow {
  id: string;
  label: string;
  grossPrice: number;
  netPrice: number;
  vatAmount: number;
  isCustom: boolean;
}

export function calcRow(
  grossPrice: number,
  label: string,
  id: string,
  isCustom = false
): PriceRow {
  const netPrice = grossPrice / VAT_DIVISOR;
  const vatAmount = grossPrice - netPrice;
  return { id, label, grossPrice, netPrice, vatAmount, isCustom };
}

export function formatTHB(value: number, decimals = 2): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function generateDefaultRows(): PriceRow[] {
  const rows: PriceRow[] = [];
  for (let price = 15000; price <= 18000; price += 500) {
    rows.push(
      calcRow(price, `฿${formatTHB(price, 0)}`, `preset-${price}`, false)
    );
  }
  return rows;
}
