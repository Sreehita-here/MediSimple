require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ── Schemas ─────────────────────────────────────────────────────────────────
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  strength: { type: String, required: true },
  commonBrands: [String],
  whatItDoes: { type: String, required: true },
  howToTake: [String],
  sideEffects: {
    common: [String],
    lessCommon: [String],
    serious: [String],
  },
  storage: String,
  callDoctorIf: [String],
  verified: { type: Boolean, default: true },
  source: { type: String, required: true },
});
MedicineSchema.index({ name: "text" });

const DosageSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  safeSingleDose: String,
  safeDailyRange: { type: String, required: true },
  maxPerDay: String,
  source: { type: String, required: true },
});

const InteractionSchema = new mongoose.Schema({
  pairKey: { type: String, required: true, unique: true },
  drugA: { type: String, required: true },
  drugB: { type: String, required: true },
  severity: { type: String, enum: ["safe", "caution", "dangerous"], required: true },
  explanation: { type: String, required: true },
  whatToWatch: String,
  source: { type: String, required: true },
});

const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);
const Dosage = mongoose.models.Dosage || mongoose.model("Dosage", DosageSchema);
const Interaction = mongoose.models.Interaction || mongoose.model("Interaction", InteractionSchema);

// ── Seed Data ────────────────────────────────────────────────────────────────
const medicines = [
  {
    name: "Paracetamol",
    strength: "500mg",
    commonBrands: ["Calpol", "Dolo 650", "Panadol", "Tylenol"],
    whatItDoes: "Paracetamol relieves mild to moderate pain and reduces fever. It works by blocking pain signals in the brain and lowering body temperature.",
    howToTake: [
      "Take 1–2 tablets (500mg–1000mg) every 4–6 hours as needed",
      "Take with or without food — food can help if you feel nauseous",
      "Swallow tablets whole with a glass of water",
      "Do not take more than 4g (4000mg) in 24 hours",
      "Leave at least 4 hours between doses",
    ],
    sideEffects: {
      common: ["Nausea", "Stomach discomfort"],
      lessCommon: ["Skin rash", "Itching", "Headache"],
      serious: ["Severe liver damage (from overdose)", "Severe allergic reaction (rash, swelling, difficulty breathing)", "Yellowing of skin or eyes (jaundice)"],
    },
    storage: "Store below 30°C, away from heat and moisture. Keep out of reach of children.",
    callDoctorIf: [
      "You take more than the recommended dose",
      "You have liver or kidney problems",
      "Symptoms don't improve after 3 days",
      "You develop a rash, swelling, or difficulty breathing",
      "You notice yellowing of skin or eyes",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Ibuprofen",
    strength: "400mg",
    commonBrands: ["Brufen", "Advil", "Nurofen", "Combiflam"],
    whatItDoes: "Ibuprofen is a non-steroidal anti-inflammatory drug (NSAID) that relieves pain, reduces fever, and decreases inflammation.",
    howToTake: [
      "Take 1 tablet (400mg) every 6–8 hours with food or milk",
      "Always take with food or a glass of milk to protect your stomach",
      "Take with a full glass of water",
      "Maximum 3 tablets (1200mg) per day unless prescribed more by your doctor",
      "Do not lie down for at least 30 minutes after taking",
    ],
    sideEffects: {
      common: ["Stomach upset or pain", "Nausea", "Heartburn", "Dizziness"],
      lessCommon: ["Headache", "Bloating", "Constipation or diarrhea", "Mild rash"],
      serious: [
        "Stomach bleeding (black or bloody stools)",
        "Chest pain or shortness of breath",
        "Sudden vision changes",
        "Signs of kidney problems (reduced urination, swelling)",
        "Severe allergic reaction",
        "Liver problems (yellowing of skin)",
      ],
    },
    storage: "Store at room temperature (15–30°C). Keep away from moisture and heat.",
    callDoctorIf: [
      "You have a history of stomach ulcers or bleeding",
      "You have heart disease, kidney or liver problems",
      "You are pregnant (especially after 20 weeks)",
      "You see black or tarry stools",
      "You experience chest pain or vision changes",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Metformin",
    strength: "500mg",
    commonBrands: ["Glycomet", "Glucophage", "Obimet"],
    whatItDoes: "Metformin is used to treat type 2 diabetes. It lowers blood sugar by reducing glucose production in the liver and improving your body's response to insulin.",
    howToTake: [
      "Take with meals to reduce stomach upset",
      "Swallow tablets whole — do not crush or chew",
      "Take at the same time each day for best results",
      "Continue even if you feel well — do not stop without doctor's advice",
      "Stay well hydrated throughout the day",
    ],
    sideEffects: {
      common: ["Nausea", "Diarrhea", "Stomach discomfort", "Loss of appetite", "Metallic taste"],
      lessCommon: ["Vitamin B12 deficiency (with long-term use)", "Weakness", "Headache"],
      serious: [
        "Lactic acidosis (rare but serious): muscle pain, weakness, difficulty breathing, slow/irregular heartbeat, stomach pain with vomiting",
        "Severe low blood sugar (if combined with other diabetes medicines)",
      ],
    },
    storage: "Store at room temperature, away from moisture and heat.",
    callDoctorIf: [
      "You have severe vomiting or diarrhea — you may become dehydrated",
      "You're scheduled for surgery or X-ray with contrast dye",
      "You feel extreme muscle pain or weakness",
      "You have difficulty breathing",
      "Blood sugar is consistently too low or too high",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Amlodipine",
    strength: "5mg",
    commonBrands: ["Amlip", "Amlopin", "Norvasc", "Stamlo"],
    whatItDoes: "Amlodipine is a calcium channel blocker used to treat high blood pressure (hypertension) and chest pain (angina). It relaxes blood vessels so the heart doesn't have to work as hard.",
    howToTake: [
      "Take once daily, with or without food",
      "Take at the same time each day",
      "Do not stop taking without your doctor's guidance",
      "Continue even if you feel well — high blood pressure has no symptoms",
      "Avoid grapefruit juice as it can interact with this medicine",
    ],
    sideEffects: {
      common: ["Swollen ankles or feet", "Flushing (feeling warm/red)", "Headache", "Dizziness", "Tiredness"],
      lessCommon: ["Nausea", "Stomach pain", "Palpitations"],
      serious: [
        "Severe dizziness or fainting",
        "Very fast or irregular heartbeat",
        "Chest pain that is worsening",
        "Severe swelling of hands/feet",
      ],
    },
    storage: "Store below 30°C, protected from light.",
    callDoctorIf: [
      "You experience severe swelling of legs or ankles",
      "You feel chest pain or pressure",
      "You faint or feel extremely dizzy",
      "Your heartbeat is very fast or irregular",
      "You want to stop this medicine",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Atorvastatin",
    strength: "10mg",
    commonBrands: ["Lipitor", "Atorva", "Storvas"],
    whatItDoes: "Atorvastatin is a statin medicine that lowers cholesterol and fats (triglycerides) in your blood to reduce the risk of heart attack and stroke.",
    howToTake: [
      "Take once daily, at any time — with or without food",
      "Can be taken at night for best effect",
      "Do not crush or chew — swallow whole",
      "Continue even if your cholesterol levels improve",
      "Avoid large amounts of grapefruit or grapefruit juice",
    ],
    sideEffects: {
      common: ["Muscle aches or pain", "Headache", "Nausea", "Diarrhea or constipation"],
      lessCommon: ["Joint pain", "Insomnia", "Elevated blood sugar"],
      serious: [
        "Severe muscle pain, weakness or dark urine (sign of muscle breakdown — rhabdomyolysis)",
        "Liver problems (yellowing of skin, dark urine, severe tiredness)",
        "Severe allergic reaction",
      ],
    },
    storage: "Store at room temperature (20–25°C), away from light and moisture.",
    callDoctorIf: [
      "You have unexplained muscle pain, tenderness, or weakness",
      "Your urine becomes dark or tea-colored",
      "You develop yellowing of skin or eyes",
      "You become pregnant",
      "You need to stop this medicine",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Omeprazole",
    strength: "20mg",
    commonBrands: ["Prilosec", "Ocid", "Omez", "Losec"],
    whatItDoes: "Omeprazole is a proton pump inhibitor (PPI) that reduces the amount of acid your stomach makes. It treats acid reflux, heartburn, stomach ulcers, and protects the stomach from NSAID damage.",
    howToTake: [
      "Take 30 minutes before a meal, usually in the morning",
      "Swallow capsules whole — do not crush or chew",
      "Take for the full prescribed course even if symptoms improve",
      "If you miss a dose, take it when you remember (skip if near next dose)",
    ],
    sideEffects: {
      common: ["Headache", "Nausea", "Diarrhea", "Stomach pain", "Flatulence"],
      lessCommon: ["Constipation", "Dry mouth", "Dizziness", "Rash"],
      serious: [
        "Severe diarrhea (may be C. difficile infection)",
        "Low magnesium levels (muscle spasms, irregular heartbeat)",
        "Kidney problems",
        "Vitamin B12 deficiency (long-term use)",
        "Severe allergic reaction",
      ],
    },
    storage: "Store at room temperature, protected from moisture.",
    callDoctorIf: [
      "Symptoms don't improve after 2 weeks",
      "You have trouble swallowing or persistent abdominal pain",
      "You notice blood in vomit or stool",
      "You develop severe diarrhea",
      "You have been taking this medicine for more than 3 months without doctor review",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Aspirin",
    strength: "75mg",
    commonBrands: ["Ecosprin", "Disprin", "Bayer Aspirin"],
    whatItDoes: "At low doses (75mg), aspirin prevents blood clots and reduces the risk of heart attack and stroke. At higher doses it relieves pain and fever.",
    howToTake: [
      "Take once daily, usually in the morning with food",
      "Swallow with a full glass of water",
      "Do not crush or chew enteric-coated tablets",
      "Do not stop without your doctor's guidance (especially if taken for heart protection)",
    ],
    sideEffects: {
      common: ["Stomach upset", "Nausea", "Indigestion"],
      lessCommon: ["Heartburn", "Increased bruising"],
      serious: [
        "Stomach or intestinal bleeding (black or bloody stools)",
        "Serious allergic reaction",
        "Ringing in ears (at high doses)",
        "Severe headache",
      ],
    },
    storage: "Store at room temperature, away from heat and moisture.",
    callDoctorIf: [
      "You notice black, tarry or bloody stools",
      "You vomit blood",
      "You develop ringing in your ears",
      "You need to stop before surgery",
      "You are pregnant",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
  {
    name: "Amoxicillin",
    strength: "500mg",
    commonBrands: ["Mox", "Novamox", "Amoxil", "Trimox"],
    whatItDoes: "Amoxicillin is an antibiotic that kills bacteria. It treats infections like ear infections, throat infections, chest infections, urinary tract infections, and skin infections.",
    howToTake: [
      "Take every 8 hours (three times a day) or as prescribed",
      "Can be taken with or without food",
      "Complete the FULL course even if you feel better",
      "Take at evenly spaced times throughout the day",
      "If you miss a dose, take it as soon as possible and continue your schedule",
    ],
    sideEffects: {
      common: ["Diarrhea", "Nausea", "Stomach discomfort", "Headache", "Skin rash"],
      lessCommon: ["Vomiting", "Vaginal yeast infection"],
      serious: [
        "Severe allergic reaction (hives, swelling of face/throat, difficulty breathing — CALL EMERGENCY SERVICES)",
        "Severe diarrhea with blood or mucus (may be C. difficile)",
        "Severe skin reaction (peeling, blistering skin)",
        "Yellowing of skin or eyes",
      ],
    },
    storage: "Store at room temperature. Liquid form must be refrigerated and used within 14 days.",
    callDoctorIf: [
      "You develop a rash, hives, or swelling — you may be allergic to penicillin",
      "Symptoms don't improve after 3 days of treatment",
      "You develop severe diarrhea during or after treatment",
      "You experience difficulty breathing or swallowing",
    ],
    verified: true,
    source: "FDA/WHO verified",
  },
];

const dosages = [
  {
    medicineName: "Paracetamol",
    safeSingleDose: "500-1000mg",
    safeDailyRange: "500-4000",
    maxPerDay: "4000mg",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Ibuprofen",
    safeSingleDose: "200-400mg",
    safeDailyRange: "200-1200",
    maxPerDay: "1200mg OTC; 3200mg prescription",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Metformin",
    safeSingleDose: "500mg",
    safeDailyRange: "500-2550",
    maxPerDay: "2550mg",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Amlodipine",
    safeSingleDose: "5-10mg",
    safeDailyRange: "2.5-10",
    maxPerDay: "10mg",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Atorvastatin",
    safeSingleDose: "10-80mg",
    safeDailyRange: "10-80",
    maxPerDay: "80mg",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Omeprazole",
    safeSingleDose: "20-40mg",
    safeDailyRange: "20-40",
    maxPerDay: "40mg standard; 120mg in Zollinger-Ellison",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Aspirin",
    safeSingleDose: "75-325mg",
    safeDailyRange: "75-325",
    maxPerDay: "325mg (antiplatelet); higher doses only under medical supervision",
    source: "FDA/WHO verified",
  },
  {
    medicineName: "Amoxicillin",
    safeSingleDose: "250-500mg",
    safeDailyRange: "750-3000",
    maxPerDay: "3000mg",
    source: "FDA/WHO verified",
  },
];

function makeKey(a, b) {
  return [a, b].map((n) => n.trim().toLowerCase()).sort().join("__");
}

const interactions = [
  {
    pairKey: makeKey("Ibuprofen", "Aspirin"),
    drugA: "Ibuprofen",
    drugB: "Aspirin",
    severity: "caution",
    explanation: "Taking ibuprofen with aspirin can reduce aspirin's ability to protect the heart. Ibuprofen may block aspirin's antiplatelet effect.",
    whatToWatch: "If you take low-dose aspirin for heart protection, talk to your doctor before using ibuprofen regularly.",
    source: "FDA Drug Interaction Warning",
  },
  {
    pairKey: makeKey("Metformin", "Ibuprofen"),
    drugA: "Metformin",
    drugB: "Ibuprofen",
    severity: "caution",
    explanation: "NSAIDs like ibuprofen can reduce kidney blood flow and increase the risk of lactic acidosis when combined with metformin.",
    whatToWatch: "Stay well hydrated. Use paracetamol for pain relief instead when possible. Avoid prolonged use together.",
    source: "WHO/FDA clinical guidance",
  },
  {
    pairKey: makeKey("Amlodipine", "Atorvastatin"),
    drugA: "Amlodipine",
    drugB: "Atorvastatin",
    severity: "caution",
    explanation: "Amlodipine can increase the blood levels of atorvastatin slightly, which may increase the risk of muscle side effects.",
    whatToWatch: "Watch for unexplained muscle pain or weakness. Report to doctor if it occurs.",
    source: "FDA label interaction data",
  },
  {
    pairKey: makeKey("Aspirin", "Metformin"),
    drugA: "Aspirin",
    drugB: "Metformin",
    severity: "safe",
    explanation: "Low-dose aspirin and metformin are commonly prescribed together for diabetic patients with cardiovascular risk. This combination is generally considered safe.",
    whatToWatch: "Monitor blood sugar levels as aspirin can slightly affect glucose readings.",
    source: "Standard clinical practice guidelines",
  },
  {
    pairKey: makeKey("Omeprazole", "Aspirin"),
    drugA: "Omeprazole",
    drugB: "Aspirin",
    severity: "safe",
    explanation: "Omeprazole is often prescribed alongside aspirin to protect the stomach lining from aspirin's irritating effects.",
    whatToWatch: "This combination is usually intentional and beneficial. Continue as prescribed.",
    source: "Standard clinical practice guidelines",
  },
  {
    pairKey: makeKey("Ibuprofen", "Omeprazole"),
    drugA: "Ibuprofen",
    drugB: "Omeprazole",
    severity: "safe",
    explanation: "Omeprazole helps protect the stomach from ibuprofen's irritating effects. This combination is commonly prescribed together.",
    whatToWatch: "Take ibuprofen with food. Report any stomach pain or black stools immediately.",
    source: "Standard clinical practice guidelines",
  },
  {
    pairKey: makeKey("Amoxicillin", "Metformin"),
    drugA: "Amoxicillin",
    drugB: "Metformin",
    severity: "safe",
    explanation: "Amoxicillin and metformin do not have a significant direct drug interaction and can generally be taken together safely.",
    whatToWatch: "Monitor blood sugar levels during the antibiotic course as illness itself can affect glucose levels.",
    source: "Standard clinical reference",
  },
  {
    pairKey: makeKey("Aspirin", "Ibuprofen"),
    drugA: "Aspirin",
    drugB: "Ibuprofen",
    severity: "caution",
    explanation: "Ibuprofen can interfere with the cardioprotective effects of low-dose aspirin by competing for the same binding site on platelets.",
    whatToWatch: "If you need pain relief while on aspirin, ask your doctor about alternatives like paracetamol.",
    source: "FDA Drug Safety Communication",
  },
];

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected!");

  console.log("🗑️  Clearing existing seed data...");
  await Medicine.deleteMany({ source: /verified/ });
  await Dosage.deleteMany({});
  await Interaction.deleteMany({});

  console.log("💊 Seeding medicines...");
  await Medicine.insertMany(medicines);
  console.log(`   ✅ ${medicines.length} medicines seeded`);

  console.log("📏 Seeding dosages...");
  await Dosage.insertMany(dosages);
  console.log(`   ✅ ${dosages.length} dosages seeded`);

  console.log("⚡ Seeding interactions...");
  for (const interaction of interactions) {
    await Interaction.findOneAndUpdate(
      { pairKey: interaction.pairKey },
      interaction,
      { upsert: true }
    );
  }
  console.log(`   ✅ ${interactions.length} interactions seeded`);

  console.log("\n🎉 Seed complete! MediSimple database is ready.");
  console.log("   Run: npm run dev");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
