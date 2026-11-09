// ============================================================================
//  FRAKT
// ============================================================================
//  Kunden väljer först om posten ska till EU eller resten av världen.
//  Stripe låter sedan bara kunden skriva en adress i den zonen, så att
//  ingen kan välja billig EU-frakt och skicka till t.ex. USA.
//
//  Priset gäller per beställning (inte per poster).
//  TODO: ändra priserna till vad det faktiskt kostar att skicka.
// ============================================================================

// Landskoder (ISO) för EU-länderna.
const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
];

// Alla andra länder som Stripe kan skicka till.
const WORLD_COUNTRIES = [
  "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AU",
  "AW", "AX", "AZ", "BA", "BB", "BD", "BF", "BH", "BI", "BJ", "BL", "BM",
  "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CD",
  "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW",
  "DJ", "DM", "DO", "DZ", "EC", "EG", "EH", "ER", "ET", "FJ", "FK", "FO",
  "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP",
  "GQ", "GS", "GT", "GU", "GW", "GY", "HK", "HN", "HT", "ID", "IL", "IM",
  "IN", "IO", "IQ", "IS", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI",
  "KM", "KN", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR",
  "LS", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN",
  "MO", "MQ", "MR", "MS", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC",
  "NE", "NG", "NI", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF",
  "PG", "PH", "PK", "PM", "PN", "PR", "PS", "PY", "QA", "RE", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SG", "SH", "SJ", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ", "TK",
  "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US",
  "UY", "UZ", "VA", "VC", "VE", "VG", "VN", "VU", "WF", "WS", "XK", "YE",
  "YT", "ZA", "ZM", "ZW",
];

export const SHIPPING_ZONES = {
  eu: {
    label: "European Union",
    price: 6, // TODO: euro
    deliveryText: "3–7 business days",
    countries: EU_COUNTRIES,
  },
  world: {
    label: "Rest of the world",
    price: 15, // TODO: euro
    deliveryText: "7–21 business days",
    countries: WORLD_COUNTRIES,
  },
};
