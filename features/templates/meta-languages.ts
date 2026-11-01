export interface MetaLanguage {
  code: string;
  name: string;
  nativeName?: string;
  region?: string;
}

export const META_SUPPORTED_LANGUAGES: MetaLanguage[] = [
  // English Variants
  { code: "en", name: "English", region: "Global" },
  { code: "en_US", name: "English (US)", region: "United States" },
  { code: "en_GB", name: "English (UK)", region: "United Kingdom" },
  { code: "en_IN", name: "English (IND)", region: "India" },
  { code: "en_AE", name: "English (UAE)", region: "United Arab Emirates" },
  { code: "en_AU", name: "English (AUS)", region: "Australia" },
  { code: "en_CA", name: "English (CAN)", region: "Canada" },
  { code: "en_GH", name: "English (GHA)", region: "Ghana" },
  { code: "en_IE", name: "English (IRL)", region: "Ireland" },
  { code: "en_JM", name: "English (JAM)", region: "Jamaica" },
  { code: "en_MY", name: "English (MYS)", region: "Malaysia" },
  { code: "en_NZ", name: "English (NZL)", region: "New Zealand" },
  { code: "en_SG", name: "English (SGP)", region: "Singapore" },
  { code: "en_ZA", name: "English (ZAF)", region: "South Africa" },

  // Indian Languages
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "India" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "India" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "India" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "India/Bangladesh" },
  { code: "bn_IN", name: "Bengali (IND)", nativeName: "বাংলা (ভারত)", region: "India" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "India/Sri Lanka" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "India" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "India" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "India" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "India" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "India" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "India/Pakistan" },

  // Middle Eastern & African
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "Middle East" },
  { code: "fa", name: "Persian", nativeName: "فارسی", region: "Iran" },
  { code: "he", name: "Hebrew", nativeName: "עברית", region: "Israel" },
  { code: "ha", name: "Hausa", region: "Nigeria" },
  { code: "sw", name: "Swahili", region: "East Africa" },
  { code: "af", name: "Afrikaans", region: "South Africa" },
  { code: "zu", name: "Zulu", region: "South Africa" },
  { code: "so", name: "Somali", region: "Somalia" },
  { code: "rw", name: "Kinyarwanda", region: "Rwanda" },

  // European
  { code: "es", name: "Spanish", region: "Global" },
  { code: "es_AR", name: "Spanish (ARG)", region: "Argentina" },
  { code: "es_ES", name: "Spanish (ESP)", region: "Spain" },
  { code: "es_MX", name: "Spanish (MEX)", region: "Mexico" },
  { code: "pt_BR", name: "Portuguese (BR)", region: "Brazil" },
  { code: "pt_PT", name: "Portuguese (POR)", region: "Portugal" },
  { code: "fr", name: "French", nativeName: "Français", region: "France" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "Germany" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "Italy" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "Netherlands" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "Russia" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", region: "Ukraine" },
  { code: "pl", name: "Polish", nativeName: "Polski", region: "Poland" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "Turkey" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", region: "Greece" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", region: "Sweden" },
  { code: "da", name: "Danish", nativeName: "Dansk", region: "Denmark" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", region: "Finland" },
  { code: "nb", name: "Norwegian", nativeName: "Norsk", region: "Norway" },
  { code: "cs", name: "Czech", nativeName: "Čeština", region: "Czech Republic" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", region: "Hungary" },
  { code: "ro", name: "Romanian", nativeName: "Română", region: "Romania" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", region: "Bulgaria" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", region: "Croatia" },
  { code: "sr", name: "Serbian", nativeName: "Српски", region: "Serbia" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", region: "Slovakia" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", region: "Slovenia" },
  { code: "et", name: "Estonian", region: "Estonia" },
  { code: "lv", name: "Latvian", region: "Latvia" },
  { code: "lt", name: "Lithuanian", region: "Lithuania" },
  { code: "ga", name: "Irish", region: "Ireland" },
  { code: "ca", name: "Catalan", region: "Spain" },
  { code: "sq", name: "Albanian", region: "Albania" },
  { code: "mk", name: "Macedonian", region: "North Macedonia" },

  // East & Southeast Asian
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", region: "Malaysia" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", region: "Vietnam" },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "Thailand" },
  { code: "fil", name: "Filipino", region: "Philippines" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "Japan" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "South Korea" },
  { code: "zh_CN", name: "Chinese (Simplified)", nativeName: "简体中文", region: "China" },
  { code: "zh_TW", name: "Chinese (Traditional)", nativeName: "繁體中文", region: "Taiwan" },
  { code: "zh_HK", name: "Chinese (Hong Kong)", nativeName: "繁體中文 (香港)", region: "Hong Kong" },
  { code: "lo", name: "Lao", region: "Laos" },
  { code: "si", name: "Sinhala", region: "Sri Lanka" },
  { code: "kk", name: "Kazakh", region: "Kazakhstan" },
  { code: "uz", name: "Uzbek", region: "Uzbekistan" },
  { code: "az", name: "Azerbaijani", region: "Azerbaijan" },
  { code: "ka", name: "Georgian", region: "Georgia" },
  { code: "ky", name: "Kyrgyz", region: "Kyrgyzstan" },
  { code: "ps", name: "Pashto", region: "Afghanistan" },
];

export const searchLanguages = (query: string): MetaLanguage[] => {
  if (!query || !query.trim()) return META_SUPPORTED_LANGUAGES;
  const clean = query.trim().toLowerCase();
  return META_SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.code.toLowerCase().includes(clean) ||
      lang.name.toLowerCase().includes(clean) ||
      (lang.nativeName && lang.nativeName.toLowerCase().includes(clean)) ||
      (lang.region && lang.region.toLowerCase().includes(clean)),
  );
};

export const getLanguageLabel = (code: string): string => {
  const match = META_SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (!match) return code;
  return `${match.name} (${match.code})`;
};
