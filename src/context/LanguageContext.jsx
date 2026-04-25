import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Nav
    aiScanner: 'AI Scanner',
    myImpact: 'My Impact',
    profile: 'Profile',
    leaderboard: 'Leaderboard',
    market: 'Market Overview',
    intake: 'AI Intake System',
    subscriptions: 'Subscription Plans',
    analytics: 'Analytics',
    logout: 'Logout',
    // Scanner
    aiWasteIntelligence: 'AI WASTE INTELLIGENCE',
    neuralNet: 'Neural-Net Powered Material Identification',
    scanningTarget: 'Scanning for target...',
    refreshApp: 'Viewfinder black? Refresh App',
    startSimulation: 'Start Simulation',
    uploadImage: 'Upload Image',
    retryCamera: 'Retry Camera',
    cameraReady: 'AI Scanner',
    ready: 'Ready',
    captureAndScan: 'Capture & Scan',
    // Scanner Results
    scrapRecoveryValue: 'Scrap Recovery Value',
    pointsAward: 'Points Award',
    materialMatrix: 'Material Matrix',
    disassemblyGuide: 'Disassembly Guide',
    videoTutorial: 'Video Tutorial',
    nearestRecyclers: 'Nearest Recyclers',
    submitForRecycling: 'Submit for Recycling',
    submitting: 'Submitting...',
    // Dashboard
    myImpactTitle: 'MY IMPACT',
    impactSubtitle: 'Real-time tracking of your environmental footprint',
    devicesRecycled: 'Devices Recycled',
    co2Prevented: 'CO₂ Prevented',
    scrapValueRecovered: 'Scrap Value Recovered',
    treeEquivalent: 'Tree Equivalent',
    weeklyActivity: 'Weekly Activity',
    sustainabilityMetrics: 'Sustainability Metrics',
    energySaved: 'Energy Saved',
    waterSaved: 'Water Saved',
    landfillDiverted: 'Landfill Diverted',
    resourcesRecovered: 'Resources Recovered',
    recyclingHistory: 'Recycling History',
    neuralIntelligence: 'Neural Intelligence',
    // Profile
    profileTitle: 'PROFILE',
    unlockedBadges: 'Unlocked Badges',
    accountSettings: 'Account Settings',
    editProfile: 'Edit Profile',
    signOut: 'Sign Out',
    memberSince: 'Member since',
    totalPoints: 'Total Points',
    // Leaderboard
    leaderboardTitle: 'GLOBAL RECYCLING ARENA',
    leaderboardSubtitle: 'Eco-warriors competing to save the planet',
    rank: 'Rank',
    name: 'Name',
    devices: 'Devices',
    points: 'Points',
    // Recycler
    marketOverview: 'MARKET OVERVIEW',
    liveScrapRates: 'Live Scrap Rates',
    marketSummary: 'Market Summary',
    trendingUp: 'Trending Up',
    underPressure: 'Under Pressure',
    outlook: 'Outlook',
    intakeTitle: 'AI INTAKE SYSTEM',
    intakeSubtitle: 'Unclaimed consumer submissions waiting for your action.',
    pending: 'Pending',
    claimed: 'Claimed',
    rejected: 'Rejected',
    claimDevice: 'Claim Device',
    reject: 'Reject',
    scrapValue: 'Scrap Value',
    // Language
    language: 'Language',
    english: 'English',
    hindi: 'हिन्दी',
    kannada: 'ಕನ್ನಡ',
  },
  hi: {
    // Nav
    aiScanner: 'AI स्कैनर',
    myImpact: 'मेरा प्रभाव',
    profile: 'प्रोफ़ाइल',
    leaderboard: 'लीडरबोर्ड',
    market: 'बाज़ार अवलोकन',
    intake: 'AI इंटेक सिस्टम',
    subscriptions: 'सदस्यता योजनाएं',
    analytics: 'विश्लेषण',
    logout: 'लॉग आउट',
    // Scanner
    aiWasteIntelligence: 'AI कचरा बुद्धिमत्ता',
    neuralNet: 'न्यूरल-नेट संचालित सामग्री पहचान',
    scanningTarget: 'लक्ष्य की खोज...',
    refreshApp: 'काली स्क्रीन? ऐप रिफ्रेश करें',
    startSimulation: 'सिमुलेशन शुरू करें',
    uploadImage: 'छवि अपलोड करें',
    retryCamera: 'कैमरा पुनः प्रयास',
    cameraReady: 'AI स्कैनर',
    ready: 'तैयार',
    captureAndScan: 'कैप्चर और स्कैन',
    // Scanner Results
    scrapRecoveryValue: 'स्क्रैप रिकवरी मूल्य',
    pointsAward: 'अंक पुरस्कार',
    materialMatrix: 'सामग्री मैट्रिक्स',
    disassemblyGuide: 'विघटन गाइड',
    videoTutorial: 'वीडियो ट्यूटोरियल',
    nearestRecyclers: 'निकटतम रिसाइक्लर',
    submitForRecycling: 'रीसाइक्लिंग के लिए जमा करें',
    submitting: 'जमा हो रहा है...',
    // Dashboard
    myImpactTitle: 'मेरा प्रभाव',
    impactSubtitle: 'आपके पर्यावरणीय पदचिह्न की वास्तविक समय ट्रैकिंग',
    devicesRecycled: 'रीसायकल किए गए उपकरण',
    co2Prevented: 'CO₂ रोका गया',
    scrapValueRecovered: 'स्क्रैप मूल्य प्राप्त',
    treeEquivalent: 'पेड़ समतुल्य',
    weeklyActivity: 'साप्ताहिक गतिविधि',
    sustainabilityMetrics: 'स्थिरता मापदंड',
    energySaved: 'ऊर्जा बचाई',
    waterSaved: 'पानी बचाया',
    landfillDiverted: 'लैंडफिल से बचाया',
    resourcesRecovered: 'संसाधन पुनर्प्राप्त',
    recyclingHistory: 'रीसाइक्लिंग इतिहास',
    neuralIntelligence: 'न्यूरल इंटेलिजेंस',
    // Profile
    profileTitle: 'प्रोफ़ाइल',
    unlockedBadges: 'अनलॉक किए गए बैज',
    accountSettings: 'खाता सेटिंग्स',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    signOut: 'साइन आउट',
    memberSince: 'सदस्य तब से',
    totalPoints: 'कुल अंक',
    // Leaderboard
    leaderboardTitle: 'वैश्विक रीसाइक्लिंग अखाड़ा',
    leaderboardSubtitle: 'ग्रह को बचाने के लिए प्रतिस्पर्धा करने वाले इको-योद्धा',
    rank: 'रैंक',
    name: 'नाम',
    devices: 'उपकरण',
    points: 'अंक',
    // Recycler
    marketOverview: 'बाज़ार अवलोकन',
    liveScrapRates: 'लाइव स्क्रैप दरें',
    marketSummary: 'बाज़ार सारांश',
    trendingUp: 'बढ़ रहा है',
    underPressure: 'दबाव में',
    outlook: 'दृष्टिकोण',
    intakeTitle: 'AI इंटेक सिस्टम',
    intakeSubtitle: 'आपकी कार्रवाई का इंतज़ार कर रहे उपभोक्ता सबमिशन।',
    pending: 'लंबित',
    claimed: 'दावा किया',
    rejected: 'अस्वीकृत',
    claimDevice: 'उपकरण का दावा करें',
    reject: 'अस्वीकार',
    scrapValue: 'स्क्रैप मूल्य',
    // Language
    language: 'भाषा',
    english: 'English',
    hindi: 'हिन्दी',
    kannada: 'ಕನ್ನಡ',
  },
  kn: {
    // Nav
    aiScanner: 'AI ಸ್ಕ್ಯಾನರ್',
    myImpact: 'ನನ್ನ ಪ್ರಭಾವ',
    profile: 'ಪ್ರೊಫೈಲ್',
    leaderboard: 'ಲೀಡರ್‌ಬೋರ್ಡ್',
    market: 'ಮಾರುಕಟ್ಟೆ ಅವಲೋಕನ',
    intake: 'AI ಇಂಟೇಕ್ ಸಿಸ್ಟಮ್',
    subscriptions: 'ಚಂದಾ ಯೋಜನೆಗಳು',
    analytics: 'ವಿಶ್ಲೇಷಣೆ',
    logout: 'ಲಾಗ್ ಔಟ್',
    // Scanner
    aiWasteIntelligence: 'AI ತ್ಯಾಜ್ಯ ಬುದ್ಧಿಮತ್ತೆ',
    neuralNet: 'ನ್ಯೂರಲ್-ನೆಟ್ ಚಾಲಿತ ವಸ್ತು ಗುರುತಿಸುವಿಕೆ',
    scanningTarget: 'ಗುರಿಯನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    refreshApp: 'ಕಪ್ಪು ಪರದೆ? ಆ್ಯಪ್ ರಿಫ್ರೆಶ್ ಮಾಡಿ',
    startSimulation: 'ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಾರಂಭಿಸಿ',
    uploadImage: 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    retryCamera: 'ಕ್ಯಾಮೆರಾ ಮರುಪ್ರಯತ್ನಿಸಿ',
    cameraReady: 'AI ಸ್ಕ್ಯಾನರ್',
    ready: 'ಸಿದ್ಧ',
    captureAndScan: 'ಕ್ಯಾಪ್ಚರ್ ಮತ್ತು ಸ್ಕ್ಯಾನ್',
    // Scanner Results
    scrapRecoveryValue: 'ಸ್ಕ್ರ್ಯಾಪ್ ಮರುಪಡೆಯುವಿಕೆ ಮೌಲ್ಯ',
    pointsAward: 'ಅಂಕಗಳ ಪ್ರಶಸ್ತಿ',
    materialMatrix: 'ವಸ್ತು ಮ್ಯಾಟ್ರಿಕ್ಸ್',
    disassemblyGuide: 'ವಿಘಟನೆ ಮಾರ್ಗದರ್ಶಿ',
    videoTutorial: 'ವೀಡಿಯೊ ಟ್ಯುಟೋರಿಯಲ್',
    nearestRecyclers: 'ಹತ್ತಿರದ ಮರುಬಳಕೆದಾರರು',
    submitForRecycling: 'ಮರುಬಳಕೆಗೆ ಸಲ್ಲಿಸಿ',
    submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
    // Dashboard
    myImpactTitle: 'ನನ್ನ ಪ್ರಭಾವ',
    impactSubtitle: 'ನಿಮ್ಮ ಪರಿಸರ ಹೆಜ್ಜೆಗುರುತಿನ ನೈಜ-ಸಮಯ ಟ್ರ್ಯಾಕಿಂಗ್',
    devicesRecycled: 'ಮರುಬಳಕೆ ಸಾಧನಗಳು',
    co2Prevented: 'CO₂ ತಡೆಯಲಾಗಿದೆ',
    scrapValueRecovered: 'ಸ್ಕ್ರ್ಯಾಪ್ ಮೌಲ್ಯ ಮರುಪಡೆಯಲಾಗಿದೆ',
    treeEquivalent: 'ಮರ ಸಮಾನ',
    weeklyActivity: 'ಸಾಪ್ತಾಹಿಕ ಚಟುವಟಿಕೆ',
    sustainabilityMetrics: 'ಸುಸ್ಥಿರತೆ ಮಾಪಕಗಳು',
    energySaved: 'ಶಕ್ತಿ ಉಳಿಸಲಾಗಿದೆ',
    waterSaved: 'ನೀರು ಉಳಿಸಲಾಗಿದೆ',
    landfillDiverted: 'ಭೂಮಿ ತುಂಬುವಿಕೆ ತಡೆಯಲಾಗಿದೆ',
    resourcesRecovered: 'ಸಂಪನ್ಮೂಲಗಳನ್ನು ಮರಳಿ ಪಡೆಯಲಾಗಿದೆ',
    recyclingHistory: 'ಮರುಬಳಕೆ ಇತಿಹಾಸ',
    neuralIntelligence: 'ನ್ಯೂರಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್',
    // Profile
    profileTitle: 'ಪ್ರೊಫೈಲ್',
    unlockedBadges: 'ಅನ್‌ಲಾಕ್ ಮಾಡಿದ ಬ್ಯಾಡ್ಜ್‌ಗಳು',
    accountSettings: 'ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    editProfile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    signOut: 'ಸೈನ್ ಔಟ್',
    memberSince: 'ಸದಸ್ಯರು ಆದ ದಿನಾಂಕ',
    totalPoints: 'ಒಟ್ಟು ಅಂಕಗಳು',
    // Leaderboard
    leaderboardTitle: 'ಜಾಗತಿಕ ಮರುಬಳಕೆ ಅಖಾಡ',
    leaderboardSubtitle: 'ಗ್ರಹವನ್ನು ಉಳಿಸಲು ಸ್ಪರ್ಧಿಸುತ್ತಿರುವ ಪರಿಸರ ಯೋಧರು',
    rank: 'ಶ್ರೇಣಿ',
    name: 'ಹೆಸರು',
    devices: 'ಸಾಧನಗಳು',
    points: 'ಅಂಕಗಳು',
    // Recycler
    marketOverview: 'ಮಾರುಕಟ್ಟೆ ಅವಲೋಕನ',
    liveScrapRates: 'ಲೈವ್ ಸ್ಕ್ರ್ಯಾಪ್ ದರಗಳು',
    marketSummary: 'ಮಾರುಕಟ್ಟೆ ಸಾರಾಂಶ',
    trendingUp: 'ಏರಿಕೆಯಲ್ಲಿದೆ',
    underPressure: 'ಒತ್ತಡದಲ್ಲಿ',
    outlook: 'ಮುನ್ನೋಟ',
    intakeTitle: 'AI ಇಂಟೇಕ್ ಸಿಸ್ಟಮ್',
    intakeSubtitle: 'ನಿಮ್ಮ ಕ್ರಮಕ್ಕಾಗಿ ಕಾಯುತ್ತಿರುವ ಗ್ರಾಹಕ ಸಲ್ಲಿಕೆಗಳು.',
    pending: 'ಬಾಕಿ',
    claimed: 'ಹಕ್ಕು ಸಲ್ಲಿಸಲಾಗಿದೆ',
    rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    claimDevice: 'ಸಾಧನ ಹಕ್ಕು',
    reject: 'ತಿರಸ್ಕರಿಸಿ',
    scrapValue: 'ಸ್ಕ್ರ್ಯಾಪ್ ಮೌಲ್ಯ',
    // Language
    language: 'ಭಾಷೆ',
    english: 'English',
    hindi: 'हिन्दी',
    kannada: 'ಕನ್ನಡ',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('punarnava_lang') || 'en');

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('punarnava_lang', newLang);
  };

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be inside LanguageProvider');
  return ctx;
}
