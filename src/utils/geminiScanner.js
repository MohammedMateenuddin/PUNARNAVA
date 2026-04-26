import { devices } from "../data/mockData";
import { getScrapRates, calculateScrapFromRates, getCachedRates, formatRate } from "./metalPrices";

// Re-export for UI usage
export { formatRate };

// ═══════════════════════════════════════════════════════════════
// MULTI-KEY ROTATION — Create multiple free keys for demo day
// ═══════════════════════════════════════════════════════════════
const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
].filter(Boolean);

let keyIndex = 0;

function getNextKey() {
  if (API_KEYS.length === 0) return null;
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
}

// ═══════════════════════════════════════════════════════════════
// SMART FALLBACK DATABASE — Never crash during a demo
// ═══════════════════════════════════════════════════════════════
const DEVICE_FALLBACK_DB = {
  mouse: {
    deviceName: "Gaming Mouse", category: "Mouse", weightGrams: 120,
    confidencePercent: 75, hazardLevel: "Low", estimatedValueINR: 180,
    co2SavedKg: 3.2, isElectronicDevice: true,
    materials: [
      { name: "Copper", weightGrams: 8.5, valueINR: 68, pct: 7 },
      { name: "Plastic", weightGrams: 85.0, valueINR: 12, pct: 71 },
      { name: "Gold", weightGrams: 0.03, valueINR: 95, pct: 1 },
      { name: "PCB", weightGrams: 15, valueINR: 20, pct: 12 }
    ],
    disassemblySteps: [
      "Remove bottom screws with Phillips #0 screwdriver",
      "Detach PCB from shell carefully",
      "Separate USB cable for copper recovery"
    ],
    toxicMaterials: ["Lead solder", "Brominated flame retardants"],
    ewasteCategory: "Small IT Equipment"
  },
  smartphone: {
    deviceName: "Smartphone", category: "Smartphone", weightGrams: 175,
    confidencePercent: 75, hazardLevel: "Moderate", estimatedValueINR: 420,
    co2SavedKg: 15.8, isElectronicDevice: true,
    materials: [
      { name: "Gold", weightGrams: 0.034, valueINR: 107, pct: 1 },
      { name: "Copper", weightGrams: 15.2, valueINR: 121, pct: 9 },
      { name: "Lithium", weightGrams: 4.5, valueINR: 40, pct: 3 },
      { name: "Aluminium", weightGrams: 24.5, valueINR: 49, pct: 14 }
    ],
    disassemblySteps: [
      "Power off and remove SIM tray",
      "Heat edges to loosen adhesive, remove back panel",
      "⚠️ Disconnect battery before removing PCB"
    ],
    toxicMaterials: ["Lead", "Mercury", "Cadmium"],
    ewasteCategory: "Telecom Equipment"
  },
  laptop: {
    deviceName: "Laptop", category: "Laptop", weightGrams: 1800,
    confidencePercent: 75, hazardLevel: "Moderate", estimatedValueINR: 1850,
    co2SavedKg: 48.0, isElectronicDevice: true,
    materials: [
      { name: "Aluminium", weightGrams: 380, valueINR: 760, pct: 21 },
      { name: "Copper", weightGrams: 90, valueINR: 720, pct: 5 },
      { name: "Gold", weightGrams: 0.3, valueINR: 945, pct: 1 },
      { name: "Lithium", weightGrams: 45, valueINR: 400, pct: 3 }
    ],
    disassemblySteps: [
      "Remove battery using T5 Torx screwdriver",
      "Unscrew motherboard, separate RAM and SSD",
      "⚠️ Remove display assembly for panel recovery"
    ],
    toxicMaterials: ["Lead", "Mercury in display", "Flame retardants"],
    ewasteCategory: "Large IT Equipment"
  },
  keyboard: {
    deviceName: "Mechanical Keyboard", category: "Keyboard", weightGrams: 780,
    confidencePercent: 75, hazardLevel: "Low", estimatedValueINR: 95,
    co2SavedKg: 3.5, isElectronicDevice: true,
    materials: [
      { name: "Plastic", weightGrams: 420, valueINR: 15, pct: 54 },
      { name: "Copper", weightGrams: 8.5, valueINR: 68, pct: 1 },
      { name: "Aluminium", weightGrams: 180, valueINR: 36, pct: 23 },
      { name: "Steel", weightGrams: 95, valueINR: 10, pct: 12 }
    ],
    disassemblySteps: [
      "Unplug keyboard from USB/wireless receiver",
      "Remove keycaps using a keycap puller",
      "Unscrew back plate and separate PCB from case"
    ],
    toxicMaterials: ["Lead solder"],
    ewasteCategory: "Small IT Equipment"
  },
  monitor: {
    deviceName: "LCD Monitor", category: "Monitor", weightGrams: 4200,
    confidencePercent: 75, hazardLevel: "High", estimatedValueINR: 400,
    co2SavedKg: 58.3, isElectronicDevice: true,
    materials: [
      { name: "Copper", weightGrams: 85, valueINR: 680, pct: 2 },
      { name: "Aluminium", weightGrams: 320, valueINR: 640, pct: 8 },
      { name: "Plastic", weightGrams: 1800, valueINR: 60, pct: 43 },
      { name: "Steel", weightGrams: 650, valueINR: 50, pct: 15 }
    ],
    disassemblySteps: [
      "Unplug all cables and remove stand",
      "Remove back panel screws",
      "⚠️ Discharge capacitors — electric shock risk!"
    ],
    toxicMaterials: ["Lead", "Mercury in backlight"],
    ewasteCategory: "Display Equipment"
  },
  headphones: {
    deviceName: "Headphones", category: "Headphones", weightGrams: 250,
    confidencePercent: 75, hazardLevel: "Low", estimatedValueINR: 125,
    co2SavedKg: 2.5, isElectronicDevice: true,
    materials: [
      { name: "Plastic", weightGrams: 150, valueINR: 8, pct: 60 },
      { name: "Copper", weightGrams: 25, valueINR: 200, pct: 10 },
      { name: "Neodymium", weightGrams: 5, valueINR: 45, pct: 2 }
    ],
    disassemblySteps: [
      "Pry open earcups carefully",
      "Remove driver magnets for rare earth recovery",
      "Separate cable for copper extraction"
    ],
    toxicMaterials: ["Lead solder"],
    ewasteCategory: "Consumer Electronics"
  }
};

function getFallbackResult(imageFile) {
  const name = (imageFile?.name || "").toLowerCase();
  if (name.includes("mouse")) return DEVICE_FALLBACK_DB.mouse;
  if (name.includes("keyboard") || name.includes("key")) return DEVICE_FALLBACK_DB.keyboard;
  if (name.includes("phone") || name.includes("pixel") || name.includes("samsung") || name.includes("iphone"))
    return DEVICE_FALLBACK_DB.smartphone;
  if (name.includes("laptop") || name.includes("macbook") || name.includes("notebook"))
    return DEVICE_FALLBACK_DB.laptop;
  if (name.includes("monitor") || name.includes("screen") || name.includes("display"))
    return DEVICE_FALLBACK_DB.monitor;
  if (name.includes("head") || name.includes("ear") || name.includes("bud"))
    return DEVICE_FALLBACK_DB.headphones;
  // Random fallback from mock data
  const randomDevice = devices[Math.floor(Math.random() * devices.length)];
  return {
    deviceName: randomDevice.name, category: randomDevice.type,
    weightGrams: randomDevice.weight, confidencePercent: 70,
    hazardLevel: randomDevice.safetyLevel === "Safe" ? "Low" : randomDevice.safetyLevel === "Hazardous" ? "High" : "Moderate",
    estimatedValueINR: Math.floor((randomDevice.value.min + randomDevice.value.max) / 2),
    co2SavedKg: randomDevice.co2Saved, isElectronicDevice: true,
    materials: randomDevice.materials.map(m => ({ name: m.name, weightGrams: m.amount, valueINR: 0, pct: m.pct })),
    disassemblySteps: randomDevice.disassembly?.en?.map(s => s.text) || [],
    toxicMaterials: [], ewasteCategory: "E-Waste"
  };
}

// ═══════════════════════════════════════════════════════════════
// BULLETPROOF JSON EXTRACTOR
// ═══════════════════════════════════════════════════════════════
function extractJSON(rawText) {
  let text = rawText.trim();
  text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");
  
  const jsonStr = text.slice(start, end + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch {
    const cleaned = jsonStr
      .replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F]/g, "");
    return JSON.parse(cleaned);
  }
}

// ═══════════════════════════════════════════════════════════════
// MATERIAL COLORS
// ═══════════════════════════════════════════════════════════════
const MATERIAL_COLORS = {
  'Gold': '#FFD700', 'Copper': '#B87333', 'Aluminium': '#C0C0C0', 'Aluminum': '#C0C0C0',
  'Plastic': '#666', 'Steel': '#888', 'Lithium': '#DC143C', 'Cobalt': '#0047AB',
  'Silicon': '#8B8682', 'Glass': '#a29bfe', 'Rubber': '#333', 'Tin': '#D4D4D4',
  'Nickel': '#727272', 'Zinc': '#B0B0B0', 'Iron': '#6B3A2A', 'PCB': '#00ff88',
  'Neodymium': '#ff6b6b', 'Titanium': '#777', 'Silver': '#C0C0C0', 'Lead': '#555',
  'Mercury': '#E0E0E0', 'Palladium': '#CED0CE', 'Rare Earth': '#ff6b6b'
};

// ═══════════════════════════════════════════════════════════════
// MAP RAW API DATA → UI-COMPATIBLE FORMAT (uses LIVE metal prices)
// ═══════════════════════════════════════════════════════════════
async function mapToUI(data, source = "gemini") {
  // Fetch live metal prices (cached for 30 min)
  const rates = await getScrapRates();

  const materials = (data.materials || []).map(m => ({
    name: m.name,
    amount: m.weightGrams || m.amount || 0,
    weightGrams: m.weightGrams || m.amount || 0,
    unit: 'g',
    color: MATERIAL_COLORS[m.name] || '#999',
    pct: m.pct || Math.floor(Math.random() * 40) + 10,
    valueINR: 0,
    scrapValueINR: 0,
    ratePerGram: 0
  }));

  // Calculate scrap value using LIVE rates
  const calculatedScrap = calculateScrapFromRates(materials, rates);
  
  // If AI returned > ₹5000 it's probably MRP, use calculated scrap value instead
  const aiValue = data.estimatedValueINR || 0;
  const estimatedValue = aiValue > 5000 ? calculatedScrap : (aiValue || calculatedScrap);

  return {
    name: data.deviceName || "Unknown Device",
    brand: data.brand || "Unknown",
    category: data.category,
    weight: data.weightGrams || 0,
    confidence: data.confidencePercent || 85,
    safetyLevel: data.hazardLevel === 'Low' ? 'Safe' : data.hazardLevel === 'High' ? 'Hazardous' : 'Moderate',
    estimatedValue,
    co2Saved: data.co2SavedKg || 0,
    materials,
    disassemblySteps: data.disassemblySteps,
    toxicMaterials: data.toxicMaterials,
    isElectronicDevice: data.isElectronicDevice !== false,
    ewasteCategory: data.ewasteCategory,
    rawAIClass: data.category,
    _source: source
  };
}

// ═══════════════════════════════════════════════════════════════
// CORE SCAN — Direct Fetch with MODEL FALLBACK CHAIN
// ═══════════════════════════════════════════════════════════════
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite"
];

async function scanDeviceWithModel(imageFile, modelName, apiKey) {
  if (!apiKey || apiKey.includes("YOUR_API_KEY")) {
    throw new Error("MISSING_KEY");
  }

  const base64 = await toBase64(imageFile);

  const body = {
    contents: [{
      parts: [
        {
          text: `You are an e-waste SCRAP VALUE analyst for the PUNARNAVA recycling platform.
Analyze this image and identify the electronic device shown.

IMPORTANT — Look carefully at shape, features, buttons, ports, and form factor:
- Scroll wheel + buttons + cord/wireless = MOUSE
- 50-110 keys in a flat layout = KEYBOARD
- Clamshell with screen + keyboard = LAPTOP
- Glass slab with touch screen = SMARTPHONE or TABLET
- Large display with stand = MONITOR
- Wearable audio device = HEADPHONES

CRITICAL REJECTION RULE:
- If the image is a traditional/mechanical wristwatch, a book, a plastic bottle, a shoe, or any non-electronic hardware, you MUST set "isElectronicDevice": false. 
- Only SMARTWATCHES with digital screens are considered e-waste. Traditional watches with analog hands are NOT e-waste.

CRITICAL PRICING RULE:
- "estimatedValueINR" must be the SCRAP RECOVERY VALUE — NOT the retail/MRP price.
- Calculate it as the sum of recoverable material values at current Indian scrap rates:
  Copper: ₹450/kg, Gold: ₹5200/g, Aluminium: ₹120/kg, Silver: ₹72/g,
  Palladium: ₹3150/g, Steel: ₹28/kg, Plastic: ₹15/kg, Lithium: ₹890/kg
- Example: A smartphone has ~0.034g gold (₹177) + 15g copper (₹7) + 25g aluminium (₹3) = ~₹187 scrap value
- A laptop has ~0.3g gold (₹1560) + 90g copper (₹41) + 380g aluminium (₹46) = ~₹1647 scrap value
- A mouse has ~8g copper (₹4) + 0.03g gold (₹156) = ~₹160 scrap value

Return ONLY raw JSON starting with { and ending with }. No markdown, no backticks, no extra text.

{
  "deviceName": "exact device name",
  "brand": "brand or Unknown",
  "category": "Smartphone|Laptop|Mouse|Keyboard|Charger|Tablet|Monitor|Printer|Camera|Headphones|Other",
  "weightGrams": estimated_weight,
  "confidencePercent": 0-100,
  "hazardLevel": "Low|Moderate|High",
  "estimatedValueINR": scrap_recovery_value_NOT_mrp,
  "co2SavedKg": estimated_co2,
  "materials": [
    {"name": "MaterialName", "weightGrams": 0.0, "valueINR": scrap_value_of_this_material, "pct": percentage_of_device_weight}
  ],
  "disassemblySteps": ["Step 1", "Step 2", "Step 3"],
  "toxicMaterials": ["Lead", "Mercury"],
  "isElectronicDevice": true,
  "ewasteCategory": "Small IT Equipment"
}`
        },
        {
          inline_data: {
            mime_type: imageFile.type || "image/jpeg",
            data: base64
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024
    }
  };

  console.log(`🔄 Trying model: ${modelName} with key: ${apiKey.slice(0,8)}...`);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "Unknown error";
    console.error(`❌ ${modelName} error:`, code, msg);

    if (code === 429) throw new Error("RATE_LIMIT");
    if (code === 400) throw new Error("BAD_REQUEST: " + msg);
    if (code === 403) throw new Error("PERMISSION_DENIED: " + msg);
    if (code === 404) throw new Error("MODEL_NOT_FOUND");
    throw new Error("API_ERROR_" + code + ": " + msg);
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log(`🧠 ${modelName} response:`, rawText);

  const parsed = extractJSON(rawText);
  console.log("✅ Parsed:", parsed);
  return parsed;
}

/**
 * Try ALL combinations of keys × models before giving up.
 * Each model has SEPARATE rate limits!
 */
async function scanDevice(imageFile) {
  const errors = [];

  for (const key of API_KEYS) {
    for (const model of MODELS) {
      try {
        return await scanDeviceWithModel(imageFile, model, key);
      } catch (err) {
        errors.push(`${model}: ${err.message}`);
        console.warn(`⚠️ ${model} failed: ${err.message}`);
        
        // If model not found, skip to next model (same key)
        if (err.message === "MODEL_NOT_FOUND") continue;
        // If rate limited, try next model (separate quotas!)
        if (err.message === "RATE_LIMIT") continue;
        // If bad request / permission denied, try next key
        if (err.message.includes("BAD_REQUEST") || err.message.includes("PERMISSION")) break;
      }
    }
  }

  // All combinations failed
  const summary = errors.join(" | ");
  console.error("❌ All models/keys exhausted:", summary);
  throw new Error("ALL_EXHAUSTED: " + summary);
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMIT QUEUE — Prevents hammering the API
// ═══════════════════════════════════════════════════════════════
let lastCallTime = 0;
const MIN_INTERVAL_MS = 4500; // ~13 calls/min, safely under 15 limit

// Stores the last API error for UI diagnostics
export let lastApiError = null;

export async function scanDeviceWithRetry(imageFile) {
  lastApiError = null;

  // Enforce minimum interval between calls
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS && lastCallTime > 0) {
    const wait = MIN_INTERVAL_MS - elapsed;
    console.log(`⏱ Rate limiting: waiting ${wait}ms`);
    await new Promise(r => setTimeout(r, wait));
  }
  lastCallTime = Date.now();

  try {
    // scanDevice already tries ALL keys × ALL models internally
    const rawResult = await scanDevice(imageFile);
    lastApiError = null;
    return await mapToUI(rawResult, "gemini");
  } catch (err) {
    console.warn("All scan attempts failed:", err.message);
    lastApiError = err.message;

    // If ALL models/keys exhausted, use smart fallback
    if (err.message.includes("ALL_EXHAUSTED") || err.message === "MISSING_KEY") {
      return await mapToUI(getFallbackResult(imageFile), "fallback");
    }

    // Everything else → show error to user
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
