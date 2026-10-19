import { VitalsReminder, VitalsReminderMetric, SugarTestTiming, SupportedLanguage } from '../types';

export const DAYS_LIST = [
  'everyday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const DEFAULT_PRESET_REMINDERS: Omit<VitalsReminder, 'id' | 'patientProfileId'>[] = [
  {
    metric: 'sugar',
    title: 'Morning Fasting Blood Sugar',
    titleUrdu: 'صبح نہار منہ شوگر چیک کریں',
    titleRoman: 'Subah Nihari Sugar Test',
    time: '08:00',
    days: ['everyday'],
    enabled: true,
    sugarTiming: 'fasting',
    soundEnabled: true,
  },
  {
    metric: 'bp',
    title: 'Morning Blood Pressure',
    titleUrdu: 'صبح کا بلڈ پریشر ریکارڈ کریں',
    titleRoman: 'Subah Ka Blood Pressure Log',
    time: '09:00',
    days: ['everyday'],
    enabled: true,
    soundEnabled: true,
  },
  {
    metric: 'sugar',
    title: 'Post-Lunch Blood Sugar (2h after meal)',
    titleUrdu: 'کھانے کے 2 گھنٹے بعد شوگر ٹیسٹ',
    titleRoman: 'Khane Ke 2 Ghantay Baad Sugar Test',
    time: '14:30',
    days: ['everyday'],
    enabled: false,
    sugarTiming: 'post_meal',
    soundEnabled: true,
  },
  {
    metric: 'bp',
    title: 'Evening Blood Pressure Check',
    titleUrdu: 'شام کا بلڈ پریشر چیک کریں',
    titleRoman: 'Shaam Ka Blood Pressure Check',
    time: '19:00',
    days: ['everyday'],
    enabled: true,
    soundEnabled: true,
  },
  {
    metric: 'heart',
    title: 'Bedtime Pulse & Relaxation Check',
    titleUrdu: 'رات کو سونے سے پہلے نبض کی جانچ',
    titleRoman: 'Raat Ko Dil Ki Dhadkan (Pulse) Check',
    time: '22:00',
    days: ['everyday'],
    enabled: false,
    soundEnabled: true,
  },
];

export function getInitialReminders(patientProfileId: string = 'prof-self'): VitalsReminder[] {
  return DEFAULT_PRESET_REMINDERS.map((preset, idx) => ({
    ...preset,
    id: `rem-${patientProfileId}-${idx}-${Date.now()}`,
    patientProfileId,
  }));
}

export function loadProfileReminders(patientProfileId: string = 'prof-self'): VitalsReminder[] {
  const key = `sehat_saathi_vitals_reminders_${patientProfileId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse vitals reminders from localStorage:', e);
  }
  const initial = getInitialReminders(patientProfileId);
  saveProfileReminders(patientProfileId, initial);
  return initial;
}

export function saveProfileReminders(patientProfileId: string, reminders: VitalsReminder[]): void {
  const key = `sehat_saathi_vitals_reminders_${patientProfileId}`;
  try {
    localStorage.setItem(key, JSON.stringify(reminders));
  } catch (e) {
    console.warn('Failed to save vitals reminders to localStorage:', e);
  }
}

// Gentle pleasant two-tone hospital/app chime using Web Audio API
export function playReminderChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone: A5 (880 Hz) harmonic chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.16);
    gain2.gain.setValueAtTime(0.18, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('Web Audio chime not permitted or failed:', e);
  }
}

// Request Browser Web Push Notification permission
export async function requestPushNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Browser notifications are not supported in this browser.');
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return 'denied';
  }
}

// Check current notification permission status safely
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Send native browser notification
export function triggerBrowserPushNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/icon.png',
      tag: options?.tag || 'vitals-reminder',
      badge: '/icon.png',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };
    return true;
  } catch (e) {
    console.warn('Failed to trigger browser notification:', e);
    return false;
  }
}

// Formats reminder message based on metric & language
export function getReminderNudgeMessage(
  reminder: VitalsReminder,
  language: SupportedLanguage
): { title: string; body: string; spokenText: string } {
  const metric = reminder.metric;
  const timing = reminder.sugarTiming;

  if (language === 'ur') {
    if (metric === 'sugar') {
      const timingUrdu = timing === 'fasting' ? 'نہار منہ' : timing === 'post_meal' ? 'کھانے کے بعد' : '';
      return {
        title: `شوگر چیک کرنے کا وقت: ${reminder.titleUrdu || reminder.title}`,
        body: `صحت ساتھی یاد دہانی: برائے مہربانی اپنا ${timingUrdu} شوگر ٹیسٹ کر کے لاگ بک میں درج کریں۔ بروقت ریکارڈنگ آپ کو تندرست رکھتی ہے۔`,
        spokenText: `آپ کے شوگر ٹیسٹ کا وقت ہو گیا ہے۔ برائے مہربانی اپنا شوگر لیول ابھی لاگ بک میں درج کریں۔`,
      };
    } else if (metric === 'bp') {
      return {
        title: `بلڈ پریشر چیک کرنے کا وقت: ${reminder.titleUrdu || reminder.title}`,
        body: `صحت ساتھی یاد دہانی: پرسکون ہو کر 5 منٹ بیٹھیں اور اپنا بلڈ پریشر ریکارڈ کریں۔ روزانہ کا ریکارڈ دل کی بیماریوں سے بچاتا ہے۔`,
        spokenText: `آپ کے بلڈ پریشر چیک کرنے کا وقت ہو گیا ہے۔ آرام سے بیٹھ کر اپنا بلڈ پریشر ریکارڈ کریں۔`,
      };
    } else if (metric === 'heart') {
      return {
        title: `نبض اور دل کی دھڑکن چیک کرنے کا وقت`,
        body: `صحت ساتھی یاد دہانی: اپنی پلس (BPM) چیک کریں یا کیمرہ سنسر سے جانچیں۔`,
        spokenText: `دل کی دھڑکن چیک کرنے کا وقت ہے۔ اپنا پلس ریٹ ریکارڈ کریں۔`,
      };
    } else {
      return {
        title: `طبی وائٹلز چیک کرنے کا وقت`,
        body: `صحت ساتھی یاد دہانی: اپنے روزانہ کے میڈیکل وائٹلز لاگ بک میں درج کریں۔`,
        spokenText: `اپنے روزانہ کے میڈیکل وائٹلز ریکارڈ کرنے کا وقت ہو گیا ہے۔`,
      };
    }
  }

  if (language === 'roman') {
    if (metric === 'sugar') {
      const timingRoman = timing === 'fasting' ? 'Nihari' : timing === 'post_meal' ? 'Khane ke baad' : '';
      return {
        title: `Sugar Test Ka Waqt: ${reminder.titleRoman || reminder.title}`,
        body: `SehatSaathi Reminder: Meherbani farma kar apna ${timingRoman} sugar test karke log karein. Regular record aapko safe rakhta hai.`,
        spokenText: `Aapki blood sugar check karne ka waqt ho gaya hai. Abhi record log karein.`,
      };
    } else if (metric === 'bp') {
      return {
        title: `Blood Pressure Check Ka Waqt: ${reminder.titleRoman || reminder.title}`,
        body: `SehatSaathi Reminder: 5 minute pur-sukoon baith kar apna Blood Pressure check karein aur record karein.`,
        spokenText: `Aapka Blood Pressure log karne ka waqt ho gaya hai. Aaram se baith kar reading note karein.`,
      };
    } else if (metric === 'heart') {
      return {
        title: `Heart Rate (Pulse) Check Ka Waqt`,
        body: `SehatSaathi Reminder: Apni pulse rate check karein ya camera se measure karein.`,
        spokenText: `Apni pulse aur heart rate check karne ka waqt ho gaya hai.`,
      };
    } else {
      return {
        title: `Daily Vitals Log Karne Ka Waqt`,
        body: `SehatSaathi Reminder: Apne daily medical vitals logbook mein record karein.`,
        spokenText: `Daily medical vitals log karne ka waqt ho gaya hai.`,
      };
    }
  }

  // English default
  if (metric === 'sugar') {
    const timingStr = timing === 'fasting' ? 'Fasting' : timing === 'post_meal' ? 'Post-Meal' : '';
    return {
      title: `Blood Sugar Check Due: ${reminder.title}`,
      body: `SehatSaathi Vitals: Time to test your ${timingStr} blood glucose and record it in your logbook. Steady tracking prevents diabetic complications.`,
      spokenText: `It's time to log your blood sugar reading in SehatSaathi.`,
    };
  } else if (metric === 'bp') {
    return {
      title: `Blood Pressure Check Due: ${reminder.title}`,
      body: `SehatSaathi Vitals: Rest quietly for 5 minutes, measure your blood pressure, and log your reading. Consistent records protect cardiovascular health.`,
      spokenText: `It's time to measure and record your blood pressure.`,
    };
  } else if (metric === 'heart') {
    return {
      title: `Pulse & Heart Rate Check Due: ${reminder.title}`,
      body: `SehatSaathi Vitals: Check your resting pulse rate manually or with our optical camera sensor.`,
      spokenText: `It's time to check your resting heart rate.`,
    };
  } else {
    return {
      title: `Daily Vitals Check: ${reminder.title}`,
      body: `SehatSaathi Vitals: Time to log your daily health metrics to keep your doctor informed.`,
      spokenText: `It's time to log your daily health vitals.`,
    };
  }
}
