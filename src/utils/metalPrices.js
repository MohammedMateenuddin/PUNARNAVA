// ═══════════════════════════════════════════════════════════════
// REAL-TIME METAL PRICES — Fetches live scrap rates in INR
// Uses Metals-API free tier (100 calls/month)
// Caches for 30 minutes to conserve API calls
// ═══════════════════════════════════════════════════════════════

const METALS_API_KEY = 'n8qis2gpmhfraer6etry8yzzv0qrdwxlnz1rfmwj5iafoh42twsaijy7bwpv';

// Fallback rates (₹ per gram) — used when API is unavailable
const FALLBACK_RATES = {
  Gold: 7250, Silver: 92, Platinum: 3100, Palladium: 3400,
  Copper: 0.48, Aluminium: 0.13, Aluminum: 0.13,
  Steel: 0.030, Iron: 0.030, Lithium: 0.95,
  Cobalt: 3.0, Nickel: 0.16, Tin: 0.24, Zinc: 0.027,
  Plastic: 0.015, Glass: 0.005, Rubber: 0.01,
  PCB: 0.8, Neodymium: 4.5, Lead: 0.018, Mercury: 0.0,
  'Lithium-Ion Battery': 0.35, 'Circuit Board': 0.8,
};

// Cache
let cachedRates = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Metal symbol mapping for Metals-API
// XAU=Gold, XAG=Silver, XPT=Platinum, XPD=Palladium, XCU=Copper, ALU=Aluminium
const METAL_SYMBOLS = 'XAU,XAG,XPT,XPD,XCU,ALU,NI,IRON,ZNC,TIN,LEAD,LITH,CO';

const SYMBOL_TO_NAME = {
  XAU: 'Gold', XAG: 'Silver', XPT: 'Platinum', XPD: 'Palladium',
  XCU: 'Copper', ALU: 'Aluminium', NI: 'Nickel', IRON: 'Iron',
  ZNC: 'Zinc', TIN: 'Tin', LEAD: 'Lead', LITH: 'Lithium', CO: 'Cobalt',
};

/**
 * Fetch live metal prices from Metals-API in INR per gram
 */
async function fetchLivePrices() {
  try {
    const url = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=INR&symbols=${METAL_SYMBOLS}&unit=gram`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API ${response.status}`);
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error?.info || 'API error');

    const rates = { ...FALLBACK_RATES };

    // API returns rates relative to base. For INR base with gram unit:
    // rate = how many units of the metal per 1 INR
    // price per gram = 1 / rate
    for (const [symbol, rate] of Object.entries(data.rates || {})) {
      const metalName = SYMBOL_TO_NAME[symbol];
      if (metalName && rate > 0) {
        const pricePerGram = 1 / rate;
        rates[metalName] = Math.round(pricePerGram * 100) / 100;
      }
    }

    // Add aliases
    rates['Aluminum'] = rates['Aluminium'];
    rates['Steel'] = rates['Iron'] || rates['Steel'];

    console.log('✅ Live metal prices fetched:', Object.entries(rates).slice(0, 6).map(([k,v]) => `${k}: ₹${v}/g`).join(', '));
    return rates;
  } catch (err) {
    console.warn('⚠️ Metal price API failed, using fallback rates:', err.message);
    return null;
  }
}

/**
 * Get current metal scrap rates (₹ per gram)
 * Returns cached data if fresh, otherwise fetches live
 */
export async function getScrapRates() {
  const now = Date.now();
  
  // Return cache if fresh
  if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedRates;
  }

  // Try live fetch
  const liveRates = await fetchLivePrices();
  if (liveRates) {
    cachedRates = liveRates;
    cacheTimestamp = now;
    return cachedRates;
  }

  // Use fallback
  return cachedRates || FALLBACK_RATES;
}

/**
 * Calculate scrap value from materials array using given rates
 */
export function calculateScrapFromRates(materials, rates) {
  let total = 0;
  for (const m of materials) {
    const weight = m.weightGrams || m.amount || 0;
    const name = m.name;
    
    // Try exact match first, then case-insensitive
    let rate = rates[name];
    if (rate === undefined) {
      const lower = name.toLowerCase();
      for (const [k, v] of Object.entries(rates)) {
        if (k.toLowerCase() === lower) { rate = v; break; }
      }
    }
    rate = rate || 0.01;

    const value = weight * rate;
    m.scrapValueINR = Math.round(value);
    m.ratePerGram = rate;
    total += value;
  }
  return Math.round(total);
}

/**
 * Get rates synchronously (returns cached or fallback)
 */
export function getCachedRates() {
  return cachedRates || FALLBACK_RATES;
}

/**
 * Format rate for display
 */
export function formatRate(ratePerGram) {
  if (!ratePerGram) return '₹0/kg';
  if (ratePerGram >= 10) return `₹${Math.round(ratePerGram)}/g`;
  if (ratePerGram >= 1) return `₹${ratePerGram.toFixed(1)}/g`;
  return `₹${Math.round(ratePerGram * 1000)}/kg`;
}

// Pre-fetch on module load (non-blocking)
getScrapRates().catch(() => {});
