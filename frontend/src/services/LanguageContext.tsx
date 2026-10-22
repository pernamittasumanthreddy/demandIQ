import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'te';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
  };
}

export const translations: Translations = {
  // Navigation
  dashboard: {
    en: 'Main Dashboard',
    hi: 'मुख्य डैशबोर्ड',
    te: 'ప్రధాన డ్యాష్‌బోర్డ్',
  },
  weeklyReview: {
    en: 'Weekly Stock Review',
    hi: 'साप्ताहिक स्टॉक समीक्षा',
    te: 'వారపు స్టాక్ సమీక్ష',
  },
  catalog: {
    en: 'Product Catalog',
    hi: 'उत्पाद कैटलॉग',
    te: 'ఉత్పత్తి కేటలాగ్',
  },
  inventory: {
    en: 'Inventory Balances',
    hi: 'इन्वेंट्री बैलेंस',
    te: 'ఇన్వెంటరీ నిల్వలు',
  },
  imports: {
    en: 'Sales Import Center',
    hi: 'बिक्री डेटा आयात',
    te: 'సేల్స్ దిగుమతి కేంద్రం',
  },
  forecasting: {
    en: 'Demand Forecasting',
    hi: 'मांग पूर्वानुमान',
    te: 'డిమాండ్ అంచనా',
  },
  replenishment: {
    en: 'Reorder Suggestions',
    hi: 'पुनः ऑर्डर सुझाव',
    te: 'రీ-ఆర్డర్ సూచనలు',
  },
  deadStock: {
    en: 'Dead-Stock Detection',
    hi: 'डेड-स्टॉक पहचान',
    te: 'డెడ్ స్టాక్ గుర్తింపు',
  },
  calendar: {
    en: 'Festival & Demand Calendar',
    hi: 'त्योहार और मांग कैलेंडर',
    te: 'పండుగ & డిమాండ్ క్యాలెండర్',
  },
  simulator: {
    en: 'What-If Simulator',
    hi: 'व्यापार सिम्युलेटर',
    te: 'వ్యాపార సిమ్యులేటర్',
  },
  suppliers: {
    en: 'Suppliers & Vendors',
    hi: 'आपूर्तिकर्ता व विक्रेता',
    te: 'సరఫరాదారులు & విక్రేతలు',
  },
  procurement: {
    en: 'Purchase Orders',
    hi: 'खरीद आदेश (PO)',
    te: 'కొనుగోలు ఆర్డర్లు',
  },
  landingShowcase: {
    en: 'Product Showcase',
    hi: 'उत्पाद प्रदर्शन',
    te: 'ఉత్పత్తి ప్రదర్శన',
  },

  // Daily Briefing
  dailyBriefingTitle: {
    en: 'Morning Stock Briefing',
    hi: 'दैनिक सुबह का स्टॉक सारांश',
    te: 'ఉదయం స్టాక్ బ్రీఫింగ్',
  },
  dailyBriefingSub: {
    en: 'Actionable insights based on your recent sales history & lead times',
    hi: 'आपकी हालिया बिक्री और सप्लायर समय पर आधारित सिफारिशें',
    te: 'మీ ఇటీవలి విక్రయాలు మరియు సప్లయర్ సమయం ఆధారంగా సిఫార్సులు',
  },

  // Common Actions
  getStarted: {
    en: 'Get Started Free',
    hi: 'निःशुल्क शुरू करें',
    te: 'ఉచితంగా ప్రారంభించండి',
  },
  watchDemo: {
    en: 'Watch Demo',
    hi: 'डेमो देखें',
    te: 'డెమో చూడండి',
  },
  login: {
    en: 'Log In',
    hi: 'लॉग इन करें',
    te: 'లాగిన్ చేయండి',
  },
  reorderNow: {
    en: 'Reorder Now',
    hi: 'अभी ऑर्डर करें',
    te: 'ఇప్పుడే ఆర్డర్ చేయండి',
  },
  exportReport: {
    en: 'Export Report',
    hi: 'रिपोर्ट डाउनलोड करें',
    te: 'నివేదిక డౌన్‌లోడ్ చేయండి',
  },

  // Metrics
  totalSales: {
    en: 'Total Sales (30D)',
    hi: 'कुल बिक्री (30 दिन)',
    te: 'మొత్తం అమ్మకాలు (30 రోజులు)',
  },
  activeProducts: {
    en: 'Active Products',
    hi: 'सक्रिय उत्पाद',
    te: 'యాక్టివ్ ఉత్పత్తులు',
  },
  stockValue: {
    en: 'Inventory Valuation',
    hi: 'इन्वेंट्री का कुल मूल्य',
    te: 'ఇన్వెంటరీ మొత్తం విలువ',
  },
  lowStockAlerts: {
    en: 'Urgent Reorders',
    hi: 'अति आवश्यक रीऑर्डर',
    te: 'అత్యవసర రీ-ఆర్డర్లు',
  },
  deadCapital: {
    en: 'Capital at Risk',
    hi: 'फंसा हुआ कार्यशील पूंजी',
    te: 'డెడ్ స్టాక్ మూలధనం',
  },

  // Taglines
  tagline: {
    en: 'Know What Sells. Stock What Matters. Grow with Confidence.',
    hi: 'जानिए क्या बिकता है। वही रखिए जो जरूरी है। विश्वास से आगे बढ़िए।',
    te: 'ఏది అమ్ముడవుతుందో తెలుసుకోండి. అవసరమైనది మాత్రమే స్టాక్ చేయండి. నమ్మకంతో ఎదగండి.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('demandiq_lang');
    return (saved === 'hi' || saved === 'te') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('demandiq_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
