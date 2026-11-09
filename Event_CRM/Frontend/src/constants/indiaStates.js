export const STATE_LIST = [
  { name: "Andaman and Nicobar Islands", slug: "andaman-and-nicobar-islands" },
  { name: "Andhra Pradesh", slug: "andhra-pradesh" },
  { name: "Arunachal Pradesh", slug: "arunachal-pradesh" },
  { name: "Assam", slug: "assam" },
  { name: "Bihar", slug: "bihar" },
  { name: "Chandigarh", slug: "chandigarh" },
  { name: "Chhattisgarh", slug: "chhattisgarh" },
  { name: "Delhi", slug: "delhi" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", slug: "dnh-and-dd" },
  { name: "Goa", slug: "goa" },
  { name: "Gujarat", slug: "gujarat" },
  { name: "Haryana", slug: "haryana" },
  { name: "Himachal Pradesh", slug: "himachal-pradesh" },
  { name: "Jammu and Kashmir", slug: "jammu-and-kashmir" },
  { name: "Jharkhand", slug: "jharkhand" },
  { name: "Karnataka", slug: "karnataka" },
  { name: "Kerala", slug: "kerala" },
  { name: "Ladakh", slug: "ladakh" },
  { name: "Lakshadweep", slug: "lakshadweep" },
  { name: "Madhya Pradesh", slug: "madhya-pradesh" },
  { name: "Maharashtra", slug: "maharashtra" },
  { name: "Manipur", slug: "manipur" },
  { name: "Meghalaya", slug: "meghalaya" },
  { name: "Mizoram", slug: "mizoram" },
  { name: "Nagaland", slug: "nagaland" },
  { name: "Odisha", slug: "odisha" },
  { name: "Puducherry", slug: "puducherry" },
  { name: "Punjab", slug: "punjab" },
  { name: "Rajasthan", slug: "rajasthan" },
  { name: "Sikkim", slug: "sikkim" },
  { name: "Tamil Nadu", slug: "tamil-nadu" },
  { name: "Telangana", slug: "telangana" },
  { name: "Tripura", slug: "tripura" },
  { name: "Uttar Pradesh", slug: "uttar-pradesh" },
  { name: "Uttarakhand", slug: "uttarakhand" },
  { name: "West Bengal", slug: "west-bengal" },
];

const ALIASES = {
  "nct-of-delhi": "delhi",
  "delhi-nct": "delhi",
  orissa: "odisha",
  telengana: "telangana",
  pondicherry: "puducherry",
  "jammu-kashmir": "jammu-and-kashmir",
  "andaman-nicobar-islands": "andaman-and-nicobar-islands",
  "dadra-and-nagar-haveli-and-daman-and-diu": "dnh-and-dd",
};

const KNOWN_SLUGS = new Set(STATE_LIST.map((state) => state.slug));

export const STATE_NAMES = Object.fromEntries(
  STATE_LIST.map((state) => [state.slug, state.name]),
);

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getStateSlug = (properties = {}) => {
  for (const value of Object.values(properties)) {
    if (typeof value !== "string") continue;
    const slug = slugify(value);
    const resolved = ALIASES[slug] || slug;
    if (KNOWN_SLUGS.has(resolved)) return resolved;
  }
  return null;
};
