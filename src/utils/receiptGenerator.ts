/**
 * Generates SVG data URLs for sample receipt photos.
 */
export function generateSampleReceiptSvg(
  vendor: string,
  amount: number,
  date: string,
  items: Array<{ name: string; qty: number; price: number }>
): string {
  const itemsRows = items
    .map(
      (item) => `
    <text x="30" y="${0}" font-family="monospace" font-size="12" fill="#334155">${item.name.substring(0, 22).padEnd(22, ' ')}</text>
    <text x="210" y="${0}" font-family="monospace" font-size="12" fill="#334155" text-anchor="end">${item.qty}x ₹${item.price}</text>
  `
    )
    .reduce((acc, row, idx) => {
      const y = 200 + idx * 22;
      return acc + row.replace(/y="\${0}"/g, `y="${y}"`);
    }, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="520" viewBox="0 0 380 520">
    <rect width="380" height="520" fill="#f8fafc" />
    <rect x="15" y="15" width="350" height="490" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6,6"/>
    
    <!-- Header -->
    <text x="190" y="55" font-family="sans-serif" font-weight="bold" font-size="18" fill="#0f172a" text-anchor="middle">${vendor.toUpperCase()}</text>
    <text x="190" y="75" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Official TechAstra 2026 Vendor Invoice</text>
    <text x="190" y="92" font-family="monospace" font-size="11" fill="#64748b" text-anchor="middle">GSTIN: 36AAACT9812A1Z5 | Inv #${Math.floor(100000 + Math.random() * 900000)}</text>
    <line x1="30" y1="105" x2="350" y2="105" stroke="#e2e8f0" stroke-width="1.5" />
    
    <!-- Date & Info -->
    <text x="30" y="130" font-family="sans-serif" font-size="12" fill="#475569">Date: ${date}</text>
    <text x="350" y="130" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="end">Time: 14:32 IST</text>
    <text x="30" y="150" font-family="sans-serif" font-size="12" fill="#475569">Payment: UPI/Verified</text>
    <line x1="30" y1="168" x2="350" y2="168" stroke="#cbd5e1" stroke-dasharray="3,3" />

    <!-- Items -->
    <text x="30" y="188" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1e293b">ITEM DESCRIPTION</text>
    <text x="350" y="188" font-family="sans-serif" font-weight="bold" font-size="12" fill="#1e293b" text-anchor="end">AMOUNT</text>
    
    ${itemsRows}
    
    <line x1="30" y1="380" x2="350" y2="380" stroke="#0f172a" stroke-width="2" />
    
    <!-- Totals -->
    <text x="30" y="410" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0f172a">TOTAL PAID:</text>
    <text x="350" y="410" font-family="sans-serif" font-weight="bold" font-size="18" fill="#0d9488" text-anchor="end">₹${amount.toLocaleString('en-IN')}</text>
    
    <rect x="30" y="435" width="320" height="40" rx="4" fill="#f1f5f9" />
    <text x="190" y="460" font-family="monospace" font-size="11" fill="#475569" text-anchor="middle">VERIFIED FOR TECHASTRA TREASURY</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
