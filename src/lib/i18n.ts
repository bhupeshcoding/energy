import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  translation: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      yes: 'Yes',
      no: 'No'
    },
    nav: {
      home: 'Home',
      scan: 'Scan',
      checklist: 'Checklist',
      survey: 'Survey',
      findings: 'Findings',
      rebates: 'Rebates',
      reports: 'Reports',
      admin: 'Admin'
    },
    home: {
      title: 'Rural Home Energy Assistant',
      subtitle: 'Identify energy inefficiencies and access rebates for your rural home',
      startScan: 'Start Energy Scan',
      recentReports: 'Recent Reports',
      noReports: 'No reports yet. Start your first scan!',
      features: {
        camera: 'Smart Camera Analysis',
        cameraDesc: 'Use your phone camera to identify energy issues',
        privacy: 'Privacy First',
        privacyDesc: 'All data stays on your device',
        rebates: 'Find Rebates',
        rebatesDesc: 'Access available energy efficiency rebates',
        report: 'Detailed Reports',
        reportDesc: 'Get actionable insights and recommendations'
      }
    },
    scan: {
      title: 'Energy Scan',
      instructions: 'Point your camera at windows, doors, and appliances to identify energy inefficiencies',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      takePhoto: 'Take Photo',
      processing: 'Analyzing footage...',
      privacyNotice: 'Privacy Notice: All video analysis happens on your device. No data is sent to servers.',
      consent: 'I consent to camera access for energy analysis',
      fallbackMessage: 'Camera not available. You can upload images instead.',
      uploadImages: 'Upload Images'
    },
    checklist: {
      title: 'Room-by-Room Checklist',
      rooms: {
        windows: 'Windows',
        doors: 'Doors',  
        kitchen: 'Kitchen',
        bathroom: 'Bathroom',
        attic: 'Attic/Roof',
        appliances: 'Appliances'
      }
    },
    survey: {
      title: 'Home Energy Survey',
      tenure: 'Do you own or rent your home?',
      occupants: 'How many people live in your home?',
      heatingType: 'What type of heating do you use?',
      coolingType: 'What type of cooling do you use?',
      monthlyBill: 'What is your average monthly energy bill?',
      windowAge: 'How old are most of your windows?',
      draftFeelings: 'Do you feel drafts in your home?'
    },
    findings: {
      title: 'Energy Findings',
      severity: {
        low: 'Low Priority',
        medium: 'Medium Priority', 
        high: 'High Priority'
      },
      confidence: 'Confidence',
      estimatedCost: 'Estimated Cost',
      annualSavings: 'Annual Savings',
      paybackPeriod: 'Payback Period',
      confirmed: 'Confirmed',
      notes: 'Add notes...'
    },
    rebates: {
      title: 'Available Rebates',
      eligible: 'Eligible',
      notEligible: 'Not Eligible',
      checkEligibility: 'Check Eligibility',
      applyNow: 'Apply Now',
      learnMore: 'Learn More'
    }
  }
};

// Hindi translations (basic - expand as needed)
const hi = {
  translation: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      back: 'पीछे',
      next: 'आगे',
      previous: 'पिछला',
      close: 'बंद करें',
      yes: 'हां',
      no: 'नहीं'
    },
    nav: {
      home: 'होम',
      scan: 'स्कैन',
      checklist: 'चेकलिस्ट',
      survey: 'सर्वेक्षण',
      findings: 'निष्कर्ष',
      rebates: 'छूट',
      reports: 'रिपोर्ट',
      admin: 'व्यवस्थापक'
    },
    home: {
      title: 'ग्रामीण घरेलू ऊर्जा सहायक',
      subtitle: 'अपने ग्रामीण घर के लिए ऊर्जा अक्षमताओं की पहचान करें और छूट प्राप्त करें',
      startScan: 'ऊर्जा स्कैन शुरू करें',
      recentReports: 'हाल की रिपोर्ट',
      noReports: 'अभी तक कोई रिपोर्ट नहीं। अपना पहला स्कैन शुरू करें!'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      hi: hi
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;