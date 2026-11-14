/**
 * Geographic Classification & Normalization Engine for Campus Connect
 * 
 * Supports:
 * - All 28 Indian States & 8 Union Territories with ISO 3166-2:IN codes
 * - Comprehensive verified city-to-state and city-to-country mapping
 * - High-confidence domestic vs international classification
 * - Transparent classification tracking: explicit_country, verified_location_mapping, unknown
 */

// All 36 Indian States & Union Territories (ISO 3166-2:IN)
export const INDIAN_STATES_AND_UTS = [
  { name: "Andhra Pradesh", code: "IN-AP", type: "state" },
  { name: "Arunachal Pradesh", code: "IN-AR", type: "state" },
  { name: "Assam", code: "IN-AS", type: "state" },
  { name: "Bihar", code: "IN-BR", type: "state" },
  { name: "Chhattisgarh", code: "IN-CT", type: "state" },
  { name: "Goa", code: "IN-GA", type: "state" },
  { name: "Gujarat", code: "IN-GJ", type: "state" },
  { name: "Haryana", code: "IN-HR", type: "state" },
  { name: "Himachal Pradesh", code: "IN-HP", type: "state" },
  { name: "Jharkhand", code: "IN-JH", type: "state" },
  { name: "Karnataka", code: "IN-KA", type: "state" },
  { name: "Kerala", code: "IN-KL", type: "state" },
  { name: "Madhya Pradesh", code: "IN-MP", type: "state" },
  { name: "Maharashtra", code: "IN-MH", type: "state" },
  { name: "Manipur", code: "IN-MN", type: "state" },
  { name: "Meghalaya", code: "IN-ML", type: "state" },
  { name: "Mizoram", code: "IN-MZ", type: "state" },
  { name: "Nagaland", code: "IN-NL", type: "state" },
  { name: "Odisha", code: "IN-OD", type: "state" },
  { name: "Punjab", code: "IN-PB", type: "state" },
  { name: "Rajasthan", code: "IN-RJ", type: "state" },
  { name: "Sikkim", code: "IN-SK", type: "state" },
  { name: "Tamil Nadu", code: "IN-TN", type: "state" },
  { name: "Telangana", code: "IN-TG", type: "state" },
  { name: "Tripura", code: "IN-TR", type: "state" },
  { name: "Uttar Pradesh", code: "IN-UP", type: "state" },
  { name: "Uttarakhand", code: "IN-UT", type: "state" },
  { name: "West Bengal", code: "IN-WB", type: "state" },
  { name: "Andaman and Nicobar Islands", code: "IN-AN", type: "ut" },
  { name: "Chandigarh", code: "IN-CH", type: "ut" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "IN-DH", type: "ut" },
  { name: "Delhi", code: "IN-DL", type: "ut" },
  { name: "Jammu and Kashmir", code: "IN-JK", type: "ut" },
  { name: "Ladakh", code: "IN-LA", type: "ut" },
  { name: "Lakshadweep", code: "IN-LD", type: "ut" },
  { name: "Puducherry", code: "IN-PY", type: "ut" },
];

// Map state name lowercase to object
export const STATE_LOOKUP = new Map();
INDIAN_STATES_AND_UTS.forEach((s) => {
  STATE_LOOKUP.set(s.name.toLowerCase(), s);
  STATE_LOOKUP.set(s.code.toLowerCase(), s);
});

// Verified Indian cities and regions mapped to State & Normalized City Name
export const INDIAN_CITY_TO_STATE_MAP = {
  // Delhi NCR
  delhi: { city: "Delhi", state: "Delhi", stateCode: "IN-DL" },
  "new delhi": { city: "New Delhi", state: "Delhi", stateCode: "IN-DL" },
  pitampura: { city: "Pitampura", state: "Delhi", stateCode: "IN-DL" },
  rohini: { city: "Rohini", state: "Delhi", stateCode: "IN-DL" },
  dwarka: { city: "Dwarka", state: "Delhi", stateCode: "IN-DL" },
  okhla: { city: "Okhla", state: "Delhi", stateCode: "IN-DL" },

  // Uttar Pradesh
  noida: { city: "Noida", state: "Uttar Pradesh", stateCode: "IN-UP" },
  "greater noida": { city: "Greater Noida", state: "Uttar Pradesh", stateCode: "IN-UP" },
  "gautam buddha nagar": { city: "Gautam Buddha Nagar", state: "Uttar Pradesh", stateCode: "IN-UP" },
  lucknow: { city: "Lucknow", state: "Uttar Pradesh", stateCode: "IN-UP" },
  kanpur: { city: "Kanpur", state: "Uttar Pradesh", stateCode: "IN-UP" },
  varanasi: { city: "Varanasi", state: "Uttar Pradesh", stateCode: "IN-UP" },
  prayagraj: { city: "Prayagraj", state: "Uttar Pradesh", stateCode: "IN-UP" },
  allahabad: { city: "Prayagraj", state: "Uttar Pradesh", stateCode: "IN-UP" },
  agra: { city: "Agra", state: "Uttar Pradesh", stateCode: "IN-UP" },
  ghaziabad: { city: "Ghaziabad", state: "Uttar Pradesh", stateCode: "IN-UP" },
  gorakhpur: { city: "Gorakhpur", state: "Uttar Pradesh", stateCode: "IN-UP" },
  meerut: { city: "Meerut", state: "Uttar Pradesh", stateCode: "IN-UP" },
  bareilly: { city: "Bareilly", state: "Uttar Pradesh", stateCode: "IN-UP" },
  aligarh: { city: "Aligarh", state: "Uttar Pradesh", stateCode: "IN-UP" },
  mathura: { city: "Mathura", state: "Uttar Pradesh", stateCode: "IN-UP" },

  // Karnataka
  bengaluru: { city: "Bengaluru", state: "Karnataka", stateCode: "IN-KA" },
  bangalore: { city: "Bengaluru", state: "Karnataka", stateCode: "IN-KA" },
  mysuru: { city: "Mysuru", state: "Karnataka", stateCode: "IN-KA" },
  mysore: { city: "Mysuru", state: "Karnataka", stateCode: "IN-KA" },
  mangaluru: { city: "Mangaluru", state: "Karnataka", stateCode: "IN-KA" },
  mangalore: { city: "Mangaluru", state: "Karnataka", stateCode: "IN-KA" },
  hubballi: { city: "Hubballi", state: "Karnataka", stateCode: "IN-KA" },
  hubli: { city: "Hubballi", state: "Karnataka", stateCode: "IN-KA" },
  belagavi: { city: "Belagavi", state: "Karnataka", stateCode: "IN-KA" },
  manipal: { city: "Manipal", state: "Karnataka", stateCode: "IN-KA" },
  surathkal: { city: "Surathkal", state: "Karnataka", stateCode: "IN-KA" },
  tumakuru: { city: "Tumakuru", state: "Karnataka", stateCode: "IN-KA" },
  tumakur: { city: "Tumakuru", state: "Karnataka", stateCode: "IN-KA" },
  davanagere: { city: "Davanagere", state: "Karnataka", stateCode: "IN-KA" },

  // Maharashtra
  mumbai: { city: "Mumbai", state: "Maharashtra", stateCode: "IN-MH" },
  pune: { city: "Pune", state: "Maharashtra", stateCode: "IN-MH" },
  nagpur: { city: "Nagpur", state: "Maharashtra", stateCode: "IN-MH" },
  nashik: { city: "Nashik", state: "Maharashtra", stateCode: "IN-MH" },
  thane: { city: "Thane", state: "Maharashtra", stateCode: "IN-MH" },
  kalyan: { city: "Kalyan", state: "Maharashtra", stateCode: "IN-MH" },
  "navi mumbai": { city: "Navi Mumbai", state: "Maharashtra", stateCode: "IN-MH" },
  kharghar: { city: "Kharghar", state: "Maharashtra", stateCode: "IN-MH" },
  powai: { city: "Mumbai (Powai)", state: "Maharashtra", stateCode: "IN-MH" },
  boisar: { city: "Boisar", state: "Maharashtra", stateCode: "IN-MH" },
  aurangabad: { city: "Chhatrapati Sambhaji Nagar", state: "Maharashtra", stateCode: "IN-MH" },
  "pimpri-chinchwad": { city: "Pune (Pimpri-Chinchwad)", state: "Maharashtra", stateCode: "IN-MH" },
  kolhapur: { city: "Kolhapur", state: "Maharashtra", stateCode: "IN-MH" },
  solapur: { city: "Solapur", state: "Maharashtra", stateCode: "IN-MH" },

  // Telangana
  hyderabad: { city: "Hyderabad", state: "Telangana", stateCode: "IN-TG" },
  secunderabad: { city: "Secunderabad", state: "Telangana", stateCode: "IN-TG" },
  warangal: { city: "Warangal", state: "Telangana", stateCode: "IN-TG" },

  // Tamil Nadu
  chennai: { city: "Chennai", state: "Tamil Nadu", stateCode: "IN-TN" },
  coimbatore: { city: "Coimbatore", state: "Tamil Nadu", stateCode: "IN-TN" },
  madurai: { city: "Madurai", state: "Tamil Nadu", stateCode: "IN-TN" },
  tiruchirappalli: { city: "Tiruchirappalli", state: "Tamil Nadu", stateCode: "IN-TN" },
  trichy: { city: "Tiruchirappalli", state: "Tamil Nadu", stateCode: "IN-TN" },
  salem: { city: "Salem", state: "Tamil Nadu", stateCode: "IN-TN" },
  erode: { city: "Erode", state: "Tamil Nadu", stateCode: "IN-TN" },
  ooty: { city: "Ooty", state: "Tamil Nadu", stateCode: "IN-TN" },
  myladi: { city: "Myladi", state: "Tamil Nadu", stateCode: "IN-TN" },
  vellore: { city: "Vellore", state: "Tamil Nadu", stateCode: "IN-TN" },

  // West Bengal
  kolkata: { city: "Kolkata", state: "West Bengal", stateCode: "IN-WB" },
  calcutta: { city: "Kolkata", state: "West Bengal", stateCode: "IN-WB" },
  jalpaiguri: { city: "Jalpaiguri", state: "West Bengal", stateCode: "IN-WB" },
  "purba medinipur district": { city: "Purba Medinipur", state: "West Bengal", stateCode: "IN-WB" },
  howrah: { city: "Howrah", state: "West Bengal", stateCode: "IN-WB" },
  durgapur: { city: "Durgapur", state: "West Bengal", stateCode: "IN-WB" },
  siliguri: { city: "Siliguri", state: "West Bengal", stateCode: "IN-WB" },
  kharagpur: { city: "Kharagpur", state: "West Bengal", stateCode: "IN-WB" },

  // Rajasthan
  jaipur: { city: "Jaipur", state: "Rajasthan", stateCode: "IN-RJ" },
  jodhpur: { city: "Jodhpur", state: "Rajasthan", stateCode: "IN-RJ" },
  udaipur: { city: "Udaipur", state: "Rajasthan", stateCode: "IN-RJ" },
  kota: { city: "Kota", state: "Rajasthan", stateCode: "IN-RJ" },
  pilani: { city: "Pilani", state: "Rajasthan", stateCode: "IN-RJ" },
  bikaner: { city: "Bikaner", state: "Rajasthan", stateCode: "IN-RJ" },

  // Gujarat
  ahmedabad: { city: "Ahmedabad", state: "Gujarat", stateCode: "IN-GJ" },
  surat: { city: "Surat", state: "Gujarat", stateCode: "IN-GJ" },
  vadodara: { city: "Vadodara", state: "Gujarat", stateCode: "IN-GJ" },
  gandhinagar: { city: "Gandhinagar", state: "Gujarat", stateCode: "IN-GJ" },
  rajkot: { city: "Rajkot", state: "Gujarat", stateCode: "IN-GJ" },

  // Haryana
  gurgaon: { city: "Gurugram", state: "Haryana", stateCode: "IN-HR" },
  gurugram: { city: "Gurugram", state: "Haryana", stateCode: "IN-HR" },
  faridabad: { city: "Faridabad", state: "Haryana", stateCode: "IN-HR" },
  panipat: { city: "Panipat", state: "Haryana", stateCode: "IN-HR" },
  kurukshetra: { city: "Kurukshetra", state: "Haryana", stateCode: "IN-HR" },

  // Punjab
  chandigarh: { city: "Chandigarh", state: "Chandigarh", stateCode: "IN-CH" },
  ludhiana: { city: "Ludhiana", state: "Punjab", stateCode: "IN-PB" },
  amritsar: { city: "Amritsar", state: "Punjab", stateCode: "IN-PB" },
  jalandhar: { city: "Jalandhar", state: "Punjab", stateCode: "IN-PB" },
  patiala: { city: "Patiala", state: "Punjab", stateCode: "IN-PB" },
  mohali: { city: "Mohali", state: "Punjab", stateCode: "IN-PB" },

  // Madhya Pradesh
  bhopal: { city: "Bhopal", state: "Madhya Pradesh", stateCode: "IN-MP" },
  indore: { city: "Indore", state: "Madhya Pradesh", stateCode: "IN-MP" },
  gwalior: { city: "Gwalior", state: "Madhya Pradesh", stateCode: "IN-MP" },
  jabalpur: { city: "Jabalpur", state: "Madhya Pradesh", stateCode: "IN-MP" },

  // Kerala
  kochi: { city: "Kochi", state: "Kerala", stateCode: "IN-KL" },
  cochin: { city: "Kochi", state: "Kerala", stateCode: "IN-KL" },
  thiruvananthapuram: { city: "Thiruvananthapuram", state: "Kerala", stateCode: "IN-KL" },
  trivandrum: { city: "Thiruvananthapuram", state: "Kerala", stateCode: "IN-KL" },
  kozhikode: { city: "Kozhikode", state: "Kerala", stateCode: "IN-KL" },

  // Odisha
  bhubaneswar: { city: "Bhubaneswar", state: "Odisha", stateCode: "IN-OD" },
  cuttack: { city: "Cuttack", state: "Odisha", stateCode: "IN-OD" },
  rourkela: { city: "Rourkela", state: "Odisha", stateCode: "IN-OD" },

  // Andhra Pradesh
  visakhapatnam: { city: "Visakhapatnam", state: "Andhra Pradesh", stateCode: "IN-AP" },
  vizag: { city: "Visakhapatnam", state: "Andhra Pradesh", stateCode: "IN-AP" },
  vijayawada: { city: "Vijayawada", state: "Andhra Pradesh", stateCode: "IN-AP" },
  tirupati: { city: "Tirupati", state: "Andhra Pradesh", stateCode: "IN-AP" },
  tekkali: { city: "Tekkali", state: "Andhra Pradesh", stateCode: "IN-AP" },

  // Uttarakhand
  dehradun: { city: "Dehradun", state: "Uttarakhand", stateCode: "IN-UT" },
  roorkee: { city: "Roorkee", state: "Uttarakhand", stateCode: "IN-UT" },
  haridwar: { city: "Haridwar", state: "Uttarakhand", stateCode: "IN-UT" },
  rishikesh: { city: "Rishikesh", state: "Uttarakhand", stateCode: "IN-UT" },

  // Bihar
  patna: { city: "Patna", state: "Bihar", stateCode: "IN-BR" },
  gaya: { city: "Gaya", state: "Bihar", stateCode: "IN-BR" },

  // Jharkhand
  ranchi: { city: "Ranchi", state: "Jharkhand", stateCode: "IN-JH" },
  jamshedpur: { city: "Jamshedpur", state: "Jharkhand", stateCode: "IN-JH" },
  dhanbad: { city: "Dhanbad", state: "Jharkhand", stateCode: "IN-JH" },

  // Chhattisgarh
  raipur: { city: "Raipur", state: "Chhattisgarh", stateCode: "IN-CT" },
  bhilai: { city: "Bhilai", state: "Chhattisgarh", stateCode: "IN-CT" },

  // Assam
  guwahati: { city: "Guwahati", state: "Assam", stateCode: "IN-AS" },

  // Goa
  panaji: { city: "Panaji", state: "Goa", stateCode: "IN-GA" },

  // Jammu & Kashmir
  srinagar: { city: "Srinagar", state: "Jammu and Kashmir", stateCode: "IN-JK" },
  jammu: { city: "Jammu", state: "Jammu and Kashmir", stateCode: "IN-JK" },
};

// Recognized Indian Educational Institutions & Tech Circles with specific campus locations
export const VERIFIED_INDIAN_INSTITUTIONS_MAP = [
  {
    regex: /(motilal nehru|mnnit)/i,
    city: "Prayagraj",
    state: "Uttar Pradesh",
    stateCode: "IN-UP",
  },
  {
    regex: /(iit\s*,?\s*madras|indian institute of technology.*madras)/i,
    city: "Chennai",
    state: "Tamil Nadu",
    stateCode: "IN-TN",
  },
  {
    regex: /(iit\s*,?\s*ropar|indian institute of technology.*ropar)/i,
    city: "Rupnagar",
    state: "Punjab",
    stateCode: "IN-PB",
  },
  {
    regex: /(anna university|college of engineering.*guindy|ceg.*guindy)/i,
    city: "Chennai",
    state: "Tamil Nadu",
    stateCode: "IN-TN",
  },
  {
    regex: /(fcrit|fr\.\s*c\.\s*rodrigues)/i,
    city: "Navi Mumbai",
    state: "Maharashtra",
    stateCode: "IN-MH",
  },
  {
    regex: /(karpagam)/i,
    city: "Coimbatore",
    state: "Tamil Nadu",
    stateCode: "IN-TN",
  },
  {
    regex: /(hackwithpune|hack with pune|codeelitepune)/i,
    city: "Pune",
    state: "Maharashtra",
    stateCode: "IN-MH",
  },
];

// Verified International Locations / Universities
export const INTERNATIONAL_MARKERS = [
  { term: "chicago", country: "United States", countryCode: "US" },
  { term: "toronto", country: "Canada", countryCode: "CA" },
  { term: "edmonton", country: "Canada", countryCode: "CA" },
  { term: "mississauga", country: "Canada", countryCode: "CA" },
  { term: "calgary", country: "Canada", countryCode: "CA" },
  { term: "vancouver", country: "Canada", countryCode: "CA" },
  { term: "san francisco", country: "United States", countryCode: "US" },
  { term: "pleasanton", country: "United States", countryCode: "US" },
  { term: "milpitas", country: "United States", countryCode: "US" },
  { term: "bay area", country: "United States", countryCode: "US" },
  { term: "stanford", country: "United States", countryCode: "US" },
  { term: "georgia tech", country: "United States", countryCode: "US" },
  { term: "ohio state", country: "United States", countryCode: "US" },
  { term: "asu engineering", country: "United States", countryCode: "US" },
  { term: "usc", country: "United States", countryCode: "US" },
  { term: "virginia beach", country: "United States", countryCode: "US" },
  { term: "emory univ", country: "United States", countryCode: "US" },
  { term: "hong kong", country: "Hong Kong", countryCode: "HK" },
  { term: "vilnius", country: "Lithuania", countryCode: "LT" },
  { term: "tallinn", country: "Estonia", countryCode: "EE" },
  { term: "dubai", country: "United Arab Emirates", countryCode: "AE" },
  { term: "tum audimax", country: "Germany", countryCode: "DE" },
  { term: "košice", country: "Slovakia", countryCode: "SK" },
  { term: "brighton", country: "United Kingdom", countryCode: "GB" },
  { term: "chiang mai", country: "Thailand", countryCode: "TH" },
  { term: "mexico", country: "Mexico", countryCode: "MX" },
  { term: "australia", country: "Australia", countryCode: "AU" },
  { term: "singapore", country: "Singapore", countryCode: "SG" },
  { term: "london", country: "United Kingdom", countryCode: "GB" },
  { term: "usa", country: "United States", countryCode: "US" },
  { term: "canada", country: "Canada", countryCode: "CA" },
  { term: "rome", country: "Italy", countryCode: "IT" },
  { term: "italy", country: "Italy", countryCode: "IT" },
  { term: "swiss school of management", country: "Italy", countryCode: "IT" },
  { term: "switzerland", country: "Switzerland", countryCode: "CH" },
  { term: "germany", country: "Germany", countryCode: "DE" },
  { term: "france", country: "France", countryCode: "FR" },
  { term: "netherlands", country: "Netherlands", countryCode: "NL" },
  { term: "japan", country: "Japan", countryCode: "JP" },
];

/**
 * Classifies location using verified evidence
 * @param {Object} item
 * @returns {Object} { country, countryCode, state, stateCode, city, locationType, countryDetectionMethod }
 */
export function classifyLocation(item = {}) {
  const locStr = (item.location || "").trim();
  const orgStr = (item.organizer || "").trim();
  const eligStr = (item.eligibility || "").trim();
  const titleStr = (item.title || "").trim();
  const fullText = `${locStr} ${orgStr} ${titleStr}`.toLowerCase();

  // 1. Check verified Indian cities first
  for (const [key, mapping] of Object.entries(INDIAN_CITY_TO_STATE_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(locStr) || regex.test(orgStr)) {
      return {
        country: "India",
        countryCode: "IN",
        state: mapping.state,
        stateCode: mapping.stateCode,
        city: mapping.city,
        locationType: "domestic",
        countryDetectionMethod: "verified_location_mapping",
      };
    }
  }

  // 2. Check verified Indian States
  for (const st of INDIAN_STATES_AND_UTS) {
    const regex = new RegExp(`\\b${st.name}\\b`, "i");
    if (regex.test(locStr) || regex.test(orgStr)) {
      return {
        country: "India",
        countryCode: "IN",
        state: st.name,
        stateCode: st.code,
        city: null,
        locationType: "domestic",
        countryDetectionMethod: "verified_location_mapping",
      };
    }
  }

  // 2b. Check recognized Indian Educational Institutions with known campuses
  for (const inst of VERIFIED_INDIAN_INSTITUTIONS_MAP) {
    if (inst.regex.test(orgStr) || inst.regex.test(titleStr)) {
      return {
        country: "India",
        countryCode: "IN",
        state: inst.state,
        stateCode: inst.stateCode,
        city: inst.city,
        locationType: "domestic",
        countryDetectionMethod: "verified_location_mapping",
      };
    }
  }

  // 3. Check international cities/universities/markers
  for (const m of INTERNATIONAL_MARKERS) {
    const regex = new RegExp(`\\b${m.term}\\b`, "i");
    if (regex.test(locStr) || regex.test(orgStr) || regex.test(titleStr)) {
      return {
        country: m.country,
        countryCode: m.countryCode,
        state: null,
        stateCode: null,
        city: locStr.includes(",") ? locStr.split(",")[0].trim() : null,
        locationType: "international",
        countryDetectionMethod: "verified_location_mapping",
      };
    }
  }

  // 4. Online hackathons with India-specific verified eligibility or recognized Indian institutions
  const indianInstitutionKeywords = [
    "nit ",
    "iit ",
    "iiit ",
    "bits ",
    "vit ",
    "srm ",
    "aditya",
    "delhi technological",
    "dtu",
    "amity",
    "manipal",
    "thapar",
    "lpu",
    "chandigarh university",
    "symbiosis",
    "nims university",
    "upes",
    "bharat",
    "aicte",
    "indian college",
    "colleges across india",
    "indian university",
    "students across india",
    "private limited",
    "pvt limited",
    "pvt ltd",
    "solutions llp",
    "services llp",
    "innovate india",
    "codeastra india",
    "codecrafters india",
    "national online hackathon",
    "indian institute of technology",
    "national institute of technology",
    "indian institute of information technology",
  ];

  const hasIndianInstitution = indianInstitutionKeywords.some((kw) =>
    fullText.includes(kw)
  );

  const hasIndianEligibility =
    eligStr.toLowerCase().includes("india") ||
    eligStr.toLowerCase().includes("indian");

  if (hasIndianInstitution || hasIndianEligibility) {
    return {
      country: "India",
      countryCode: "IN",
      state: null,
      stateCode: null,
      city: null,
      locationType: "domestic",
      countryDetectionMethod: "verified_location_mapping",
    };
  }

  // 5. Explicit "India" keyword in location
  if (/\bindia\b/i.test(locStr) || /\bbharat\b/i.test(locStr)) {
    return {
      country: "India",
      countryCode: "IN",
      state: null,
      stateCode: null,
      city: null,
      locationType: "domestic",
      countryDetectionMethod: "explicit_country",
    };
  }

  // 6. Explicit international markers or global student groups (e.g., Hack Club global, Devpost international)
  if (
    locStr.toLowerCase().includes("usa") ||
    locStr.toLowerCase().includes("uk") ||
    locStr.toLowerCase().includes("europe") ||
    locStr.toLowerCase().includes("global") ||
    orgStr.toLowerCase().includes("hack club") ||
    orgStr.toLowerCase().includes("chi tech")
  ) {
    return {
      country: "International",
      countryCode: "INT",
      state: null,
      stateCode: null,
      city: null,
      locationType: "international",
      countryDetectionMethod: "verified_location_mapping",
    };
  }

  // 7. Unknown / Location Not Specified (Do not invent data!)
  return {
    country: null,
    countryCode: null,
    state: null,
    stateCode: null,
    city: null,
    locationType: "unknown",
    countryDetectionMethod: "unknown",
  };
}

export default {
  INDIAN_STATES_AND_UTS,
  INDIAN_CITY_TO_STATE_MAP,
  INTERNATIONAL_MARKERS,
  STATE_LOOKUP,
  classifyLocation,
};
