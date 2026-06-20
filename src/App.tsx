import React, { useState, useEffect } from 'react';
import { lessonsData } from './data/lessonsData';
import { grammarChapters as initialGrammarChapters, GrammarChapter } from './data/grammarChapters';
import { orientationData as initialOrientationData, OrientationArticle } from './data/orientation';
import { pdfVocabulary } from './data/pdfVocabulary';
import { ProgressState, Lesson, WordBreakdown, DialogueLine, GrammarNote, QuizQuestion, RegisteredUser, PurchaseOrder, Course, StoreItem } from './types';
import ProgressCard from './components/ProgressCard';
import SentenceView from './components/SentenceView';
import VocabularyView from './components/VocabularyView';
import QuizView from './components/QuizView';
import AlphabetGuide from './components/AlphabetGuide';
import { GrammarVocabDropdown } from './components/GrammarVocabDropdown';
import { CheckoutGateway } from './components/CheckoutGateway';
import { OrderDetailModal } from './components/OrderDetailModal';
import { 
  BookOpen, 
  Award, 
  Palette,
  MapPin, 
  Volume2, 
  Volume1,
  Volume,
  FileText, 
  HelpCircle, 
  CheckCircle,
  WifiOff, 
  Search, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  User, 
  Star,
  Check,
  Lock,
  Unlock,
  Shield,
  Trash2,
  Plus,
  Archive,
  X,
  Pencil,
  TrendingUp,
  Activity,
  Users,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  Upload,
  Download,
  CheckSquare,
  ShoppingBag,
  CreditCard,
  GripVertical,
  Megaphone,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSingleSentenceEnglish, getMyanmarPhonetic } from './utils/sentenceUtils';
import { autoFillWord } from './utils/dictionary';

const adjustHexBrightness = (hex: string, percent: number): string => {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return hex;
  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  if (percent > 0) {
    // Tint (mix with white) -> approach 255
    const factor = percent / 100;
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
  } else {
    // Shade (mix with black) -> approach 0
    const factor = 1 + (percent / 100); // e.g. percent=-15 -> factor=0.85
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
  }

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
};

const DEFAULT_STORE_ITEMS: StoreItem[] = [
  {
    id: "premium-book",
    name: "Advanced Thai-Myanmar Grammar Manual (Printed E-Book)",
    nameMm: "အဆင့်မြင့် ထိုင်း-မြန်မာ သဒ္ဒါလက်စွဲ စာအုပ် (အီးဘုခ်)",
    type: "e-book" as const,
    description: "Deep dive into 45 complex Sentence structures, silent consonants rules, and tone system markers with local audio tracks link.",
    descriptionMm: "ရှုပ်ထွေးသော ဝါကျတည်ဆောက်ပုံ ၄၅ မျိုး၊ အသံထွက် ခြွင်းချက်ပုံစံများနှင့် အသံနိမ့်မြင့်များ အသေးစိတ်ရှင်းလင်းချက်။",
    price: 15000,
    currency: "MMK" as const,
    popular: true,
    pdfFileName: "Advanced_Grammar_Manual.pdf",
    pdfDownloadUrl: "https://drive.google.com/open?id=demo_advanced_grammar"
  },
  {
    id: "free-phrases",
    name: "100 Daily Essential Thai Phrases Guide",
    nameMm: "နေ့စဉ်သုံး အထူးထိုင်းစကားပြော စာအုပ်",
    type: "e-book" as const,
    description: "Contains vital expressions for daily commute, polite particles, asking directions, ordering meals, and instant street conversation guides.",
    descriptionMm: "နေ့စဉ်သုံး အထူးထိုင်းစကားပြော စာအုပ် - ခရီးသွားလာခြင်း၊ လမ်းမေးခြင်း၊ အစားအသောက်မှာယူခြင်းတို့အတွက် အထူးလက်စွဲ။",
    price: 0,
    currency: "MMK" as const,
    pdfFileName: "Kru_Jane_100_Daily_Essential_Thai_Phrases.pdf"
  },
  {
    id: "free-writing",
    name: "Thai Letters Writing Practice Sheet",
    nameMm: "ထိုင်းဗျည်းနှင့် အရေးအသား အခြေခံလေ့ကျင့်ခန်း",
    type: "e-book" as const,
    description: "Includes basic Thai writing stroke keys, consonant class divisions (high, middle, low), and standard phonetic pronunciation guidelines.",
    descriptionMm: "ထိုင်းဗျည်းနှင့် အရေးအသား အခြေခံလေ့ကျင့်ခန်း - အခြေခံစာရေးသားနည်းနှင့် အသံထွက်လမ်းညွှန်ချက်များ။",
    price: 0,
    currency: "MMK" as const,
    pdfFileName: "Thai_Alphabet_Writing_Workbook.pdf"
  },
  {
    id: "tutoring-zoom",
    name: "1-on-1 Practice Speaking Session with Kru Jane (1 Hour Zoom)",
    nameMm: "ဆရာမ Kru Jane နှင့် တစ်ဦးချင်း ၁ နာရီ စကားပြောလေ့ကျင့်ခန်း",
    type: "tutoring" as const,
    description: "Get real-time feedback on your tone mastery, vocabulary fluency, and everyday conversational pronunciation tips from an experienced Thai speaker native speaker tutor.",
    descriptionMm: "ထိုင်းစကားပြော လုံးဝကျွမ်းကျင်စေရန် ဇူးမ် (Zoom) ဖြင့် ၁ နာရီကြာ တိုက်ရိုက်တစ်ဦးချင်း အသံထွက်ပြင်ဆင်သင်ကြားပေးခြင်း။",
    price: 45000,
    currency: "MMK" as const
  },
  {
    id: "course-cert",
    name: "Official Certification of Thai Basic Course Mastery",
    nameMm: "ထိုင်းအခြေခံသင်ရိုး ပြီးဆုံးကြောင်း တရားဝင် အောင်လက်မှတ်",
    type: "certificate" as const,
    description: "Redeem your learning performance with a verified downloadable digital certificate. (Requires 1,000 XP minimum to apply!)",
    descriptionMm: "ရမှတ် XP ၁၀၀၀ ပြည့်ပါက လျှောက်ထားနိုင်သည့် စနစ်တကျလေ့လာအောင်မြင်ကြောင်း QR ပါရှိသော အောင်လက်မှတ်။",
    price: 1000,
    currency: "XP" as const
  },
  {
    id: "vip-vip",
    name: "VIP Lifetime Premium Study Access Card (All Lessons Support)",
    nameMm: "VIP တစ်သက်တာ ပရီမီယံ အဖွဲ့ဝင်ကတ်",
    type: "vip-package" as const,
    description: "Unlock offline access support, all dynamic system dialogue modules, customized direct testing tools, and early-bird textbook additions forever.",
    descriptionMm: "အော့ဖ်လိုင်းလေ့လာခွင့်များ၊ စကားစမြည်ပြောဆိုမှု အထူးခန်းများ၊ နောက်ဆက်တွဲ သင်ပုန်းများ အားလုံးအား တစ်သက်တာ သုံးစွဲခွင့်။",
    price: 80000,
    currency: "MMK" as const,
    popular: true
  }
];

export const PREMIUM_COURSES = [
  {
    id: "course-basic",
    name: "Complete Thai Foundational Mastery Course",
    nameMm: "ထိုင်းစကားပြောနှင့် စာရေးစာဖတ် အခြေခံအထူးတန်းသင်တန်း",
    priceAmount: 35000,
    currency: "MMK" as const,
    duration: "6 Weeks (Self-paced Interactive Training)",
    description: "Perfect for complete beginners. Cover Thai phonetic consonants, low/mid/high class letters, compound vowels, and tone rules with native audio worksheets and direct conversational practices.",
    descriptionMm: "ထိုင်းအက္ခရာ လုံးချင်းအသံထွက်များ၊ သရတွဲများနှင့် အသံနိမ့်မြင့်သင်္ကေတစည်းမျဉ်းများကို တစ်သက်တာ ဗီဒီယို သင်ခန်းစာများ စနစ်တကျ သင်ယူလေ့လာနိုင်မည့် အခြေခံအထူးတန်း။",
    instructor: "Kru Jane (Experienced Native Tutor)",
    includes: ["20 HD Video Lessons", "Downloadable Exercise Workbook", "Private QA Forum Access"]
  },
  {
    id: "course-business",
    name: "Advanced Business Thai Speaking & Letters Course",
    nameMm: "အလုပ်အကိုင်နှင့် စီးပွားရေးသုံး အဆင့်မြင့် ထိုင်းစကားပြောသင်တန်း",
    priceAmount: 65000,
    currency: "MMK" as const,
    duration: "8 Weeks (Structured Learning Tracks)",
    description: "Best for career professionals, translators, and cross-border business seekers. Master professional business email drafts, complex negotiation terms, formal speech patterns, and custom terminology.",
    descriptionMm: "စီးပွားရေးညှိနှိုင်းမှုများ၊ ရုံးသုံးစာပေးစာယူများ၊ အင်တာဗျူးပုံစံများနှင့် လုပ်ငန်းခွင်သုံး စကားပြောအဆင့်မြင့်စကားလုံးများကို ကျွမ်းကျင်စွာ ပြောဆိုရေးသားနိုင်ရန် အထူးသင်ရိုး။",
    instructor: "Kru Jane & Sayar Thura",
    includes: ["35 Advanced Masterclass Videos", "Professional Letter Templates", "Certificate of Completion"]
  },
  {
    id: "course-consonants-quick",
    name: "Intensive Thai Consonants & Tones Quick-Crash Course",
    nameMm: "ထိုင်းဗျည်း ၄၄ လုံးနှင့် အသံတန်ဖိုး အမြန်လေ့လာရေးသင်တန်း",
    priceAmount: 15000,
    currency: "MMK" as const,
    duration: "2 Weeks (High-Intensity Crash Practice)",
    description: "An intensive training track designed exclusively to master the 44 consonants, 32 vowels, and their complex tone combinations within days using active audio visual memory techniques.",
    descriptionMm: "ဉာဏ်ရည်မြှင့်နည်းစနစ်များ သုံးစွဲ၍ အသံထွက် အခက်အခဲအရှိဆုံး ထိုင်းဗျည်းစု၊ သရစုများနှင့် အသံဖလှယ်နည်းစနစ်များကို အချိန်တိုအတွင်း ပိုင်နိုင်စေမည့် အမြန်လေ့လာရေးတန်း။",
    instructor: "Sayar Thura (Senior Thai Linguist)",
    includes: ["10 Interactive Sprint Videos", "Consonant Tone Memory Map", "Consonants Audio Quizzes"]
  }
];

const INITIAL_PROGRESS: ProgressState = {
  completedLessons: [],
  masteredWords: [],
  totalXp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  quizHighScores: {}
};

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('thai_lessons_curriculum');
    let baseLessons = lessonsData;
    
    // Process base lessons to distribute across courses and inject premium dialogue learning videos
    const mappedInitialLessons = baseLessons.map((lesson) => {
      let courseId = 'course-basic';
      if (lesson.id >= 11 && lesson.id <= 20) {
        courseId = 'course-business';
      } else if (lesson.id >= 21) {
        courseId = 'course-workspace';
      }

      let wholeDialogueVideoUrl: string | undefined = undefined;
      let dialogue = lesson.dialogue;

      if (courseId === 'course-business') {
        if (lesson.id <= 15) {
          // Case: One full video for the whole dialogue practice in this lesson
          const ytUrls = [
            "https://www.youtube.com/embed/nU2U3B4X2S0",
            "https://www.youtube.com/embed/H7c2n-M8-3E",
            "https://www.youtube.com/embed/SOf-hVsc_yU",
            "https://www.youtube.com/embed/mK9k2tY6SVE",
            "https://www.youtube.com/embed/T6WkCOx4-R8"
          ];
          wholeDialogueVideoUrl = ytUrls[(lesson.id - 11) % ytUrls.length];
        } else {
          // Case: Speaker A video and Speaker B video for each dialogue line
          dialogue = lesson.dialogue.map((line, lineIdx) => {
            const isSpeakerA = line.speaker.includes('A');
            // Premium mixkit stock video clips depicting clear close-up speaking loops for native practice
            const speakerAVideo = "https://assets.mixkit.co/videos/preview/mixkit-woman-explaining-something-during-a-video-call-40030-large.mp4";
            const speakerBVideo = "https://assets.mixkit.co/videos/preview/mixkit-young-man-having-a-web-conference-40031-large.mp4";
            return {
              ...line,
              videoUrl: isSpeakerA ? speakerAVideo : speakerBVideo
            };
          });
        }
      } else if (courseId === 'course-workspace') {
        // Also inject a full video for some workplace lessons
        const ytUrls = [
          "https://www.youtube.com/embed/sRLO4p_rDss",
          "https://www.youtube.com/embed/YnIdVscH_cE"
        ];
        wholeDialogueVideoUrl = ytUrls[(lesson.id - 21) % ytUrls.length];
      }

      return {
        ...lesson,
        courseId,
        dialogue,
        wholeDialogueVideoUrl
      };
    });

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge mapped properties if saved lines lack courseId or video fields
        return parsed.map((savedL: any) => {
          const matched = mappedInitialLessons.find(m => m.id === savedL.id);
          if (matched) {
            return {
              ...matched,
              ...savedL,
              // Keep matched video fields & courseId if they aren't configured in saved
              courseId: savedL.courseId || matched.courseId,
              dialogue: savedL.dialogue && savedL.dialogue.length > 0
                ? savedL.dialogue.map((line: any, idx: number) => ({
                    ...matched.dialogue[idx],
                    ...line,
                    videoUrl: line.videoUrl || matched.dialogue[idx]?.videoUrl
                  }))
                : matched.dialogue,
              wholeDialogueVideoUrl: savedL.wholeDialogueVideoUrl || matched.wholeDialogueVideoUrl
            };
          }
          return savedL;
        });
      } catch (e) {
        console.error("Error parsing saved lessons:", e);
      }
    }
    return mappedInitialLessons;
  });

  const [grammarChapters, setGrammarChapters] = useState<GrammarChapter[]>(() => {
    const saved = localStorage.getItem('thai_grammar_chapters_curriculum_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved grammar chapters:", e);
      }
    }
    return initialGrammarChapters;
  });

  const [orientationData, setOrientationData] = useState<OrientationArticle[]>(() => {
    const saved = localStorage.getItem('thai_orientation_articles_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved orientation articles:", e);
      }
    }
    return initialOrientationData;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('thai_courses_curriculum');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved courses:", e);
      }
    }
    return [
      {
        id: "course-basic",
        name: "Complete Thai Foundational Mastery Course",
        nameMm: "ထိုင်းစကားပြောနှင့် စာရေးစာဖတ် အခြေခံအထူးတန်းသင်တန်း",
        priceAmount: 35000,
        currency: "MMK" as const,
        duration: "6 Weeks (Self-paced Interactive Training)",
        description: "Perfect for complete beginners. Cover Thai phonetic consonants, low/mid/high class letters, compound vowels, and tone rules with native audio worksheets.",
        descriptionMm: "ထိုင်းအက္ခရာ လုံးချင်းအသံထွက်များ၊ သရတွဲများနှင့် အသံနိမ့်မြင့်သင်္ကေတစည်းမျဉ်းများကို စနစ်တကျ သင်ယူလေ့လာနိုင်မည့် အခြေခံအထူးတန်း။",
        instructor: "Kru Jane (Experienced Native Tutor)",
        resources: [
          {
            id: "res-basic-alphabet",
            name: "Premium Thai Alphabet Tracing Workbook",
            nameMm: "ထိုင်းအခြေခံဗျည်းအက္ခရာ ရေးသားလေ့ကျင့်ခန်းစာအုပ်",
            downloadUrl: "https://drive.google.com/open?id=demo_thai_tracing",
            priceAmount: 0,
            currency: 'MMK'
          },
          {
            id: "res-basic-grammar",
            name: "Complete Thai Tones & Grammar Pocket Guide",
            nameMm: "ထိုင်းအသံမြှင့်စနစ်နှင့် အဓိကသဒ္ဒါစည်းမျဉ်း အိတ်ဆောင်လက်စွဲ",
            downloadUrl: "https://drive.google.com/open?id=demo_thai_tones",
            priceAmount: 4500,
            currency: 'MMK'
          }
        ]
      },
      {
        id: "course-business",
        name: "Advanced Business Thai Speaking & Letters Course",
        nameMm: "အလုပ်အကိုင်နှင့် စီးပွားရေးသုံး အဆင့်မြင့် ထိုင်းစကားပြောသင်တန်း",
        priceAmount: 65000,
        currency: "MMK" as const,
        duration: "8 Weeks (Structured Learning Tracks)",
        description: "Best for career professionals, translators, and cross-border business seekers. Master professional business email drafts, complex negotiation terms, formal speech patterns, and custom terminology.",
        descriptionMm: "စီးပွားရေးညှိနှိုင်းမှုများ၊ ရုံးသုံးစာပေးစာယူများ၊ အင်တာဗျူးပုံစံများနှင့် လုပ်ငန်းခွင်သုံး စကားပြောအဆင့်မြင့်စကားလုံးများကို ကျွမ်းကျင်စွာ ပြောဆိုရေးသားနိုင်ရန် အထူးသင်ရိုး။",
        instructor: "Kru Jane & Sayar Thura",
        resources: [
          {
            id: "res-biz-email",
            name: "Professional Business Thai Email Templates",
            nameMm: "ရုံးသုံးထိုင်းအီးမေးလ်ရေးသားနည်း ပုံစံတူလက်စွဲစနစ်",
            downloadUrl: "https://drive.google.com/open?id=demo_biz_email",
            priceAmount: 6000,
            currency: 'MMK'
          }
        ]
      },
      {
        id: "course-workspace",
        name: "Workspace & Professional Thai Learning Course",
        nameMm: "လုပ်ငန်းခွင်သုံး ထိုင်းစကားပြောနှင့် လက်တွေ့အသုံးချသင်တန်း",
        priceAmount: 45000,
        currency: "MMK" as const,
        duration: "6 Weeks (Self-paced Job-Oriented Training)",
        description: "Master workplace communication, technical operations terminology, factory shift dialogues, and HR speech formulas for working in Thailand comfortably.",
        descriptionMm: "ထိုင်းနိုင်ငံအတွင်း အလုပ်လုပ်ကိုင်နေသူများ၊ စက်ရုံ/အလုပ်ရုံတန်းများ၊ ရုံးဝန်ထမ်းများနှင့် အရောင်းကိုယ်စားလှယ်များအတွက် လက်တွေ့လုပ်ငန်းခွင်သုံး အထူးပြုပြောဆိုနည်းများ။",
        instructor: "Kru Jane & Sayar Thura"
      }
    ];
  });

  // Course management edit form states
  const [adminSelectedCourseId, setAdminSelectedCourseId] = useState<string>('course-basic');
  const [courseFormName, setCourseFormName] = useState<string>('');
  const [courseFormNameMm, setCourseFormNameMm] = useState<string>('');
  const [courseFormPrice, setCourseFormPrice] = useState<number>(35000);
  const [courseFormDuration, setCourseFormDuration] = useState<string>('');
  const [courseFormDescription, setCourseFormDescription] = useState<string>('');
  const [courseFormDescriptionMm, setCourseFormDescriptionMm] = useState<string>('');
  const [courseFormInstructor, setCourseFormInstructor] = useState<string>('');
  const [courseIsNew, setCourseIsNew] = useState<boolean>(false);
  const [courseNewIdStr, setCourseNewIdStr] = useState<string>('');

  // Course resource form state
  const [resourceFormName, setResourceFormName] = useState<string>('');
  const [resourceFormNameMm, setResourceFormNameMm] = useState<string>('');
  const [resourceFormUrl, setResourceFormUrl] = useState<string>('');
  const [resourceFormPrice, setResourceFormPrice] = useState<number>(0);
  const [resourceFormType, setResourceFormType] = useState<'free' | 'premium'>('free');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  // Course filter for filtering lessons inside admin curriculum editor
  const [adminCurriculumCourseFilter, setAdminCurriculumCourseFilter] = useState<string>('all');

  useEffect(() => {
    const activeC = courses.find(c => c.id === adminSelectedCourseId);
    if (activeC && !courseIsNew) {
      setCourseFormName(activeC.name);
      setCourseFormNameMm(activeC.nameMm);
      setCourseFormPrice(activeC.priceAmount);
      setCourseFormDuration(activeC.duration);
      setCourseFormDescription(activeC.description);
      setCourseFormDescriptionMm(activeC.descriptionMm);
      setCourseFormInstructor(activeC.instructor);
    }
  }, [adminSelectedCourseId, courses, courseIsNew]);

  const [adminSelectedLessonId, setAdminSelectedLessonId] = useState<number | null>(null);
  const [adminEditTab, setAdminEditTab] = useState<'metadata' | 'vocabulary' | 'dialogue' | 'grammar' | 'quiz'>('metadata');
  const [adminHubTab, setAdminHubTab] = useState<'orders' | 'accounts' | 'courses' | 'store' | 'orientation' | 'grammar' | 'brand'>('orders');

  const [adminSelectedOrientId, setAdminSelectedOrientId] = useState<string>('better-thai');
  const [adminSelectedGrammarChId, setAdminSelectedGrammarChId] = useState<number>(1);

  const [orientEditArticle, setOrientEditArticle] = useState<OrientationArticle | null>(null);
  const [grammarEditChapter, setGrammarEditChapter] = useState<GrammarChapter | null>(null);

  useEffect(() => {
    const article = orientationData.find(a => a.id === adminSelectedOrientId);
    if (article) {
      setOrientEditArticle(JSON.parse(JSON.stringify(article)));
    } else {
      setOrientEditArticle(null);
    }
  }, [adminSelectedOrientId, orientationData]);

  useEffect(() => {
    const chapter = grammarChapters.find(c => c.id === adminSelectedGrammarChId);
    if (chapter) {
      setGrammarEditChapter(JSON.parse(JSON.stringify(chapter)));
    } else {
      setGrammarEditChapter(null);
    }
  }, [adminSelectedGrammarChId, grammarChapters]);

  const updateOrientField = (field: string, val: any) => {
    if (!orientEditArticle) return;
    setOrientEditArticle({ ...orientEditArticle, [field]: val });
  };

  const updateOrientSectionHeading = (sIdx: number, valEn: string, valMm: string) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        return { ...sec, headingEnglish: valEn, headingMyanmar: valMm };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const addOrientSection = () => {
    if (!orientEditArticle) return;
    const nextSections = [
      ...orientEditArticle.sections,
      {
        headingEnglish: "New Section",
        headingMyanmar: "အပိုင်းသစ်",
        paragraphs: [{ en: "", mm: "" }],
        highlights: []
      }
    ];
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const deleteOrientSection = (sIdx: number) => {
    if (!orientEditArticle) return;
    if (confirm("Are you sure you want to delete this entire section, including all its paragraphs and highlights?")) {
      const nextSections = orientEditArticle.sections.filter((_, i) => i !== sIdx);
      setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
    }
  };

  const updateOrientParagraph = (sIdx: number, pIdx: number, field: 'en' | 'mm', val: string) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        const nextParas = sec.paragraphs.map((p, j) => {
          if (j === pIdx) {
            return { ...p, [field]: val };
          }
          return p;
        });
        return { ...sec, paragraphs: nextParas };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const addOrientParagraph = (sIdx: number) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        return { ...sec, paragraphs: [...sec.paragraphs, { en: "", mm: "" }] };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const deleteOrientParagraph = (sIdx: number, pIdx: number) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        return { ...sec, paragraphs: sec.paragraphs.filter((_, j) => j !== pIdx) };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const updateOrientHighlight = (sIdx: number, hIdx: number, field: string, val: string) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        const nextHighlights = sec.highlights.map((h, j) => {
          if (j === hIdx) {
            return { ...h, [field]: val };
          }
          return h;
        });
        return { ...sec, highlights: nextHighlights };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const addOrientHighlight = (sIdx: number) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        return {
          ...sec,
          highlights: [
            ...sec.highlights,
            { termThai: "", termPhonetic: "", meaningEnglish: "", meaningMyanmar: "" }
          ]
        };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const deleteOrientHighlight = (sIdx: number, hIdx: number) => {
    if (!orientEditArticle) return;
    const nextSections = orientEditArticle.sections.map((sec, i) => {
      if (i === sIdx) {
        return { ...sec, highlights: sec.highlights.filter((_, j) => j !== hIdx) };
      }
      return sec;
    });
    setOrientEditArticle({ ...orientEditArticle, sections: nextSections });
  };

  const handleSaveOrientation = () => {
    if (!orientEditArticle) return;
    const nextList = orientationData.map(a => a.id === orientEditArticle.id ? orientEditArticle : a);
    setOrientationData(nextList);
    localStorage.setItem('thai_orientation_articles_list', JSON.stringify(nextList));
    addSystemLog('admin', `Updated orientation article content: "${orientEditArticle.titleEnglish}"`);
    alert("Orientation article content updated successfully!");
  };

  const updateGrammarChField = (field: string, val: any) => {
    if (!grammarEditChapter) return;
    setGrammarEditChapter({ ...grammarEditChapter, [field]: val });
  };

  const updateGrammarRuleField = (rIdx: number, field: string, val: any) => {
    if (!grammarEditChapter) return;
    const nextRules = grammarEditChapter.rules.map((rule, i) => {
      if (i === rIdx) {
        return { ...rule, [field]: val };
      }
      return rule;
    });
    setGrammarEditChapter({ ...grammarEditChapter, rules: nextRules });
  };

  const addGrammarRule = () => {
    if (!grammarEditChapter) return;
    const nextRules = [
      ...grammarEditChapter.rules,
      {
        title: "New Rule",
        titleMyanmar: "စည်းမျဉ်းသစ်",
        explanation: "Rule explanation",
        explanationMyanmar: "စည်းမျဉ်း ရှင်းလင်းချက်",
        examples: []
      }
    ];
    setGrammarEditChapter({ ...grammarEditChapter, rules: nextRules });
  };

  const deleteGrammarRule = (rIdx: number) => {
    if (!grammarEditChapter) return;
    if (confirm("Are you sure you want to delete this rule?")) {
      const nextRules = grammarEditChapter.rules.filter((_, i) => i !== rIdx);
      setGrammarEditChapter({ ...grammarEditChapter, rules: nextRules });
    }
  };

  const updateGrammarExampleField = (rIdx: number, eIdx: number, field: string, val: any) => {
    if (!grammarEditChapter) return;
    const nextRules = grammarEditChapter.rules.map((rule, i) => {
      if (i === rIdx) {
        const nextExamples = rule.examples.map((ex, j) => {
          if (j === eIdx) {
            return { ...ex, [field]: val };
          }
          return ex;
        });
        return { ...rule, examples: nextExamples };
      }
      return rule;
    });
    setGrammarEditChapter({ ...grammarEditChapter, rules: nextRules });
  };

  const addGrammarExample = (rIdx: number) => {
    if (!grammarEditChapter) return;
    const nextRules = grammarEditChapter.rules.map((rule, i) => {
      if (i === rIdx) {
        return {
          ...rule,
          examples: [
            ...rule.examples,
            { thai: "", phonetic: "", english: "", myanmar: "" }
          ]
        };
      }
      return rule;
    });
    setGrammarEditChapter({ ...grammarEditChapter, rules: nextRules });
  };

  const deleteGrammarExample = (rIdx: number, eIdx: number) => {
    if (!grammarEditChapter) return;
    const nextRules = grammarEditChapter.rules.map((rule, i) => {
      if (i === rIdx) {
        return { ...rule, examples: rule.examples.filter((_, j) => j !== eIdx) };
      }
      return rule;
    });
    setGrammarEditChapter({ ...grammarEditChapter, rules: nextRules });
  };

  const handleSaveGrammarChapter = () => {
    if (!grammarEditChapter) return;
    const nextList = grammarChapters.map(c => c.id === grammarEditChapter.id ? grammarEditChapter : c);
    setGrammarChapters(nextList);
    localStorage.setItem('thai_grammar_chapters_curriculum_list', JSON.stringify(nextList));
    addSystemLog('admin', `Updated grammar handbook chapter details: Chapter ${grammarEditChapter.chapterNumber} - "${grammarEditChapter.titleEnglish}"`);
    alert("Grammar handbook chapter content updated successfully!");
  };
  const [editingVocabIndex, setEditingVocabIndex] = useState<number | null>(null);
  const [editingVocabThai, setEditingVocabThai] = useState<string>('');
  const [editingVocabPhonetic, setEditingVocabPhonetic] = useState<string>('');
  const [editingVocabEnglish, setEditingVocabEnglish] = useState<string>('');
  const [editingVocabMyanmar, setEditingVocabMyanmar] = useState<string>('');
  const [editingVocabPos, setEditingVocabPos] = useState<string>('');

  // Admin New Account Creator State
  const [adminNewUserUsername, setAdminNewUserUsername] = useState<string>('');
  const [adminNewUserPassword, setAdminNewUserPassword] = useState<string>('');
  const [adminNewUserRole, setAdminNewUserRole] = useState<'student' | 'admin'>('student');

  // CSV Import Hub State
  const [csvImportType, setCsvImportType] = useState<'vocabulary' | 'dialogue' | 'grammar' | 'quiz' | 'lessons'>('vocabulary');
  const [csvImportTargetLesson, setCsvImportTargetLesson] = useState<number | 'all'>('all');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParsedData, setCsvParsedData] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [isCsvImportExpanded, setIsCsvImportExpanded] = useState<boolean>(false);
  const [isCsvDragOver, setIsCsvDragOver] = useState<boolean>(false);

  // Dedicated syllabus-level bulk lesson import state
  const [syllabusCsvFile, setSyllabusCsvFile] = useState<File | null>(null);
  const [syllabusCsvFileName, setSyllabusCsvFileName] = useState<string>('');
  const [syllabusCsvParsedData, setSyllabusCsvParsedData] = useState<any[]>([]);
  const [syllabusCsvErrors, setSyllabusCsvErrors] = useState<string[]>([]);
  const [isSyllabusCsvDragOver, setIsSyllabusCsvDragOver] = useState<boolean>(false);
  const [isSyllabusImportExpanded, setIsSyllabusImportExpanded] = useState<boolean>(false);

  // Checkout and Store purchase form state
  const [selectedStoreItem, setSelectedStoreItem] = useState<any | null>(null);
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutNetwork, setCheckoutNetwork] = useState<string>('KBZPay');

  // Interactive Course Store and Secure Payment Gateway Simulation states
  const [isCourseStoreExpanded, setIsCourseStoreExpanded] = useState<boolean>(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(false);
  const [gatewayCourse, setGatewayCourse] = useState<any | null>(null);
  const [gatewayPaymentMethod, setGatewayPaymentMethod] = useState<'kbzpay' | 'wavepay' | 'cbpay' | 'ayabank' | 'truemoney' | 'promptpay'>('kbzpay');
  const [gatewayPhone, setGatewayPhone] = useState<string>('');
  const [gatewayStep, setGatewayStep] = useState<number>(1); // 1 = input contact/order, 2 = select method & complete gateway step, 3 = dynamic qr/otp confirmation, 4 = complete success
  const [gatewayProcessing, setGatewayProcessing] = useState<boolean>(false);
  const [gatewayOtp, setGatewayOtp] = useState<string>('');
  const [gatewayTimer, setGatewayTimer] = useState<number>(180); // 3 minutes Countdown timer for dynamic QR codes
  const [gatewayEmail, setGatewayEmail] = useState<string>('');

  // Drag and drop states for admin sorting
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<'lessons' | 'vocab' | 'dialogue' | 'grammar' | 'quiz' | null>(null);
  const [dragOverTargetIndex, setDragOverTargetIndex] = useState<number | null>(null);
  const [isDragReorderExpanded, setIsDragReorderExpanded] = useState<boolean>(false);

  const handleDragStart = (e: React.DragEvent, index: number, type: 'lessons' | 'vocab' | 'dialogue' | 'grammar' | 'quiz') => {
    setDraggedItemIndex(index);
    setDraggedItemType(type);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === index) return;
    setDragOverTargetIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDraggedItemType(null);
    setDragOverTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number, type: 'lessons' | 'vocab' | 'dialogue' | 'grammar' | 'quiz') => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemType !== type) return;
    if (draggedItemIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    if (type === 'lessons') {
      const updated = [...lessons];
      const [movedItem] = updated.splice(draggedItemIndex, 1);
      updated.splice(targetIndex, 0, movedItem);
      setLessons(updated);
      addSystemLog('admin', 'Reordered lessons list via drag-and-drop');
    } else if (type === 'vocab') {
      if (adminSelectedLessonId) {
        const currentVocab = getCustomVocabList(adminSelectedLessonId);
        const updated = [...currentVocab];
        const [movedItem] = updated.splice(draggedItemIndex, 1);
        updated.splice(targetIndex, 0, movedItem);
        handleSaveVocabList(adminSelectedLessonId, updated);
        addSystemLog('admin', `Reordered vocabulary words list in Lesson ${adminSelectedLessonId}`);
      }
    } else if (type === 'dialogue') {
      if (adminSelectedLessonId) {
        const selectedLesson = lessons.find(l => l.id === adminSelectedLessonId);
        if (selectedLesson) {
          const updated = [...(selectedLesson.dialogue || [])];
          const [movedItem] = updated.splice(draggedItemIndex, 1);
          updated.splice(targetIndex, 0, movedItem);
          handleSaveDialogue(adminSelectedLessonId, updated);
          addSystemLog('admin', `Reordered sentences/dialogue list in Lesson ${adminSelectedLessonId}`);
        }
      }
    } else if (type === 'grammar') {
      if (adminSelectedLessonId) {
        const selectedLesson = lessons.find(l => l.id === adminSelectedLessonId);
        if (selectedLesson) {
          const updated = [...(selectedLesson.grammarNotes || [])];
          const [movedItem] = updated.splice(draggedItemIndex, 1);
          updated.splice(targetIndex, 0, movedItem);
          handleSaveGrammarNotes(adminSelectedLessonId, updated);
          addSystemLog('admin', `Reordered grammar notes list in Lesson ${adminSelectedLessonId}`);
        }
      }
    } else if (type === 'quiz') {
      if (adminSelectedLessonId) {
        const selectedLesson = lessons.find(l => l.id === adminSelectedLessonId);
        if (selectedLesson) {
          const updated = [...(selectedLesson.quiz || [])];
          const [movedItem] = updated.splice(draggedItemIndex, 1);
          updated.splice(targetIndex, 0, movedItem);
          handleSaveQuizzes(adminSelectedLessonId, updated);
          addSystemLog('admin', `Reordered interactive quizzes list in Lesson ${adminSelectedLessonId}`);
        }
      }
    }

    handleDragEnd();
  };

  useEffect(() => {
    let interval: any;
    if (isGatewayOpen && gatewayStep === 3 && gatewayTimer > 0) {
      interval = setInterval(() => {
        setGatewayTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGatewayOpen, gatewayStep, gatewayTimer]);

  useEffect(() => {
    localStorage.setItem('thai_lessons_curriculum', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('thai_courses_curriculum', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    setEditingVocabIndex(null);
  }, [adminSelectedLessonId, adminEditTab]);

  const [progress, setProgress] = useState<ProgressState>(INITIAL_PROGRESS);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'sentence' | 'grammar' | 'quiz'>('vocabulary');
  const [vocabSearch, setVocabSearch] = useState<string>('');
  const [onlyShowUnmastered, setOnlyShowUnmastered] = useState<boolean>(false);
  const [isOnline, setIsRecordingOnline] = useState<boolean>(navigator.onLine);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dashboardTab, setDashboardTab] = useState<'lessons' | 'orientation' | 'handbook' | 'alphabet' | 'notebook' | 'profile' | 'admin'>('lessons');
  const [selectedCourseTab, setSelectedCourseTab] = useState<string>('course-basic');
  const [courseSubTab, setCourseSubTab] = useState<'lessons' | 'resources'>('lessons');
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeOrientationId, setActiveOrientationId] = useState<string>('better-thai');
  const [mobileChapterDetailActive, setMobileChapterDetailActive] = useState<boolean>(false);
  const [currentGrammarPageIndex, setCurrentGrammarPageIndex] = useState<number>(0);
  const [expandedChapterRuleIndex, setExpandedChapterRuleIndex] = useState<number>(0);
  const [lessonSubPageIndex, setLessonSubPageIndex] = useState<number>(0);
  const [handbookSubPageIndex, setHandbookSubPageIndex] = useState<number>(0);
  const [exampleModeForRules, setExampleModeForRules] = useState<{[key: string]: 'standard' | 'more' | 'formal' | 'casual'}>({});
  const [audioSpeedIndex, setAudioSpeedIndex] = useState<number>(0); // 0: Normal, 1: Slow, 2: Much Slower

  const [brandColor, setBrandColor] = useState<string>(() => {
    return localStorage.getItem('thai_brand_color') || '#8234ea';
  });
  const [brandLogoText, setBrandLogoText] = useState<string>(() => {
    return localStorage.getItem('thai_brand_logo_text') || 'TH';
  });
  const [brandLogoImg, setBrandLogoImg] = useState<string>(() => {
    return localStorage.getItem('thai_brand_logo_img') || '';
  });
  const [brandName, setBrandName] = useState<string>(() => {
    return localStorage.getItem('thai_brand_name') || 'Thai Language Tutor';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-brand-purple', brandColor);
    
    const hoverColor = adjustHexBrightness(brandColor, 10);
    const shadowColor = adjustHexBrightness(brandColor, -15);
    const lightColor = adjustHexBrightness(brandColor, 95);
    const subtleColor = adjustHexBrightness(brandColor, 90);
    const deepColor = adjustHexBrightness(brandColor, -75);
    
    root.style.setProperty('--color-brand-purple-hover', hoverColor);
    root.style.setProperty('--color-brand-purple-shadow', shadowColor);
    root.style.setProperty('--color-brand-purple-light', lightColor);
    root.style.setProperty('--color-brand-purple-subtle', subtleColor);
    root.style.setProperty('--color-brand-purple-deep', deepColor);
    
    localStorage.setItem('thai_brand_color', brandColor);
  }, [brandColor]);

  useEffect(() => {
    localStorage.setItem('thai_brand_logo_text', brandLogoText);
  }, [brandLogoText]);

  useEffect(() => {
    localStorage.setItem('thai_brand_logo_img', brandLogoImg);
  }, [brandLogoImg]);

  useEffect(() => {
    localStorage.setItem('thai_brand_name', brandName);
  }, [brandName]);

  // User engagement tracking state
  const [clickCount, setClickCount] = useState<number>(0);
  const [timeOnPage, setTimeOnPage] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('thai_user_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('thai_current_user') || null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('thai_user_is_admin') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [hasDismissedPromo, setHasDismissedPromo] = useState<boolean>(() => {
    return sessionStorage.getItem('thai_has_dismissed_promo') === 'true';
  });

  const [authTab, setAuthTab] = useState<'student-signup' | 'student-login' | 'admin'>('student-signup');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthModalCoursePurchaseExpanded, setIsAuthModalCoursePurchaseExpanded] = useState<boolean>(false);

  // Custom Words Notebook state variables
  const [customWords, setCustomWords] = useState<(WordBreakdown & { author?: string })[]>(() => {
    const saved = localStorage.getItem('thai_custom_words_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        thai: "พรุ่งนี้",
        phonetic: "phrûŋ-níi",
        english: "Tomorrow",
        myanmar: "မနက်ဖြန်",
        partOfSpeech: "Noun",
        notes: "Example: พรุ่งนี้เจอกัน (phrûŋ-níi cəə-kan) - See you tomorrow!",
        author: "Root"
      },
      {
        thai: "ขอบคุณมาก",
        phonetic: "khɔ̀ɔp-khun mâak",
        english: "Thank you very much",
        myanmar: "အများကြီးကျေးဇူးတင်ပါတယ်",
        partOfSpeech: "Phrase",
        notes: "Polite final particle 'ครับ/ค่ะ' (khráp/khâ) can be appended.",
        author: "Root"
      },
      {
        thai: "สบายดีไหม",
        phonetic: "sà-baaj-dii mǎj",
        english: "How are you?",
        myanmar: "နေကောင်းလား",
        partOfSpeech: "Phrase",
        notes: "Standard friendly greeting in Thai and Myanmar translations.",
        author: "Root"
      }
    ];
  });
  const [customWordSearch, setCustomWordSearch] = useState<string>('');
  const [newWordThai, setNewWordThai] = useState<string>('');
  const [newWordPhonetic, setNewWordPhonetic] = useState<string>('');
  const [newWordEnglish, setNewWordEnglish] = useState<string>('');
  const [newWordMyanmar, setNewWordMyanmar] = useState<string>('');
  const [newWordPos, setNewWordPos] = useState<string>('Noun');
  const [newWordNotes, setNewWordNotes] = useState<string>('');
  const [notebookError, setNotebookError] = useState<string>('');
  const [notebookSuccess, setNotebookSuccess] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Editing state
  const [editingWordThai, setEditingWordThai] = useState<string | null>(null);
  const [editWordPhonetic, setEditWordPhonetic] = useState<string>('');
  const [editWordEnglish, setEditWordEnglish] = useState<string>('');
  const [editWordMyanmar, setEditWordMyanmar] = useState<string>('');
  const [editWordPos, setEditWordPos] = useState<string>('Noun');
  const [editWordNotes, setEditWordNotes] = useState<string>('');

  // Admin announcement input
  const [activeBroadcastInput, setActiveBroadcastInput] = useState<string>(() => {
    return localStorage.getItem('thai_active_broadcast') || 'မင်္ဂလာပါ! အခြေခံ ထိုင်းသဒ္ဒါနှင့် ဝေါဟာရများကို စနစ်တကျ သင်ယူလေ့လာနိုင်ပါသည်။ (Welcome! Study Thai grammar & vocabulary systematically.)';
  });

  // Admin Broadcast Message Option
  const [activeBroadcast, setActiveBroadcast] = useState<string>(() => {
    return localStorage.getItem('thai_active_broadcast') || 'မင်္ဂလာပါ! အခြေခံ ထိုင်းသဒ္ဒါနှင့် ဝေါဟာရများကို စနစ်တကျ သင်ယူလေ့လာနိုင်ပါသည်။ (Welcome! Study Thai grammar & vocabulary systematically.)';
  });

  // Simple Notification banner dismiss
  const [showBroadcastBanner, setShowBroadcastBanner] = useState<boolean>(true);

  // User list table for admin dashboard view
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('thai_registered_users_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((u: any) => ({
          username: u.username,
          password: u.password || 'password123',
          role: u.role || 'student',
          xp: u.xp || 0,
          dateJoined: u.dateJoined || new Date().toISOString().split('T')[0],
          fullName: u.fullName,
          phone: u.phone,
          email: u.email
        }));
      } catch (e) {
        // Fallback
      }
    }
    return [
      { username: "ko_nay_min", password: "password123", role: "student", xp: 1250, dateJoined: "2026-05-12", fullName: "Ko Nay Min", phone: "09-771234567", email: "naymin@gmail.com" },
      { username: "ma_khine", password: "password123", role: "student", xp: 820, dateJoined: "2026-06-01", fullName: "Ma Khine Oo", phone: "09-445890123", email: "makhineoo@viber-me.com" },
      { username: "phyo_wai", password: "password123", role: "student", xp: 450, dateJoined: "2026-06-10", fullName: "Phyo Wai Tun", phone: "09-221345566", email: "phyowai@gmail.com" },
      { username: "admin_thura", password: "adminpassword", role: "admin", xp: 5000, dateJoined: "2026-06-05" }
    ];
  });

  // Purchase orders list state
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('thai_user_orders_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: "ORD-99321",
        username: "ko_nay_min",
        itemName: "🗣️ 1-on-1 Practice Speaking Session with Kru Jane (1 Hour Zoom)",
        itemType: "tutoring",
        priceAmount: 45000,
        currency: "MMK",
        status: "completed",
        orderDate: "2026-06-10",
        studentPhone: "09-771234567",
        studentEmail: "konaymin@gmail.com",
        adminNotes: "Session scheduled with Kru Jane. Zoom link dispatched to student mail/viber pipeline."
      },
      {
        id: "ORD-99322",
        username: "ma_khine",
        itemName: "📕 Advanced Thai-Myanmar Grammar Manual (Printed E-Book)",
        itemType: "e-book",
        priceAmount: 25000,
        currency: "MMK",
        status: "pending",
        orderDate: "2026-06-13",
        studentPhone: "09-445890123",
        studentEmail: "makhineoo@viber-me.com",
        evidenceImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='500' viewBox='0 0 300 500'><rect width='300' height='500' fill='%230056B3'/><rect x='15' y='15' width='270' height='470' rx='20' fill='white'/><circle cx='150' cy='80' r='30' fill='%2328A745'/><path d='M140 80 l7 7 l13 -13' fill='none' stroke='white' stroke-width='4'/><text x='150' y='135' font-family='sans-serif' font-size='16' font-weight='bold' fill='%2328A745' text-anchor='middle'>KPay Verification</text><text x='150' y='160' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23333333' text-anchor='middle'>- 25,000 MMK</text><line x1='30' y1='185' x2='270' y2='185' stroke='%23EEEEEE' stroke-width='2'/><text x='35' y='210' font-family='sans-serif' font-size='11' fill='%23777777'>Transaction ID</text><text x='265' y='210' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>TXN7784013920</text><text x='35' y='245' font-family='sans-serif' font-size='11' fill='%23777777'>Sender</text><text x='265' y='245' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>Ma Khine</text><text x='35' y='280' font-family='sans-serif' font-size='11' fill='%23777777'>Recipient</text><text x='265' y='280' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>Kru Jane Thai School</text><text x='35' y='315' font-family='sans-serif' font-size='11' fill='%23777777'>Date &amp; Time</text><text x='265' y='315' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>2026-06-13 14:15</text><line x1='30' y1='345' x2='270' y2='345' stroke='%23EEEEEE' stroke-width='2'/><rect x='30' y='370' width='240' height='70' rx='10' fill='%23F8F9FA'/><text x='150' y='398' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23666666' text-anchor='middle'>Payment Channel: KBZPay Myanmar</text><text x='150' y='418' font-family='sans-serif' font-size='10' fill='%23999999' text-anchor='middle'>Reference: KBZ-PRINT-THAI</text></svg>"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('thai_user_orders_list', JSON.stringify(orders));
  }, [orders]);

  // Study store items state for sale
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('thai_store_items_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_STORE_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('thai_store_items_list', JSON.stringify(storeItems));
  }, [storeItems]);

  // Admin Store / E-Book editor states
  const [adminSelectedStoreId, setAdminSelectedStoreId] = useState<string>('premium-book');
  const [storeFormName, setStoreFormName] = useState<string>('');
  const [storeFormNameMm, setStoreFormNameMm] = useState<string>('');
  const [storeFormType, setStoreFormType] = useState<'e-book' | 'tutoring' | 'certificate' | 'vip-package'>('e-book');
  const [storeFormDescription, setStoreFormDescription] = useState<string>('');
  const [storeFormDescriptionMm, setStoreFormDescriptionMm] = useState<string>('');
  const [storeFormPrice, setStoreFormPrice] = useState<number>(25000);
  const [storeFormCurrency, setStoreFormCurrency] = useState<'MMK' | 'XP'>('MMK');
  const [storeFormPopular, setStoreFormPopular] = useState<boolean>(false);
  const [storeIsNew, setStoreIsNew] = useState<boolean>(false);
  const [storeNewIdStr, setStoreNewIdStr] = useState<string>('');
  const [storeFormCourseId, setStoreFormCourseId] = useState<string>('');
  const [storeFormPdfFileName, setStoreFormPdfFileName] = useState<string>('');
  const [storeFormPdfDownloadUrl, setStoreFormPdfDownloadUrl] = useState<string>('');

  useEffect(() => {
    const activeItem = storeItems.find(item => item.id === adminSelectedStoreId);
    if (activeItem && !storeIsNew) {
      setStoreFormName(activeItem.name);
      setStoreFormNameMm(activeItem.nameMm);
      setStoreFormType(activeItem.type);
      setStoreFormDescription(activeItem.description || '');
      setStoreFormDescriptionMm(activeItem.descriptionMm || '');
      setStoreFormPrice(activeItem.price);
      setStoreFormCurrency(activeItem.currency);
      setStoreFormPopular(!!activeItem.popular);
      setStoreFormCourseId(activeItem.courseId || '');
      setStoreFormPdfFileName(activeItem.pdfFileName || '');
      setStoreFormPdfDownloadUrl(activeItem.pdfDownloadUrl || '');
    }
  }, [adminSelectedStoreId, storeItems, storeIsNew]);

  // Load student account profile parameters into checkout form automatically when currentUser changes
  useEffect(() => {
    if (isLoggedIn && currentUser && !isAdmin) {
      const parentUser = registeredUsers.find(u => u.username.toLowerCase() === currentUser.toLowerCase());
      if (parentUser) {
        setCheckoutName(parentUser.fullName || parentUser.username || '');
        setGatewayPhone(parentUser.phone || '');
        setGatewayEmail(parentUser.email || '');
      }
    }
  }, [currentUser, isLoggedIn, isAdmin]);

  const [selectedDetailOrder, setSelectedDetailOrder] = useState<PurchaseOrder | null>(null);

  // Dynamic system logs shown on the admin panel
  const [systemLogs, setSystemLogs] = useState<{ id: string; user: string; action: string; time: string }[]>(() => {
    return [
      { id: "log-1", user: "ko_nay_min", action: "Completed Lesson 4 Quiz (+150 XP)", time: "10 mins ago" },
      { id: "log-2", user: "ma_khine", action: "Mastered word 'สวัสดี' (+10 XP)", time: "24 mins ago" },
      { id: "log-3", user: "phyo_wai", action: "Passed Grammar Chapter 1 test", time: "1 hour ago" },
      { id: "log-4", user: "Anonymous", action: "Switched pronunciation speed to SLOW", time: "2 hours ago" },
    ];
  });

  // Global track clicks and active session duration (35 seconds OR 8 clicks trigger the auth invite)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage((prev) => {
        const nextTime = prev + 1;
        if (!isLoggedIn && !hasDismissedPromo && !showAuthModal) {
          if (nextTime >= 35) {
            setShowAuthModal(true);
          }
        }
        return nextTime;
      });
    }, 1000);

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
        setClickCount((prev) => {
          const nextCount = prev + 1;
          if (!isLoggedIn && !hasDismissedPromo && !showAuthModal) {
            if (nextCount >= 8) {
              setShowAuthModal(true);
            }
          }
          return nextCount;
        });
      }
    };

    window.addEventListener('click', handleWindowClick);

    return () => {
      clearInterval(timer);
      window.removeEventListener('click', handleWindowClick);
    };
  }, [isLoggedIn, hasDismissedPromo, showAuthModal]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('thai_mm_progress_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Calculate streak
        const today = new Date().toISOString().split('T')[0];
        const lastActive = parsed.lastActiveDate;
        let currentStreak = parsed.streak || 1;

        if (lastActive && lastActive !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (lastActive === yesterday) {
            currentStreak += 1;
          } else {
            currentStreak = 1; // broken streak
          }
        }

        setProgress({
          ...parsed,
          streak: currentStreak,
          lastActiveDate: today
        });
      } catch (e) {
        console.error("Error reading saved progress", e);
      }
    }
  }, []);

  // Helper to generate a genuine educational PDF guide on the fly and trigger file download
  const triggerPdfDownload = (fileName: string, title: string, description: string, languageHighlights: { thai: string, pronunciation: string, myanmar: string }[]) => {
    const itemsText = languageHighlights.map((hl, idx) => {
      return `${idx + 1}. ${hl.thai} [${hl.pronunciation}] - ${hl.myanmar}`;
    }).join("\n");

    const pdfContent = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.275 841.889] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length 850 >>
stream
BT
/F1 16 Tf
50 780 Td
(${title}) Tj
/F2 10 Tf
0 -25 Td
(Kru Jane & Sayar Thura Thai Language Academy) Tj
0 -15 Td
(E-Book Reference Companion Guide) Tj
0 -30 Td
(About: ${description}) Tj
0 -30 Td
/F1 12 Tf
(ESSENTIAL PHRASES & VOCABULARY HIGHLIGHTS:) Tj
/F2 10 Tf
0 -20 Td
${itemsText.split('\n').map(line => `(${line}) Tj\n0 -15 Td`).join('\n')}
0 -30 Td
(Downloaded officially via classroom portal.) Tj
0 -15 Td
(Unlock Advanced levels to master Business negotiations, contracts & full speaking guides.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000120 00000 n 
0000000273 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
1100
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addSystemLog(currentUser || "Student", `Downloaded free study textbook: "${title}"`);
  };

  // Save progress changes
  const saveProgress = (newState: ProgressState) => {
    setProgress(newState);
    localStorage.setItem('thai_mm_progress_v1', JSON.stringify(newState));
    if (isLoggedIn && currentUser && !isAdmin) {
      // Sync XP dynamically in the user list
      setRegisteredUsers((prev) => {
        const nextList = prev.map((u) => 
          u.username.toLowerCase() === currentUser.toLowerCase() 
            ? { ...u, xp: newState.totalXp } 
            : u
        );
        localStorage.setItem('thai_registered_users_list', JSON.stringify(nextList));
        return nextList;
      });
    }
  };

  // User log-in and sign-up handlers
  const handleAdminLogin = (usernameStr: string, passwordStr: string): boolean => {
    const cleanUser = usernameStr.trim();
    const cleanPassword = passwordStr.trim();

    // 1. Check hardcoded master admin
    if (cleanUser.toLowerCase() === 'admin' && cleanPassword === 'admin@4238') {
      setIsLoggedIn(true);
      setCurrentUser('admin');
      setIsAdmin(true);
      localStorage.setItem('thai_user_logged_in', 'true');
      localStorage.setItem('thai_current_user', 'admin');
      localStorage.setItem('thai_user_is_admin', 'true');
      setShowAuthModal(false);
      setDashboardTab('admin'); // Navigate to administrator dashboard directly
      addSystemLog('admin', 'Logged into Administrator Console (Master)');
      return true;
    }

    // 2. Check registered users database
    const matchedUser = registeredUsers.find(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === cleanPassword
    );

    if (matchedUser) {
      setIsLoggedIn(true);
      setCurrentUser(matchedUser.username);
      const isAdm = matchedUser.role === 'admin';
      setIsAdmin(isAdm);
      localStorage.setItem('thai_user_logged_in', 'true');
      localStorage.setItem('thai_current_user', matchedUser.username);
      localStorage.setItem('thai_user_is_admin', isAdm ? 'true' : 'false');
      setShowAuthModal(false);

      if (isAdm) {
        setDashboardTab('admin');
        addSystemLog(matchedUser.username, 'Admin logged into console');
      } else {
        setDashboardTab('lessons');
        // Restore user's XP progress state
        const nextProgress = {
          ...progress,
          totalXp: matchedUser.xp
        };
        setProgress(nextProgress);
        localStorage.setItem('thai_mm_progress_v1', JSON.stringify(nextProgress));
        addSystemLog(matchedUser.username, `Student logged in (Current XP: ${matchedUser.xp})`);
      }
      return true;
    }

    return false;
  };

  const handleStandardSignUp = (usernameStr: string, passwordStr?: string) => {
    const cleanUser = usernameStr.trim();
    const cleanPassword = (passwordStr || 'password123').trim();
    if (!cleanUser) return false;
    
    // Check if taken
    const alreadyHas = registeredUsers.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase()) || cleanUser.toLowerCase() === 'admin';
    if (alreadyHas) {
      alert("Username is already taken! Please choose another username or log in.");
      return false;
    }

    setIsLoggedIn(true);
    setCurrentUser(cleanUser);
    setIsAdmin(false);
    localStorage.setItem('thai_user_logged_in', 'true');
    localStorage.setItem('thai_current_user', cleanUser);
    localStorage.setItem('thai_user_is_admin', 'false');
    setShowAuthModal(false);

    // Save registration
    setRegisteredUsers((prev) => {
      const nextList = [...prev, { 
        username: cleanUser, 
        password: cleanPassword, 
        role: 'student' as const, 
        xp: progress.totalXp, 
        dateJoined: new Date().toISOString().split('T')[0] 
      }];
      localStorage.setItem('thai_registered_users_list', JSON.stringify(nextList));
      return nextList;
    });

    addSystemLog(cleanUser, `Newly registered as Student and synchronized progress (+${progress.totalXp} XP)`);
    return true;
  };

  const handleSignOut = () => {
    const prevUser = currentUser || 'User';
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('thai_user_logged_in');
    localStorage.removeItem('thai_current_user');
    localStorage.removeItem('thai_user_is_admin');
    
    if (dashboardTab === 'admin') {
      setDashboardTab('lessons');
    }
    addSystemLog(prevUser, "Safely signed out from server session");
  };

  const addSystemLog = (user: string, action: string) => {
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
      user,
      action,
      time: 'Just now'
    };
    setSystemLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  const getCustomVocabList = (lessonId: number): WordBreakdown[] => {
    const saved = localStorage.getItem(`thai_custom_vocab_${lessonId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return pdfVocabulary[lessonId] || [];
  };

  const handleSaveVocabList = (lessonId: number, updatedVocab: WordBreakdown[]) => {
    localStorage.setItem(`thai_custom_vocab_${lessonId}`, JSON.stringify(updatedVocab));
    window.dispatchEvent(new Event('thai_vocab_updated'));
    addSystemLog('admin', `Updated dynamic Vocabulary database of Lesson ${lessonId}`);
    alert("Vocabulary list updated successfully!");
  };

  const updateLessonField = (lessonId: number, field: keyof Lesson, value: any) => {
    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return { ...l, [field]: value };
      }
      return l;
    }));
    addSystemLog('admin', `Updated ${field} for Lesson ${lessonId}`);
  };

  const handleSaveDialogue = (lessonId: number, updatedDialogue: DialogueLine[]) => {
    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return { ...l, dialogue: updatedDialogue };
      }
      return l;
    }));
    addSystemLog('admin', `Saved Dialogue context configuration for Lesson ${lessonId}`);
    alert("Dialogue saved successfully!");
  };

  const handleSaveGrammarNotes = (lessonId: number, updatedGrammar: GrammarNote[]) => {
    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return { ...l, grammarNotes: updatedGrammar };
      }
      return l;
    }));
    addSystemLog('admin', `Saved Grammar context rules for Lesson ${lessonId}`);
    alert("Grammar notes saved successfully!");
  };

  const handleSaveQuizzes = (lessonId: number, updatedQuizzes: QuizQuestion[]) => {
    setLessons(prev => prev.map(l => {
      if (l.id === lessonId) {
        return { ...l, quiz: updatedQuizzes };
      }
      return l;
    }));
    addSystemLog('admin', `Saved interactive Quizzes context for Lesson ${lessonId}`);
    alert("Quizzes saved successfully!");
  };

  // --- CSV Import Engine & Utilities ---
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        result.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      result.push(row);
    }
    return result.filter(r => r.length > 0 && r.some(cell => cell !== ''));
  };

  const downloadCsvTemplate = (type: string) => {
    let headers = '';
    let sample = '';
    let filename = '';

    if (type === 'vocabulary') {
      headers = 'thai,phonetic,english,myanmar,partOfSpeech,notes\n';
      sample = 'ข้าว,khaaw,rice,ထမင်း,noun,basic food item\nน้ำ,naam,water,ရေ,noun,essential fluid\n';
      filename = 'thai_vocabulary_template.csv';
    } else if (type === 'dialogue') {
      headers = 'speaker,thai,phonetic,english,myanmar,words\n';
      sample = 'A,สบายดีไหม,sa-baai-dee mai,How are you?,နေကောင်းလား,"สบายดี|sa-baai-dee|fine|နေကောင်းတယ်|verb ; ไหม|mai|question marker|လား|particle"\nB,สบายดีครับ,sa-baai-dee khráp,I am fine thank you.,နေကောင်းပါတယ်ခင်ဗျာ,"สบายดี|sa-baai-dee|fine|နေကောင်းတယ်|verb ; ครับ|khráp|polite male|ခင်ဗျာ|particle"\n';
      filename = 'thai_dialogue_template.csv';
    } else if (type === 'grammar') {
      headers = 'title,titleMyanmar,explanation,explanationMyanmar,examples\n';
      sample = 'Using polite particle "khrap",အမျိုးသားယဉ်ကျေးမှုစကား,Add "khrap" at the end of statements for polite male speech,အမျိုးသားများအတွက် ယဉ်ကျေးစွာပြောဆိုရန် ဝါကျအဆုံးတွင် "khrap" ထည့်ပါ,"สวัสดีครับ|sa-wat-dee khráp|Hello (male)|မင်္ဂလာပါခင်ဗျာ ; ขอบคุณครับ|khòop-khun khráp|Thank you (male)|ကျေးဇူးတင်ပါတယ်ခင်ဗျာ"\n';
      filename = 'thai_grammar_template.csv';
    } else if (type === 'quiz') {
      headers = 'type,prompt,promptThai,options,correctAnswer,explanation,explanationMyanmar\n';
      sample = 'translate-thai-to-mm,What does "สวัสดี" mean?,สวัสดี,နေကောင်းလား|မင်္ဂလာပါ|ကျေးဇူးတင်ပါတယ်|သွားတော့မယ်,မင်္ဂလာပါ,Standard greeting context,Sawatdee သည် ထိုင်းနှုတ်ဆက်စကား မင်္ဂလာပါ ဖြစ်သည်။\n';
      filename = 'thai_quiz_template.csv';
    } else if (type === 'lessons') {
      headers = 'id,titleThai,titlePhonetic,titleEnglish,titleMyanmar,descriptionEnglish,descriptionMyanmar\n';
      sample = '51,บทเรียนทดสอบ,Bot-riian thot-sɔɔp,Advanced Testing Lesson,စမ်းသပ်သင်ခန်းစာ,An advanced lesson imported via Excel/CSV system,Excel/CSV စနစ်မှ တစ်ဆင့် ထည့်သွင်းထားသော သင်ခန်းစာဖြစ်သည်။\n';
      filename = 'thai_lessons_metadata_template.csv';
    }

    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadOrdersAsJSON = (filteredOrders: PurchaseOrder[], customFileName?: string) => {
    try {
      const dataStr = JSON.stringify(filteredOrders, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', customFileName || `${currentUser || 'my'}_orders_ledger.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addSystemLog(currentUser || 'User', `Successfully downloaded orders ledger as JSON file: ${customFileName || 'default'}`);
    } catch (e) {
      alert('Failed to generate JSON download.');
    }
  };

  const downloadOrdersAsCSV = (filteredOrders: PurchaseOrder[], customFileName?: string) => {
    try {
      const headers = ['Order ID', 'Item Name', 'Item Type', 'Price Amount', 'Currency', 'Status', 'Date Placed', 'Contact Phone', 'Contact Email', 'Admin Notes', 'Student Username', 'Payment Image Attached'];
      const escapeCSVCell = (val: string | number | undefined) => {
        if (val === undefined || val === null) return '""';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      };

      const rows = filteredOrders.map(o => [
        escapeCSVCell(o.id),
        escapeCSVCell(o.itemName),
        escapeCSVCell(o.itemType),
        escapeCSVCell(o.priceAmount),
        escapeCSVCell(o.currency),
        escapeCSVCell(o.status),
        escapeCSVCell(o.orderDate),
        escapeCSVCell(o.studentPhone),
        escapeCSVCell(o.studentEmail),
        escapeCSVCell(o.adminNotes),
        escapeCSVCell(o.username),
        o.evidenceImage ? '"Yes"' : '"No"'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', customFileName || `${currentUser || 'my'}_orders_ledger.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addSystemLog(currentUser || 'User', `Successfully downloaded purchase ledger as CSV file: ${customFileName || 'default'}`);
    } catch (e) {
      alert('Failed to generate CSV download.');
    }
  };

  const handleSyllabusCsvFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSyllabusCsvFile(file);
    }
  };

  const processSyllabusCsvFile = (file: File) => {
    setSyllabusCsvFile(file);
    setSyllabusCsvFileName(file.name);
    setSyllabusCsvErrors([]);
    setSyllabusCsvParsedData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setSyllabusCsvErrors(['Empty file or unable to read file contents.']);
        return;
      }
      parseAndValidateSyllabusCsv(text);
    };
    reader.onerror = () => {
      setSyllabusCsvErrors(['Error reading file.']);
    };
    reader.readAsText(file);
  };

  const parseAndValidateSyllabusCsv = (text: string) => {
    const rows = parseCSV(text);
    if (rows.length < 2) {
      setSyllabusCsvErrors(['Invalid CSV format. File must contain at least a header row and one data row.']);
      return;
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    const parsed: any[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const getVal = (headerName: string): string => {
        const colIdx = headers.indexOf(headerName.toLowerCase().trim());
        return colIdx !== -1 && row[colIdx] !== undefined ? row[colIdx].trim() : '';
      };

      const idVal = getVal('id');
      const titleThai = getVal('titleThai');
      const titlePhonetic = getVal('titlePhonetic');
      const titleEnglish = getVal('titleEnglish');
      const titleMyanmar = getVal('titleMyanmar');
      const descriptionEnglish = getVal('descriptionEnglish');
      const descriptionMyanmar = getVal('descriptionMyanmar');

      if (!idVal) errors.push(`Row ${rowNum}: Lesson 'id' (number) is required.`);
      if (!titleEnglish) errors.push(`Row ${rowNum}: Lesson 'titleEnglish' is required.`);

      const parsedId = Number(idVal);
      if (isNaN(parsedId)) {
        errors.push(`Row ${rowNum}: Lesson ID must be a valid number.`);
      }

      parsed.push({
        id: parsedId,
        titleThai: titleThai || "บทเรียนใหม่",
        titlePhonetic: titlePhonetic || "Bot-riian mai",
        titleEnglish,
        titleMyanmar: titleMyanmar || titleEnglish,
        descriptionEnglish: descriptionEnglish || "",
        descriptionMyanmar: descriptionMyanmar || "",
        dialogue: [],
        grammarNotes: [],
        quiz: []
      });
    });

    setSyllabusCsvParsedData(parsed);
    setSyllabusCsvErrors(errors);
  };

  const submitSyllabusCsvImport = () => {
    if (syllabusCsvParsedData.length === 0) {
      alert("No valid lesson rows found to import. Please check columns and formatting.");
      return;
    }
    if (syllabusCsvErrors.length > 0) {
      const proceed = window.confirm(`There are ${syllabusCsvErrors.length} errors/warnings found in your CSV data. Would you like to proceed anyway, skipping corrupted records?`);
      if (!proceed) return;
    }

    const updatedLessons = [...lessons];
    let addedCount = 0;
    let updatedCount = 0;

    syllabusCsvParsedData.forEach((importedLesson: Lesson) => {
      const existingIdx = updatedLessons.findIndex(l => l.id === importedLesson.id);
      if (existingIdx !== -1) {
        updatedLessons[existingIdx] = {
          ...updatedLessons[existingIdx],
          titleThai: importedLesson.titleThai,
          titlePhonetic: importedLesson.titlePhonetic,
          titleEnglish: importedLesson.titleEnglish,
          titleMyanmar: importedLesson.titleMyanmar,
          descriptionEnglish: importedLesson.descriptionEnglish,
          descriptionMyanmar: importedLesson.descriptionMyanmar
        };
        updatedCount++;
      } else {
        updatedLessons.push(importedLesson);
        addedCount++;
      }
    });

    updatedLessons.sort((a, b) => a.id - b.id);
    setLessons(updatedLessons);
    localStorage.setItem('thai_lessons_curriculum', JSON.stringify(updatedLessons));
    addSystemLog('admin', `Syllabus upload: Imported ${addedCount} new lessons and updated ${updatedCount} existing lessons.`);
    alert(`Curriculum syllabus imported/updated successfully!\n- Added: ${addedCount} lesson(s)\n- Updated: ${updatedCount} lesson(s)`);

    setSyllabusCsvFile(null);
    setSyllabusCsvParsedData([]);
    setSyllabusCsvErrors([]);
    setSyllabusCsvFileName('');
    setIsSyllabusImportExpanded(false);
  };

  const handleCsvFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  };

  const processCsvFile = (file: File) => {
    setCsvFile(file);
    setCsvFileName(file.name);
    setCsvErrors([]);
    setCsvParsedData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setCsvErrors(['Empty file or unable to read file contents.']);
        return;
      }
      parseAndValidateCsv(text, csvImportType);
    };
    reader.onerror = () => {
      setCsvErrors(['Error reading file.']);
    };
    reader.readAsText(file);
  };

  const parseAndValidateCsv = (text: string, type: 'vocabulary' | 'dialogue' | 'grammar' | 'quiz' | 'lessons') => {
    const rows = parseCSV(text);
    if (rows.length < 2) {
      setCsvErrors(['Invalid CSV format. File must contain at least a header row and one data row.']);
      return;
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    const parsed: any[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const getVal = (headerName: string): string => {
        const colIdx = headers.indexOf(headerName.toLowerCase().trim());
        return colIdx !== -1 && row[colIdx] !== undefined ? row[colIdx].trim() : '';
      };

      if (type === 'vocabulary') {
        const thai = getVal('thai');
        const phonetic = getVal('phonetic');
        const english = getVal('english');
        const myanmar = getVal('myanmar');
        const partOfSpeech = getVal('partOfSpeech') || 'noun';
        const notes = getVal('notes');

        if (!thai) errors.push(`Row ${rowNum}: 'thai' column value is required.`);
        if (!english) errors.push(`Row ${rowNum}: 'english' meaning column is required.`);
        if (!myanmar) errors.push(`Row ${rowNum}: 'myanmar' translation is required.`);

        parsed.push({
          thai,
          phonetic: phonetic || thai,
          english,
          myanmar,
          partOfSpeech,
          notes: notes || undefined
        });
      } else if (type === 'dialogue') {
        const speaker = getVal('speaker') || 'A';
        const thai = getVal('thai');
        const phonetic = getVal('phonetic');
        const english = getVal('english');
        const myanmar = getVal('myanmar');
        const wordsStr = getVal('words');

        if (!thai) errors.push(`Row ${rowNum}: 'thai' transcription is required.`);
        if (!english) errors.push(`Row ${rowNum}: 'english' meaning is required.`);
        if (!myanmar) errors.push(`Row ${rowNum}: 'myanmar' translation is required.`);

        const words: WordBreakdown[] = [];
        if (wordsStr) {
          const parts = wordsStr.split(';').map(p => p.trim()).filter(Boolean);
          parts.forEach(part => {
            const fields = part.split('|').map(f => f.trim());
            if (fields.length >= 4) {
              words.push({
                thai: fields[0],
                phonetic: fields[1] || fields[0],
                english: fields[2],
                myanmar: fields[3],
                partOfSpeech: fields[4] || 'noun'
              });
            }
          });
        }

        if (words.length === 0) {
          words.push({
            thai: thai,
            phonetic: phonetic || thai,
            english: english,
            myanmar: myanmar,
            partOfSpeech: 'phrase'
          });
        }

        parsed.push({
          speaker,
          thai,
          phonetic: phonetic || thai,
          english,
          myanmar,
          words
        });
      } else if (type === 'grammar') {
        const title = getVal('title');
        const titleMyanmar = getVal('titleMyanmar') || title;
        const explanation = getVal('explanation');
        const explanationMyanmar = getVal('explanationMyanmar') || explanation;
        const examplesStr = getVal('examples');

        if (!title) errors.push(`Row ${rowNum}: Grammar 'title' column is required.`);
        if (!explanation) errors.push(`Row ${rowNum}: Grammar 'explanation' is required.`);

        const examples: any[] = [];
        if (examplesStr) {
          const parts = examplesStr.split(';').map(p => p.trim()).filter(Boolean);
          parts.forEach(part => {
            const fields = part.split('|').map(f => f.trim());
            if (fields.length >= 4) {
              examples.push({
                thai: fields[0],
                phonetic: fields[1] || fields[0],
                english: fields[2],
                myanmar: fields[3]
              });
            }
          });
        }

        parsed.push({
          title,
          titleMyanmar,
          explanation,
          explanationMyanmar,
          examples
        });
      } else if (type === 'quiz') {
        const quizType = getVal('type') || 'translate-thai-to-mm';
        const prompt = getVal('prompt');
        const promptThai = getVal('promptThai');
        const optionsStr = getVal('options');
        const correctAnswer = getVal('correctAnswer');
        const explanation = getVal('explanation');
        const explanationMyanmar = getVal('explanationMyanmar');

        if (!prompt) errors.push(`Row ${rowNum}: Quiz 'prompt' is required.`);
        if (!optionsStr) errors.push(`Row ${rowNum}: Quiz 'options' options separated by "|" are required.`);
        if (!correctAnswer) errors.push(`Row ${rowNum}: Quiz 'correctAnswer' option is required.`);

        const options = optionsStr.split('|').map(o => o.trim()).filter(Boolean);
        if (options.length < 2) {
          errors.push(`Row ${rowNum}: Options must contain at least 2 distinct options separated by "|".`);
        }
        if (options.length > 0 && !options.includes(correctAnswer)) {
          errors.push(`Row ${rowNum}: Correct answer ("${correctAnswer}") is missing from the options list (${options.join(', ')}).`);
        }

        parsed.push({
          id: `quiz-imported-${Date.now()}-${idx}`,
          type: quizType,
          prompt,
          promptThai: promptThai || undefined,
          options,
          correctAnswer,
          explanation: explanation || undefined,
          explanationMyanmar: explanationMyanmar || undefined
        });
      } else if (type === 'lessons') {
        const idVal = getVal('id');
        const titleThai = getVal('titleThai');
        const titlePhonetic = getVal('titlePhonetic');
        const titleEnglish = getVal('titleEnglish');
        const titleMyanmar = getVal('titleMyanmar');
        const descriptionEnglish = getVal('descriptionEnglish');
        const descriptionMyanmar = getVal('descriptionMyanmar');

        if (!idVal) errors.push(`Row ${rowNum}: Lesson 'id' (number) is required.`);
        if (!titleEnglish) errors.push(`Row ${rowNum}: Lesson 'titleEnglish' is required.`);

        const parsedId = Number(idVal);
        if (isNaN(parsedId)) {
          errors.push(`Row ${rowNum}: Lesson ID must be a valid number.`);
        }

        parsed.push({
          id: parsedId,
          titleThai: titleThai || "บทเรียนใหม่",
          titlePhonetic: titlePhonetic || "Bot-riian mai",
          titleEnglish,
          titleMyanmar: titleMyanmar || titleEnglish,
          descriptionEnglish: descriptionEnglish || "",
          descriptionMyanmar: descriptionMyanmar || "",
          dialogue: [],
          grammarNotes: [],
          quiz: []
        });
      }
    });

    setCsvParsedData(parsed);
    setCsvErrors(errors);
  };

  const submitCsvImport = () => {
    if (csvParsedData.length === 0) {
      alert("No valid data rows found to import. Please check columns and formatting.");
      return;
    }
    if (csvErrors.length > 0) {
      const proceed = window.confirm(`There are ${csvErrors.length} errors/warnings found in your CSV data. Would you like to proceed anyway, skipping corrupted records?`);
      if (!proceed) return;
    }

    const updatedLessons = [...lessons];

    if (csvImportType === 'lessons') {
      let addedCount = 0;
      let updatedCount = 0;

      csvParsedData.forEach((importedLesson: Lesson) => {
        const existingIdx = updatedLessons.findIndex(l => l.id === importedLesson.id);
        if (existingIdx !== -1) {
          updatedLessons[existingIdx] = {
            ...updatedLessons[existingIdx],
            titleThai: importedLesson.titleThai,
            titlePhonetic: importedLesson.titlePhonetic,
            titleEnglish: importedLesson.titleEnglish,
            titleMyanmar: importedLesson.titleMyanmar,
            descriptionEnglish: importedLesson.descriptionEnglish,
            descriptionMyanmar: importedLesson.descriptionMyanmar
          };
          updatedCount++;
        } else {
          updatedLessons.push(importedLesson);
          addedCount++;
        }
      });

      updatedLessons.sort((a, b) => a.id - b.id);
      setLessons(updatedLessons);
      addSystemLog('admin', `Imported ${addedCount} new lessons and updated ${updatedCount} lessons from CSV file.`);
      alert(`Lesson Curriculum sync successful!\n- New Lessons Added: ${addedCount}\n- Lessons Metadata Updated: ${updatedCount}`);
    } else {
      const activeLessonTarget = csvImportTargetLesson === 'all' 
        ? adminSelectedLessonId 
        : Number(csvImportTargetLesson);

      if (!activeLessonTarget) {
        alert("Please select a target Lesson in the database first.");
        return;
      }

      const lessonIdx = updatedLessons.findIndex(l => l.id === activeLessonTarget);
      if (lessonIdx === -1) {
        alert(`Target Lesson ID ${activeLessonTarget} does not exist.`);
        return;
      }

      const targetLesson = updatedLessons[lessonIdx];

      if (csvImportType === 'vocabulary') {
        const currentVocab = getCustomVocabList(activeLessonTarget) || [];
        const mergedVocab = [...currentVocab, ...csvParsedData];
        handleSaveVocabList(activeLessonTarget, mergedVocab);
        addSystemLog('admin', `Imported ${csvParsedData.length} vocabulary terms to Lesson ${activeLessonTarget} via CSV upload.`);
        alert(`Success! Imported ${csvParsedData.length} vocabulary items into Lesson ${activeLessonTarget}.`);
      } else if (csvImportType === 'dialogue') {
        const currentDialogue = targetLesson.dialogue || [];
        const updatedDialogue = [...currentDialogue, ...csvParsedData];
        handleSaveDialogue(activeLessonTarget, updatedDialogue);
        addSystemLog('admin', `Imported ${csvParsedData.length} dialogue lines to Lesson ${activeLessonTarget} via CSV upload.`);
        alert(`Success! Imported ${csvParsedData.length} sentence entries into Lesson ${activeLessonTarget}.`);
      } else if (csvImportType === 'grammar') {
        const currentNotes = targetLesson.grammarNotes || [];
        const updatedNotes = [...currentNotes, ...csvParsedData];
        handleSaveGrammarNotes(activeLessonTarget, updatedNotes);
        addSystemLog('admin', `Imported ${csvParsedData.length} grammar points to Lesson ${activeLessonTarget} via CSV upload.`);
        alert(`Success! Imported ${csvParsedData.length} grammar nodes into Lesson ${activeLessonTarget}.`);
      } else if (csvImportType === 'quiz') {
        const currentQuizzes = targetLesson.quiz || [];
        const updatedQuizzes = [...currentQuizzes, ...csvParsedData];
        handleSaveQuizzes(activeLessonTarget, updatedQuizzes);
        addSystemLog('admin', `Imported ${csvParsedData.length} interactive quizzes to Lesson ${activeLessonTarget} via CSV upload.`);
        alert(`Success! Imported ${csvParsedData.length} quiz questions into Lesson ${activeLessonTarget}.`);
      }
    }

    setCsvFile(null);
    setCsvParsedData([]);
    setCsvErrors([]);
    setCsvFileName('');
    setIsCsvImportExpanded(false);
    window.dispatchEvent(new Event('thai_vocab_updated'));
  };

  // Dismiss auto promotion modal
  const handleDismissPromo = () => {
    setHasDismissedPromo(true);
    sessionStorage.setItem('thai_has_dismissed_promo', 'true');
    setShowAuthModal(false);
  };

  // Compile all words from all lessons for the master dictionary grid
  const allMasterVocab: WordBreakdown[] = Object.values(
    lessons.reduce((acc: { [key: string]: WordBreakdown }, lesson) => {
      lesson.dialogue.forEach((line) => {
        line.words.forEach((word) => {
          if (!acc[word.thai]) {
            acc[word.thai] = word;
          }
        });
      });
      return acc;
    }, {})
  );

  const filteredVocab = allMasterVocab.filter((word) => {
    const matchesSearch = 
      word.thai.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      word.phonetic.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      word.english.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      word.myanmar.includes(vocabSearch);

    const matchesMasteredFilter = onlyShowUnmastered 
      ? !progress.masteredWords.includes(word.thai)
      : true;

    return matchesSearch && matchesMasteredFilter;
  });

  const handleToggleMasteredWord = (thaiWord: string) => {
    let updated: string[];
    if (progress.masteredWords.includes(thaiWord)) {
      updated = progress.masteredWords.filter((w) => w !== thaiWord);
    } else {
      updated = [...progress.masteredWords, thaiWord];
    }
    const newState = {
      ...progress,
      masteredWords: updated,
      totalXp: progress.totalXp + (updated.includes(thaiWord) ? 10 : -10) // +10 XP for mastering a word!
    };
    saveProgress(newState);
  };

  const handleLessonCompleted = (lessonId: number) => {
    if (!progress.completedLessons.includes(lessonId)) {
      const newState = {
        ...progress,
        completedLessons: [...progress.completedLessons, lessonId],
        totalXp: progress.totalXp + 150 // +150 XP bonus for completing entire lesson quiz!
      };
      saveProgress(newState);
    }
  };

  const handleQuizFinished = (lessonId: number, scorePercentage: number, xpGained: number) => {
    const prevScore = progress.quizHighScores[lessonId] || 0;
    const newHighScores = {
      ...progress.quizHighScores,
      [lessonId]: Math.max(prevScore, scorePercentage)
    };

    const newState = {
      ...progress,
      quizHighScores: newHighScores,
      totalXp: progress.totalXp + xpGained
    };

    saveProgress(newState);
    if (scorePercentage >= 80) {
      handleLessonCompleted(lessonId);
    }
  };

  const handleSentenceAssembled = (xpGained: number) => {
    const newState = {
      ...progress,
      totalXp: progress.totalXp + xpGained
    };
    saveProgress(newState);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Cycle shared speed index
    const nextIndex = (audioSpeedIndex + 1) % 3;
    setAudioSpeedIndex(nextIndex);

    const rates = [0.85, 0.7, 0.5];
    const rate = rates[nextIndex];

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  const getAdditionalPhrases = (chapterId: number, ruleIdx: number, mode: 'standard' | 'more' | 'formal' | 'casual'): { thai: string; phonetic: string; english: string; myanmar: string }[] => {
    // Custom premium data for Chapter 10 Tenses, which is the user's specific highlighted scenario
    if (chapterId === 10) {
      if (ruleIdx === 0) { // Tense Inferred from Context
        if (mode === 'more') {
          return [
            { thai: "พรุ่งนี้ตอนเช้าฉันจะไปตลาด", phonetic: "phrûŋ-níi tɔɔn cháaw chǎn ca paj tà-làat", english: "Tomorrow morning I will go to the market.", myanmar: "မနက်ဖြန်မနက် ကျွန်မ ဈေးသွားပါလိမ့်မယ်။" },
            { thai: "เมื่อวานนี้พวกเขาไม่ได้เรียน", phonetic: "mʉ̂a-waan-níi phûak-khǎw mâj dâaj rian", english: "Yesterday they did not study.", myanmar: "မနေ့က သူတို့ စาမသင်ခဲ့ကြပါဘူး။" }
          ];
        }
        if (mode === 'formal') {
          return [
            { thai: "คู่สัญญาจะส่งรายงานในวันพรุ่งนี้ครับ", phonetic: "khûu-sǎn-jaa ca sòŋ raaj-ŋaan naj wan phrûŋ-níi khráp", english: "The contracting party will deliver the report tomorrow.", myanmar: "စာချုပ်ချုပ်ဆိုသူဘက်မှ အစီရင်ခံစာကို မနက်ဖြันတွင် တင်ပြပါလိမ့်မည်ခင်ဗျာ။" },
            { thai: "เมื่อวานนี้กระผมได้พบผู้กำกับแล้วครับ", phonetic: "mʉ̂a-waan-níi kra-phǒm dâaj phóp phûu-kam-kàp lɛ́ɛw khráp", english: "Yesterday I already met the superintendent.", myanmar: "မနေ့က ကျွန်တော် ရဲမှူးကြီးနှင့် တွေ့ဆုံပြီးပါပြီခင်ဗျာ။" }
          ];
        }
        if (mode === 'casual') {
          return [
            { thai: "เมื่อวานไปกินส้มตำกันสะใจมากเลย", phonetic: "mʉ̂a-waan paj kin sôm-tam kan sà-caj mâak ləəj", english: "Yesterday we went and had papaya salad together, it was super satisfying!", myanmar: "မနေ့က သွားစားတဲ့ သင်္ဘောသီးထောင်းကတော့ တကယ့်ကို အကြိုက်တွေ့စရာပဲဟ။" },
            { thai: "พรุ่งนี้เดี๋ยวเจอกันหน้าสถานีนะ", phonetic: "phrûŋ-níi dǐaw cəə kan nâa sà-thǎa-nii ná", english: "I will see you tomorrow in front of the station, alright?", myanmar: "မနက်ဖြန် ဘူတာရုံရှေ့မှာ ဆုံကြမယ်နော်။" }
          ];
        }
      }

      if (ruleIdx === 1) { // Present Continuous with กำลัง
        if (mode === 'more') {
          return [
            { thai: "พวกเรากำลังสนทนาภาษาไทยบทที่สิบ", phonetic: "phûak-raw kam-laŋ sǒn-tha-naa phaašaa thaj bòt thîi sìp", english: "We are currently conversing in Lesson 10 Thai.", myanmar: "ကျွန်တော်တို့ လက်ရှိ ထိုင်းဘာသာစကား သင်ခန်းစာ ၁၀ ကို အပြန်အလှန်ပြောဆိုနေကြသည်။" },
            { thai: "นักเรียนกำลังเขียนคำศัพท์", phonetic: "nák-rian kam-laŋ khǐan kham-sàp", english: "The student is writing down vocabulary.", myanmar: "ကျောင်းသားသည် ဝေါဟာရစကားလုံးများကို လိုက်လံရေးမှတ်နေသည်။" }
          ];
        }
        if (mode === 'formal') {
          return [
            { thai: "ท่านประธานกำลังพิจารณารายละเอียดงานอยู่ครับ", phonetic: "thâan pra-thaan kam-laŋ phí-caa-rá-naa raaj-la-ìat ŋaan jùu khráp", english: "The chairman is currently evaluating the work details.", myanmar: "ဥက္ကဋ္ဌမင်းသည် လက်ရှိ လုပ်ငန်းအသေးစိတ်အချက်အလက်များကို သုံးသပ်နေပါသည်ခင်ဗျာ။" }
          ];
        }
        if (mode === 'casual') {
          return [
            { thai: "กำลังยุ่งอยู่ เดี๋ยวโทรกลับนะ", phonetic: "kam-laŋ jûŋ jùu dǐaw thoo klàp ná", english: "I'm busy right now, calling you back later!", myanmar: "အခု အလုပ်ရှုပ်နေလို့၊ ခဏနေမှ ဖုန်းပြန်ခေါ်မယ်နော်။" }
          ];
        }
      }

      if (ruleIdx === 2) { // Perfective aspect with แล้ว
        if (mode === 'more') {
          return [
            { thai: "พัสดุเดินทางมาถึงแล้ว", phonetic: "phát-sà-dù dthəən-thaary maa thʉ̌ŋ lɛ́ɛw", english: "The parcel has arrived already.", myanmar: "ချောထုပ် ရောက်ရှိလာခဲ့ပြီးပါပြီ။" },
            { thai: "ผู้ใหญ่บ้านพูดจบแล้ว", phonetic: "phûu-jàj-bâan phûut còp lɛ́ɛw", english: "The village chief has finished speaking already.", myanmar: "သူကြီး စကားပြောလို့ ပြီးသွားပြီ။" }
          ];
        }
        if (mode === 'formal') {
          return [
            { thai: "เอกสารฉบับนี้ได้รับอนุมัติเรียบร้อยแล้วครับ", phonetic: "èek-ka-sǎan chà-bàp níi dâaj-ráp a-nú-mát rîap-rɔ́ɔj lɛ́ɛw khráp", english: "This document has already been fully approved.", myanmar: "ဤစာရွက်စာတမ်းအား အတည်ပြုချက် ရရှိပြီးပါပြီခင်ဗျာ။" }
          ];
        }
        if (mode === 'casual') {
          return [
            { thai: "กินอิ่มแปล้แล้ว", phonetic: "kin ìm plɛ́ɛ lɛ́ɛw", english: "Extremely full already!", myanmar: "ဗိုက်ကောင်းကောင်းကြီး တင်းသွားပြီဟေ့။" }
          ];
        }
      }
    }

    // Generic realistic expansions for other chapters based on Chapter IDs
    return [
      {
        thai: "เราเรียนเรื่องนี้เสร็จแล้ว",
        phonetic: "raw rian rʉ̂aŋ níi sèt lɛ́ɛw",
        english: `[${mode.toUpperCase()}] We have finished learning this topic.`,
        myanmar: `[${mode.toUpperCase()}] ကျွန်တော်တို့ ဤသဒ္ဒါခေါင်းစဉ်ကို လေ့လာပြီးပါပြီ။`
      },
      {
        thai: "โปรดฟังครูอีกครั้งหนึ่ง",
        phonetic: "pròot faŋ khruu ìik khráŋ nʉ̀ŋ",
        english: "Please listen to the teacher once more.",
        myanmar: "ဆရာ့အသံကို နောက်တစ်ကြိမ် ဂရုတစိုက်နားထောင်ပေးပါ။"
      }
    ];
  };

  const getSubPageContent = (
    type: 'handbook' | 'lesson',
    parentId: number,
    topicIdx: number,
    pageIdx: number,
    original: { title: string; titleMyanmar: string; explanation: string; explanationMyanmar: string; examples: any[] }
  ): {
    title: string;
    titleMyanmar: string;
    explanation: string;
    explanationMyanmar: string;
    examples: { thai: string; phonetic: string; english: string; myanmar: string }[];
  } => {
    // Page 1 is always the original content
    if (pageIdx === 0) {
      return {
        title: original.title,
        titleMyanmar: original.titleMyanmar,
        explanation: original.explanation,
        explanationMyanmar: original.explanationMyanmar,
        examples: original.examples || []
      };
    }

    // Normalized parent ID based on category type
    const queryId = parentId;

    if (pageIdx === 1) {
      if (queryId === 10) { // Chapter 10 or Lesson 10: Tenses
        if (topicIdx === 2) { // Perfective aspect with แล้ว
          return {
            title: "Perfective Aspect: The Complete State of แล้ว",
            titleMyanmar: "'แล้ว' (lɛ́ɛw) ဖြင့် ပြီးမြောက်သွားသောအခြေအနေမှန်ကို ပြသခြင်း",
            explanation: "The particle 'แล้ว' (lɛ́ɛw) signifies that an action or transition has finished. When talking about states (like being full or grown up), 'lɛ́ɛw' means the state has successfully changed.",
            explanationMyanmar: "'แล้ว' သည် လုပ်ဆောင်ချက်တစ်ခု ပြီးဆုံးအကောင်အထည်ဖော်ပြီးကြောင်း သို့မဟုတ် ဗိုက်ပြည့်ခြင်း၊ ကြီးပြင်းခြင်း စသည့် အခြေအနေတစ်ခု ပြောင်းလဲပြီးမြောက်ကြောင်း ပြသသည်။",
            examples: [
              { thai: "ผมกินอาหารเย็นเสร็จเรียบร้อยแล้ว", phonetic: "phǒm kin aa-hǎan jen sèt rîap-rɔ́ɔj lɛ́ɛw", english: "I have already finished having dinner completely.", myanmar: "ကျွန်တော် ညစာ စားသုံးလို့ လုံးဝပြီးသွားပါပြီ။" },
              { thai: "ลูกสาวของเขาโตเป็นผู้ใหญ่แล้ว", phonetic: "lûuk-sǎaw khɔ̌ɔŋ khǎw too bpen phûu-jàj lɛ́ɛw", english: "His daughter has already grown up into an adult.", myanmar: "သူ့ရဲ့ သမီးဟာ လူကြီးတစ်ယောက်အဖြစ် ကြီးပြင်းသွားခဲ့ပါပြီ။" }
            ]
          };
        }
      }

      // Default fallback Page 2
      return {
        title: `${original.title}: Deep Context Analysis`,
        titleMyanmar: `${original.titleMyanmar} • အတွင်းကျကျ စနစ်တကျ လေ့လာခြင်း`,
        explanation: "Core Thai structures emphasize syntactic purity. To master this topic fully, study how polite final particles and context clues adjust the tone from formal administration to everyday street interactions.",
        explanationMyanmar: "ဤသဒ္ဒါအကြောင်းရင်းကို နားလည်ရန် ယဉ်ကျေးသော နောက်ဆက်စကားလုံးများနှင့် ဝါကျ၏ အသုံးအနှုန်း ကွာခြားမှုများကို လိုက်လျောညီထွေစွာ အသုံးချတတ်ရန် အထူးလိုအပ်သည်။",
        examples: [
          { thai: "พวกเราเข้าใจบทเรียนนี้เป็นอย่างดี", phonetic: "phûak-raw khâw-caaj bòt-rian níi bpen jàaŋ dii", english: "We understand this lesson very well.", myanmar: "ကျွန်တော်တို့ ဤသင်ခန်းစာကို ကောင်းမွန်စွာ နားလည်သဘောပေါက်ပါသည်။" },
          { thai: "คุณมีคำถามเพิ่มเติมไหมครับ", phonetic: "khun mii kham-thǎam phə̂əm-toom mǎj khráp", english: "Do you have any additional questions?", myanmar: "လူကြီးมင်းအနေဖြင့် နောက်ထပ် မေးမြန်းလိုသည့် မေးခွန်းများ ရှိပါသလားခင်ဗျา။" }
        ]
      };
    }

    if (pageIdx === 2) {
      // PAGE 3: Conversational Scenarios and Dialogues
      if (queryId === 10) { // Chapter 10 or Lesson 10: Tenses
        if (topicIdx === 0) { // Tense Inferred from Context
          return {
            title: "Tense Inferred from Context: Real Conversation Scenario",
            titleMyanmar: "အချိန်ကာလညွှန်းချက်များဖြင့် လက်တွေ့စကားပြောဆိုမှုပြခန်း",
            explanation: "Study this real-world exchange where time flows smoothly. Notice how the temporal context carries over between speakers without verbs shifting forms.",
            explanationMyanmar: "ကြิယာများ ပုံစံပြောင်းလဲခြင်းမရှိဘဲ စကားပြောသူနှစ်ဦးအကြား အတိတ်နှင့် အနာဂတ်ကာလများ ပြောင်းလဲပုံကို ဤလက်တွေ့စကားပြောခန်းတွင် လေ့လာပါ။",
            examples: [
              { thai: "เมื่อวานนี้คุณไปเที่ยวที่ไหนมาครับ", phonetic: "mʉ̂a-waan-níi khun paj thîaw thîi-nǎj maa khráp", english: "Where did you go travel yesterday?", myanmar: "မနေ့က လူကြီးมင်း ဘယ်ကို လည်ပတ်သွားခဲ့ပါသလဲခင်ဗျา။" },
              { thai: "เมื่อวานไปเที่ยวทะเลกับเพื่อนสนุกมากค่ะ", phonetic: "mʉ̂a-waan paj thîaw thá-lee kàp phʉ̂an sà-nùk mâak khâ", english: "Yesterday I went to the beach with friends, it was so fun!", myanmar: "မနေ့က သူငယ်ချင်းတွေနဲ့အတူ ပင်လယ်ကမ်းခြေကို သွားလည်ခဲ့တာ အရမ်းပျော်စရာကောင်းခဲ့ပါတယ်ရှင့်။" }
            ]
          };
        }
        if (topicIdx === 1) { // Progressives with กำลัง
          return {
            title: "Present Continuous: Conversation Practice Drill",
            titleMyanmar: "လက်ရှိပြုလုပ်ဆဲအခြေအနေများအတွက် စကားပြောလေ့ကျင့်ခန်း",
            explanation: "Practice using 'kamlang... jùu' in common questions and instant responses to show real-time dynamic events.",
            explanationMyanmar: "'กำลัง... อยู่' ကို အသုံးပြုပြီး လက်ရှိဖြစ်ပျက်နေသည့် အခြေအနေများကို အပြန်အလှัน စုံစမ်းဖြေကြားရန် လေ့ကျင့်ခန်း ဖြစ်သည်။",
            examples: [
              { thai: "แม่กำลังทำกับข้าวอยู่ในครัวหรือเปล่า", phonetic: "mɛ̂ɛ kam-laŋ tham kàp-khâaw jùu naj khrua rʉ̌ʉ bplàaw", english: "Is Mom currently cooking in the kitchen?", myanmar: "အမေက အခု မီးဖိုချောင်ထဲမှာ ဟင်းချက်နေဆဲဖြစ်ပါသလားဟင်။" },
              { thai: "ใช่ค่ะ คุณแม่กำลังเตรียมต้มยำกุ้งอยู่", phonetic: "châj khâ khun-mɛ̂ɛ kam-laŋ triam tôm-jam-kûŋ jùu", english: "Yes, she is currently preparing Tom Yum shrimp soup.", myanmar: "ဟုတ်ပါတယ်ရှင့်၊ အမေက တုံယမ်းပုစွန်ဟင်းချက်ဖို့ ပြင်ဆင်နေဆဲဖြစ်ပါတယ်ရှင့်။" }
            ]
          };
        }
        if (topicIdx === 2) { // Perfective aspect with แล้ว
          return {
            title: "Perfective Aspect: Completed Action Dialogues",
            titleMyanmar: "ပြီးမြောက်သွားသောအခြေအနေများအတွက် ဆွေးနွေးစကားပြောခန်း",
            explanation: "Observe how 'lɛ́ɛw' triggers transition states, showing that action is finished fully.",
            explanationMyanmar: "'แล้ว' (ပြီးပြီ) ကို သုံး၍ လုပ်ငန်းဆောင်တာများ အောင်မြင်စွာ ပြီးဆုံးကြောင်း ပြောကြားပုံကို လေ့လာပါ။",
            examples: [
              { thai: "คุณเขียนรายงานส่งอาจารย์หรือยังครับ", phonetic: "khun khǐan raaj-ŋaan sòŋ aa-caan rʉ̌ʉ jaŋ khráp", english: "Have you written and submitted the report yet?", myanmar: "လူကြီးမင်း ဆရာ့ထံ အစီရင်ခံစာ ရေးသားတင်ပြပြီးပြီလားခင်ဗျา။" },
              { thai: "ฉันเขียนเสร็จเรียบร้อยแล้วค่ะ", phonetic: "chǎn khǐan sèt rîap-rɔ́ɔj lɛ́ɛw khâ", english: "I have already finished writing it completely.", myanmar: "ကျွန်မ အားလုံး ရေးသားပြီးမြောက်သွားခဲ့ပါပြီရှင့်။" }
            ]
          };
        }
      }

      if (queryId === 1) { // Nouns
        return {
          title: "Noun Suffix Practice: Action and Quality State",
          titleMyanmar: "နာမ်သစ်များတည်ဆောက်မှုနှင့် စကားပြောလေ့လာခန်း",
          explanation: "Compare nominalization in physical actions (kaan-) and quality states (khwaam-). Practicing these lets you converse on abstract, deeper topics with ease.",
          explanationMyanmar: "ရုပ်ဝတ္ถုပြုလုပ်မှု (การ) နှင့် สိတ်ကူးစိတ်သန်းအခြေအနေ (ความ) တို့ကို နှိုင်းယှဉ်၍ ဝေါဟာรကြွယ်ဝစွာ ပြောဆိုပုံကို လေ့လာပါ။",
          examples: [
            { thai: "การเรียนภาษาคือความสุขของผม", phonetic: "kaan-rian phaa-šaa khʉʉ khwaam-sùk khɔ̌ɔŋ phǒm", english: "Learning languages is my happiness.", myanmar: "ဘာသာစကား သင်ယူခြင်းဟာ ကျွန်တော့်ရဲ့ ပျော်ရွှင်မှုပဲ ဖြစ်ပါတယ်။" },
            { thai: "ความรักคือความตั้งใจจริงครับ", phonetic: "khwaam-rák khʉʉ khwaam-tâŋ-caj ciŋ khráp", english: "Love is real intent and dedication.", myanmar: "ချစ်ခြင်းမေต္တာဆိုတာ အစစ်အမှန် စိတ်ဆန္ဒတစ်ခုပဲ ဖြစ်ပါတယ်ခင်ဗျา။" }
          ]
        };
      }

      // Default fallback Page 3
      return {
        title: `${original.title}: Conversational Scenarios`,
        titleMyanmar: `${original.titleMyanmar} • အပြန်အလှัน စကားပြောခန်း`,
        explanation: "Engage with this final page dialogue containing high-contrast phrases that fully reinforce the grammatical lessons from Page 1 and Page 2.",
        explanationMyanmar: "ဤသင်ခန်းစာ၏ သဒ္ဒါအချက်အလက်အားလုံးကို စုစည်းပြီး အလွတ်ပြောဆိုနိုင်ရန် စကားပြောပုံစံ သရုပ်ပြကွက် ဖြစ်သည်။",
        examples: [
          { thai: "เข้าใจแล้วครับ มีประโยชน์มากเลย", phonetic: "khâw-caaj lɛ́ɛw khráp mii pra-jòot mâak ləəj", english: "I understand now! This is extremely useful.", myanmar: "နားလည်သဘောပေါက်သွားပါပြီခင်ဗျา၊ အရမ်းပဲ အကျိုးရှိပါတယ်။" },
          { thai: "ขอให้สนุกกับการเรียนรู้นะคะ", phonetic: "khɔ̌ɔ hâj sà-nùk kàp kaan-rian-rúu ná khâ", english: "We hope you enjoy your learning journey!", myanmar: "လေ့လာသင်ယူခြင်းလမ်းခရီးတွင် ပျော်ရွှင်ပါစေရှင့်။" }
        ]
      };
    }

    return {
      title: original.title,
      titleMyanmar: original.titleMyanmar,
      explanation: original.explanation,
      explanationMyanmar: original.explanationMyanmar,
      examples: original.examples || []
    };
  };

  const handleResetAllProgress = () => {
    setProgress(INITIAL_PROGRESS);
    localStorage.removeItem('thai_mm_progress_v1');
  };

  const handleTabClick = (tab: 'lessons' | 'notebook' | 'courses' | 'profile' | 'admin') => {
    if (tab === 'lessons') {
      if (dashboardTab === 'lessons' && activeLessonId !== null) {
        setActiveLessonId(null);
      } else {
        setDashboardTab('lessons');
      }
    } else if (tab === 'notebook') {
      setDashboardTab('notebook');
      setActiveLessonId(null);
    } else if (tab === 'profile') {
      setDashboardTab('profile');
      setActiveLessonId(null);
    } else if (tab === 'admin') {
      setDashboardTab('admin');
      setActiveLessonId(null);
    } else if (tab === 'courses') {
      setActiveLessonId(null);
      if (!['orientation', 'handbook', 'alphabet'].includes(dashboardTab)) {
        setDashboardTab('orientation');
      }
    }
  };

  const isLessonsActive = dashboardTab === 'lessons';
  const isNotebookActive = dashboardTab === 'notebook';
  const isProfileActive = dashboardTab === 'profile';
  const isAdminActive = dashboardTab === 'admin';
  const isCoursesActive = ['orientation', 'handbook', 'alphabet'].includes(dashboardTab);

  const isCourseUnlocked = (courseId: string) => {
    if (currentUser === 'admin' || (currentUser && registeredUsers.find(u => u.username === currentUser)?.role === 'admin')) {
      return true;
    }
    if (courseId === 'course-basic') {
      return true;
    }
    return orders.some(o => 
      o.username.toLowerCase() === (currentUser || "").toLowerCase() && 
      o.status === 'completed' &&
      (o.id === courseId || o.itemName.toLowerCase().includes(courseId.toLowerCase().replace('course-', '')))
    );
  };

  const isStoreItemUnlocked = (itemId: string, itemPrice: number) => {
    if (itemPrice === 0) return true;
    if (currentUser === 'admin' || (currentUser && registeredUsers.find(u => u.username === currentUser)?.role === 'admin')) {
      return true;
    }
    return orders.some(o => 
      o.username.toLowerCase() === (currentUser || "").toLowerCase() && 
      o.status === 'completed' &&
      (o.id.toLowerCase() === itemId.toLowerCase() || o.itemName.toLowerCase().includes(itemId.trim().toLowerCase()))
    );
  };

  const activeCourse = courses.find(c => c.id === selectedCourseTab);
  const courseLessons = activeCourse 
    ? lessons.filter(l => (l.courseId || 'course-basic') === activeCourse.id)
    : lessons; // Fallback to all lessons if resources tab is picked

  const lessonsPerPage = 6;
  const totalLessons = courseLessons.length;
  const totalPages = Math.max(1, Math.ceil(totalLessons / lessonsPerPage));
  const paginatedLessons = courseLessons.slice(
    (currentPage - 1) * lessonsPerPage,
    currentPage * lessonsPerPage
  );

  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  // Use the course-filtered lessons for calculating prev/next lessons so that you stay within the selected course!
  const activeLessonIndex = activeLesson ? courseLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const prevLesson = activeLessonIndex > 0 ? courseLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < courseLessons.length - 1 ? courseLessons[activeLessonIndex + 1] : null;

  return (
    <div className="h-screen h-[100dvh] bg-brand-light text-brand-dark flex flex-col font-sans overflow-hidden">
      
      {/* Top Header Navigation bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shrink-0 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-16 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Brand Logo & Title + Mobile Actions Row */}
            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 bg-slate-950 border border-slate-800 text-white rounded-2xl flex items-center justify-center font-sans font-black text-xs shrink-0 select-none shadow-md relative overflow-hidden group">
                  {brandLogoImg ? (
                    <img 
                      src={brandLogoImg} 
                      alt={brandName} 
                      className="w-full h-full object-cover relative z-10" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span className="relative z-10 font-sans font-extrabold bg-gradient-to-tr from-cyan-400 via-brand-purple to-pink-300 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform">{brandLogoText}</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-purple" />
                </div>
                <div className="min-w-0 text-left">
                  <h1 className="text-[12.5px] sm:text-[14px] font-sans font-black text-slate-800 tracking-tight leading-none uppercase select-none">
                    {brandName}
                  </h1>
                  <p className="text-[8.5px] sm:text-[9.5px] text-brand-purple/90 font-sans font-bold tracking-wider uppercase mt-1 truncate">
                    <span className="font-semibold text-slate-500">Myanmar Repat •</span> ထိုင်း-မြန်မာ အပြန်အလှန်လေ့လာရေး
                  </p>
                </div>
              </div>

              {/* Mobile Right Authenticated controls / Sign In (hidden on lg and above) */}
              <div className="flex lg:hidden items-center gap-2">
                {isLoggedIn ? (
                  <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 p-1.5 pl-3 rounded-2xl shadow-3xs">
                    <div className="flex flex-col text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {isAdmin ? (
                          <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 shrink-0 animate-pulse" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                        )}
                        <span className="text-[10px] font-sans font-black text-slate-800 truncate max-w-[80px] uppercase tracking-tight">
                          {currentUser}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-brand-purple font-extrabold -mt-0.5 uppercase">
                        {isAdmin ? 'ADMIN' : `${progress.totalXp} XP`}
                      </span>
                    </div>
                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="h-8 px-2.5 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-xl border border-slate-300 transition-colors cursor-pointer text-slate-500 text-[9px] font-sans font-black uppercase leading-none min-h-[32px] flex items-center justify-center shrink-0 shadow-3xs"
                      title="Sign Out • အကောင့်ထွက်မည်"
                    >
                      Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthTab('user');
                      setShowAuthModal(true);
                    }}
                    className="h-9 px-3.5 bg-brand-purple hover:bg-brand-purple/95 text-white rounded-xl border-b-2 border-brand-purple-shadow flex items-center gap-1.5 font-sans font-black text-[9.5px] transition-transform active:translate-y-0.5 cursor-pointer uppercase tracking-wider select-none shrink-0 shadow-xs min-h-[36px]"
                  >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Middle: Integrated 4 Course Selection Tabs (Combined with Header Group) */}
            <div className="relative w-full lg:w-auto overflow-hidden shrink-0">
              <div className="flex items-center justify-start lg:justify-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-205 select-none overflow-x-auto scrollbar-none gap-2 w-full lg:w-auto max-w-full flex-nowrap shrink-0 pr-1.5">
                {courses.map((course) => {
                  const isSelected = selectedCourseTab === course.id && dashboardTab === 'lessons';
                  let icon = "⭐️";
                  if (course.id === 'course-basic') icon = "⭐️";
                  else if (course.id === 'course-business') icon = "💎";
                  else if (course.id === 'course-workspace') icon = "💼";

                  const displayName = course.id === 'course-basic' ? "Basic Course" :
                                      course.id === 'course-business' ? "Advanced" :
                                      course.id === 'course-workspace' ? "Workplace" :
                                      course.name;

                  return (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseTab(course.id);
                        setDashboardTab('lessons');
                      }}
                      className={`px-6 sm:px-5 py-2.5 sm:py-2.5 rounded-xl font-sans font-black text-[11px] sm:text-[11.5px] transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[40px] sm:min-h-[38px] ${
                        isSelected
                          ? 'bg-gradient-to-r from-brand-purple to-[#7a42c4] text-white shadow-xs border-b-2 border-brand-purple-shadow'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title={course.name}
                    >
                      <span className="text-[11px] sm:text-[11.5px] leading-none">{icon}</span>
                      <span>{displayName}</span>
                      {course.id === 'course-business' && (
                        <span className="lg:hidden font-sans font-extrabold text-[12px] opacity-90">&gt;</span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setSelectedCourseTab('resources');
                    setDashboardTab('lessons');
                  }}
                  className={`px-6 sm:px-5 py-2.5 sm:py-2.5 rounded-xl font-sans font-black text-[11px] sm:text-[11.5px] transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[40px] sm:min-h-[38px] ${
                    selectedCourseTab === 'resources' && dashboardTab === 'lessons'
                      ? 'bg-gradient-to-r from-brand-purple to-[#7a42c4] text-white shadow-xs border-b-2 border-brand-purple-shadow'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/70'
                  }`}
                  title="Syllabus Resources & Document Material PDFs"
                >
                  <span className="text-[11px] sm:text-[11.5px] leading-none">📚</span>
                  <span>Resources</span>
                </button>
              </div>
            </div>

            {/* Right Group: User Profile Controls for Desktop */}
            <div className="hidden lg:flex items-center gap-3 shrink-0 justify-end">

              {/* Authentication Controls */}
              {isLoggedIn ? (
                <div className="flex items-center gap-3.5 bg-slate-50 hover:bg-slate-100/40 border border-slate-200 p-1 pl-3.5 rounded-2xl transition-colors">
                  <div className="flex flex-col text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {isAdmin ? (
                        <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 shrink-0" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                      )}
                      <span className="text-[10.5px] font-sans font-black text-slate-800 uppercase tracking-tight">
                        {currentUser}
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-mono text-brand-purple font-black uppercase tracking-wider -mt-0.5 leading-none">
                      {isAdmin ? 'ADMINISTRATOR' : `${progress.totalXp} XP • LEVEL ${Math.floor(progress.totalXp / 1000) + 1}`}
                    </span>
                  </div>
                  
                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="p-1 px-3 py-2 bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer text-slate-500 flex items-center gap-1.5 shadow-3xs"
                    title="Sign Out • အကောင့်ထွက်မည်"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span className="font-sans font-black text-[9px] leading-none uppercase tracking-wider">
                      Out
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab('user');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-brand-purple to-[#7a42c4] hover:brightness-105 text-white rounded-xl border-b-4 border-brand-purple-shadow flex items-center gap-1.5 font-sans font-black text-[10px] sm:text-xs transition-transform active:translate-y-0.5 cursor-pointer uppercase tracking-wider select-none shrink-0 shadow-xs"
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  Sign In • ဝင်ရောက်ရန်
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-[88px] sm:pb-32">
        
        {/* If no lesson is currently active: Display main student Dashboard */}
        {!activeLessonId ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Courses Segmented Top Sub-Selector - Only visible under Courses Bottom Tab */}
            {['orientation', 'handbook', 'alphabet'].includes(dashboardTab) && (
              <div className="grid grid-cols-3 gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-gray-100 select-none max-w-2xl mx-auto shadow-xs">
                <button
                  onClick={() => setDashboardTab('orientation')}
                  className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                    dashboardTab === 'orientation'
                      ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                      : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                  }`}
                >
                  🧭 Orientation<span className="hidden md:inline"> • လမ်းညွှန်ချက်</span>
                </button>
                <button
                  onClick={() => {
                    setDashboardTab('handbook');
                    setMobileChapterDetailActive(false);
                  }}
                  className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                    dashboardTab === 'handbook'
                      ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                      : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                  }`}
                >
                  📖 Grammar<span className="hidden md:inline"> Handbook • သဒ္ဒါလက်စွဲ</span><span className="inline md:hidden"> Guide</span>
                </button>
                <button
                  onClick={() => setDashboardTab('alphabet')}
                  className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                    dashboardTab === 'alphabet'
                      ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                      : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                  }`}
                >
                  🔠 Alphabet<span className="hidden md:inline"> Guide • အက္ခရာများ</span><span className="inline md:hidden"> Guide</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT: 1. Lessons pathways */}
            {dashboardTab === 'lessons' && (
              <div className="max-w-4xl mx-auto space-y-6 min-h-[500px]">

                {selectedCourseTab !== 'resources' ? (() => {
                  const activeCourse = courses.find(c => c.id === selectedCourseTab);
                  if (!activeCourse) return <p className="text-center font-sans font-bold text-xs text-brand-muted py-10">Unknown Course selection.</p>;

                  const unlocked = isCourseUnlocked(activeCourse.id);

                  if (unlocked) {
                    const courseResources = storeItems.filter(item => item.courseId === activeCourse.id);
                    const hasDirectResources = activeCourse.resources && activeCourse.resources.length > 0;
                    const hasStoreResources = courseResources.length > 0;
                    const hasAnyResources = hasDirectResources || hasStoreResources;
                    const activeSubTab = (courseSubTab === 'resources' && !hasAnyResources) ? 'lessons' : courseSubTab;

                    return (
                      <>
                        {/* Course Tab Navigation - Display only if eBook or PDF resources exist */}
                        {hasAnyResources && (
                          <div className="bg-white p-2 rounded-2xl border-2 border-gray-100 flex items-center gap-2 select-none shadow-sm mb-6">
                            <button
                              type="button"
                              onClick={() => setCourseSubTab('lessons')}
                              className={`flex-1 py-3 px-4 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                activeSubTab === 'lessons'
                                  ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow shadow-sm'
                                  : 'text-brand-muted hover:text-brand-dark hover:bg-slate-50'
                              }`}
                            >
                              <BookOpen className="w-4 h-4" />
                              Study Syllabus Lessons (သင်ခန်းစာများ)
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => setCourseSubTab('resources')}
                              className={`flex-1 py-3 px-4 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                activeSubTab === 'resources'
                                  ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow shadow-sm'
                                  : 'text-brand-muted hover:text-brand-dark hover:bg-slate-50'
                              }`}
                            >
                              <FileText className={`w-4 h-4 ${activeSubTab === 'resources' ? 'text-white' : 'text-brand-purple'}`} />
                              Course eBooks & PDFs ({courseResources.length + (activeCourse.resources?.length || 0)})
                            </button>
                          </div>
                        )}

                        {activeSubTab === 'lessons' ? (
                          <div className="space-y-6 animate-fade-in text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-gray-100">
                              <div>
                                <span className="text-[10px] text-brand-purple font-sans font-black uppercase tracking-wider block">Course: {activeCourse.name}</span>
                                <h3 className="font-sans font-black text-brand-dark text-base mb-0.5 uppercase tracking-tight mt-0.5">
                                  Syllabus Lessons • သင်ခန်းစာများ
                                </h3>
                                <p className="text-xs text-brand-muted font-sans font-semibold">
                                  Lessons {(currentPage - 1) * lessonsPerPage + 1} to {Math.min(currentPage * lessonsPerPage, totalLessons)} of {totalLessons}
                                </p>
                              </div>

                              {/* Compact Pagination Top Control */}
                              {totalPages > 1 && (
                                <div className="flex items-center gap-1.5 self-center sm:self-auto select-none border-none bg-transparent p-0">
                                  <button
                                    onClick={() => {
                                      setCurrentPage((p) => Math.max(1, p - 1));
                                    }}
                                    disabled={currentPage === 1}
                                    className="w-7 h-7 text-brand-purple hover:text-brand-dark disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                    title="Previous page"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>

                                  <div className="text-[11px] font-sans font-black tracking-wider text-brand-purple/90 uppercase whitespace-nowrap px-1">
                                    {currentPage} / {totalPages}
                                  </div>

                                  <button
                                    onClick={() => {
                                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="w-7 h-7 text-brand-purple hover:text-brand-dark disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                    title="Next page"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="lessons-catalog">
                              {paginatedLessons.map((lesson) => {
                                const isCompleted = progress.completedLessons.includes(lesson.id);
                                const score = progress.quizHighScores[lesson.id] || 0;

                                return (
                                  <motion.div
                                    key={lesson.id}
                                    className="duo-card p-6 bg-white flex flex-col justify-between hover:shadow-md transition-all duration-200"
                                    whileHover={{ y: -2 }}
                                  >
                                    <div>
                                      <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-sans text-white bg-brand-purple px-2.5 py-1 rounded-full border-b-2 border-brand-purple-shadow font-extrabold select-none">
                                          LESSON {lesson.id}
                                        </span>
                                        {isCompleted && (
                                          <span className="flex items-center gap-1 text-[10px] text-white bg-brand-green px-2.5 py-1 rounded-full font-black font-sans border-b-2 border-brand-green-shadow">
                                            Complete • အောင်မြင်သည်
                                          </span>
                                        )}
                                      </div>

                                      <h4 className="text-sm font-sans font-black text-[#3c3c3c] mt-4 leading-tight">
                                        {lesson.titleEnglish}
                                      </h4>
                                      <p className="text-xs font-sans text-brand-green font-extrabold italic mt-1" style={{ wordBreak: 'break-word' }}>
                                        {lesson.titlePhonetic} = {getMyanmarPhonetic(lesson.titlePhonetic)} ({lesson.titleThai})
                                      </p>

                                      <p className="text-[11px] text-brand-muted font-sans mt-3 line-clamp-2 leading-relaxed font-bold">
                                        {lesson.descriptionMyanmar}
                                      </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                                      <span className="text-[10px] font-sans text-brand-muted font-extrabold tracking-wider uppercase">
                                        SCORE: {score}%
                                      </span>
                                      <button
                                        onClick={() => {
                                          setActiveLessonId(lesson.id);
                                          setActiveTab('vocabulary');
                                          setCurrentGrammarPageIndex(0);
                                        }}
                                        className="duo-btn duo-btn-purple text-xs px-4 py-2.5 flex items-center gap-1.5 font-bold"
                                      >
                                        Study Lesson • လေ့လာမည်
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Duolingo Modern Pagination Panel */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 bg-white p-4 rounded-2xl border-2 border-gray-100/80">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentPage((p) => Math.max(1, p - 1));
                                    document.getElementById('lessons-catalog')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  disabled={currentPage === 1}
                                  className="duo-btn bg-white hover:bg-gray-50 border-2 border-gray-200 text-brand-dark disabled:opacity-40 disabled:pointer-events-none text-xs px-3.5 py-2 flex items-center gap-1 font-bold"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  Prev
                                </button>
                                
                                <div className="flex items-center gap-1.5 overflow-x-auto px-2 max-w-[200px] sm:max-w-none">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                      type="button"
                                      key={page}
                                      onClick={() => {
                                        setCurrentPage(page);
                                        document.getElementById('lessons-catalog')?.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className={`w-9 h-9 rounded-xl font-sans font-black text-xs flex items-center justify-center transition-all ${
                                        currentPage === page
                                          ? "bg-brand-purple text-white border-b-4 border-brand-purple-shadow"
                                          : "bg-white border-2 border-gray-100 text-brand-dark hover:border-gray-200"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                                    document.getElementById('lessons-catalog')?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  disabled={currentPage === totalPages}
                                  className="duo-btn bg-white hover:bg-gray-50 border-2 border-gray-200 text-brand-dark disabled:opacity-40 disabled:pointer-events-none text-xs px-3.5 py-2 flex items-center gap-1 font-bold"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6 animate-fade-in text-left">
                            <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div>
                                <span className="text-[10px] text-brand-purple font-sans font-black uppercase tracking-wider block">Course Resources</span>
                                <h3 className="font-sans font-black text-brand-dark text-base mb-0.5 uppercase tracking-tight mt-0.5">
                                  📕 Course eBooks &amp; PDF Downloads • စာအုပ်များနှင့် PDFs
                                </h3>
                                <p className="text-xs text-brand-muted font-sans font-semibold">
                                  Course-specific companion workbooks, reference sheets, and curriculum materials.
                                </p>
                              </div>
                            </div>

                            {(() => {
                              const hasDirectResources = activeCourse.resources && activeCourse.resources.length > 0;
                              const hasStoreResources = courseResources.length > 0;

                              if (!hasDirectResources && !hasStoreResources) {
                                return (
                                  <div className="bg-[#fcf8ff] rounded-3xl p-8 border-2 border-dashed border-brand-purple/10 text-center space-y-2">
                                    <span className="text-2xl block">📚</span>
                                    <h4 className="font-sans font-black text-sm text-[#3c3c3c]">No resources configured yet.</h4>
                                    <p className="text-[10px] text-brand-muted font-sans font-semibold">
                                      The administrator hasn't linked any custom eBooks or PDF sheets to this course group. Check general Study Store catalogs!
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-8">
                                  {/* Section A: Direct Companion eBook uploads */}
                                  {hasDirectResources && (
                                    <div className="space-y-4">
                                      <h4 className="font-sans font-black text-xs text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 text-left">
                                        <span>📕 Course Companion eBooks & Workbooks ({activeCourse.resources?.length || 0})</span>
                                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-sans font-black px-1.5 py-0.2 rounded-lg uppercase">
                                          Enrolled Materials
                                        </span>
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {activeCourse.resources?.map((res: any) => {
                                          const isFree = res.priceAmount === 0;
                                          const itemOwned = isStoreItemUnlocked(res.id, res.priceAmount);
                                          return (
                                            <div
                                              key={res.id}
                                              className="duo-card p-6 bg-white flex flex-col justify-between hover:shadow-md transition-all duration-200 animate-fade-in border-2 border-slate-100"
                                            >
                                              <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                  <div className="w-11 h-11 rounded-xl bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-2xl select-none">
                                                    📕
                                                  </div>
                                                  <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border select-none ${
                                                    isFree 
                                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                                  }`}>
                                                    {isFree ? "FREE DOWNLOAD" : "PREMIUM EBOOK"}
                                                  </span>
                                                </div>

                                                <div className="space-y-1">
                                                  <h4 className="font-sans font-black text-sm text-[#3c3c3c] leading-tight text-left">
                                                    {res.name}
                                                  </h4>
                                                  {res.nameMm && (
                                                    <p className="text-[11px] font-sans font-bold text-[#5a3194] text-left">
                                                      {res.nameMm}
                                                    </p>
                                                  )}
                                                  <p className="text-[11px] text-brand-muted font-sans font-medium leading-relaxed pt-1 text-left">
                                                    Official direct study companion material provided directly for students attending <b>{activeCourse.name}</b>.
                                                    {isFree ? " You have instant free download access." : " Purchase this course companion key to unlock direct access."}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-[#fafafc] -mx-6 -mb-6 p-4 rounded-b-2xl">
                                                <div className="text-left font-sans select-none">
                                                  <span className="text-[8px] text-brand-muted block font-extrabold uppercase leading-none">PRICING RATE</span>
                                                  <span className="text-[11.5px] font-black text-brand-purple block mt-0.5">
                                                    {isFree ? "FREE" : `${res.priceAmount.toLocaleString()} MMK`}
                                                  </span>
                                                </div>

                                                {itemOwned ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      window.open(res.downloadUrl, '_blank');
                                                      addSystemLog(currentUser || 'student', `Downloaded PDF companion resource: "${res.name}"`);
                                                    }}
                                                    className="px-3.5 py-2 bg-gradient-to-r from-[#00875a] to-[#00a36c] text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-[#006644] flex items-center gap-1 shrink-0"
                                                  >
                                                    📥 Open / Download
                                                  </button>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const checkoutProduct = {
                                                        id: res.id,
                                                        name: res.name,
                                                        nameMm: res.nameMm || '',
                                                        priceAmount: res.priceAmount,
                                                        currency: 'MMK' as const,
                                                        itemType: 'e-book',
                                                        duration: "Companion eBook Study Resource",
                                                        description: `Direct premium supplementary eBook for ${activeCourse.name}`,
                                                        descriptionMm: res.nameMm || '',
                                                        instructor: activeCourse.instructor || "Kru Jane & Sayar Thura",
                                                        includes: ["Permanent direct download URL", "Study exercises", "Vocabulary sheets"]
                                                      };
                                                      setGatewayCourse(checkoutProduct as any);
                                                      setGatewayPhone(progress.masteredWords.length > 0 ? "09-791112233" : "09-");
                                                      setGatewayEmail(currentUser ? `${currentUser.toLowerCase()}@classroom.edu` : "student@classroom.edu");
                                                      setGatewayStep(1);
                                                      setGatewayPaymentMethod('kbzpay');
                                                      setGatewayOtp('');
                                                      setGatewayTimer(180);
                                                      setIsGatewayOpen(true);
                                                    }}
                                                    className="px-3.5 py-2 bg-gradient-to-r from-[#583092] to-[#7a42c4] text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-[#3c1e66] flex items-center gap-1 shrink-0"
                                                  >
                                                    🔒 Unlock eBook
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Section B: General related bookstore cards */}
                                  {hasStoreResources && (
                                    <div className="space-y-4 pt-4">
                                      <h4 className="font-sans font-black text-xs text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 text-left">
                                        <span>🛍️ Bookstore Reference Sheets ({courseResources.length})</span>
                                        <span className="text-[8px] bg-brand-purple/10 text-brand-purple font-sans font-black px-1.5 py-0.2 rounded-lg uppercase">
                                          Store Catalog
                                        </span>
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {courseResources.map((item) => {
                                          const itemOwned = isStoreItemUnlocked(item.id, item.price);
                                          return (
                                            <div
                                              key={item.id}
                                              className="duo-card p-6 bg-white flex flex-col justify-between hover:shadow-md transition-all duration-200 animate-fade-in"
                                            >
                                      <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                          <div className="w-12 h-12 rounded-xl bg-brand-purple/5 border border-brand-purple/10 flex items-center justify-center text-2xl select-none">
                                            📕
                                          </div>
                                          {item.popular && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-orange-500 text-white border-b-2 border-orange-700 select-none">
                                              POPULAR
                                            </span>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <h4 className="font-sans font-black text-sm text-[#3c3c3c] leading-tight">
                                            {item.name}
                                          </h4>
                                          <p className="text-[11px] font-sans font-bold text-brand-purple/80">
                                            {item.nameMm}
                                          </p>
                                          <p className="text-[11.5px] text-brand-muted font-sans font-semibold leading-relaxed pt-1.5 line-clamp-3">
                                            {item.description}
                                          </p>
                                          {item.descriptionMm && (
                                            <p className="text-[10px] text-gray-500 font-sans font-semibold italic mt-1 leading-snug line-clamp-2">
                                              {item.descriptionMm}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                                        <div className="text-left font-sans select-none">
                                          <span className="text-[8px] text-brand-muted block font-extrabold uppercase leading-none">PRICING RATE</span>
                                          <span className="text-[12px] font-black text-brand-purple block mt-0.5">
                                            {item.price === 0 ? "FREE" : `${item.price.toLocaleString()} ${item.currency}`}
                                          </span>
                                        </div>

                                        {itemOwned ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (item.pdfDownloadUrl) {
                                                window.open(item.pdfDownloadUrl, '_blank');
                                                addSystemLog('system', `Opened eBook resource downland link: "${item.name}"`);
                                              } else {
                                                const fileName = item.pdfFileName || `${item.id}_study_manual.pdf`;
                                                const docTitle = item.name;
                                                const docDesc = item.description;
                                                
                                                const lessonsInCourse = lessons.filter(l => (l.courseId || 'course-basic') === activeCourse.id);
                                                const baseList = lessonsInCourse.flatMap(l => l.vocabularyBreakout || []).slice(0, 15);
                                                const highlights = baseList.length > 0 
                                                  ? baseList.map(v => ({ thai: v.thai, pronunciation: v.phonetic || '', myanmar: v.myanmar }))
                                                  : [{ thai: "สวัสดี", pronunciation: "sa-wat-di", myanmar: "မင်္ဂလာပါ" }];
                                                  
                                                triggerPdfDownload(fileName, docTitle, docDesc, highlights);
                                                addSystemLog('system', `Downloaded PDF companion: "${item.name}"`);
                                              }
                                            }}
                                            className="px-3.5 py-2 bg-gradient-to-r from-[#00875a] to-[#00a36c] text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-[#006644] flex items-center gap-1 shrink-0"
                                          >
                                            {item.pdfDownloadUrl ? "📥 Open Download URL" : "📥 Download PDF"}
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const checkoutProduct = {
                                                id: item.id,
                                                name: item.name,
                                                nameMm: item.nameMm,
                                                priceAmount: item.price,
                                                currency: item.currency,
                                                duration: "Lifetime E-Book Study License",
                                                description: item.description,
                                                descriptionMm: item.descriptionMm || '',
                                                instructor: "Kru Jane & Sayar Thura",
                                                includes: ["Custom E-Book PDF Download", "Topic practice questions", "Vocabulary listings"]
                                              };
                                              setGatewayCourse(checkoutProduct);
                                              setGatewayPhone(progress.masteredWords.length > 0 ? "09-791112233" : "09-");
                                              setGatewayEmail(currentUser ? `${currentUser.toLowerCase()}@classroom.edu` : "student@classroom.edu");
                                              setGatewayStep(1);
                                              setGatewayPaymentMethod('kbzpay');
                                              setGatewayOtp('');
                                              setGatewayTimer(180);
                                              setIsGatewayOpen(true);
                                            }}
                                            className="px-3.5 py-2 bg-gradient-to-r from-[#583092] to-[#7a42c4] text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-[#3c1e66] flex items-center gap-1 shrink-0"
                                          >
                                            🔒 Buy E-Book
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                          </div>
                        )}
                      </>
                    );
                  } else {
                    const courseCancelledOrder = orders.find(o => 
                      o.username.toLowerCase() === (currentUser || "").toLowerCase() && 
                      o.status === 'cancelled' &&
                      (o.id === activeCourse.id || o.itemName.toLowerCase().includes(activeCourse.id.toLowerCase().replace('course-', '')))
                    );

                    return (
                      <div className="bg-white rounded-3xl border-2 border-[#e5e5e5] p-6 sm:p-10 text-center space-y-3.5 shadow-xs max-w-2xl mx-auto motion-safe:animate-fade-inMac">
                        {courseCancelledOrder ? (
                          <div className="bg-rose-50 border-2 border-rose-200 p-5 rounded-2xl text-left space-y-3 shadow-3xs animate-fade-in text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                                <AlertTriangle className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-sans font-black text-rose-800 text-sm uppercase leading-none tracking-wider">
                                  PAYMENT DECLINED • ငွေပေးချေမှုငြင်းပယ်ခံရသည်
                                </h4>
                                <span className="text-[9.5px] font-sans font-bold text-rose-600 uppercase tracking-widest block mt-1">
                                  Course: {activeCourse.name}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-[11px] font-sans font-bold text-slate-700 leading-relaxed font-mono">
                              We are sorry, but your previous payment transfer slip was reviewed and declined by Kru Jane / Sayar Thura. As a result, this premium class remains locked.
                            </p>

                            {courseCancelledOrder.adminNotes && (
                              <div className="bg-white p-3 rounded-xl border border-rose-150/80 shadow-3xs space-y-1">
                                <span className="block text-[8.5px] font-sans font-black text-rose-500 uppercase tracking-wider">
                                  Admin Rejection Memo (အကြောင်းပြချက်):
                                </span>
                                <p className="text-[11.5px] font-sans font-black text-[#3c3c3c] leading-relaxed">
                                  "{courseCancelledOrder.adminNotes}"
                                </p>
                              </div>
                            )}

                            <div className="text-[9.5px] text-slate-500 font-bold leading-normal">
                              💡 To unlock access, please click the button below to retry and upload your transaction receipt again. Make sure the screenshot clearly displays the date, time, and TXN code.
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border-b-4 border-amber-200">
                            <Lock className="w-8 h-8" />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                            PREMIUM LOCKED • အဆင့်မြင့်တန်း
                          </span>
                          <h3 className="text-xl sm:text-2xl font-sans font-black text-[#3c3c3c] tracking-tight">
                            {activeCourse.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans max-w-md mx-auto font-medium">
                            {activeCourse.description}
                          </p>
                          <p className="text-xs sm:text-sm text-[#583092] italic mt-1 leading-relaxed font-sans max-w-md mx-auto font-black">
                            {activeCourse.descriptionMm || ""}
                          </p>
                        </div>

                        <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-100 text-left space-y-3.5">
                          <h4 className="font-sans font-black text-[10px] sm:text-xs text-[#583092] uppercase tracking-wider">
                            WHAT'S INCLUDED IN THIS CLASS:
                          </h4>
                          <ul className="text-[11px] sm:text-xs font-sans font-black text-brand-dark/80 space-y-2.5">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-brand-green shrink-0" />
                              <span>Custom Video Lectures & Interactive Speech Exercises • ဗီဒီယို သင်ခန်းစာများ</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-brand-green shrink-0" />
                              <span>Instructor Profile: {activeCourse.instructor || "Jane & Thura"}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-brand-green shrink-0" />
                              <span>Duration Period: {activeCourse.duration || "Self-paced"}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-brand-green shrink-0" />
                              <span>Direct Q&A Forum with Kru Jane & Sayar Thura • ဆရာများနှင့်မေးမြန်းခြင်း</span>
                            </li>
                          </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 gap-4">
                          <div className="text-left select-none">
                            <div className="text-[8px] sm:text-[10px] font-sans font-extrabold text-brand-muted uppercase tracking-wider">ONE-TIME LIFE-TIME ENROLLMENT</div>
                            <div className="text-xl sm:text-2xl font-sans font-black text-brand-purple mt-0.5">
                              {activeCourse.priceAmount.toLocaleString()} MMK
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const courseProduct = {
                                id: activeCourse.id,
                                name: activeCourse.name,
                                nameMm: activeCourse.nameMm || activeCourse.name,
                                priceAmount: activeCourse.priceAmount,
                                currency: "MMK" as const,
                                duration: activeCourse.duration || "8 Weeks",
                                description: activeCourse.description || "",
                                descriptionMm: activeCourse.descriptionMm || "",
                                instructor: activeCourse.instructor || "Kru Jane & Sayar Thura"
                              };
                              setGatewayCourse(courseProduct);
                              setGatewayPhone(progress.masteredWords.length > 0 ? "09-791112233" : "09-");
                              setGatewayEmail(currentUser ? `${currentUser.toLowerCase()}@classroom.edu` : "student@classroom.edu");
                              setGatewayStep(1);
                              setGatewayPaymentMethod('kbzpay');
                              setGatewayOtp('');
                              setGatewayTimer(180);
                              setIsGatewayOpen(true);
                            }}
                            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-brand-purple to-brand-purple/90 text-white rounded-xl text-[11px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 flex items-center justify-center gap-1.5 border-b-4 border-brand-purple-shadow"
                          >
                            <Sparkles className="w-4 h-4" />
                            🎓 Purchase & Unlock Course • ဝယ်ယူမည်
                          </button>
                        </div>
                      </div>
                    );
                  }
                })() : (
                  <div className="bg-white rounded-3xl border-2 border-[#e5e5e5] p-6 sm:p-8 space-y-8 shadow-xs max-w-4xl mx-auto motion-safe:animate-fade-in">
                    <div className="space-y-2 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-[#583092]">
                        📚 Dynamic Library & Learning PDF Hub • စာအုပ်ဆိုင်ရာ ပရိုဂရမ်
                      </span>
                      <h3 className="text-xl sm:text-2xl font-sans font-black text-[#3c3c3c] tracking-tight justify-center flex items-center gap-2">
                        <span>Thai Library & Handbooks Hub</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto font-medium font-sans leading-relaxed">
                        Download high-quality vocabulary worksheets, practice keys, and reference handbooks directly for offline learning. Premium eBooks can be unlocked via instant local mobile checkout!
                      </p>
                    </div>

                    {(() => {
                      const allStoreEbooks = storeItems.filter(item => item.type === 'e-book');
                      const standaloneEbooks = allStoreEbooks.filter(item => !item.courseId);
                      const courseLinkedEbooks = allStoreEbooks.filter(item => !!item.courseId);

                      if (allStoreEbooks.length === 0) {
                        return (
                          <div className="p-8 bg-slate-50 rounded-2xl text-center border border-slate-150">
                            <span className="text-2xl block mb-2">📁</span>
                            <span className="text-xs text-brand-muted font-bold font-sans">No eBooks configured yet in store items. Add some in Store Manager!</span>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-8">
                          {/* 1. STANDALONE EBOOKS & INDEPENDENT MANUALS */}
                          {standaloneEbooks.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-sans font-black text-xs text-brand-dark uppercase tracking-wider flex items-center gap-2 border-b-2 border-slate-100 pb-2 text-left">
                                <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">📕</span>
                                <span>General Reference Manuals & Independent Guides ({standaloneEbooks.length})</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                {standaloneEbooks.map((item) => {
                                  const isFree = item.price === 0;
                                  const itemOwned = isStoreItemUnlocked(item.id, item.price);

                                  return (
                                    <div
                                      key={item.id}
                                      className="duo-card p-5 sm:p-6 bg-white border-2 border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-200 animate-fade-in relative overflow-hidden"
                                    >
                                      {item.popular && (
                                        <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider select-none animate-pulse">
                                          🔥 POPULAR
                                        </div>
                                      )}
                                      <div className="space-y-3.5">
                                        <div className="flex items-center justify-between">
                                          <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border select-none ${
                                            isFree
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                              : 'bg-brand-purple/10 text-[#583092] border-brand-purple/20'
                                          }`}>
                                            {isFree ? 'FREE PDF DOWNLOAD' : 'PREMIUM STUDY BOOK'}
                                          </span>
                                          <FileText className={`w-4 h-4 ${isFree ? 'text-emerald-600' : 'text-brand-purple'}`} />
                                        </div>
                                        <div>
                                          <h4 className="font-sans font-black text-sm text-[#3c3c3c] leading-snug">
                                            {item.name}
                                          </h4>
                                          <p className="text-[10px] sm:text-[11px] font-sans font-bold text-brand-purple mt-0.5">
                                            {item.nameMm}
                                          </p>
                                          <p className="text-[11px] text-brand-muted font-sans font-medium mt-2 leading-relaxed">
                                            {item.description}
                                          </p>
                                          {item.descriptionMm && (
                                            <p className="text-[10.5px] text-slate-500 font-sans italic mt-1 leading-relaxed">
                                              {item.descriptionMm}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between gap-3 pt-4 mt-5 border-t border-slate-100 -mx-5 -mb-5 p-4 bg-[#fafafc] rounded-b-2xl">
                                        <div className="text-left font-sans select-none">
                                          <span className="text-[7.5px] text-brand-muted block font-extrabold uppercase leading-none">Price Tag</span>
                                          <span className="text-xs sm:text-sm font-black text-brand-purple block mt-0.5">
                                            {isFree ? 'FREE' : `${item.price.toLocaleString()} ${item.currency}`}
                                          </span>
                                        </div>

                                        {itemOwned ? (
                                          <button
                                            onClick={() => {
                                              if (item.pdfDownloadUrl) {
                                                window.open(item.pdfDownloadUrl, '_blank');
                                                addSystemLog(currentUser || 'student', `Opened dynamic download link for eBook: "${item.name}"`);
                                              } else {
                                                triggerPdfDownload(
                                                  item.pdfFileName || `${item.id}.pdf`,
                                                  item.name,
                                                  item.description,
                                                  [
                                                    { thai: "สวัสดี ครับ/ค่ะ", pronunciation: "sawàtdii khráp/khâ", myanmar: "မင်္ဂလာပါ (ကျား/မ)" },
                                                    { thai: "ขอบคุณ ครับ/ค่ะ", pronunciation: "khɔ̀ɔp-khun khráp/khâ", myanmar: "ကျေးဇူးတင်ပါတယ်" },
                                                    { thai: "สบายดีไหม", pronunciation: "sabaaj dii mǎi", myanmar: "နေကောင်းလား" },
                                                    { thai: "ขอโทษ ครับ/ค่ะ", pronunciation: "khɔ̌ɔ-thôot khráp/khâ", myanmar: "တောင်းပန်ပါတယ်" },
                                                    { thai: "เรียนภาษาไทย", pronunciation: "riian phaasǎathai", myanmar: "ထိုင်းစာ သင်ယူသည်" }
                                                  ]
                                                );
                                                addSystemLog(currentUser || 'student', `Completed dynamic auto-generation download: "${item.name}"`);
                                              }
                                            }}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-750 text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-emerald-800 flex items-center gap-1.5 shrink-0"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            📥 Download Free Guide
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              const bookProduct = {
                                                id: item.id,
                                                name: item.name,
                                                nameMm: item.nameMm,
                                                priceAmount: item.price,
                                                currency: item.currency || 'MMK',
                                                itemType: 'e-book',
                                                duration: "Lifetime Study Access License",
                                                description: item.description,
                                                descriptionMm: item.descriptionMm,
                                                instructor: "Kru Jane & Sayar Thura",
                                                includes: ["Full Dynamic PDF eBook Download", "Offline Reading Support", "Grammar Revision Sheets", "Burmese Pronunciation Guide"]
                                              };
                                              setGatewayCourse(bookProduct as any);
                                              setGatewayPhone(progress.masteredWords.length > 0 ? "09-791112233" : "09-");
                                              setGatewayEmail(currentUser ? `${currentUser.toLowerCase()}@classroom.edu` : "student@classroom.edu");
                                              setGatewayStep(1);
                                              setGatewayPaymentMethod('kbzpay');
                                              setGatewayOtp('');
                                              setGatewayTimer(180);
                                              setIsGatewayOpen(true);
                                            }}
                                            className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-purple/95 text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-brand-purple-shadow flex items-center gap-1 shrink-0"
                                          >
                                            🔒 Unlock eBook
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 2. COURSE LINKED STUDY MANUALS */}
                          {courseLinkedEbooks.length > 0 && (
                            <div className="space-y-4 pt-4">
                              <h4 className="font-sans font-black text-xs text-brand-dark uppercase tracking-wider flex items-center gap-2 border-b-2 border-slate-100 pb-2 text-left">
                                <span className="p-1 rounded-lg bg-amber-50 text-amber-700">📚</span>
                                <span>Course Companion eBooks & Specific Lesson PDFs ({courseLinkedEbooks.length})</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                {courseLinkedEbooks.map((item) => {
                                  const isFree = item.price === 0;
                                  const itemOwned = isStoreItemUnlocked(item.id, item.price);
                                  const linkedCourse = courses.find(c => c.id === item.courseId);

                                  return (
                                    <div
                                      key={item.id}
                                      className="duo-card p-5 sm:p-6 bg-white border-2 border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-200 animate-fade-in relative overflow-hidden"
                                    >
                                      {item.popular && (
                                        <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider select-none">
                                          ★ FEATURED
                                        </div>
                                      )}
                                      <div className="space-y-3.5">
                                        <div className="flex items-center justify-between">
                                          <span className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-50 text-amber-850 border border-amber-200 uppercase tracking-widest leading-none">
                                            Linked: {linkedCourse ? linkedCourse.name : item.courseId}
                                          </span>
                                        </div>
                                        <div>
                                          <h4 className="font-sans font-black text-sm text-[#3c3c3c] leading-snug">
                                            {item.name}
                                          </h4>
                                          <p className="text-[10px] sm:text-[11px] font-sans font-bold text-brand-purple mt-0.5">
                                            {item.nameMm}
                                          </p>
                                          <p className="text-[11px] text-brand-muted font-sans font-medium mt-2 leading-relaxed">
                                            {item.description}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between gap-3 pt-4 mt-5 border-t border-slate-100 -mx-5 -mb-5 p-4 bg-[#fafafc] rounded-b-2xl">
                                        <div className="text-left font-sans select-none">
                                          <span className="text-[7.5px] text-brand-muted block font-extrabold uppercase leading-none">Syllabus Access</span>
                                          <span className="text-xs sm:text-sm font-black text-brand-purple block mt-0.5">
                                            {isFree ? 'FREE' : `${item.price.toLocaleString()} ${item.currency}`}
                                          </span>
                                        </div>

                                        {itemOwned ? (
                                          <button
                                            onClick={() => {
                                              if (item.pdfDownloadUrl) {
                                                window.open(item.pdfDownloadUrl, '_blank');
                                                addSystemLog(currentUser || 'student', `Downloaded companion booklet: "${item.name}"`);
                                              } else {
                                                triggerPdfDownload(
                                                  item.pdfFileName || `${item.id}.pdf`,
                                                  item.name,
                                                  item.description,
                                                  [
                                                    { thai: "สวัสดี ครับ", pronunciation: "sawàtdii khráp", myanmar: "မဂ်လာပါခင်ဗျာ" },
                                                    { thai: "ขอบคุณ ครับ", pronunciation: "khɔ̀ɔp-khun khráp", myanmar: "ကျေးဇူးတင်ပါတယ်ခင်ဗျာ" },
                                                    { thai: "โชคดี", pronunciation: "chôok-dii", myanmar: "ကံကောင်းပါစေ" }
                                                  ]
                                                );
                                                addSystemLog(currentUser || 'student', `Auto generated dynamic Companion PDF download: "${item.name}"`);
                                              }
                                            }}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-750 text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-emerald-800 flex items-center gap-1.5 shrink-0"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            📥 Download
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              const bookProduct = {
                                                id: item.id,
                                                name: item.name,
                                                nameMm: item.nameMm,
                                                priceAmount: item.price,
                                                currency: item.currency || 'MMK',
                                                itemType: 'e-book',
                                                duration: "Linked Syllabus Learning Course Pack",
                                                description: item.description,
                                                descriptionMm: item.descriptionMm,
                                                instructor: "Kru Jane & Sayar Thura",
                                                includes: ["Full PDF Handbook Download Link", "Specific Course Exercises", "Vocabulary sheets"]
                                              };
                                              setGatewayCourse(bookProduct as any);
                                              setGatewayPhone(progress.masteredWords.length > 0 ? "09-791112233" : "09-");
                                              setGatewayEmail(currentUser ? `${currentUser.toLowerCase()}@classroom.edu` : "student@classroom.edu");
                                              setGatewayStep(1);
                                              setGatewayPaymentMethod('kbzpay');
                                              setGatewayOtp('');
                                              setGatewayTimer(180);
                                              setIsGatewayOpen(true);
                                            }}
                                            className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-purple/95 text-white rounded-xl text-[10px] sm:text-xs font-sans font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform active:translate-y-0.5 border-b-4 border-brand-purple-shadow flex items-center gap-1 shrink-0"
                                          >
                                            🔒 Unlock eBook
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Orientation & Pronunciation Guide */}
            {dashboardTab === 'orientation' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 min-h-[500px]">
                
                {/* Left Sidebar Article Selector */}
                <div className="space-y-4 lg:col-span-1">
                  <div className="mb-4">
                    <h3 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wider">
                      Orientation • လမ်းညွှန်ချက်
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {orientationData.map((article) => {
                      const isActive = article.id === activeOrientationId;
                      return (
                        <button
                          key={article.id}
                          onClick={() => setActiveOrientationId(article.id)}
                          className={`w-full text-left p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all text-xs outline-none ${
                            isActive
                              ? 'bg-brand-purple text-white border-brand-purple border-b-4 border-brand-purple-shadow'
                              : 'bg-white hover:bg-gray-50 text-brand-dark border-gray-150 border-b-4'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className={`font-sans font-black leading-tight text-sm ${isActive ? 'text-white' : 'text-[#3c3c3c]'}`}>
                              {article.titleEnglish}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-white' : 'text-gray-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Area Article details panel */}
                <div className="lg:col-span-3 space-y-6">
                  {(() => {
                    const article = orientationData.find(a => a.id === activeOrientationId) || orientationData[0];
                    return (
                      <>
                        {/* Article Welcome Card */}
                        <div className="duo-card p-6 md:p-8 bg-white border-2 border-gray-100">
                          <span className="text-[10px] font-sans text-brand-purple bg-brand-purple-light px-2.5 py-1 rounded-full font-extrabold border border-brand-purple/20 select-none uppercase">
                            Course Orientation
                          </span>
                          <h2 className="text-xl md:text-2xl font-sans font-black text-brand-dark tracking-tight mt-3">
                            {article.titleEnglish}
                          </h2>
                        </div>

                        {/* Article Sections */}
                        <div className="space-y-6">
                          {article.sections.map((section, secIdx) => (
                            <motion.div
                              key={secIdx}
                              className="duo-card p-6 bg-white border-2 border-gray-100"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: secIdx * 0.05 }}
                            >
                              <h4 className="font-sans font-black text-brand-purple text-base mb-2">
                                {section.headingEnglish}
                              </h4>
                              <h5 className="font-sans font-black text-brand-muted text-xs mb-4">
                                {section.headingMyanmar}
                              </h5>
                              <div className="space-y-4">
                                {section.paragraphs.map((p, pIdx) => (
                                  <div key={pIdx} className="space-y-1">
                                    <p className="text-xs sm:text-sm text-brand-dark font-sans leading-relaxed font-semibold">
                                      {p.en}
                                    </p>
                                    <p className="text-xs sm:text-sm text-brand-muted font-sans leading-relaxed italic border-l-4 border-brand-purple/20 pl-3 font-semibold whitespace-pre-line">
                                      {p.mm}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {section.highlights && section.highlights.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {section.highlights.map((hl, hlIdx) => (
                                    <div key={hlIdx} className="p-3.5 bg-brand-light/50 border border-gray-200 rounded-xl flex items-center justify-between gap-3.5 hover:border-brand-purple/30 transition-all shadow-3xs">
                                      <div className="min-w-0 flex-1">
                                        <div className="font-sans font-bold text-xs flex items-center flex-wrap gap-1">
                                          {hl.termThai && (
                                            <span className="text-brand-purple text-base font-black mr-1">{hl.termThai}</span>
                                          )}
                                          <span className="text-brand-green italic font-black">({hl.termPhonetic} = {getMyanmarPhonetic(hl.termPhonetic)})</span>
                                        </div>
                                        <div className="text-[11px] font-sans mt-2 font-bold text-brand-dark leading-snug">
                                          {hl.meaningEnglish} • <span className="text-brand-muted">{hl.meaningMyanmar}</span>
                                        </div>
                                      </div>
                                      {hl.termThai && (
                                        <button
                                          onClick={() => speakText(hl.termThai)}
                                          className="p-1 px-2 border-2 border-brand-purple/20 bg-[#fbfaff] hover:bg-brand-purple/10 text-brand-purple hover:text-brand-purple-dark text-[10px] rounded-lg font-black shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                          title="Play sound • အသံထွက်ဖွင့်ရန်"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                          <span>Play</span>
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. Grammar Handbook */}
            {dashboardTab === 'handbook' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 min-h-[500px]">
                
                {/* Left Chapters list sidebar (responsive layout) */}
                <div className={`space-y-4 lg:col-span-1 ${mobileChapterDetailActive ? 'hidden lg:block' : 'block'}`}>
                  <div className="mb-4">
                    <h3 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wider">
                      Grammar Index • သဒ္ဒါမာတိကာ
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {grammarChapters.map((ch) => {
                      const isActive = ch.id === activeChapterId;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => {
                            setActiveChapterId(ch.id);
                            setExpandedChapterRuleIndex(0);
                            setHandbookSubPageIndex(0);
                            setMobileChapterDetailActive(true);
                          }}
                          className={`w-full text-left p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all text-xs outline-none ${
                            isActive
                              ? 'bg-brand-purple text-white border-brand-purple border-b-4 border-brand-purple-shadow'
                              : 'bg-white hover:bg-gray-50 text-brand-dark border-gray-150 border-b-4'
                          }`}
                        >
                          <BookOpen className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-brand-purple'}`} />
                          <div className="min-w-0 flex-1">
                            <div className={`font-sans font-black leading-tight text-sm ${isActive ? 'text-white' : 'text-[#3c3c3c]'}`}>
                              Chapter {ch.id}: {ch.titleEnglish}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-white' : 'text-gray-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Area active chapter details deck */}
                <div className={`lg:col-span-3 space-y-6 ${mobileChapterDetailActive ? 'block' : 'hidden lg:block'}`}>
                  {(() => {
                    const chapter = grammarChapters.find(c => c.id === activeChapterId) || grammarChapters[0];
                    return (
                      <>
                        {/* Mobile Back navigation button */}
                        <div className="lg:hidden">
                          <button
                            onClick={() => setMobileChapterDetailActive(false)}
                            className="text-brand-purple text-xs font-sans font-black flex items-center gap-1 hover:underline pb-3"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            BACK TO HANDBOOK CHAPTERS LIST
                          </button>
                        </div>

                        {/* Active Chapter Splash Welcome card */}
                        <div className="duo-card p-6 md:p-8 bg-white border-2 border-gray-100 flex items-start gap-4">
                          <div className="w-12 h-12 bg-brand-purple-light text-brand-purple rounded-2xl flex items-center justify-center shrink-0 border border-brand-purple/20 shadow-xs font-sans font-black text-sm select-none">
                            {chapter.id}
                          </div>
                          <div>
                            <span className="text-[10px] font-sans text-brand-purple bg-brand-purple-light px-2.5 py-1 rounded-full font-extrabold border border-brand-purple/20 select-none uppercase">
                              Active Handbook Chapter
                            </span>
                            <h2 className="text-xl md:text-2xl font-sans font-black text-brand-dark tracking-tight mt-3">
                              Chapter {chapter.id}: {chapter.titleEnglish}
                            </h2>
                          </div>
                        </div>

                        {/* Interactive Chapter Rules Deck */}
                        <div className="space-y-4">
                          {chapter.rules.map((rule, ruleIdx) => {
                            const isExpanded = expandedChapterRuleIndex === ruleIdx;
                            const currentMode = exampleModeForRules[`${chapter.id}-${ruleIdx}`] || 'standard';
                            
                            // Get page-specific rule data
                            const ruleData = getSubPageContent('handbook', chapter.id, ruleIdx, handbookSubPageIndex, rule);

                            // Active examples: if custom mode is chosen, we query additional phrases. Otherwise, we use current page's examples.
                            const activeExamples = currentMode === 'standard' 
                              ? (ruleData.examples || []) 
                              : getAdditionalPhrases(chapter.id, ruleIdx, currentMode);

                            return (
                              <motion.div
                                key={ruleIdx}
                                id={`handbook-rule-${ruleIdx}`}
                                className="duo-card bg-white border-2 border-gray-100 overflow-hidden"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: ruleIdx * 0.05 }}
                              >
                                {/* Collapsible Accordion Header */}
                                <button
                                  onClick={() => {
                                    setExpandedChapterRuleIndex(isExpanded ? -1 : ruleIdx);
                                    setHandbookSubPageIndex(0);
                                  }}
                                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors select-none focus:outline-none"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-sans font-black text-xs shrink-0 select-none ${
                                      isExpanded 
                                        ? 'bg-brand-purple text-white border-brand-purple shadow-xs' 
                                        : 'bg-brand-purple-light text-brand-purple border-brand-purple/20'
                                    }`}>
                                      {ruleIdx + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="font-sans font-black text-brand-purple text-base leading-tight truncate">
                                        {rule.title}
                                      </h5>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {isExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-brand-purple" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </button>

                                {/* Collapsible Content Body */}
                                {isExpanded && (
                                  <div className="px-5 pb-5 pt-2 space-y-4 border-t border-gray-100">
                                    
                                    {/* Sub-Page Navigation Controls Bar */}
                                    <div className="flex items-center justify-end bg-[#fdfcff] p-3 rounded-2xl border border-brand-purple/15 mt-2">
                                      {/* Quick Pagers */}
                                      <div className="flex items-center gap-2 select-none">
                                        <button
                                          onClick={() => setHandbookSubPageIndex((p) => Math.max(0, p - 1))}
                                          disabled={handbookSubPageIndex === 0}
                                          className="text-[10px] font-sans font-black text-brand-dark hover:text-brand-purple disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5"
                                        >
                                          <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                                          BACK
                                        </button>
                                        <span className="text-[10px] font-mono font-bold bg-brand-purple-light/50 px-2 py-0.5 rounded text-brand-purple">
                                          {handbookSubPageIndex + 1} / 3
                                        </span>
                                        <button
                                          onClick={() => setHandbookSubPageIndex((p) => Math.min(2, p + 1))}
                                          disabled={handbookSubPageIndex === 2}
                                          className="text-[10px] font-sans font-black text-brand-dark hover:text-brand-purple disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5"
                                        >
                                          NEXT
                                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Page-Specific Topic Title */}
                                    <div className="pt-1">
                                      <span className="text-[9px] font-sans text-brand-purple bg-brand-purple-light border border-brand-purple/10 px-2 py-0.5 rounded font-black uppercase">
                                        Page {handbookSubPageIndex + 1} • {handbookSubPageIndex === 0 ? "Theory" : handbookSubPageIndex === 1 ? "Nuance" : "Drills"}
                                      </span>
                                      <h6 className="font-sans font-black text-brand-dark text-sm mt-1">
                                        {ruleData.title}
                                      </h6>
                                    </div>

                                    {/* Expositions */}
                                    {isSingleSentenceEnglish(ruleData.explanation) && (
                                      <p className="text-xs sm:text-sm text-brand-dark font-sans leading-relaxed font-semibold">
                                        {ruleData.explanation}
                                      </p>
                                    )}
                                    <p className="text-xs sm:text-sm text-brand-muted font-sans leading-relaxed italic border-l-4 border-brand-purple/20 pl-3 font-semibold mt-1">
                                      {ruleData.explanationMyanmar}
                                    </p>



                                    {/* Rule Examples Grid */}
                                    {activeExamples && activeExamples.length > 0 && (
                                      <div className="space-y-3 pt-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                          {activeExamples.map((ex, exIdx) => (
                                            <div key={exIdx} className="duo-card p-4 bg-gray-50/50 border border-gray-100 flex items-center justify-between gap-4 hover:border-gray-250 transition-all">
                                              <div className="min-w-0 flex-1">
                                                <div className="font-sans font-black text-brand-dark text-sm leading-tight flex items-baseline gap-1.5 flex-wrap">
                                                  <span className="text-brand-purple text-[15px]">{ex.thai}</span>
                                                  <span className="text-[10px] text-brand-green font-extrabold italic bg-brand-green-light px-2 py-0.5 rounded-full">
                                                    ({ex.phonetic} = {getMyanmarPhonetic(ex.phonetic)})
                                                  </span>
                                                </div>
                                                <div className="text-[11px] text-brand-muted font-sans font-bold leading-normal mt-2">
                                                  {ex.english}
                                                </div>
                                                <div className="text-[11px] text-brand-dark font-sans font-bold leading-normal mt-0.5">
                                                  {ex.myanmar}
                                                </div>
                                              </div>

                                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0 self-start">
                                                <GrammarVocabDropdown sentence={ex.thai} allLessons={lessons} />
                                                <button
                                                  onClick={() => speakText(ex.thai)}
                                                  className="px-2 h-8 rounded-xl bg-white border-2 border-b-4 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1 shrink-0 transition-all active:translate-y-0.5"
                                                  title={`Listen (${audioSpeedIndex === 0 ? "Normal" : audioSpeedIndex === 1 ? "Slow 0.7x" : "Slower 0.5x"})`}
                                                >
                                                  {audioSpeedIndex === 0 ? (
                                                    <>
                                                      <Volume2 className="w-3.5 h-3.5 text-brand-purple" />
                                                      <span className="text-[8px] font-sans font-black text-brand-purple bg-brand-purple-light px-1 py-0.5 rounded-md select-none leading-none">1.0x</span>
                                                    </>
                                                  ) : audioSpeedIndex === 1 ? (
                                                    <>
                                                      <Volume1 className="w-3.5 h-3.5 text-indigo-500" />
                                                      <span className="text-[8px] font-sans font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded-md select-none leading-none">0.7x</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Volume className="w-3.5 h-3.5 text-orange-500" />
                                                      <span className="text-[8px] font-sans font-black text-orange-500 bg-orange-50 px-1 py-0.5 rounded-md select-none leading-none">0.5x</span>
                                                    </>
                                                  )}
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Elegant Footer Navigation Bar */}
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-4 bg-[#fdfcff] -mx-5 -mb-5 p-4 rounded-b-2xl">
                                      {handbookSubPageIndex < 2 ? (
                                        <button
                                          onClick={() => setHandbookSubPageIndex(handbookSubPageIndex + 1)}
                                          className="text-brand-purple font-sans font-black text-xs flex items-center gap-1 hover:underline active:translate-y-0.5 transition-transform"
                                        >
                                          Next
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                      ) : ruleIdx < chapter.rules.length - 1 ? (
                                        <button
                                          onClick={() => {
                                            setExpandedChapterRuleIndex(ruleIdx + 1);
                                            setHandbookSubPageIndex(0);
                                            setTimeout(() => {
                                              document.getElementById(`handbook-rule-${ruleIdx + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }, 100);
                                          }}
                                          className="text-brand-purple font-sans font-black text-xs flex items-center gap-1 hover:underline active:translate-y-0.5 transition-transform"
                                        >
                                          Next Topic • အောက်ပါမှတ်စု
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <span className="text-[10px] font-sans text-brand-green font-extrabold uppercase">Chapter Complete • ပြီးဆုံးပါသည်</span>
                                      )}
                                    </div>

                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>
            )}

            {/* TAB CONTENT: 3. Alphabet Guide */}
            {dashboardTab === 'alphabet' && (
              <div className="max-w-7xl mx-auto space-y-6 min-h-[500px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-sans font-black text-brand-dark text-base uppercase tracking-tight">
                      Alphabet Guide • ထိုင်းအက္ခရာများ
                    </h3>
                  </div>
                </div>

                <AlphabetGuide speakText={speakText} />
              </div>
            )}

            {/* TAB CONTENT: 4. Notebook & Custom Vocabulary (Add Word Panel) */}
            {dashboardTab === 'notebook' && (
              <div className="max-w-7xl mx-auto space-y-6 min-h-[500px]">
                <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans font-black text-brand-dark text-base uppercase tracking-tight">
                      Vocabulary Notebook • ဝေါဟာရစုစည်းမှု
                    </h3>
                  </div>
                  {!isLoggedIn && (
                    <button
                      onClick={() => {
                        setAuthTab('user');
                        setShowAuthModal(true);
                      }}
                      className="px-4 py-2.5 bg-brand-purple text-white rounded-xl border-b-4 border-brand-purple-shadow font-sans font-black text-xs uppercase tracking-wider flex items-center gap-1 shrink-0"
                    >
                      <User className="w-4 h-4" />
                      Sign In to Add Words
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Add Word Form Card */}
                  <div className="lg:col-span-1 bg-white p-5 rounded-2xl border-2 border-gray-100 h-fit space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <Plus className="w-5 h-5 text-brand-purple" />
                      <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide">
                        Add Custom Word • စကားလုံးအသစ်ထည့်မည်
                      </h4>
                    </div>

                    {!isLoggedIn ? (
                      <div className="p-3 bg-brand-purple-light/40 border border-brand-purple/20 text-brand-purple rounded-xl text-xs sm:text-sm leading-relaxed text-center font-bold font-sans">
                        ⚠️ Please sign in to unlock custom contributions!
                      </div>
                    ) : (
                      <>
                        {notebookError && (
                          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold leading-relaxed border border-red-100 flex items-center gap-2">
                            <span>⚠️ {notebookError}</span>
                          </div>
                        )}

                        {notebookSuccess && (
                          <div className="bg-green-50 text-brand-green p-3 rounded-xl text-xs font-black leading-relaxed border border-green-100 flex items-center gap-2">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>{notebookSuccess}</span>
                          </div>
                        )}

                        <div className="space-y-3.5">
                          <p className="text-[10px] text-brand-purple font-semibold leading-normal font-sans bg-brand-purple-light/40 p-2.5 rounded-lg border border-brand-purple/10">
                            💡 <strong>Smart Filler Enabled:</strong> Fill only 1-2 fields (e.g. English or Thai) and submit! The app will automatically translate, structure, and create the card for you.
                          </p>

                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                              Thai Script (e.g. สวัสดี)
                            </label>
                            <input
                              type="text"
                              placeholder="พิมพ์ภาษาไทย"
                              value={newWordThai}
                              onChange={(e) => setNewWordThai(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-bold font-sans focus:border-brand-purple focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                              Phonetic pronunciation (e.g. sà-wàt-dii)
                            </label>
                            <input
                              type="text"
                              placeholder="pronunciation guide"
                              value={newWordPhonetic}
                              onChange={(e) => setNewWordPhonetic(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-bold font-sans focus:border-brand-purple focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                              English Translation (e.g. Hello)
                            </label>
                            <input
                              type="text"
                              placeholder="English meaning"
                              value={newWordEnglish}
                              onChange={(e) => setNewWordEnglish(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-bold font-sans focus:border-brand-purple focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                              Myanmar Translation (e.g. မင်္ဂလာပါ)
                            </label>
                            <input
                              type="text"
                              placeholder="မြန်မာဘာသာပြန်"
                              value={newWordMyanmar}
                              onChange={(e) => setNewWordMyanmar(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-bold font-sans focus:border-brand-purple focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                              Part of Speech
                            </label>
                            <select
                              value={newWordPos}
                              onChange={(e) => setNewWordPos(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-black font-sans focus:border-brand-purple focus:outline-none transition-colors"
                            >
                              <option value="Noun">Noun (နာမ်)</option>
                              <option value="Verb">Verb (ကြိယာ)</option>
                              <option value="Adjective">Adjective (နာမဝိသေသန)</option>
                              <option value="Adverb">Adverb (ကြိယာဝိသေသန)</option>
                              <option value="Phrase">Phrase (စကားစု)</option>
                              <option value="Pronoun">Pronoun (နာမ်စား)</option>
                              <option value="Conjunction">Conjunction (သမ္ဗန္ဓ)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1 text-brand-muted">
                              Notes / Usage Example (Optional)
                            </label>
                            <textarea
                              placeholder="Enter context clues or notes..."
                              value={newWordNotes}
                              onChange={(e) => setNewWordNotes(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs font-semibold font-sans focus:border-brand-purple focus:outline-none transition-colors"
                            />
                          </div>

                          <button
                            onClick={() => {
                              const cleanThai = newWordThai.trim();
                              const cleanPhonetic = newWordPhonetic.trim();
                              const cleanEnglish = newWordEnglish.trim();
                              const cleanMyanmar = newWordMyanmar.trim();
                              if (!cleanThai && !cleanPhonetic && !cleanEnglish && !cleanMyanmar) {
                                setNotebookError("Please enter at least one or two options in the form to generate words!");
                                return;
                              }
                              
                              const completedWord = autoFillWord(
                                cleanThai,
                                cleanPhonetic,
                                cleanEnglish,
                                cleanMyanmar,
                                newWordPos,
                                lessons
                              );

                              if (customWords.some(w => w.thai === completedWord.thai && !w.isArchived)) {
                                setNotebookError(`"${completedWord.thai}" already exists in active list!`);
                                return;
                              }

                              const wordPayload = {
                                ...completedWord,
                                notes: newWordNotes.trim() || undefined,
                                author: currentUser || 'User',
                                isArchived: false
                              };
                              const updated = [wordPayload, ...customWords];
                              setCustomWords(updated);
                              localStorage.setItem('thai_custom_words_v1', JSON.stringify(updated));
                              setNewWordThai('');
                              setNewWordPhonetic('');
                              setNewWordEnglish('');
                              setNewWordMyanmar('');
                              setNewWordNotes('');
                              setNotebookError('');
                              setNotebookSuccess(`Successfully added "${completedWord.thai}"! (+5 XP gained)`);
                              saveProgress({
                                ...progress,
                                totalXp: progress.totalXp + 5
                              });
                              addSystemLog(currentUser || 'User', `Contributed new word "${completedWord.thai}" to Notebook`);
                              setTimeout(() => setNotebookSuccess(''), 4000);
                            }}
                            className="w-full duo-btn duo-btn-purple text-xs font-black py-3.5 flex items-center justify-center gap-2"
                          >
                            <CheckSquare className="w-4 h-4" />
                            SUBMIT WORD (+5 XP)
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Custom Words List Card */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Active vs Archived segmented filter */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-150 select-none">
                      <button
                        onClick={() => setShowArchived(false)}
                        className={`py-2 text-center rounded-lg font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider cursor-pointer ${
                          !showArchived
                            ? 'bg-white text-brand-purple border-b-2 border-brand-purple/30 shadow-xs'
                            : 'text-brand-muted hover:text-brand-dark'
                        }`}
                      >
                        📂 Active Words ({customWords.filter(w => !w.isArchived).length})
                      </button>
                      <button
                        onClick={() => setShowArchived(true)}
                        className={`py-2 text-center rounded-lg font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider cursor-pointer ${
                          showArchived
                            ? 'bg-white text-brand-purple border-b-2 border-brand-purple/30 shadow-xs'
                            : 'text-brand-muted hover:text-brand-dark'
                        }`}
                      >
                        📦 Archived Words ({customWords.filter(w => w.isArchived).length})
                      </button>
                    </div>

                    {/* Sub card Search */}
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 flex items-center gap-2">
                      <Search className="w-4 h-4 text-brand-muted shrink-0" />
                      <input
                        type="text"
                        placeholder="Search custom notebook (Thai, Eng, Myanmar)..."
                        value={customWordSearch}
                        onChange={(e) => setCustomWordSearch(e.target.value)}
                        className="w-full text-xs font-semibold font-sans bg-transparent outline-none"
                      />
                    </div>

                    {/* custom words iterator */}
                    {(() => {
                      const filteredCustom = customWords.filter(item => {
                        const isCardArchived = !!item.isArchived;
                        if (isCardArchived !== showArchived) return false;

                        const query = customWordSearch.toLowerCase();
                        return (
                          item.thai.toLowerCase().includes(query) ||
                          item.phonetic.toLowerCase().includes(query) ||
                          item.english.toLowerCase().includes(query) ||
                          item.myanmar.toLowerCase().includes(query)
                        );
                      });

                      if (filteredCustom.length === 0) {
                        return (
                          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-12 text-center">
                            <HelpCircle className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                            <h4 className="font-sans font-black text-brand-dark text-sm uppercase">No Custom Words Found</h4>
                            <p className="text-xs text-brand-muted font-sans font-semibold mt-1">Be the first to add a useful vocabulary word to the dictionary!</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredCustom.map((item, idx) => {
                            const isEdited = editingWordThai === item.thai;
                            const isMastered = progress.masteredWords.includes(item.thai);

                            return (
                              <div key={idx} className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-brand-purple/40 hover:shadow-xs transition-all relative flex flex-col justify-between">
                                {isEdited ? (
                                  /* Edit Form Inside Card */
                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-[9px] font-sans font-black text-brand-purple uppercase tracking-widest block mb-1">Editing: {item.thai}</span>
                                      <input
                                        type="text"
                                        placeholder="Phonetic translation"
                                        value={editWordPhonetic}
                                        onChange={(e) => setEditWordPhonetic(e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs font-bold font-sans text-brand-dark"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="English translation"
                                        value={editWordEnglish}
                                        onChange={(e) => setEditWordEnglish(e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs font-bold font-sans text-brand-dark"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="Myanmar translation"
                                        value={editWordMyanmar}
                                        onChange={(e) => setEditWordMyanmar(e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs font-bold font-sans text-brand-dark"
                                      />
                                    </div>
                                    <div>
                                      <select
                                        value={editWordPos}
                                        onChange={(e) => setEditWordPos(e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs font-bold font-sans text-brand-dark"
                                      >
                                        <option value="Noun">Noun</option>
                                        <option value="Verb">Verb</option>
                                        <option value="Adjective">Adjective</option>
                                        <option value="Phrase">Phrase</option>
                                        <option value="Pronoun">Pronoun</option>
                                      </select>
                                    </div>
                                    <div>
                                      <textarea
                                        placeholder="Private notes..."
                                        value={editWordNotes}
                                        onChange={(e) => setEditWordNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs font-semibold font-sans text-brand-dark"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          const updated = customWords.map(w => {
                                            if (w.thai === item.thai) {
                                              return {
                                                ...w,
                                                phonetic: editWordPhonetic,
                                                english: editWordEnglish,
                                                myanmar: editWordMyanmar,
                                                partOfSpeech: editWordPos,
                                                notes: editWordNotes.trim() || undefined
                                              };
                                            }
                                            return w;
                                          });
                                          setCustomWords(updated);
                                          localStorage.setItem('thai_custom_words_v1', JSON.stringify(updated));
                                          setEditingWordThai(null);
                                          addSystemLog(currentUser || 'User', `Edited word "${item.thai}"`);
                                        }}
                                        className="flex-1 py-1 px-2.5 bg-brand-green text-white text-[10px] font-sans font-black rounded hover:opacity-90 cursor-pointer"
                                      >
                                        SAVE
                                      </button>
                                      <button
                                        onClick={() => setEditingWordThai(null)}
                                        className="flex-1 py-1 px-2.5 bg-gray-500 text-white text-[10px] font-sans font-black rounded hover:opacity-90 cursor-pointer"
                                      >
                                        CANCEL
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Display layout */
                                  <>
                                    <div>
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-[9px] font-sans font-black text-brand-purple bg-brand-purple-light px-2.5 py-0.5 rounded border border-brand-purple/10 uppercase tracking-widest leading-none">
                                          {item.partOfSpeech}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => handleToggleMasteredWord(item.thai)}
                                            className="p-1 text-amber-400 hover:text-amber-500 rounded hover:bg-amber-50 transition-colors cursor-pointer"
                                            title={isMastered ? "Unmark Mastered" : "Mark Mastered (+10 XP)"}
                                          >
                                            <Star className={`w-4 h-4 ${isMastered ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                                          </button>
                                          <>
                                            <button
                                              onClick={() => {
                                                setEditingWordThai(item.thai);
                                                setEditWordPhonetic(item.phonetic);
                                                setEditWordEnglish(item.english);
                                                setEditWordMyanmar(item.myanmar);
                                                setEditWordPos(item.partOfSpeech);
                                                setEditWordNotes(item.notes || '');
                                              }}
                                              className="p-1 hover:bg-gray-150 rounded text-brand-muted hover:text-brand-dark cursor-pointer transition-colors"
                                              title="Edit Card"
                                            >
                                              <Pencil className="w-3.5 h-3.5 shrink-0" />
                                            </button>
                                            <button
                                              onClick={() => {
                                                const updated = customWords.map(w => {
                                                  if (w.thai === item.thai) {
                                                    return { ...w, isArchived: !w.isArchived };
                                                  }
                                                  return w;
                                                });
                                                setCustomWords(updated);
                                                localStorage.setItem('thai_custom_words_v1', JSON.stringify(updated));
                                                addSystemLog(currentUser || 'User', item.isArchived ? `Restored word "${item.thai}" from Archive` : `Archived * ${item.thai}`);
                                              }}
                                              className={`p-1 rounded cursor-pointer transition-colors ${
                                                item.isArchived ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-muted hover:bg-gray-100 hover:text-brand-dark'
                                              }`}
                                              title={item.isArchived ? "Unarchive / Restore word" : "Archive word"}
                                            >
                                              <Archive className="w-3.5 h-3.5 shrink-0" />
                                            </button>
                                            <button
                                              onClick={() => {
                                                const updated = customWords.filter(w => w.thai !== item.thai);
                                                setCustomWords(updated);
                                                localStorage.setItem('thai_custom_words_v1', JSON.stringify(updated));
                                                addSystemLog(currentUser || 'User', `Removed word "${item.thai}" from Notebook`);
                                              }}
                                              className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                                              title="Delete Card"
                                            >
                                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                            </button>
                                          </>
                                        </div>
                                      </div>

                                      <p className="text-xl sm:text-2xl font-sans font-black text-brand-dark mt-2 tracking-tight select-all leading-none">
                                        {item.thai}
                                      </p>
                                      <div className="text-xs font-mono text-brand-muted mt-1.5 flex items-center gap-1.5 font-bold">
                                        <span>{item.phonetic}</span>
                                        <button
                                          onClick={() => speakText(item.thai)}
                                          className="p-1 bg-gray-50 hover:bg-gray-150 rounded-full text-brand-purple transition-all cursor-pointer"
                                          title="Listen native speak"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 shrink-0" />
                                        </button>
                                      </div>

                                      <div className="mt-3.5 text-xs font-semibold border-t border-gray-50 pt-3 space-y-1.5">
                                        <p className="text-brand-dark leading-tight">
                                          <span className="text-brand-muted text-[10px] font-sans mr-2 uppercase tracking-wide">English:</span>
                                          {item.english}
                                        </p>
                                        <p className="text-brand-purple italic leading-tight">
                                          <span className="text-brand-muted text-[10px] font-sans mr-2 uppercase tracking-wide">Myanmar:</span>
                                          {item.myanmar}
                                        </p>
                                      </div>

                                      {item.notes && (
                                        <div className="bg-gray-50/50 rounded-xl px-3 py-2 mt-3 border border-gray-100 text-[10px] font-semibold text-brand-dark/70 leading-relaxed">
                                          <span className="font-bold underline text-[9px] block mb-0.5 text-brand-muted uppercase">Usage context clue</span>
                                          {item.notes}
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-4 border-t border-brand-light pt-2 text-[8px] font-sans text-brand-muted font-bold tracking-wider uppercase flex items-center gap-1">
                                      👤 Saved by {item.author || "System"}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
 
            {/* TAB CONTENT: My Account / Student Profile Page */}
            {dashboardTab === 'profile' && (
              <div className="max-w-7xl mx-auto space-y-6 min-h-[500px] text-left">
                {/* 1. Account Identity & Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Profile Card */}
                  <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-brand-purple/10 border-2 border-brand-purple flex items-center justify-center font-sans font-black text-2xl text-brand-purple shrink-0">
                          {currentUser ? currentUser.substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <div>
                          <h3 className="font-sans font-black text-brand-dark text-lg capitalize tracking-tight leading-tight">
                            {currentUser || 'Guest Student (ဧည့်သည်တော်)'}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                <Shield className="w-2.5 h-2.5" /> Staff Admin
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                Student Scholar
                              </span>
                            )}
                            <span className="text-[10px] text-brand-muted font-bold font-sans">
                              Joined {isLoggedIn ? 'Recently' : 'Now'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-3 font-sans text-xs">
                        <div className="flex justify-between">
                          <span className="text-brand-muted font-semibold">Account Status:</span>
                          <span className="text-brand-dark font-black uppercase tracking-wider flex items-center gap-1">
                            {isLoggedIn ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-ping"></span>
                                Logged In (အကောင့်ဝင်ပြီး)
                              </>
                            ) : (
                              'Not Registered (ဧည့်သည်)'
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-muted font-semibold">Total XP Reward:</span>
                          <span className="text-brand-purple font-black font-mono text-sm">{progress.totalXp} XP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-muted font-semibold">Current Title:</span>
                          <span className="text-brand-green font-extrabold uppercase">
                            Level {Math.floor(progress.totalXp / 1000) + 1} Thai Scholar
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isLoggedIn ? (
                      <div className="bg-brand-purple-light p-4 rounded-xl border border-brand-purple/20 space-y-3 text-left">
                        <p className="text-[11px] font-semibold text-brand-purple leading-normal">
                          ⚠️ You are viewing as a guest. Please sign up or log in to track your XP, earn dynamic certificates, and order study manuals securely!
                        </p>
                        <button
                          onClick={() => {
                            setAuthTab('student-signup');
                            setShowAuthModal(true);
                          }}
                          className="w-full py-2 bg-brand-purple text-white text-[10px] font-black uppercase tracking-wider rounded-lg border-b-4 border-brand-purple-shadow hover:brightness-105 active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5" /> Complete Registration Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3 text-left">
                          <span className="text-[9.5px] font-sans font-black text-brand-purple uppercase tracking-wider block">
                            Account Profile Details • အချက်အလက်များပြင်ဆင်ရန်
                          </span>
                          
                          <div className="space-y-2 text-[11px]">
                            <div>
                              <label className="block text-[9.5px] text-slate-500 font-bold mb-1">Full Name (အမည်):</label>
                              <input 
                                type="text"
                                value={checkoutName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCheckoutName(val);
                                  setRegisteredUsers(prev => {
                                    const updated = prev.map(u => u.username.toLowerCase() === currentUser.toLowerCase() ? { ...u, fullName: val } : u);
                                    localStorage.setItem('thai_registered_users_list', JSON.stringify(updated));
                                    return updated;
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-150 rounded-lg font-semibold focus:outline-none focus:border-brand-purple text-xs text-slate-800"
                                placeholder="e.g. Nay Min"
                              />
                            </div>

                            <div>
                              <label className="block text-[9.5px] text-slate-500 font-bold mb-1">Phone Number (ဖုန်းနံပါတ်):</label>
                              <input 
                                type="text"
                                value={gatewayPhone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGatewayPhone(val);
                                  setRegisteredUsers(prev => {
                                    const updated = prev.map(u => u.username.toLowerCase() === currentUser.toLowerCase() ? { ...u, phone: val } : u);
                                    localStorage.setItem('thai_registered_users_list', JSON.stringify(updated));
                                    return updated;
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-150 rounded-lg font-semibold focus:outline-none focus:border-brand-purple font-mono text-xs text-slate-800"
                                placeholder="e.g. 09791234567"
                              />
                            </div>

                            <div>
                              <label className="block text-[9.5px] text-slate-500 font-bold mb-1">Email (အီးမေးလ်):</label>
                              <input 
                                type="email"
                                value={gatewayEmail}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGatewayEmail(val);
                                  setRegisteredUsers(prev => {
                                    const updated = prev.map(u => u.username.toLowerCase() === currentUser.toLowerCase() ? { ...u, email: val } : u);
                                    localStorage.setItem('thai_registered_users_list', JSON.stringify(updated));
                                    return updated;
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-150 rounded-lg font-semibold focus:outline-none focus:border-brand-purple text-xs text-slate-800"
                                placeholder="e.g. student@gmail.com"
                              />
                            </div>
                          </div>
                          
                          <div className="text-[8px] text-slate-400 font-bold leading-normal">
                            ✨ These profile details will automatically auto-fill your course checkout form.
                          </div>
                        </div>

                        <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-[10px] font-sans font-bold text-brand-muted leading-relaxed">
                          ✨ Local Session State has been synchronized. All orders and metrics are logged dynamically in local storage.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Columns: User Metrics Dashboard Display */}
                  <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                      <h4 className="font-sans font-black text-brand-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-brand-purple shrink-0" />
                        My Progress • သင်ယူမှုမှတ်တမ်း
                      </h4>
                    </div>

                    {/* Metrics Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/85 text-center">
                        <span className="text-[10px] font-sans text-brand-muted block uppercase font-bold">Lessons Passed</span>
                        <span className="text-2xl font-sans font-black text-brand-dark min-h-8 flex items-center justify-center">
                          {progress.completedLessons.length} / {lessons.length}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div 
                            className="bg-brand-purple h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, lessons.length > 0 ? (progress.completedLessons.length / lessons.length) * 100 : 0)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/85 text-center">
                        <span className="text-[10px] font-sans text-brand-muted block uppercase font-bold">Saved Words</span>
                        <span className="text-2xl font-sans font-black text-brand-purple min-h-8 flex items-center justify-center">
                          {progress.masteredWords.length}
                        </span>
                        <span className="text-[9px] text-brand-muted block leading-none mt-1 font-bold">marked mastered</span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/85 text-center">
                        <span className="text-[10px] font-sans text-brand-muted block uppercase font-bold">Active Streak</span>
                        <span className="text-2xl font-sans font-black text-amber-500 min-h-8 flex items-center justify-center gap-0.5">
                          🔥 {progress.streak} <span className="text-[10px] text-brand-muted">days</span>
                        </span>
                        <span className="text-[9px] text-brand-muted block leading-none mt-1 font-bold">keep practicing!</span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/85 text-center">
                        <span className="text-[10px] font-sans text-brand-muted block uppercase font-bold">Current Level</span>
                        <span className="text-2xl font-sans font-black text-brand-green min-h-8 flex items-center justify-center">
                          LVL {Math.floor(progress.totalXp / 1000) + 1}
                        </span>
                        <span className="text-[9px] text-brand-muted block leading-none mt-1 font-bold">
                          {1000 - (progress.totalXp % 1000)} XP to next
                        </span>
                      </div>
                    </div>

                    {/* Progress Achievements */}
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1 text-left">
                        <Award className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                        🏆 Earned Accolades & Milestones (အောင်မြင်မှုဆုတံဆိပ်များ)
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${progress.completedLessons.length > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/40 border-gray-100 opacity-60'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${progress.completedLessons.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            🎬
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-[11px] font-sans font-black text-brand-dark truncate">First Breakthrough</h6>
                            <p className="text-[9px] text-brand-muted leading-tight font-bold">Completed 1+ lessons.</p>
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${progress.masteredWords.length >= 5 ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/40 border-gray-100 opacity-60'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${progress.masteredWords.length >= 5 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            👑
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-[11px] font-sans font-black text-brand-dark truncate">Vocab Titan</h6>
                            <p className="text-[9px] text-brand-muted leading-tight font-bold">Mastered 5+ words.</p>
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${progress.totalXp >= 1000 ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/40 border-gray-100 opacity-60'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shrink-0 ${progress.totalXp >= 1000 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                            🎖️
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-[11px] font-sans font-black text-brand-dark truncate">Scholar Grade</h6>
                            <p className="text-[9px] text-brand-muted leading-tight font-bold">Earned 1000+ points.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.5. PREMIUM LANGUAGE COURSES ACQUISITION HUB */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-brand-purple/15 shadow-sm space-y-5 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-brand-purple"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-sans font-black text-brand-dark text-xs uppercase tracking-wider flex items-center gap-1.5 text-brand-purple">
                        <Award className="w-4 h-4 shrink-0" />
                        🎓 Premium Thai-Myanmar Language Courses • အွန်လိုင်းတန်းခွဲများ
                      </h4>
                      <p className="text-[10px] font-sans font-semibold text-brand-muted mt-1 leading-relaxed">
                        Improve your fluency quickly! Purchase lifetime-access structured courses with Kru Jane. Secure payments processed instantly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCourseStoreExpanded(!isCourseStoreExpanded)}
                      className="px-3.5 py-1.5 border-2 border-brand-purple/30 bg-[#fbfaff] hover:bg-brand-purple/10 text-brand-purple rounded-xl text-[10px] font-sans font-black flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      {isCourseStoreExpanded ? "HIDE CHANNELS • ဖျောက်ထားရန်" : "VIEW COURSE SILLYABUS • သင်တန်းများကြည့်ရန်"}
                    </button>
                  </div>

                  {isCourseStoreExpanded && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1 animate-fade-in">
                      {courses.map((course) => {
                        const calculatedThb = Math.round(course.priceAmount / 70); // Simulated approximate THB rate
                        return (
                          <div 
                            key={course.id} 
                            className="bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 p-5 rounded-2xl border border-gray-200/90 flex flex-col justify-between space-y-5 relative group"
                          >
                            <div className="space-y-3">
                              {/* Header Card Badges */}
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-brand-purple/10 text-brand-purple">
                                  {course.duration}
                                </span>
                                <span className="text-[10.5px] font-mono font-black text-brand-muted">
                                  ID: {course.id.toUpperCase()}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h5 className="font-sans font-black text-brand-dark text-[14px] leading-tight group-hover:text-brand-purple transition-colors">
                                  {course.name}
                                </h5>
                                <h6 className="font-sans font-extrabold text-[12px] text-brand-purple leading-tight">
                                  {course.nameMm}
                                </h6>
                              </div>

                              <div className="border-t border-gray-150 pt-2.5 text-[9.5px] text-brand-muted font-semibold space-y-1">
                                <div><span className="text-brand-dark font-extrabold">Instructor:</span> {course.instructor}</div>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[10.5px] text-brand-muted leading-relaxed">
                                  {course.description}
                                </p>
                                <p className="text-[10.5px] italic text-brand-dark/85 leading-relaxed font-semibold">
                                  {course.descriptionMm}
                                </p>
                              </div>

                              {/* Included bullet items */}
                              <div className="space-y-1.5 pt-1.5 border-t border-dashed border-gray-200">
                                <span className="text-[8.5px] font-black text-brand-dark uppercase tracking-wider block">Course Resources Included:</span>
                                <div className="space-y-1">
                                  {course.includes.map((inc, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-brand-dark font-semibold">
                                      <Check className="w-3 h-3 text-brand-green bg-brand-green/10 rounded-full p-0.5 shrink-0" />
                                      <span>{inc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Price and CTA */}
                            <div className="border-t border-gray-150 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="text-left">
                                <span className="text-[8px] font-mono text-brand-muted block uppercase font-extrabold leading-none mb-1">Tuition Fee</span>
                                <div className="space-y-0.5">
                                  <span className="text-sm sm:text-base font-black text-brand-purple font-mono block leading-none">
                                    {course.priceAmount.toLocaleString()} MMK
                                  </span>
                                  <span className="text-[10px] text-brand-muted font-mono font-bold block">
                                    ~ {calculatedThb.toLocaleString()} THB (PromptPay)
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  // Parse current student name if logged in
                                  setCheckoutName(currentUser || '');
                                  // Initialize simulated secure checkout terminal state
                                  setGatewayCourse(course);
                                  setGatewayPhone(progress.masteredWords.length > 0 ? "09-791112233" : "09-");
                                  setGatewayEmail(currentUser ? `${currentUser.toLowerCase()}@classroom.edu` : "student@classroom.edu");
                                  setGatewayStep(1);
                                  setGatewayPaymentMethod('kbzpay');
                                  setGatewayOtp('');
                                  setGatewayTimer(180);
                                  setIsGatewayOpen(true);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-purple/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-1"
                              >
                                🎓 Enroll • ဝယ်ယူမည်
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!isCourseStoreExpanded && (
                    <div className="bg-brand-purple/[0.02] p-4 rounded-xl border border-dashed border-brand-purple/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left space-y-1">
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase bg-brand-purple text-white">PROMOTION VALUE</span>
                        <h6 className="text-[12px] font-sans font-black text-brand-dark">Special Interactive Structured Course Modules with Kru Jane</h6>
                        <p className="text-[10px] font-sans font-medium text-brand-muted leading-tight">Complete grammar lessons, native tone guidelines and digital worksheets with dynamic 1-click gateway checkouts.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCourseStoreExpanded(true)}
                        className="px-4 py-2 bg-brand-purple text-white border-b-4 border-brand-purple-shadow rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-105 cursor-pointer transform transition-transform"
                      >
                        Enroll Course Now • သင်တန်းအပ်ရန်
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. PREMIUM RESOURCE STUDY STORE (WHERE USERS PURCHASE ORDERS) */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-left">
                    <div>
                      <h4 className="font-sans font-black text-brand-dark text-xs uppercase tracking-wider flex items-center gap-1.5 text-brand-purple">
                        <ShoppingBag className="w-4 h-4 shrink-0" />
                        Study Resources Store • အပိုဆောင်းလေ့လာရန်
                      </h4>
                    </div>
                  </div>

                  {/* Grid of Store Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storeItems.map((item) => {
                      return (
                        <div key={item.id} className="bg-gray-50/40 hover:bg-gray-50/80 p-4 rounded-xl border border-gray-200/90 flex flex-col justify-between space-y-4 transition-all relative">
                          {item.popular && (
                            <span className="absolute top-2.5 right-2 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-brand-purple text-white">
                              POPULAR • အရောင်းရဆုံး
                            </span>
                          )}
                          <div className="space-y-2 text-left">
                            <div className="flex gap-1.5 text-xs font-sans font-black uppercase text-brand-purple text-left items-center">
                              <span>
                                {item.type === 'e-book' && '📕'}
                                {item.type === 'tutoring' && '🗣️'}
                                {item.type === 'certificate' && '🎖️'}
                                {item.type === 'vip-package' && '⭐'}
                              </span>
                              <span>{item.type}</span>
                            </div>
                            <h5 className="font-sans font-black text-brand-dark text-[13px] leading-snug">
                              {item.name}
                            </h5>
                            <p className="font-sans font-extrabold text-[12px] text-brand-purple/90 leading-tight">
                              {item.nameMm}
                            </p>
                            <p className="text-[10.5px] text-brand-muted leading-relaxed">
                              {item.description}
                            </p>
                            <p className="text-[10.5px] italic text-brand-dark/80 leading-relaxed font-semibold">
                              {item.descriptionMm}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-gray-150 pt-3 flex-wrap gap-2 text-left">
                            <div>
                              <span className="text-[10px] font-mono text-brand-muted block leading-none font-bold">TOTAL VALUE PRICE</span>
                              <span className="text-base font-sans font-black text-brand-purple font-mono">
                                {item.price.toLocaleString()} {item.currency}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                if (!isLoggedIn) {
                                  alert("You must be registered and logged in as a student to purchase resources!");
                                  setAuthTab('student-signup');
                                  setShowAuthModal(true);
                                  return;
                                }
                                if (item.currency === 'XP' && progress.totalXp < item.price) {
                                  alert(`Error: You need at least ${item.price} XP points to redeem this certificate! (You current have ${progress.totalXp} XP)`);
                                  return;
                                }
                                setSelectedStoreItem(item);
                                setCheckoutPhone('');
                                setCheckoutName(currentUser || '');
                                setCheckoutNetwork(item.currency === 'XP' ? 'XP' : 'KBZPay');
                              }}
                              className="px-4 py-2 bg-brand-purple text-white border-b-4 border-brand-purple-shadow rounded-lg text-[10px] font-black uppercase tracking-wider hover:brightness-105 cursor-pointer active:translate-y-0.5"
                            >
                              {item.currency === 'XP' ? 'Redeem with XP' : 'Purchase Order'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Checkout Form Modal/Card */}
                {selectedStoreItem && (
                  <div className="bg-amber-50/40 border-2 border-amber-200 p-5 rounded-2xl space-y-4" id="store-checkout-block">
                    <div className="flex items-start justify-between border-b border-amber-200 pb-2 text-left">
                      <div>
                        <h4 className="font-sans font-black text-brand-dark text-[13px] uppercase tracking-wide flex items-center gap-1 text-amber-800">
                          <CreditCard className="w-4 h-4 text-amber-600 shrink-0" /> Secure Order Checkout Terminal
                        </h4>
                        <p className="text-[10px] text-amber-700/80 font-semibold font-sans">
                          Complete details below to submit your study course order logic.
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedStoreItem(null)} 
                        className="p-1 hover:bg-amber-100 text-amber-800 rounded-full cursor-pointer"
                        title="Cancel Checkout"
                      >
                        <X className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="md:col-span-1 bg-white p-3 rounded-xl border border-amber-200 space-y-2 text-left">
                        <span className="text-[9px] font-black text-brand-purple uppercase tracking-wider block">Selected Package</span>
                        <h5 className="font-sans font-black text-brand-dark text-xs">{selectedStoreItem.name}</h5>
                        <p className="text-[11px] font-sans font-mono font-black text-brand-purple mt-1 text-base">
                          {selectedStoreItem.price.toLocaleString()} {selectedStoreItem.currency}
                        </p>
                        <div className="text-[10px] text-brand-muted leading-relaxed font-semibold">
                          Once confirmed, a "Pending Approval" state will appear in your Order Ledger. Logged administrators will instantly review the transaction.
                        </div>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const id = "ORD-" + Math.floor(10000 + Math.random() * 90000);
                        
                        // If payment currency is XP
                        if (selectedStoreItem.currency === 'XP') {
                          if (progress.totalXp < selectedStoreItem.price) {
                            alert("Insufficient XP balance!");
                            return;
                          }
                          // Deduct XP
                          const nextXp = progress.totalXp - selectedStoreItem.price;
                          saveProgress({ ...progress, totalXp: nextXp });
                        }

                        const newOrder: PurchaseOrder = {
                          id,
                          username: currentUser || 'Anonymous',
                          itemName: selectedStoreItem.name,
                          itemType: selectedStoreItem.type,
                          priceAmount: selectedStoreItem.price,
                          currency: selectedStoreItem.currency,
                          status: 'pending',
                          orderDate: new Date().toISOString().split('T')[0]
                        };

                        const nextOrders = [newOrder, ...orders];
                        setOrders(nextOrders);
                        addSystemLog(currentUser || 'User', `Ordered package "${selectedStoreItem.name}" (ID: ${id})`);
                        setSelectedStoreItem(null);
                        alert(`Your order ${id} has been submitted successfully!\nAdmin is checking the transaction details.`);
                      }} className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                            Student Name / Contact
                          </label>
                          <input
                            type="text"
                            required
                            value={checkoutName}
                            onChange={(e) => setCheckoutName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                            placeholder="e.g. ko_nay_min"
                          />
                        </div>

                        {selectedStoreItem.currency !== 'XP' ? (
                          <>
                            <div>
                              <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                                Mobile Wallet Phone Number (Myanmar)
                              </label>
                              <input
                                type="text"
                                required
                                value={checkoutPhone}
                                onChange={(e) => setCheckoutPhone(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-mono font-bold text-brand-dark focus:border-brand-purple focus:outline-none"
                                placeholder="e.g. 09-987654321 / 09-791234567"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                                Myanmar Mobile Payment System
                              </label>
                              <select
                                value={checkoutNetwork}
                                onChange={(e) => setCheckoutNetwork(e.target.value)}
                                className="w-full px-2.5 py-2 bg-white border border-amber-200 rounded-lg text-[10px] font-black font-sans text-brand-purple focus:border-brand-purple focus:outline-none"
                              >
                                <option value="KBZPay">KBZPay Wallet Merchant (09987654321)</option>
                                <option value="WavePay">WavePay Mobile Wallet (09791234567)</option>
                                <option value="CBPay">CBPay Fast App Transfer</option>
                                <option value="AYAPay">AYA Pay Secure Pay</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <div className="sm:col-span-1 bg-amber-100/20 p-2.5 rounded-lg border border-amber-200 text-[10px] text-amber-800 font-bold leading-normal">
                            Redeeming with XP! This purchase will deduct {selectedStoreItem.price} XP directly from your registered progress balance!
                          </div>
                        )}

                        <div className="sm:col-span-2 flex justify-end pt-2">
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-brand-purple text-white border-b-4 border-brand-purple-shadow rounded-lg text-[10.5px] font-black uppercase tracking-wider hover:brightness-105 active:translate-y-0.5 cursor-pointer"
                          >
                            Submit Order Purchase • ဝယ်ယူမှုအတည်ပြုမည်
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 3. STUDENT LEDGER/ORDERS HISTORY PREVIEW */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                    <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-brand-purple shrink-0" />
                      📜 Personal Purchase Ledger & Order Compliance ({currentUser ? orders.filter(o => o.username.toLowerCase() === currentUser.toLowerCase()).length : 0})
                    </h4>
                    {isLoggedIn && orders.filter(o => o.username.toLowerCase() === (currentUser || '').toLowerCase()).length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadOrdersAsJSON(orders.filter(o => o.username.toLowerCase() === (currentUser || '').toLowerCase()))}
                          className="px-2.5 py-1.5 bg-gray-50 text-brand-dark hover:bg-brand-purple/5 border border-gray-200 hover:border-brand-purple rounded-xl text-[10px] sm:text-[10.5px] font-sans font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0"
                          title="Download my purchase history as structured JSON"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-purple" />
                          Download JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadOrdersAsCSV(orders.filter(o => o.username.toLowerCase() === (currentUser || '').toLowerCase()))}
                          className="px-2.5 py-1.5 bg-gray-50 text-brand-dark hover:bg-brand-purple/5 border border-gray-200 hover:border-brand-purple rounded-xl text-[10px] sm:text-[10.5px] font-sans font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0"
                          title="Download my purchase history as a CSV spreadsheet"
                        >
                          <Download className="w-3.5 h-3.5 text-[#00875a]" />
                          Download CSV
                        </button>
                      </div>
                    )}
                  </div>

                  {!isLoggedIn ? (
                    <div className="text-center py-6 text-xs text-brand-muted font-sans font-bold">
                      Please register an account above to track your transaction logs.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="w-full text-left font-sans text-xs">
                        <thead className="bg-gray-50/70">
                          <tr className="border-b border-gray-100 text-brand-muted text-[10px] font-black uppercase tracking-wider">
                            <th className="py-2.5 px-3">ORDER ID</th>
                            <th className="py-2.5 px-3">ITEM DESCRIPTION</th>
                            <th className="py-2.5 px-3">DATE PLACED</th>
                            <th className="py-2.5 px-3">METHOD VALUE</th>
                            <th className="py-2.5 px-3 text-right">STATUS BADGE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.filter(o => o.username.toLowerCase() === currentUser.toLowerCase()).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-brand-muted font-bold">
                                No previous orders exist on your student account. Click "Purchase Order" above to purchase!
                              </td>
                            </tr>
                          ) : (
                            orders
                              .filter(o => o.username.toLowerCase() === currentUser.toLowerCase())
                              .map((ord) => (
                                <tr 
                                  key={ord.id} 
                                  onClick={() => setSelectedDetailOrder(ord)}
                                  className="hover:bg-brand-purple/5 transition-all cursor-pointer group"
                                  title="Click to view order payment details & admin notes"
                                >
                                  <td className="py-3 px-3 font-mono font-black text-brand-purple group-hover:underline">{ord.id}</td>
                                  <td className="py-3 px-3 font-bold text-brand-dark text-[11px]">{ord.itemName}</td>
                                  <td className="py-3 px-3 text-brand-muted font-bold">{ord.orderDate}</td>
                                  <td className="py-3 px-3 font-mono font-black text-brand-dark">
                                    {ord.priceAmount.toLocaleString()} {ord.currency}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {ord.status === 'pending' ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                          Pending Admin
                                        </span>
                                      ) : ord.status === 'completed' ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                                          Approved / Sent
                                        </span>
                                      ) : (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-50 text-red-700 border border-red-200">
                                          Cancelled
                                        </span>
                                      )}
                                      <button className="px-2 py-0.5 text-[9px] font-bold text-brand-purple bg-brand-purple/10 rounded group-hover:bg-brand-purple group-hover:text-white transition-colors cursor-pointer">
                                        View
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. Admin Panel */}
            {isAdmin && dashboardTab === 'admin' && (
              <div className="max-w-7xl mx-auto space-y-6 min-h-[500px]">
                <div className="bg-brand-dark text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans font-black text-xl sm:text-2xl mb-1 uppercase tracking-tight flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400 fill-amber-400/10 shrink-0" />
                      🛡️ Administrator Control Console
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 font-sans font-semibold">
                      Control app announcements, review user logs, and audit student databases and custom wordlists.
                    </p>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-gray-200 h-fit self-start sm:self-auto font-black uppercase">
                    Status: Root Authorized
                  </div>
                </div>

                {/* COMBINED: Core Student Register & Purchase Ledger Hub */}
                <div id="student-commerce-ledger-hub" className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden text-left shadow-xs">
                  {/* Tab/Indicator Selector bar */}
                  <div className="bg-gradient-to-r from-brand-dark to-[#1d232a] text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                    <div>
                      <h4 className="font-sans font-black text-sm sm:text-base uppercase tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-purple shrink-0" />
                        👥 Students & Commerce Hub • ကျောင်းသားရေးရာနှင့် အော်ဒါစီမံမှု
                      </h4>
                      <p className="text-[11px] text-gray-400 font-sans font-semibold mt-1">
                        Unified directory for student accounts management, progress level checks, and checkout transaction auditing.
                      </p>
                    </div>

                    {/* Segmented controls button */}
                    <div className="bg-white/10 p-1.5 rounded-xl border border-white/10 flex flex-wrap items-center gap-1.5 w-full md:w-auto self-start md:self-auto select-none">
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('orders')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'orders'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Purchase Orders ({orders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('accounts')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'accounts'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Student Directory ({registeredUsers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('courses')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'courses'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Course Manager ({courses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('store')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'store'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Study Store ({storeItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('orientation')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'orientation'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Orientation Articles ({orientationData.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('grammar')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'grammar'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Grammar Handbook ({grammarChapters.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminHubTab('brand')}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10.5px] font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          adminHubTab === 'brand'
                            ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple-shadow'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        Brand & Theme
                      </button>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-6">
                    {/* SUB-SECTION 1: PURCHASE ORDERS */}
                    {adminHubTab === 'orders' && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                          <div>
                            <h5 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5">
                              📋 Student Purchase Orders Manager (ကျောင်းသားများ ဝယ်ယူမှုအော်ဒါများ)
                            </h5>
                            <p className="text-[10px] text-brand-muted font-sans font-semibold mt-1">
                              Review, audit, Approve or cancel client transactions submitted from study resource store checkout.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => downloadOrdersAsJSON(orders, `all_student_orders_ledger_${new Date().toISOString().split('T')[0]}.json`)}
                              className="px-3 py-1.5 bg-white text-brand-dark hover:bg-brand-purple/5 border border-gray-200 hover:border-brand-purple rounded-xl text-[10px] sm:text-[10.5px] font-sans font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-3xs"
                              title="Download all purchase orders as structured JSON"
                            >
                              <Download className="w-3.5 h-3.5 text-brand-purple" />
                              Export JSON
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadOrdersAsCSV(orders, `all_student_orders_ledger_${new Date().toISOString().split('T')[0]}.csv`)}
                              className="px-3 py-1.5 bg-white text-brand-dark hover:bg-brand-purple/5 border border-gray-200 hover:border-brand-purple rounded-xl text-[10px] sm:text-[10.5px] font-sans font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-3xs"
                              title="Download all purchase orders as a CSV spreadsheet"
                            >
                              <Download className="w-3.5 h-3.5 text-[#00875a]" />
                              Export CSV
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm("Restore demo mock transactions?")) {
                                  const initialOrders: PurchaseOrder[] = [
                                    {
                                      id: "ORD-99321",
                                      username: "ko_nay_min",
                                      itemName: "🗣️ 1-on-1 Practice Speaking Session with Kru Jane (1 Hour Zoom)",
                                      itemType: "tutoring",
                                      priceAmount: 45000,
                                      currency: "MMK",
                                      status: "completed",
                                      orderDate: "2026-06-10",
                                      studentPhone: "09-771234567",
                                      studentEmail: "konaymin@gmail.com",
                                      adminNotes: "Session scheduled with Kru Jane. Zoom link dispatched to student mail/viber pipeline."
                                    },
                                    {
                                      id: "ORD-99322",
                                      username: "ma_khine",
                                      itemName: "📕 Advanced Thai-Myanmar Grammar Manual (Printed E-Book)",
                                      itemType: "e-book",
                                      priceAmount: 25000,
                                      currency: "MMK",
                                      status: "pending",
                                      orderDate: "2026-06-13",
                                      studentPhone: "09-445890123",
                                      studentEmail: "makhineoo@viber-me.com",
                                      evidenceImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='500' viewBox='0 0 300 500'><rect width='300' height='500' fill='%230056B3'/><rect x='15' y='15' width='270' height='470' rx='20' fill='white'/><circle cx='150' cy='80' r='30' fill='%2328A745'/><path d='M140 80 l7 7 l13 -13' fill='none' stroke='white' stroke-width='4'/><text x='150' y='135' font-family='sans-serif' font-size='16' font-weight='bold' fill='%2328A745' text-anchor='middle'>KPay Verification</text><text x='150' y='160' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23333333' text-anchor='middle'>- 25,000 MMK</text><line x1='30' y1='185' x2='270' y2='185' stroke='%23EEEEEE' stroke-width='2'/><text x='35' y='210' font-family='sans-serif' font-size='11' fill='%23777777'>Transaction ID</text><text x='265' y='210' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>TXN7784013920</text><text x='35' y='245' font-family='sans-serif' font-size='11' fill='%23777777'>Sender</text><text x='265' y='245' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>Ma Khine</text><text x='35' y='280' font-family='sans-serif' font-size='11' fill='%23777777'>Recipient</text><text x='265' y='280' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>Kru Jane Thai School</text><text x='35' y='315' font-family='sans-serif' font-size='11' fill='%23777777'>Date &amp; Time</text><text x='265' y='315' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23333333' text-anchor='end'>2026-06-13 14:15</text><line x1='30' y1='345' x2='270' y2='345' stroke='%23EEEEEE' stroke-width='2'/><rect x='30' y='370' width='240' height='70' rx='10' fill='%23F8F9FA'/><text x='150' y='398' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23666666' text-anchor='middle'>Payment Channel: KBZPay Myanmar</text><text x='150' y='418' font-family='sans-serif' font-size='10' fill='%23999999' text-anchor='middle'>Reference: KBZ-PRINT-THAI</text></svg>"
                                    }
                                  ];
                                  setOrders(initialOrders);
                                  addSystemLog('admin', 'Seeded demo simulated purchase orders ledger');
                                }
                              }}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-sans font-black text-brand-dark rounded-lg cursor-pointer flex items-center gap-1 hover:brightness-95 transition-all text-[10px]"
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-0.5 text-brand-muted" />
                              SEED DEFAULT ORDERS
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/25">
                          <table className="w-full text-left font-sans text-xs">
                            <thead className="bg-gray-50/75 border-b border-gray-100">
                              <tr className="text-brand-muted text-[9px] font-black uppercase tracking-wider">
                                <th className="py-2.5 px-3">ORDER ID</th>
                                <th className="py-2.5 px-3">USERNAME</th>
                                <th className="py-2.5 px-3">PACKAGE DESCRIPTION</th>
                                <th className="py-2.5 px-3">DATE PLACED</th>
                                <th className="py-2.5 px-3">METHOD TOTAL</th>
                                <th className="py-2.5 px-3">STATUS</th>
                                <th className="py-2.5 px-3 text-right">ADMIN ACTIONS</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-sans">
                              {orders.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="py-12 text-center text-brand-muted font-bold text-sm">
                                    No purchase orders currently submitted in system memory.
                                  </td>
                                </tr>
                              ) : (
                                orders.map((ord) => (
                                  <tr 
                                    key={ord.id} 
                                    onClick={() => setSelectedDetailOrder(ord)}
                                    className="hover:bg-amber-50/10 cursor-pointer transition-all group"
                                    title="Click to view full order details, screenshot slip, and write notes"
                                  >
                                    <td className="py-3 px-3 font-mono font-black text-brand-purple group-hover:underline">{ord.id}</td>
                                    <td className="py-3 px-3 font-bold text-brand-dark">{ord.username}</td>
                                    <td className="py-3 px-3 font-semibold text-brand-dark text-[11px]">{ord.itemName}</td>
                                    <td className="py-3 px-3 text-brand-muted font-bold">{ord.orderDate}</td>
                                    <td className="py-3 px-3 font-mono font-black text-brand-dark">
                                      {ord.priceAmount.toLocaleString()} {ord.currency}
                                    </td>
                                    <td className="py-3 px-3">
                                      {ord.status === 'pending' ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-205">
                                          Pending Review
                                        </span>
                                      ) : ord.status === 'completed' ? (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-green-50 text-green-700 border border-green-205">
                                          Completed
                                        </span>
                                      ) : (
                                        <span className="inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-red-50 text-red-700 border border-red-205">
                                          Cancelled
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex gap-1 justify-end items-center">
                                        <button
                                          onClick={() => setSelectedDetailOrder(ord)}
                                          className="px-2 py-1 bg-brand-purple/10 text-brand-purple font-sans font-bold text-[9.5px] uppercase rounded-lg hover:bg-brand-purple hover:text-white transition-all cursor-pointer"
                                        >
                                          Details
                                        </button>
                                        {ord.status === 'pending' && (
                                          <>
                                            <button
                                              onClick={() => {
                                                setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'completed' } : o));
                                                addSystemLog('admin', `Approved purchase of "${ord.itemName}" by "${ord.username}"`);
                                              }}
                                              className="px-2.5 py-1 bg-brand-green text-white text-[9.5px] font-black uppercase rounded-lg hover:opacity-90 cursor-pointer shadow-3xs"
                                              title="Mark order as Completed"
                                            >
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => {
                                                setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'cancelled' } : o));
                                                addSystemLog('admin', `Denied and Cancelled order "${ord.id}"`);
                                              }}
                                              className="px-2.5 py-1 bg-red-500 text-white text-[9.5px] font-black uppercase rounded-lg hover:opacity-90 cursor-pointer shadow-3xs"
                                              title="Reject order"
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        )}
                                        {ord.status !== 'pending' && (
                                          <span className="text-[10px] text-brand-muted italic font-bold">Processed</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION 2: REGISTERED ACCOUNTS */}
                    {adminHubTab === 'accounts' && (
                      <div className="space-y-6 animate-fade-in" id="admin-accounts-tab-view">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Create account form block */}
                          <div className="lg:col-span-5 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-150 space-y-4">
                            <h5 className="text-xs font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                              Create Student / Admin Account
                            </h5>
                            <p className="text-[10px] text-brand-muted font-sans font-semibold leading-relaxed">
                              Manually add pre-configured login credentials for custom testing or manual student profile onboarding.
                            </p>

                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const cleanUser = adminNewUserUsername.trim();
                              const cleanPassword = adminNewUserPassword.trim();
                              if (!cleanUser || !cleanPassword) {
                                alert("Username and password are required.");
                                return;
                              }
                              const alreadyHas = registeredUsers.some(u => u.username.toLowerCase() === cleanUser.toLowerCase()) || cleanUser.toLowerCase() === 'admin';
                              if (alreadyHas) {
                                alert("This username is already taken!");
                                return;
                              }
                              const newUser: RegisteredUser = {
                                username: cleanUser,
                                password: cleanPassword,
                                role: adminNewUserRole,
                                xp: adminNewUserRole === 'student' ? 0 : 5000,
                                dateJoined: new Date().toISOString().split('T')[0]
                              };
                              const updated = [...registeredUsers, newUser];
                              setRegisteredUsers(updated);
                              localStorage.setItem('thai_registered_users_list', JSON.stringify(updated));
                              addSystemLog('admin', `Created a new ${adminNewUserRole.toUpperCase()} account for "${cleanUser}"`);
                              setAdminNewUserUsername('');
                              setAdminNewUserPassword('');
                              alert(`Account successfully created!\nUsername: ${cleanUser}\nRole: ${adminNewUserRole.toUpperCase()}`);
                            }} className="space-y-3 pt-1 text-left">
                              <div>
                                <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">Username</label>
                                <input
                                  type="text"
                                  placeholder="e.g. ko_phyo"
                                  value={adminNewUserUsername}
                                  onChange={(e) => setAdminNewUserUsername(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">Password</label>
                                <input
                                  type="text"
                                  placeholder="Enter clean password"
                                  value={adminNewUserPassword}
                                  onChange={(e) => setAdminNewUserPassword(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">Assigned Role</label>
                                <select
                                  value={adminNewUserRole}
                                  onChange={(e) => setAdminNewUserRole(e.target.value as 'student' | 'admin')}
                                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-black font-sans text-brand-purple focus:border-brand-purple focus:outline-none cursor-pointer"
                                >
                                  <option value="student">STUDENT (ကျောင်းသားရှုထောင့်)</option>
                                  <option value="admin">ADMIN CONTROL (စီမံသူရှုထောင့်)</option>
                                </select>
                              </div>
                              <button
                                type="submit"
                                className="w-full py-3 bg-brand-purple hover:bg-brand-purple/95 text-white rounded-xl border-b-4 border-brand-purple-shadow text-[11px] font-sans font-black hover:brightness-105 active:translate-y-0.5 cursor-pointer uppercase tracking-wider transition-all pt-3 flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Account Securely
                              </button>
                            </form>
                          </div>

                          {/* List of registered users directory cards */}
                          <div className="lg:col-span-7 space-y-3.5 flex flex-col justify-between text-left">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h6 className="text-[11px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Current Register List ({registeredUsers.length} Users)
                                </h6>
                                <button
                                  onClick={() => {
                                    const confirmReset = window.confirm("Are you sure you want to reset user table? (Will reset to standard entries)");
                                    if (confirmReset) {
                                      const initialUsers: RegisteredUser[] = [
                                        { username: "ko_nay_min", password: "password123", role: "student", xp: 1250, dateJoined: "2026-05-12", fullName: "Ko Nay Min", phone: "09-771234567", email: "naymin@gmail.com" },
                                        { username: "ma_khine", password: "password123", role: "student", xp: 820, dateJoined: "2026-06-01", fullName: "Ma Khine Oo", phone: "09-445890123", email: "makhineoo@viber-me.com" },
                                        { username: "phyo_wai", password: "password123", role: "student", xp: 450, dateJoined: "2026-06-10", fullName: "Phyo Wai Tun", phone: "09-221345566", email: "phyowai@gmail.com" },
                                        { username: "admin_thura", password: "adminpassword", role: "admin", xp: 5000, dateJoined: "2026-06-05" }
                                      ];
                                      setRegisteredUsers(initialUsers);
                                      localStorage.setItem('thai_registered_users_list', JSON.stringify(initialUsers));
                                      addSystemLog('admin', 'Reset student user directory catalog to factory seed');
                                    }
                                  }}
                                  className="text-[9.5px] font-sans font-black text-brand-purple hover:underline flex items-center gap-1 cursor-pointer select-none"
                                >
                                  <RefreshCw className="w-3 text-brand-purple" />
                                  RESET TO DEFAULT USERS
                                </button>
                              </div>

                              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 bg-gray-50/30 p-2 border border-gray-100 rounded-xl">
                                {registeredUsers.map((usr, i) => (
                                  <div key={i} className="bg-white p-3 rounded-xl border border-gray-110 flex items-center justify-between gap-3 shadow-3xs hover:border-gray-205 transition-all text-left">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-sans font-black text-brand-dark text-xs">{usr.username}</span>
                                        {usr.role === 'admin' ? (
                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 select-none">
                                            <Shield className="w-2 h-2" /> Admin
                                          </span>
                                        ) : (
                                          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200 select-none">
                                            Student
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-brand-muted font-sans space-y-0.5 font-semibold">
                                        <p>Password: <code className="bg-gray-50 text-brand-dark px-1 py-0.5 rounded font-mono font-bold text-brand-dark">{usr.password || 'password123'}</code></p>
                                        {usr.fullName && <p>Full Name: <span className="text-brand-dark font-extrabold">{usr.fullName}</span></p>}
                                        {usr.phone && <p>Phone: <span className="text-brand-dark font-mono font-bold">{usr.phone}</span></p>}
                                        {usr.email && <p>Email: <span className="text-slate-600 font-medium">{usr.email}</span></p>}
                                        <p>Progress: <span className="text-brand-purple font-black font-mono">{usr.role === 'admin' ? '—' : `${usr.xp} XP (LVL ${Math.floor(usr.xp / 1000) + 1})`}</span></p>
                                        <p>Joined: <span className="text-gray-500 font-mono font-bold">{usr.dateJoined}</span></p>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => {
                                        const confirmed = window.confirm(`Are you sure you want to delete the user account "${usr.username}"? This cannot be undone.`);
                                        if (confirmed) {
                                          setRegisteredUsers((prev) => {
                                            const updated = prev.filter(u => u.username !== usr.username);
                                            localStorage.setItem('thai_registered_users_list', JSON.stringify(updated));
                                            return updated;
                                          });
                                          addSystemLog('admin', `Deregistered account of "${usr.username}"`);
                                        }
                                      }}
                                      className="p-2.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl cursor-pointer transition-all border border-transparent hover:border-red-100 flex items-center justify-center shrink-0"
                                      title="Delete Account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION 3: COURSE MANAGER */}
                    {adminHubTab === 'courses' && (
                      <div className="space-y-6 animate-fade-in" id="admin-courses-tab-view">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                          {/* Course List Panel */}
                          <div className="lg:col-span-5 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-150 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 shrink-0 text-brand-purple" />
                                Course Catalog ({courses.length})
                              </h5>
                              <div className="relative">
                                <select
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'course') {
                                      setCourseIsNew(true);
                                      setCourseNewIdStr('');
                                      setCourseFormName('');
                                      setCourseFormNameMm('');
                                      setCourseFormPrice(35000);
                                      setCourseFormDuration('6 Weeks (Self-paced)');
                                      setCourseFormDescription('');
                                      setCourseFormDescriptionMm('');
                                      setCourseFormInstructor('Kru Jane & Sayar Thura');
                                      
                                      setTimeout(() => {
                                        const el = document.getElementById("admin-course-form-panel");
                                        if (el) {
                                          el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                      }, 50);
                                    } else if (val === 'resource') {
                                      if (courseIsNew) {
                                        setCourseIsNew(false);
                                        setAdminSelectedCourseId('course-basic');
                                      }
                                      setEditingResourceId(null);
                                      setResourceFormName('');
                                      setResourceFormNameMm('');
                                      setResourceFormUrl('');
                                      setResourceFormPrice(0);
                                      setResourceFormType('free');
                                      
                                      setTimeout(() => {
                                        const el = document.getElementById("admin-resource-form-section");
                                        if (el) {
                                          el.scrollIntoView({ behavior: 'smooth' });
                                          const input = el.querySelector('input');
                                          if (input) input.focus();
                                        }
                                      }, 150);
                                    }
                                    e.target.value = '';
                                  }}
                                  className="px-2 py-1.5 bg-brand-purple hover:bg-brand-purple/95 text-white text-[9px] font-black uppercase rounded-lg hover:brightness-105 active:translate-y-0.5 cursor-pointer outline-none border-t-0 border-r-0 border-l-0 border-b-4 border-brand-purple-shadow shadow-3xs font-sans text-center"
                                  defaultValue=""
                                >
                                  <option value="" disabled className="bg-white text-slate-800 text-[10px] font-sans font-bold">➕ CREATE...</option>
                                  <option value="course" className="bg-white text-slate-800 text-[10px] font-sans font-semibold text-left">📚 Course</option>
                                  <option value="resource" className="bg-white text-[#583092] text-[10px] font-sans font-semibold text-left">📕 eBook Resource</option>
                                </select>
                              </div>
                            </div>

                            <p className="text-[10px] text-brand-muted font-sans font-semibold leading-relaxed">
                              Configure core premium language tracks that students can enroll in or purchase dynamically from their screens.
                            </p>

                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                              {courses.map((course) => {
                                const isSelected = !courseIsNew && adminSelectedCourseId === course.id;
                                return (
                                  <div
                                    key={course.id}
                                    onClick={() => {
                                      setCourseIsNew(false);
                                      setAdminSelectedCourseId(course.id);
                                      setCourseFormName(course.name);
                                      setCourseFormNameMm(course.nameMm);
                                      setCourseFormPrice(course.priceAmount);
                                      setCourseFormDuration(course.duration);
                                      setCourseFormDescription(course.description || '');
                                      setCourseFormDescriptionMm(course.descriptionMm || '');
                                      setCourseFormInstructor(course.instructor || '');
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-3xs ${
                                      isSelected
                                        ? 'bg-brand-purple/5 border-brand-purple'
                                        : 'bg-white border-gray-150 hover:border-gray-250'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <h6 className="font-sans font-black text-brand-dark text-[11px] leading-snug">
                                        {course.name}
                                      </h6>
                                      <p className="text-[9px] text-[#583092] font-semibold italic">
                                        {course.nameMm}
                                      </p>
                                      <div className="text-[9px] text-brand-muted font-sans font-bold flex flex-wrap gap-x-2">
                                        <span>⏱️ {course.duration}</span>
                                        <span>•</span>
                                        <span className="text-brand-purple font-mono">{course.priceAmount.toLocaleString()} MMK</span>
                                      </div>
                                    </div>

                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (course.id === 'course-basic') {
                                            alert("The foundational Course (course-basic) is required for system routing and cannot be deleted.");
                                            return;
                                          }
                                          const confirmDel = window.confirm(`Permanently delete the course "${course.name}"? All lessons assigned to it will fallback to Basic Course.`);
                                          if (confirmDel) {
                                            const updated = courses.filter(c => c.id !== course.id);
                                            setCourses(updated);
                                            addSystemLog('admin', `Permanently deleted course "${course.name}"`);
                                            
                                            // Reassign lessons
                                            setLessons(prev => prev.map(l => l.courseId === course.id ? { ...l, courseId: 'course-basic' } : l));
                                            
                                            if (adminSelectedCourseId === course.id) {
                                              setAdminSelectedCourseId('course-basic');
                                              setCourseIsNew(false);
                                            }
                                            if (selectedCourseTab === course.id) {
                                              setSelectedCourseTab('course-basic');
                                            }
                                          }
                                        }}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100"
                                        title="Delete Course"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Course Form Editor Panel */}
                          <div id="admin-course-form-panel" className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border-2 border-gray-100 space-y-4 scroll-mt-20">
                            <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 text-brand-purple">
                              <Pencil className="w-4 h-4 text-brand-purple" />
                              {courseIsNew ? "Create New Language Course" : `Edit Course Details`}
                            </h5>
                            
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!courseFormName.trim() || !courseFormDuration.trim() || !courseFormInstructor.trim()) {
                                  alert("Please fill in all core course fields before publishing.");
                                  return;
                                }

                                if (courseIsNew) {
                                  const rawId = courseNewIdStr.trim();
                                  if (!rawId) {
                                    alert("Course ID is required.");
                                    return;
                                  }
                                  const cleanId = rawId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
                                  if (!cleanId.startsWith("course-")) {
                                    alert("Highly recommended to prefix course IDs with 'course-' (e.g. course-fluent-thai).");
                                  }
                                  if (courses.some(c => c.id === cleanId)) {
                                    alert("This Course ID is already taken. Choose a unique keyword.");
                                    return;
                                  }

                                  const created: Course = {
                                    id: cleanId,
                                    name: courseFormName.trim(),
                                    nameMm: courseFormNameMm.trim() || courseFormName.trim(),
                                    priceAmount: Number(courseFormPrice) || 0,
                                    currency: 'MMK',
                                    duration: courseFormDuration.trim(),
                                    description: courseFormDescription.trim(),
                                    descriptionMm: courseFormDescriptionMm.trim(),
                                    instructor: courseFormInstructor.trim()
                                  };

                                  const updated = [...courses, created];
                                  setCourses(updated);
                                  setAdminSelectedCourseId(cleanId);
                                  setCourseIsNew(false);
                                  addSystemLog('admin', `Created a brand new Language Course: "${created.name}"`);
                                  alert("Course successfully published to students!");
                                } else {
                                  const updated = courses.map(c => {
                                    if (c.id === adminSelectedCourseId) {
                                      return {
                                        ...c,
                                        name: courseFormName.trim(),
                                        nameMm: courseFormNameMm.trim() || courseFormName.trim(),
                                        priceAmount: Number(courseFormPrice) || 0,
                                        duration: courseFormDuration.trim(),
                                        description: courseFormDescription.trim(),
                                        descriptionMm: courseFormDescriptionMm.trim(),
                                        instructor: courseFormInstructor.trim()
                                      };
                                    }
                                    return c;
                                  });
                                  setCourses(updated);
                                  addSystemLog('admin', `Updated details for Course: "${courseFormName}"`);
                                  alert("Changes synced successfully!");
                                }
                              }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                            >
                              {courseIsNew && (
                                <div className="sm:col-span-2 space-y-1 text-left">
                                  <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                    Course ID Key (Unique identifier - No spaces, lowercase only)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. course-advanced-grammar"
                                    value={courseNewIdStr}
                                    onChange={(e) => setCourseNewIdStr(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold font-sans text-brand-purple focus:border-brand-purple focus:outline-none transition-all placeholder-gray-300"
                                    required
                                  />
                                </div>
                              )}

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Course Display Name (English)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Advanced Thai Writing Skills"
                                  value={courseFormName}
                                  onChange={(e) => setCourseFormName(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all placeholder-gray-300"
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-[#583092] uppercase tracking-wider">
                                  အတန်းအမည် (မြန်မာအသံထွက် / စာသား)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. ထိုင်းစာ ရေးသားခြင်း လက်တွေ့အဆင့်မြင့်တန်း"
                                  value={courseFormNameMm}
                                  onChange={(e) => setCourseFormNameMm(e.target.value)}
                                  className="w-full px-3 py-2 bg-[#fdfbfe] border border-[#f0ebf7] rounded-xl text-xs font-sans font-extrabold text-[#583092] focus:border-brand-purple focus:outline-none transition-all placeholder-gray-300"
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Price Amount (MMK)
                                </label>
                                <input
                                  type="number"
                                  value={courseFormPrice}
                                  onChange={(e) => setCourseFormPrice(Number(e.target.value))}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono font-black text-brand-purple focus:border-brand-purple focus:outline-none transition-all"
                                  min={0}
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Duration Period
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 6 Weeks (Self-paced)"
                                  value={courseFormDuration}
                                  onChange={(e) => setCourseFormDuration(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left sm:col-span-2">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Active Instructor(s)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Kru Jane & Sayar Thura"
                                  value={courseFormInstructor}
                                  onChange={(e) => setCourseFormInstructor(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left sm:col-span-2">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Syllabus Outline Description (English)
                                </label>
                                <textarea
                                  placeholder="Provide descriptive details of topic items coverage..."
                                  value={courseFormDescription}
                                  onChange={(e) => setCourseFormDescription(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                />
                              </div>

                              <div className="space-y-1 text-left sm:col-span-2">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  သင်တန်း အတိုချုံး ဖော်ပြချက် (မြန်မာဘာသာ)
                                </label>
                                <textarea
                                  placeholder="ကျောင်းသားများ မြင်တွေ့ရမည့် မြန်မာဘာသာ အတန်းဖော်ပြချက်..."
                                  value={courseFormDescriptionMm}
                                  onChange={(e) => setCourseFormDescriptionMm(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                />
                              </div>

                              <div className="sm:col-span-2 pt-2 text-left">
                                <button
                                  type="submit"
                                  className="w-full py-3 bg-brand-purple hover:bg-brand-purple/95 text-white border-b-4 border-brand-purple-shadow text-[11px] font-sans font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                                >
                                  <CheckSquare className="w-4 h-4 shrink-0" />
                                  {courseIsNew ? "Publish Language Course" : "Sync Course Details"}
                                </button>
                              </div>
                            </form>

                            {!courseIsNew && (() => {
                              const activeCourse = courses.find(c => c.id === adminSelectedCourseId);
                              return (
                                <div className="border-t border-gray-150 pt-5 mt-6 text-left space-y-4">
                                  <div className="p-4 bg-slate-50/70 border border-slate-200/85 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <h6 className="text-[11px] font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                                        <span>📕 Course Companion eBooks & Resource Links ({activeCourse?.resources?.length || 0})</span>
                                      </h6>
                                      <span className="text-[8.5px] bg-brand-purple/10 text-brand-purple font-sans font-black px-2 py-0.5 rounded-lg uppercase">
                                        Course Material Panel
                                      </span>
                                    </div>

                                    <p className="text-[9.5px] text-brand-muted leading-relaxed font-sans font-semibold">
                                      Include high quality PDF workbooks, vocabulary handbooks, letters manuals, or worksheet links specifically for students studying <b>{courseFormName}</b>. Give students two options: download directly or purchase separate premium eBooks before unlocking!
                                    </p>

                                    {/* List current Resources */}
                                    <div className="space-y-2">
                                      {(!activeCourse?.resources || activeCourse.resources.length === 0) ? (
                                        <div className="text-center py-4 bg-white border border-gray-150/65 rounded-xl text-[10px] text-brand-muted font-bold font-sans">
                                          No companion eBooks configured yet for this course. Add one below!
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                                          {activeCourse.resources.map((res: any) => {
                                            return (
                                              <div key={res.id} className="bg-white border border-gray-150 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-3xs text-[10.5px]">
                                                <div className="space-y-0.5">
                                                  <div className="font-sans font-black text-slate-800 leading-snug flex items-center gap-1.5 flex-wrap">
                                                    <span>📘 {res.name}</span>
                                                    <span className={`text-[8px] font-sans font-black px-1.5 py-0.2 rounded uppercase ${
                                                      res.priceAmount === 0 
                                                        ? 'bg-emerald-50 text-emerald-600' 
                                                        : 'bg-amber-50 text-amber-700 border border-amber-150/20'
                                                    }`}>
                                                      {res.priceAmount === 0 ? "FREE DOWNLOAD" : `PREMIUM: ${res.priceAmount.toLocaleString()} MMK`}
                                                    </span>
                                                  </div>
                                                  {res.nameMm && <p className="text-[9.5px] text-[#583092] font-semibold italic">{res.nameMm}</p>}
                                                  <p className="text-[9px] text-[#0073e6] truncate font-mono max-w-[280px]" title={res.downloadUrl}>🔗 {res.downloadUrl}</p>
                                                </div>
                                                
                                                <div className="flex gap-1 shrink-0">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setEditingResourceId(res.id);
                                                      setResourceFormName(res.name);
                                                      setResourceFormNameMm(res.nameMm || '');
                                                      setResourceFormUrl(res.downloadUrl);
                                                      setResourceFormPrice(res.priceAmount);
                                                      setResourceFormType(res.priceAmount > 0 ? 'premium' : 'free');
                                                    }}
                                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg cursor-pointer transition-colors border-none"
                                                    title="Edit Resource"
                                                  >
                                                    <Pencil className="w-3 h-3" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const confirmDel = window.confirm(`Permanently remove eBook resource "${res.name}"?`);
                                                      if (confirmDel) {
                                                        const updatedCourses = courses.map(c => {
                                                          if (c.id === adminSelectedCourseId) {
                                                            return {
                                                              ...c,
                                                              resources: (c.resources || []).filter((r: any) => r.id !== res.id)
                                                            };
                                                          }
                                                          return c;
                                                        });
                                                        setCourses(updatedCourses);
                                                        addSystemLog('admin', `Removed resource eBook "${res.name}" from ${courseFormName}`);
                                                        if (editingResourceId === res.id) {
                                                          setEditingResourceId(null);
                                                          setResourceFormName('');
                                                          setResourceFormNameMm('');
                                                          setResourceFormUrl('');
                                                          setResourceFormPrice(0);
                                                          setResourceFormType('free');
                                                        }
                                                      }
                                                    }}
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors border-none font-sans font-black flex items-center justify-center"
                                                    title="Delete Resource"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* Form card to add/edit eBook resource */}
                                    <div id="admin-resource-form-section" className="p-3 bg-white border border-gray-150 rounded-xl space-y-3 shadow-3xs scroll-mt-20">
                                      <span className="text-[9.5px] font-sans font-black text-brand-purple uppercase tracking-wider block">
                                        {editingResourceId ? "✏️ Edit eBook Resource Details" : "➕ Add eBook / Companion PDF Resource"}
                                      </span>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div className="space-y-0.5 text-left">
                                          <label className="text-[8.5px] font-sans font-black text-brand-dark uppercase tracking-wide">
                                            eBook Name (English)
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="e.g. Workbook Volume 1"
                                            value={resourceFormName}
                                            onChange={(e) => setResourceFormName(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all placeholder-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-0.5 text-left">
                                          <label className="text-[8.5px] font-sans font-black text-[#583092] uppercase tracking-wide">
                                            စာအုပ်အမည် (မြန်မာအသံထွက် / စာသား)
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="e.g. ထိုင်းစာ ရေးပုံရေးနည်း လေ့ကျင့်ခန်းစာအုပ်"
                                            value={resourceFormNameMm}
                                            onChange={(e) => setResourceFormNameMm(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-sans font-bold text-[#583092] focus:border-brand-purple focus:outline-none transition-all placeholder-gray-300"
                                          />
                                        </div>

                                        <div className="sm:col-span-2 space-y-0.5 text-left">
                                          <label className="text-[8.5px] font-sans font-black text-brand-dark uppercase tracking-wide flex items-center gap-1">
                                            <span>🔗 eBook Download URL (Direct PDF Link or Google Drive Link)</span>
                                          </label>
                                          <input
                                            type="url"
                                            placeholder="e.g. https://drive.google.com/file/d/... or PDF download link"
                                            value={resourceFormUrl}
                                            onChange={(e) => setResourceFormUrl(e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-mono text-brand-dark focus:border-brand-purple focus:outline-none transition-all placeholder-gray-300"
                                          />
                                        </div>

                                        <div className="space-y-0.5 text-left">
                                          <label className="text-[8.5px] font-sans font-black text-brand-dark uppercase tracking-wide">
                                            Access Model Option
                                          </label>
                                          <select
                                            value={resourceFormType}
                                            onChange={(e) => {
                                              const type = e.target.value as 'free' | 'premium';
                                              setResourceFormType(type);
                                              if (type === 'free') {
                                                setResourceFormPrice(0);
                                              } else if (resourceFormPrice === 0) {
                                                setResourceFormPrice(5000);
                                              }
                                            }}
                                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-sans font-bold text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          >
                                            <option value="free">🆓 Free Direct Download for Enrolled Students</option>
                                            <option value="premium">💳 Premium Purchase Required (paid resource)</option>
                                          </select>
                                        </div>

                                        <div className="space-y-0.5 text-left">
                                          <label className="text-[8.5px] font-sans font-black text-brand-dark uppercase tracking-wide">
                                            Purchase Price (MMK)
                                          </label>
                                          <input
                                            type="number"
                                            value={resourceFormPrice}
                                            onChange={(e) => setResourceFormPrice(Number(e.target.value))}
                                            disabled={resourceFormType === 'free'}
                                            className={`w-full px-2.5 py-1.5 border rounded-lg text-[11px] font-mono font-black focus:outline-none transition-all ${
                                              resourceFormType === 'free' 
                                                ? 'bg-slate-50 border-gray-150 text-slate-400 cursor-not-allowed' 
                                                : 'bg-white border-gray-200 text-brand-purple focus:border-brand-purple'
                                            }`}
                                            min={0}
                                          />
                                        </div>
                                      </div>

                                      {/* Action buttons */}
                                      <div className="flex gap-2 pt-1.5 border-t border-gray-100">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!resourceFormName.trim() || !resourceFormUrl.trim()) {
                                              alert("Please enter both the eBook Name and Resource Download URL.");
                                              return;
                                            }
                                            
                                            const resourceId = editingResourceId || `res-${Date.now()}`;
                                            const updatedRes = {
                                              id: resourceId,
                                              name: resourceFormName.trim(),
                                              nameMm: resourceFormNameMm.trim() || undefined,
                                              downloadUrl: resourceFormUrl.trim(),
                                              priceAmount: resourceFormType === 'free' ? 0 : (resourceFormPrice || 0),
                                              currency: 'MMK' as const
                                            };

                                            const updatedCourses = courses.map(c => {
                                              if (c.id === adminSelectedCourseId) {
                                                const currentResources = c.resources || [];
                                                const resourcesExist = currentResources.some(r => r.id === resourceId);
                                                
                                                let nextResources;
                                                if (resourcesExist) {
                                                  nextResources = currentResources.map(r => r.id === resourceId ? updatedRes : r);
                                                } else {
                                                  nextResources = [...currentResources, updatedRes];
                                                }
                                                
                                                return {
                                                  ...c,
                                                  resources: nextResources
                                                };
                                              }
                                              return c;
                                            });

                                            setCourses(updatedCourses);
                                            addSystemLog('admin', `${editingResourceId ? "Updated" : "Added"} eBook resource "${updatedRes.name}" on course: "${courseFormName}"`);
                                            
                                            // Reset form
                                            setEditingResourceId(null);
                                            setResourceFormName('');
                                            setResourceFormNameMm('');
                                            setResourceFormUrl('');
                                            setResourceFormPrice(0);
                                            setResourceFormType('free');
                                            alert("eBook Resource synced successfully!");
                                          }}
                                          className="flex-1 py-1.5 bg-slate-900 border-none hover:bg-slate-800 text-white font-sans font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                                        >
                                          {editingResourceId ? "💾 Save eBook Changes" : "💾 Add Resource eBook"}
                                        </button>

                                        {editingResourceId && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingResourceId(null);
                                              setResourceFormName('');
                                              setResourceFormNameMm('');
                                              setResourceFormUrl('');
                                              setResourceFormPrice(0);
                                              setResourceFormType('free');
                                            }}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 font-sans font-black text-[10px] uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION 4: STUDY STORE MANAGER */}
                    {adminHubTab === 'store' && (
                      <div className="space-y-6 animate-fade-in" id="admin-store-tab-view">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                          {/* Store Item List Panel */}
                          <div className="lg:col-span-5 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-150 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5 font-sans">
                                <ShoppingBag className="w-4 h-4 shrink-0 text-brand-purple" />
                                Store Catalog ({storeItems.length})
                              </h5>
                              <button
                                type="button"
                                onClick={() => {
                                  setStoreIsNew(true);
                                  setStoreNewIdStr('');
                                  setStoreFormName('');
                                  setStoreFormNameMm('');
                                  setStoreFormType('e-book');
                                  setStoreFormDescription('');
                                  setStoreFormDescriptionMm('');
                                  setStoreFormPrice(25000);
                                  setStoreFormCurrency('MMK');
                                  setStoreFormPopular(false);
                                  setStoreFormCourseId('');
                                  setStoreFormPdfFileName('');
                                  setStoreFormPdfDownloadUrl('');
                                }}
                                className="px-2.5 py-1 bg-brand-purple hover:bg-brand-purple/95 text-white text-[9px] font-black uppercase rounded-lg hover:brightness-105 active:translate-y-0.5 cursor-pointer flex items-center gap-1 shadow-3xs font-sans"
                              >
                                <Plus className="w-3 h-3" />
                                CREATE NEW
                              </button>
                            </div>

                            <p className="text-[10px] text-brand-muted font-sans font-semibold leading-relaxed">
                              Configure premium eBook resources, practice guides, zoom speak tutoring, or VIP system packages that students can purchase.
                            </p>

                            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                              {storeItems.map((item) => {
                                const isSelected = !storeIsNew && adminSelectedStoreId === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setStoreIsNew(false);
                                      setAdminSelectedStoreId(item.id);
                                      setStoreFormName(item.name);
                                      setStoreFormNameMm(item.nameMm);
                                      setStoreFormType(item.type);
                                      setStoreFormDescription(item.description || '');
                                      setStoreFormDescriptionMm(item.descriptionMm || '');
                                      setStoreFormPrice(item.price);
                                      setStoreFormCurrency(item.currency);
                                      setStoreFormPopular(!!item.popular);
                                      setStoreFormCourseId(item.courseId || '');
                                      setStoreFormPdfFileName(item.pdfFileName || '');
                                      setStoreFormPdfDownloadUrl(item.pdfDownloadUrl || '');
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-3xs ${
                                      isSelected
                                        ? 'bg-brand-purple/5 border-brand-purple'
                                        : 'bg-white border-gray-150 hover:border-gray-250'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[13px]">
                                          {item.type === 'e-book' && '📕'}
                                          {item.type === 'tutoring' && '🗣️'}
                                          {item.type === 'certificate' && '🎖️'}
                                          {item.type === 'vip-package' && '⭐'}
                                        </span>
                                        <h6 className="font-sans font-black text-brand-dark text-[11px] leading-snug">
                                          {item.name}
                                        </h6>
                                      </div>
                                      <p className="text-[9px] text-[#583092] font-bold italic pl-4">
                                        {item.nameMm}
                                      </p>
                                      <div className="text-[9px] text-brand-muted font-sans font-bold flex flex-wrap gap-x-2 pl-4">
                                        <span className="uppercase text-amber-700 font-extrabold">{item.type}</span>
                                        <span>•</span>
                                        <span className="text-brand-purple font-mono">{item.price.toLocaleString()} {item.currency}</span>
                                        {item.popular && (
                                          <>
                                            <span>•</span>
                                            <span className="text-orange-600 font-extrabold">POPULAR</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const confirmDel = window.confirm(`Permanently delete the study product "${item.name}" from your catalog store?`);
                                          if (confirmDel) {
                                            const updated = storeItems.filter(s => s.id !== item.id);
                                            setStoreItems(updated);
                                            addSystemLog('admin', `Permanently deleted product/resource "${item.name}"`);
                                            
                                            if (adminSelectedStoreId === item.id) {
                                              if (updated.length > 0) {
                                                setAdminSelectedStoreId(updated[0].id);
                                              } else {
                                                setAdminSelectedStoreId('');
                                              }
                                              setStoreIsNew(false);
                                            }
                                          }
                                        }}
                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100 placeholder-transparent"
                                        title="Delete Product"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Store Item Form Editor Panel */}
                          <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border-2 border-gray-100 space-y-4">
                            <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 text-brand-purple font-sans">
                              <Pencil className="w-4 h-4 text-brand-purple" />
                              {storeIsNew ? "Upload & Create New eBook / Product" : `Edit Study Store product`}
                            </h5>
                            
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!storeFormName.trim() || !storeFormDescription.trim()) {
                                  alert("Please fill in name and description outline before publishing.");
                                  return;
                                }

                                if (storeIsNew) {
                                  const rawId = storeNewIdStr.trim();
                                  if (!rawId) {
                                    alert("Product ID is required.");
                                    return;
                                  }
                                  const cleanId = rawId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
                                  if (storeItems.some(i => i.id === cleanId)) {
                                    alert(`Duplicate ID Error: "${cleanId}" is already taken.`);
                                    return;
                                  }
                                  
                                  const newItem: StoreItem = {
                                    id: cleanId,
                                    name: storeFormName.trim(),
                                    nameMm: storeFormNameMm.trim() || storeFormName.trim(),
                                    type: storeFormType,
                                    description: storeFormDescription.trim(),
                                    descriptionMm: storeFormDescriptionMm.trim(),
                                    price: storeFormPrice,
                                    currency: storeFormCurrency,
                                    popular: storeFormPopular,
                                    courseId: storeFormCourseId || undefined,
                                    pdfFileName: storeFormPdfFileName.trim() || undefined,
                                    pdfDownloadUrl: storeFormPdfDownloadUrl.trim() || undefined
                                  };

                                  const updated = [...storeItems, newItem];
                                  setStoreItems(updated);
                                  addSystemLog('admin', `Uploaded new eBook / Resource: "${newItem.name}" (${newItem.price} ${newItem.currency})`);
                                  
                                  setStoreIsNew(false);
                                  setAdminSelectedStoreId(cleanId);
                                  alert(`Successfully published resource item "${newItem.name}"!`);
                                } else {
                                  // Edit Mode
                                  const updated = storeItems.map(item => {
                                    if (item.id === adminSelectedStoreId) {
                                      return {
                                        ...item,
                                        name: storeFormName.trim(),
                                        nameMm: storeFormNameMm.trim() || storeFormName.trim(),
                                        type: storeFormType,
                                        description: storeFormDescription.trim(),
                                        descriptionMm: storeFormDescriptionMm.trim(),
                                        price: storeFormPrice,
                                        currency: storeFormCurrency,
                                        popular: storeFormPopular,
                                        courseId: storeFormCourseId || undefined,
                                        pdfFileName: storeFormPdfFileName.trim() || undefined,
                                        pdfDownloadUrl: storeFormPdfDownloadUrl.trim() || undefined
                                      };
                                    }
                                    return item;
                                  });
                                  setStoreItems(updated);
                                  addSystemLog('admin', `Synced updates for product "${storeFormName}"`);
                                  alert("Product information successfully updated!");
                                }
                              }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                            >
                              {storeIsNew && (
                                <div className="space-y-1 text-left sm:col-span-2">
                                  <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                    Target Item URL/ID String (Must be unique, e.g. ebook-thai-advanced)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. ebook-travel-myanmar"
                                    value={storeNewIdStr}
                                    onChange={(e) => setStoreNewIdStr(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    required
                                  />
                                </div>
                              )}

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Product Name (English / Romanized)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Everyday Thai Phrases E-Book v2"
                                  value={storeFormName}
                                  onChange={(e) => setStoreFormName(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  ကုန်ပစ္စည်းအမည် (မြန်မာဘာသာ)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. နေ့စဉ်သုံး ထိုင်းဝါကျများ အီးဘုခ်"
                                  value={storeFormNameMm}
                                  onChange={(e) => setStoreFormNameMm(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                />
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Resource Product Category
                                </label>
                                <select
                                  value={storeFormType}
                                  onChange={(e) => setStoreFormType(e.target.value as any)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                >
                                  <option value="e-book">📕 E-Book (Digital Manual)</option>
                                  <option value="tutoring">🗣️ Tutoring / Speaking Zoom Session</option>
                                  <option value="certificate">🎖️ Verified Certificate Token</option>
                                  <option value="vip-package">⭐ VIP System Premium Study Access</option>
                                </select>
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Price Amount &amp; Currency Value
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="e.g. 15000"
                                    value={storeFormPrice}
                                    onChange={(e) => setStoreFormPrice(Number(e.target.value))}
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    required
                                  />
                                  <select
                                    value={storeFormCurrency}
                                    onChange={(e) => setStoreFormCurrency(e.target.value as any)}
                                    className="px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  >
                                    <option value="MMK">MMK (Kyat)</option>
                                    <option value="XP">XP (Points)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Link to Language Course (Course Filter)
                                </label>
                                <select
                                  value={storeFormCourseId}
                                  onChange={(e) => setStoreFormCourseId(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                >
                                  <option value="">General / None (No Course Filter)</option>
                                  {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                      📚 {course.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  eBook PDF File Name for Auto-Generator
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Basic_Reading_Manual.pdf"
                                  value={storeFormPdfFileName}
                                  onChange={(e) => setStoreFormPdfFileName(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                />
                              </div>

                              <div className="space-y-1 text-left">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1">
                                  <span>🔗 eBook Download / Web Resource URL</span>
                                  <span className="text-[8px] bg-[#e1f5fe] text-[#0288d1] px-1 rounded font-bold uppercase select-none">Direct File / Remote Link</span>
                                </label>
                                <input
                                  type="url"
                                  placeholder="e.g. https://drive.google.com/file/d/..."
                                  value={storeFormPdfDownloadUrl}
                                  onChange={(e) => setStoreFormPdfDownloadUrl(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                />
                              </div>

                              <div className="space-y-2 text-left sm:col-span-2 py-1.5 px-3 bg-brand-purple/5 border border-brand-purple/10 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <span className="block text-[10px] font-sans font-black text-brand-purple uppercase tracking-wider leading-none">
                                    Feature as Best Seller / Popular?
                                  </span>
                                  <span className="block text-[9.5px] text-brand-muted font-sans font-semibold">
                                    Places an eye-catching orange 'POPULAR' flag on the student store card.
                                  </span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={storeFormPopular}
                                  onChange={(e) => setStoreFormPopular(e.target.checked)}
                                  className="w-4 h-4 text-brand-purple rounded border-gray-300 focus:ring-brand-purple"
                                />
                              </div>

                              <div className="space-y-1 text-left sm:col-span-2">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  Product Description (English Outline info)
                                </label>
                                <textarea
                                  placeholder="Outline the content of this eBook resource (e.g. 120 vocabulary items with high-fidelity pronunciation guides)..."
                                  value={storeFormDescription}
                                  onChange={(e) => setStoreFormDescription(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                  required
                                />
                              </div>

                              <div className="space-y-1 text-left sm:col-span-2">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                  ကုန်ပစ္စည်း အသေးစိတ် ရှင်းလင်းချက် (မြန်မာဘာသာ)
                                </label>
                                <textarea
                                  placeholder="ကျောင်းသားများ မြင်တွေ့ရမည့် မြန်မာဘာသာ အီးဘုတ်အကြောင်းအရာ ရှင်းလင်းချက်..."
                                  value={storeFormDescriptionMm}
                                  onChange={(e) => setStoreFormDescriptionMm(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                />
                              </div>

                              <div className="sm:col-span-2 pt-2 text-left">
                                <button
                                  type="submit"
                                  className="w-full py-3 bg-brand-purple hover:bg-brand-purple/95 text-white border-b-4 border-brand-purple-shadow text-[11px] font-sans font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs font-sans"
                                >
                                  <CheckSquare className="w-4 h-4 shrink-0" />
                                  {storeIsNew ? "Publish Product to Store" : "Sync Product Changes"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION 5: DYNAMIC ORIENTATION BOOK CONTEXT MANAGER */}
                    {adminHubTab === 'orientation' && (
                      <div className="space-y-6 animate-fade-in text-left" id="admin-orientation-tab-view">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* Left Panel: Available Articles Switcher */}
                          <div className="lg:col-span-4 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-150 space-y-4">
                            <h5 className="text-xs font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                              <FileText className="w-4 h-4 shrink-0 text-brand-purple" />
                              ORIENTATION MATERIALS ({orientationData.length})
                            </h5>
                            <p className="text-[10px] text-brand-muted font-sans font-semibold leading-relaxed">
                              Select a public Orientation Guide article to edit headings, custom sections, paragraphs, and language lookup highlights.
                            </p>
                            <div className="space-y-2">
                              {orientationData.map((article) => {
                                const isSelected = adminSelectedOrientId === article.id;
                                return (
                                  <button
                                    key={article.id}
                                    type="button"
                                    onClick={() => setAdminSelectedOrientId(article.id)}
                                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-white border-brand-purple/50 shadow-xs'
                                        : 'bg-white/40 hover:bg-white border-gray-200'
                                    }`}
                                  >
                                    <div>
                                      <div className="text-xs font-bold font-sans text-brand-dark flex items-center gap-1.5 font-sans">
                                        <span>📚 {article.titleEnglish}</span>
                                      </div>
                                      <div className="text-[10px] text-brand-muted font-sans font-medium mt-0.5">
                                        ID: {article.id} • {article.sections.length} Sections
                                      </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-brand-dark shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-brand-purple' : ''}`} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Panel: Selected Article Editor Form */}
                          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 space-y-6">
                            {!orientEditArticle ? (
                              <p className="text-xs text-brand-muted py-8 text-center font-semibold">
                                Select an article from the left side panel to edit its details.
                              </p>
                            ) : (
                              <div className="space-y-6 col-span-1">
                                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-sans font-black text-sm uppercase text-brand-dark">
                                      📝 Edit: {orientEditArticle.titleEnglish}
                                    </h4>
                                    <span className="text-[10px] text-brand-muted font-bold font-mono">
                                      Database ID: {orientEditArticle.id}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSaveOrientation}
                                    className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/95 text-white text-[10.5px] font-sans font-black uppercase tracking-wider rounded-xl shadow-xs cursor-pointer hover:brightness-105 transition-all font-sans"
                                  >
                                    💾 Save Article changes
                                  </button>
                                </div>

                                {/* Article Global Titles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Article Main Title (English)
                                    </label>
                                    <input
                                      type="text"
                                      value={orientEditArticle.titleEnglish || ''}
                                      onChange={(e) => updateOrientField('titleEnglish', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      ဆောင်းပါးခေါင်းစဉ် (မြန်မာဘာသာ)
                                    </label>
                                    <input
                                      type="text"
                                      value={orientEditArticle.titleMyanmar || ''}
                                      onChange={(e) => updateOrientField('titleMyanmar', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>
                                </div>

                                {/* Section Accompanying Rules */}
                                <div className="space-y-4 pt-3 text-left">
                                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <h5 className="text-[11px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Article Content Sections ({orientEditArticle.sections.length})
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={addOrientSection}
                                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[9.5px] font-sans font-black uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      ADD SECTION
                                    </button>
                                  </div>

                                  {orientEditArticle.sections.map((section, sIdx) => (
                                    <div key={sIdx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 text-left space-y-4 relative">
                                      <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => deleteOrientSection(sIdx)}
                                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                                          title="Delete entire section"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="pr-12 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                        <div className="space-y-1">
                                          <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                            Section Heading {sIdx + 1} (English)
                                          </label>
                                          <input
                                            type="text"
                                            value={section.headingEnglish}
                                            onChange={(e) => updateOrientSectionHeading(sIdx, e.target.value, section.headingMyanmar)}
                                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                            ခေါင်းစဉ်ငယ် {sIdx + 1} (မြန်မာဘာသာ)
                                          </label>
                                          <input
                                            type="text"
                                            value={section.headingMyanmar}
                                            onChange={(e) => updateOrientSectionHeading(sIdx, section.headingEnglish, e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          />
                                        </div>
                                      </div>

                                      {/* Paras section code */}
                                      <div className="space-y-2 border-t border-gray-150/60 pt-3 text-left">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9.5px] font-sans font-black text-brand-purple uppercase tracking-wider">
                                            Paragraph Blocks ({section.paragraphs.length})
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => addOrientParagraph(sIdx)}
                                            className="px-2 py-0.5 bg-white hover:bg-gray-50 text-brand-purple hover:text-brand-purple border border-brand-purple/20 rounded text-[8.5px] font-black uppercase tracking-wider cursor-pointer"
                                          >
                                            + Add paragraph
                                          </button>
                                        </div>

                                        {section.paragraphs.map((para, pIdx) => (
                                          <div key={pIdx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 relative pr-10 text-left">
                                            <button
                                              type="button"
                                              onClick={() => deleteOrientParagraph(sIdx, pIdx)}
                                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 cursor-pointer"
                                              title="Remove Paragraph block"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                                              <textarea
                                                rows={2}
                                                placeholder="English Paragraph Text..."
                                                value={para.en}
                                                onChange={(e) => updateOrientParagraph(sIdx, pIdx, 'en', e.target.value)}
                                                className="w-full p-2 border border-gray-150 rounded text-[11px] font-medium font-sans text-brand-dark focus:outline-none focus:border-brand-purple"
                                              />
                                              <textarea
                                                rows={2}
                                                placeholder="မြန်မာဘာသာပြန် စာစု..."
                                                value={para.mm}
                                                onChange={(e) => updateOrientParagraph(sIdx, pIdx, 'mm', e.target.value)}
                                                className="w-full p-2 border border-gray-150 rounded text-[11.5px] font-semibold font-sans text-brand-dark focus:outline-none focus:border-brand-purple"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Vocabulary highlights in that section */}
                                      <div className="space-y-2 border-t border-gray-150/60 pt-3 text-left">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9.5px] font-sans font-black text-[#0288d1] uppercase tracking-wider">
                                            Vocabulary Highlights &amp; Lookup Terms ({section.highlights ? section.highlights.length : 0})
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => addOrientHighlight(sIdx)}
                                            className="px-2 py-0.5 bg-white hover:bg-gray-50 text-[#0288d1] border border-[#0288d1]/20 rounded text-[8.5px] font-black uppercase tracking-wider cursor-pointer font-sans"
                                          >
                                            + Add word highlight
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 text-left">
                                          {(section.highlights || []).map((hl, hIdx) => (
                                            <div key={hIdx} className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-2 items-center relative pr-10 text-left">
                                              <button
                                                type="button"
                                                onClick={() => deleteOrientHighlight(sIdx, hIdx)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 md:top-auto md:right-3 cursor-pointer"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>

                                              <input
                                                type="text"
                                                placeholder="Thai Script (e.g. ภาษา)"
                                                value={hl.termThai}
                                                onChange={(e) => updateOrientHighlight(sIdx, hIdx, 'termThai', e.target.value)}
                                                className="w-full md:w-1/4 px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-sans font-bold"
                                              />
                                              <input
                                                type="text"
                                                placeholder="Phonetic (e.g. phaa-saa)"
                                                value={hl.termPhonetic}
                                                onChange={(e) => updateOrientHighlight(sIdx, hIdx, 'termPhonetic', e.target.value)}
                                                className="w-full md:w-1/4 px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-mono text-[10px]"
                                              />
                                              <input
                                                type="text"
                                                placeholder="English Meaning"
                                                value={hl.meaningEnglish}
                                                onChange={(e) => updateOrientHighlight(sIdx, hIdx, 'meaningEnglish', e.target.value)}
                                                className="w-full md:w-1/4 px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-sans font-medium"
                                              />
                                              <input
                                                type="text"
                                                placeholder="Myanmar Meaning"
                                                value={hl.meaningMyanmar}
                                                onChange={(e) => updateOrientHighlight(sIdx, hIdx, 'meaningMyanmar', e.target.value)}
                                                className="w-full md:w-1/4 px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-sans font-semibold"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={handleSaveOrientation}
                                    className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-sans font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:brightness-105 transition-all text-center flex items-center justify-center gap-1.5 font-sans"
                                  >
                                    <CheckSquare className="w-4 h-4" />
                                    Save entire orientation article details
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION 6: DYNAMIC GRAMMAR HANDBOOK CONTEXT MANAGER */}
                    {adminHubTab === 'grammar' && (
                      <div className="space-y-6 animate-fade-in text-left" id="admin-grammar-tab-view">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* Left Panel: Chapters Switcher */}
                          <div className="lg:col-span-4 bg-gray-50/70 p-4 sm:p-5 rounded-2xl border border-gray-150 space-y-4 text-left">
                            <h5 className="text-xs font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 shrink-0 text-brand-purple" />
                              GRAMMAR HANDBOOK CHAPTERS ({grammarChapters.length})
                            </h5>
                            <p className="text-[10px] text-brand-muted font-sans font-semibold leading-relaxed">
                              Select a grammar handbook chapter (Chapters 1 to 15+) or review higher content chapters to dynamically edit explanations, rules, structure concepts, and examples.
                            </p>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                              {grammarChapters.map((chapter) => {
                                const isSelected = adminSelectedGrammarChId === chapter.id;
                                return (
                                  <button
                                    key={chapter.id}
                                    type="button"
                                    onClick={() => setAdminSelectedGrammarChId(chapter.id)}
                                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-white border-brand-purple/50 shadow-xs'
                                        : 'bg-white/40 hover:bg-white border-gray-200'
                                    }`}
                                  >
                                    <div>
                                      <div className="text-xs font-bold font-sans text-brand-dark flex items-center gap-1 font-sans">
                                        <span>📖 Chapter {chapter.chapterNumber}: {chapter.titleEnglish}</span>
                                      </div>
                                      <div className="text-[10px] text-brand-muted font-sans font-semibold mt-0.5">
                                        Core Concept: {chapter.thaiCoreConcept || 'General'}
                                      </div>
                                      <div className="text-[9px] text-brand-purple font-sans font-black mt-0.5">
                                        {chapter.rules.length} Grammar Rules
                                      </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-brand-dark shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-brand-purple' : ''}`} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Panel: Selected Chapter Editor Form */}
                          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 space-y-6 text-left">
                            {!grammarEditChapter ? (
                              <p className="text-xs text-brand-muted py-8 text-center font-semibold">
                                Select a grammar chapter from the left side panel to edit its details.
                              </p>
                            ) : (
                              <div className="space-y-6 text-left">
                                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-sans font-black text-sm uppercase text-brand-dark">
                                      📝 Edit: Chapter {grammarEditChapter.chapterNumber} - {grammarEditChapter.titleEnglish}
                                    </h4>
                                    <span className="text-[10px] text-brand-muted font-bold font-mono">
                                      Database Chapter Key: {grammarEditChapter.id}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSaveGrammarChapter}
                                    className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/95 text-white text-[10.5px] font-sans font-black uppercase tracking-wider rounded-xl shadow-xs cursor-pointer hover:brightness-105 transition-all font-sans"
                                  >
                                    💾 Save Chapter Changes
                                  </button>
                                </div>

                                {/* Chapter Basic Meta Info */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                                  <div className="md:col-span-3 space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Chapter #
                                    </label>
                                    <input
                                      type="number"
                                      value={grammarEditChapter.chapterNumber}
                                      onChange={(e) => updateGrammarChField('chapterNumber', Number(e.target.value))}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>
                                  <div className="md:col-span-9 space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Thai Core Concept (e.g. คำนาม / ကတ္တားများ)
                                    </label>
                                    <input
                                      type="text"
                                      value={grammarEditChapter.thaiCoreConcept || ''}
                                      onChange={(e) => updateGrammarChField('thaiCoreConcept', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>

                                  <div className="md:col-span-6 space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Chapter Title (English)
                                    </label>
                                    <input
                                      type="text"
                                      value={grammarEditChapter.titleEnglish}
                                      onChange={(e) => updateGrammarChField('titleEnglish', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>
                                  <div className="md:col-span-6 space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      အခန်းခေါင်းစဉ် (မြန်မာဘာသာ)
                                    </label>
                                    <input
                                      type="text"
                                      value={grammarEditChapter.titleMyanmar || ''}
                                      onChange={(e) => updateGrammarChField('titleMyanmar', e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>

                                  <div className="md:col-span-6 space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Introductory Outline Description (English)
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={grammarEditChapter.descriptionEnglish || ''}
                                      onChange={(e) => updateGrammarChField('descriptionEnglish', e.target.value)}
                                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>
                                  <div className="md:col-span-6 space-y-1 text-left">
                                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      မိတ်ဆက် ရှင်းလင်းချက်များ (မြန်မာဘာသာ)
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={grammarEditChapter.descriptionMyanmar || ''}
                                      onChange={(e) => updateGrammarChField('descriptionMyanmar', e.target.value)}
                                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                    />
                                  </div>
                                </div>

                                {/* Rule lists */}
                                <div className="space-y-4 pt-3 border-t border-gray-100 mt-4 text-left">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-[11px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      Rules &amp; Syntactical Explanations ({grammarEditChapter.rules.length})
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={addGrammarRule}
                                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[9.5px] font-sans font-black uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      ADD RULE
                                    </button>
                                  </div>

                                  {grammarEditChapter.rules.map((rule, rIdx) => (
                                    <div key={rIdx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 text-left space-y-4 relative">
                                      <button
                                        type="button"
                                        onClick={() => deleteGrammarRule(rIdx)}
                                        className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 cursor-pointer"
                                        title="Delete Rule"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>

                                      <div className="pr-10 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                        <div className="space-y-1 text-left">
                                          <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                            Rule {rIdx + 1} Title (English)
                                          </label>
                                          <input
                                            type="text"
                                            value={rule.title}
                                            onChange={(e) => updateGrammarRuleField(rIdx, 'title', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          />
                                        </div>
                                        <div className="space-y-1 text-left">
                                          <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                            စည်းမျဉ်းခေါင်းစဉ် (မြန်မာဘာသာ)
                                          </label>
                                          <input
                                            type="text"
                                            value={rule.titleMyanmar || ''}
                                            onChange={(e) => updateGrammarRuleField(rIdx, 'titleMyanmar', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          />
                                        </div>

                                        <div className="space-y-1 sm:col-span-2 text-left">
                                          <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                            Grammar Rule Explanation (English)
                                          </label>
                                          <textarea
                                            rows={2}
                                            value={rule.explanation}
                                            onChange={(e) => updateGrammarRuleField(rIdx, 'explanation', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          />
                                        </div>
                                        <div className="space-y-1 sm:col-span-2 text-left">
                                          <label className="block text-[9px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                            မြန်မာဘာသာဖြင့် သဒ္ဒါစည်းမျဉ်း ရှင်းလင်းချက်
                                          </label>
                                          <textarea
                                            rows={2}
                                            value={rule.explanationMyanmar || ''}
                                            onChange={(e) => updateGrammarRuleField(rIdx, 'explanationMyanmar', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none transition-all"
                                          />
                                        </div>
                                      </div>

                                      {/* Examples row */}
                                      <div className="space-y-2 border-t border-gray-150/60 pt-3 text-left">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9.5px] font-sans font-black text-brand-purple uppercase tracking-wider">
                                            Thai Example Sentences ({rule.examples ? rule.examples.length : 0})
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => addGrammarExample(rIdx)}
                                            className="px-2 py-0.5 bg-white hover:bg-gray-50 text-brand-purple border border-brand-purple/20 rounded text-[8.5px] font-black uppercase tracking-wider cursor-pointer"
                                          >
                                            + Add example
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 text-left">
                                          {(rule.examples || []).map((ex, eIdx) => (
                                            <div key={eIdx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2 relative pr-10 text-left">
                                              <button
                                                type="button"
                                                onClick={() => deleteGrammarExample(rIdx, eIdx)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>

                                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-left">
                                                <div>
                                                  <label className="block text-[8px] font-sans font-black uppercase text-brand-dark mb-0.5 leading-none">Thai Text</label>
                                                  <input
                                                    type="text"
                                                    placeholder="thai text"
                                                    value={ex.thai}
                                                    onChange={(e) => updateGrammarExampleField(rIdx, eIdx, 'thai', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-sans font-bold"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[8px] font-sans font-black uppercase text-brand-dark mb-0.5 leading-none">Phonetic</label>
                                                  <input
                                                    type="text"
                                                    placeholder="phonetic spelling"
                                                    value={ex.phonetic}
                                                    onChange={(e) => updateGrammarExampleField(rIdx, eIdx, 'phonetic', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-mono text-[10px]"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[8px] font-sans font-black uppercase text-brand-dark mb-0.5 leading-none">English Meaning</label>
                                                  <input
                                                    type="text"
                                                    placeholder="english meaning"
                                                    value={ex.english}
                                                    onChange={(e) => updateGrammarExampleField(rIdx, eIdx, 'english', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-sans font-medium"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[8px] font-sans font-black uppercase text-brand-dark mb-0.5 leading-none">Myanmar Translation</label>
                                                  <input
                                                    type="text"
                                                    placeholder="မြန်မာအနက်အဓိပ္ပာယ်"
                                                    value={ex.myanmar}
                                                    onChange={(e) => updateGrammarExampleField(rIdx, eIdx, 'myanmar', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-150 rounded text-xs text-brand-dark font-sans font-semibold"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={handleSaveGrammarChapter}
                                    className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-sans font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:brightness-105 transition-all text-center flex items-center justify-center gap-1.5 font-sans"
                                  >
                                    <CheckSquare className="w-4 h-4" />
                                    Save current grammar chapter details
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-SECTION 7: BRAND & THEME SETTINGS (DYNAMIC CONFIG) */}
                    {adminHubTab === 'brand' && (
                      <div className="space-y-6 animate-fade-in text-left">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                          <h5 className="text-xs font-sans font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
                            <Palette className="w-4 h-4 text-brand-purple animate-pulse" />
                            Live Branding Customization
                          </h5>
                          <p className="text-[11px] text-slate-500 font-sans font-medium mb-4 leading-relaxed font-sans">
                            Easily redefine the identity of your tuition system. Altering the brand color triggers dynamic math calculation models to shift shades, borders, shadows, highlights, and active state styles automatically over all student screens in real-time.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Left Panel: Inputs */}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[9px] font-sans font-black uppercase text-slate-700 mb-1.5">
                                  App Logo Initials / Short text (2-3 chars)
                                </label>
                                <input
                                  type="text"
                                  maxLength={3}
                                  value={brandLogoText}
                                  onChange={(e) => setBrandLogoText(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 focus:border-brand-purple rounded-xl font-sans font-extrabold text-sm text-slate-800 tracking-wider shadow-2xs leading-none uppercase"
                                  placeholder="e.g. TH"
                                />
                              </div>

                              {/* New PNG Image Logo Uploader element */}
                              <div>
                                <label className="block text-[9px] font-sans font-black uppercase text-slate-700 mb-1.5 flex items-center justify-between">
                                  <span>System Logo Image (PNG / JPG)</span>
                                  {brandLogoImg && (
                                    <button 
                                      type="button" 
                                      onClick={() => setBrandLogoImg('')}
                                      className="text-rose-600 hover:text-rose-700 font-sans font-extrabold text-[8.5px] uppercase cursor-pointer transition-colors"
                                    >
                                      Remove Logo Image
                                    </button>
                                  )}
                                </label>
                                
                                {brandLogoImg ? (
                                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-slate-200">
                                    <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center p-0.5 border border-slate-300">
                                      <img src={brandLogoImg} alt="Logotype" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-sans font-black text-emerald-700 uppercase flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Custom image active
                                      </p>
                                      <p className="text-[9px] text-slate-400 font-sans font-medium truncate">Saved locally and synchronized dynamically</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative border-2 border-dashed border-slate-250 hover:border-brand-purple rounded-xl p-4 bg-white/50 text-center transition-all cursor-pointer group">
                                    <input
                                      type="file"
                                      accept="image/png, image/jpeg, image/gif, image/webp"
                                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          if (file.size > 2 * 1024 * 1024) {
                                            alert("Notice: Image file size must be less than 2MB for high-performance LocalStorage buffer storage!");
                                            return;
                                          }
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            if (event.target?.result && typeof event.target.result === 'string') {
                                              setBrandLogoImg(event.target.result);
                                              addSystemLog('admin', `Custom logo image uploaded successfully (${file.name})`);
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                    <div className="flex flex-col items-center gap-1">
                                      <Upload className="w-4 h-4 text-slate-400 group-hover:text-brand-purple transition-colors" />
                                      <span className="text-[9.5px] font-sans font-black text-slate-600 group-hover:text-brand-purple uppercase tracking-wide">Upload PNG Logo</span>
                                      <span className="text-[8.5px] text-slate-400 font-sans font-medium">Click or Drag & Drop to attach image file</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-[9px] font-sans font-black uppercase text-slate-700 mb-1.5">
                                  App Brand Name / Institution Title
                                </label>
                                <input
                                  type="text"
                                  value={brandName}
                                  onChange={(e) => setBrandName(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 focus:border-brand-purple rounded-xl font-sans font-extrabold text-sm text-slate-800 shadow-2xs leading-none"
                                  placeholder="e.g. Thai Language Tutor"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-sans font-black uppercase text-slate-700 mb-2">
                                  Select Brand Base Color
                                </label>
                                {/* Quick Color Presets */}
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mb-3.5">
                                  {[
                                    { name: "Royal Purple", hex: "#8234ea" },
                                    { name: "Emerald Green", hex: "#10b981" },
                                    { name: "Ocean Blue", hex: "#3b82f6" },
                                    { name: "Sly Blue", hex: "#06b6d4" },
                                    { name: "Sunset Red", hex: "#ef4444" },
                                    { name: "Mandarin Orange", hex: "#f97316" },
                                    { name: "Charcoal", hex: "#1e293b" }
                                  ].map((pColor) => (
                                    <button
                                      key={pColor.hex}
                                      type="button"
                                      onClick={() => setBrandColor(pColor.hex)}
                                      className={`h-9 w-full rounded-xl border-2 transition-all relative flex items-center justify-center cursor-pointer p-0 shadow-2xs ${
                                        brandColor.toLowerCase() === pColor.hex.toLowerCase()
                                          ? 'scale-105 border-slate-800 ring-2 ring-slate-800/10'
                                          : 'border-white hover:scale-102 hover:opacity-90'
                                      }`}
                                      style={{ backgroundColor: pColor.hex }}
                                      title={pColor.name}
                                    >
                                      {brandColor.toLowerCase() === pColor.hex.toLowerCase() && (
                                        <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
                                      )}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex gap-3 items-center">
                                  <div className="relative shrink-0 select-none">
                                    <input
                                      type="color"
                                      value={brandColor}
                                      onChange={(e) => setBrandColor(e.target.value)}
                                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                    <div className="w-10 h-10 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer" style={{ backgroundColor: brandColor }} />
                                  </div>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={brandColor}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.startsWith('#') && val.length <= 7) {
                                          setBrandColor(val);
                                        }
                                      }}
                                      className="w-full px-3 py-2 bg-white border-2 border-slate-200 focus:border-brand-purple rounded-xl font-mono text-xs text-slate-800 select-all"
                                      placeholder="#8234ea"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Panel: Live Dynamic Preview card */}
                            <div className="space-y-4">
                              <label className="block text-[9px] font-sans font-black uppercase text-slate-700 leading-none">
                                Real-time Header & Card Preview
                              </label>

                              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-4 shadow-3xs overflow-hidden">
                                
                                {/* Top Banner Simulation */}
                                <div className="border border-slate-100/80 p-2.5 rounded-xl bg-slate-50/50">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-sans font-black text-[9px] shrink-0 text-white relative overflow-hidden" style={{ backgroundColor: brandColor }}>
                                      {brandLogoImg ? (
                                        <img 
                                          src={brandLogoImg} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover relative z-10" 
                                          referrerPolicy="no-referrer" 
                                        />
                                      ) : (
                                        <span className="relative z-10 font-sans font-extrabold uppercase">{brandLogoText || 'TH'}</span>
                                      )}
                                    </div>
                                    <div className="min-w-0 text-left">
                                      <h6 className="text-[10px] font-sans font-black text-slate-800 leading-none uppercase truncate">
                                        {brandName || 'Thai Language Tutor'}
                                      </h6>
                                      <span className="text-[7px] text-slate-400 font-sans font-bold uppercase mt-0.5 block tracking-wider">PREVIEW COMPONENT</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Active Selection Element simulation */}
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="p-3 rounded-2xl border-2 transition-all flex flex-col justify-between h-20 text-left bg-white border-slate-200">
                                    <span className="text-[9px] font-sans font-bold text-slate-400 uppercase">Inactive element</span>
                                    <span className="text-[10px] font-sans font-black text-slate-600">STANDARD TAB</span>
                                  </div>
                                  <div className="p-3 rounded-2xl border-2 transition-all flex flex-col justify-between h-20 text-left shadow-3xs" 
                                    style={{ 
                                      backgroundColor: adjustHexBrightness(brandColor, 90),
                                      borderColor: brandColor,
                                    }}>
                                    <span className="text-[9px] font-sans font-bold uppercase" style={{ color: brandColor }}>Active state</span>
                                    <span className="text-[10px] font-sans font-black" style={{ color: adjustHexBrightness(brandColor, -30) }}>DYNAMIC TINT</span>
                                  </div>
                                </div>

                                {/* Buttons Simulation */}
                                <div className="flex gap-2">
                                  <button type="button" className="flex-1 py-2 text-[9px] font-sans font-extrabold uppercase tracking-wide rounded-xl text-white shadow-xs transition-transform active:translate-y-0.5 cursor-pointer text-center" 
                                    style={{ 
                                      backgroundColor: brandColor, 
                                      borderBottom: `3px solid ${adjustHexBrightness(brandColor, -15)}`
                                    }}>
                                    Primary duo-btn
                                  </button>
                                  <button type="button" className="flex-1 py-2 text-[9px] font-sans font-extrabold uppercase tracking-wide rounded-xl border border-slate-300 bg-white transition-none text-center" style={{ color: brandColor, borderColor: adjustHexBrightness(brandColor, 40) }}>
                                    Border outline
                                  </button>
                                </div>

                              </div>

                              <div className="p-3 bg-slate-100 border border-slate-250 rounded-xl">
                                <span className="block text-[8px] font-sans font-black uppercase text-slate-700 tracking-wider mb-0.5 leading-none">Pro tip</span>
                                <span className="text-[9.5px] text-slate-600 font-sans font-medium leading-normal">
                                  The base color picker updates live instantly. There is no need to manually deploy css code. Changes persist dynamically across client browser reloads.
                                </span>
                              </div>
                            </div>

                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-200 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                addSystemLog('admin', `Customized look and feel: title="${brandName}", initials="${brandLogoText}", hex="${brandColor}"`);
                                alert("Success! Brand Identity updated and propagated successfully across all panels. All changes persist automatically.");
                              }}
                              className="px-6 py-2.5 bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-sans font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:brightness-105 transition-all text-center flex items-center justify-center gap-1.5 font-sans"
                            >
                              <CheckSquare className="w-4 h-4" />
                              Save branding properties
                            </button>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PREMIUM SYSTEM ANNOUNCEMENT BANNER */}
                <div id="system-broadcast-config-card" className="bg-white rounded-2xl border-2 border-gray-100 p-5 sm:p-6 text-left space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                        <Megaphone className="w-4 h-4 text-brand-purple shrink-0 animate-pulse" />
                        📢 Public Student Announcement Banner Configuration (စနစ်အလံထုတ်ပြန်ချက်)
                      </h4>
                      <p className="text-[10px] text-brand-muted font-sans font-semibold mt-1">
                        Compose and update the global scrolling dynamic announcement marquee bar displayed instantly on all students' dashboards.
                      </p>
                    </div>

                    {/* Miniature live status indicator badge */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto select-none">
                      {activeBroadcast ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8.5px] font-sans font-black uppercase text-brand-green bg-gradient-to-r from-green-50 to-emerald-50 text-brand-green border border-brand-green/30 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-brand-green text-transparent inline-block">●</span> LIVE STREAMING
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[8.5px] font-sans font-black uppercase text-brand-muted bg-gray-50 border border-gray-200">
                          ○ HIDDEN / OFFLINE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Split Visual Layout for Announcement Banner */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Form & Template Pills */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[9.5px] font-sans font-black text-brand-dark uppercase tracking-wider">
                            Compose Marquee Text (မြန်မာ/အင်္ဂလိပ်/ထိုင်း)
                          </label>
                          <span className="text-[9px] font-mono text-brand-muted font-bold block select-none">
                            {activeBroadcastInput.length} characters
                          </span>
                        </div>
                        <textarea
                          placeholder="Welcome students! Enter the update notification marquee bar text here..."
                          value={activeBroadcastInput}
                          onChange={(e) => setActiveBroadcastInput(e.target.value)}
                          rows={3}
                          className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-semibold font-sans focus:border-brand-purple focus:outline-none transition-colors text-brand-dark placeholder-gray-400 bg-gray-50/30 font-sans"
                        />
                      </div>

                      {/* Quick Template Pills */}
                      <div className="space-y-2 bg-[#fcfbfe] border border-brand-purple/10 p-3 rounded-xl">
                        <span className="block text-[9px] font-sans font-black text-brand-purple uppercase tracking-wider select-none">
                          ⚡ Quick Pre-configured Templates:
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {[
                            {
                              label: "Maintenance 🛠️",
                              text: "System maintenance is scheduled for tonight at 11:30 PM (MMT). The application database will be updated for roughly 20 mins. 🛠️"
                            },
                            {
                              label: "New Lesson Content 📚",
                              text: "Exciting News! Level 10 dialogues and vocabulary list with native speed audio clips are now added! Check them out in learning path! 📚"
                            },
                            {
                              label: "Handbook Sale 📕",
                              text: "Exclusive promo active! Get access code for advanced Thai-Myanmar Grammar Manual with worksheets for 50% off! 📕"
                            },
                            {
                              label: "Double XP Boost ⚡",
                              text: "Supercharge weekend is here! Earn double XP (+2x score multiplier) on all translation quizzes until Sunday midnight. Go go go! ⚡"
                            }
                          ].map((pill, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setActiveBroadcastInput(pill.text)}
                              className="px-2 py-1 bg-white hover:bg-brand-purple/5 text-brand-dark hover:text-brand-purple border border-gray-250 hover:border-brand-purple/30 rounded-lg text-[9.5px] font-semibold font-sans transition-all cursor-pointer text-left shadow-3xs"
                            >
                              {pill.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (!activeBroadcastInput.trim()) {
                              alert("Please enter message body before broadcasting.");
                              return;
                            }
                            setActiveBroadcast(activeBroadcastInput);
                            localStorage.setItem('thai_active_broadcast', activeBroadcastInput);
                            addSystemLog('admin', `Updated system broadcast marquee alert`);
                          }}
                          className="flex-1 py-3 bg-brand-purple hover:bg-brand-purple/95 border-b-4 border-brand-purple-shadow text-white rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          Publish Live Broadcast
                        </button>
                        <button
                          onClick={() => {
                            setActiveBroadcast('');
                            localStorage.removeItem('thai_active_broadcast');
                            setActiveBroadcastInput('');
                            addSystemLog('admin', 'Disabled system broadcast marquee');
                          }}
                          className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200/60 font-sans font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                          title="Clear banner and hide"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          Disable Banner
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Live Broadcast Simulator Display Container */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#1d232a] to-brand-dark rounded-2xl border-2 border-[#12161a] p-4.5 text-white flex flex-col justify-between items-stretch shadow-md select-none relative overflow-hidden text-left">
                      {/* Grid background effect */}
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

                      <div className="z-10 flex items-center justify-between border-b border-white/10 pb-2.5">
                        <span className="text-[9px] font-mono font-black text-brand-purple-light uppercase tracking-widest flex items-center gap-1.5_wrap">
                          <Activity className="w-3 h-3 text-brand-purple-light shrink-0" />
                          Broadcast Monitor Simulator
                        </span>
                        {activeBroadcast ? (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping" />
                            <span className="text-[8px] font-mono text-brand-green font-extrabold uppercase">TX TRANSMITTING</span>
                          </div>
                        ) : (
                          <span className="text-[8px] font-mono text-gray-500 font-extrabold uppercase">STBY OFFLINE</span>
                        )}
                      </div>

                      {/* Display Screen */}
                      <div className="z-10 my-4 py-6 px-4 bg-black/45 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center min-h-[90px]">
                        {activeBroadcast ? (
                          <div className="w-full space-y-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30">
                              📡 Global Active Marquee Banner
                            </span>
                            <div className="bg-brand-purple text-white py-2 px-3 rounded-xl shadow-inner text-[10px] font-sans font-bold text-left border-l-4 border-amber-300 relative overflow-hidden w-full">
                              <p className="truncate uppercase tracking-wide leading-normal text-white">
                                {activeBroadcast}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-gray-400 font-mono text-xs font-bold uppercase tracking-wide">○ Digital Display Empty</p>
                            <p className="text-gray-500 text-[10px] leading-relaxed max-w-xs font-sans font-semibold">
                              Compose marquee notification text on the left and click "Publish Live Broadcast" to activate.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Simulator Telemetry Footing */}
                      <div className="z-10 border-t border-white/5 pt-2 flex items-center justify-between text-[8.5px] font-mono text-gray-400 font-semibold">
                        <span>Device: Student Client Frame</span>
                        <span>Update: Instant Sync</span>
                      </div>
                    </div>
                  </div>
                </div>






                {/* Curriculum & Lesson Database Manager */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-6" id="admin-curriculum-manager">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 text-brand-purple">
                        <BookOpen className="w-4 h-4 shrink-0 text-brand-purple" />
                        📚 Curriculum & Lesson Database Manager • သင်ရိုးညွှန်းတမ်း တည်းဖြတ်ခြင်း
                      </h4>
                      <p className="text-[10px] font-sans font-bold text-brand-muted mt-1">
                        Add, delete or modify metadata, vocabularies, sentences, grammars, and quizzes for all lessons. All edits persist instantly.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const nextId = lessons.length > 0 ? Math.max(...lessons.map(l => l.id)) + 1 : 1;
                          const newLesson: Lesson = {
                            id: nextId,
                            courseId: adminCurriculumCourseFilter !== 'all' ? adminCurriculumCourseFilter : 'course-basic',
                            titleThai: "บทเรียนใหม่",
                            titlePhonetic: "Bot-riian mai",
                            titleEnglish: "New Custom Lesson " + nextId,
                            titleMyanmar: "သင်ခန်းစာသစ် " + nextId,
                            descriptionEnglish: "This is an interactive custom-created lesson from the Admin console.",
                            descriptionMyanmar: "ဤသင်ခန်းစာကို စီမံခန့်ခွဲသူမှ တိုက်ရိုက်ဖန်တီးထားပါသည်။",
                            dialogue: [
                              {
                                speaker: "A",
                                thai: "สวัสดีครับ",
                                phonetic: "sa-wat-dee khráp",
                                english: "Hello (male)",
                                myanmar: "မင်္ဂလာပါခင်ဗျာ",
                                words: [{ thai: "สวัสดี", phonetic: "sa-wat-dee", english: "Hello", myanmar: "မင်္ဂလာပါ", partOfSpeech: "interjection" }]
                              }
                            ],
                            grammarNotes: [
                              {
                                title: "Polite Particles",
                                titleMyanmar: "ယဉ်ကျေးမှုဆိုင်ရာ အဆုံးသတ်စကားလုံးများ",
                                explanation: "Use khráp for male speakers.",
                                explanationMyanmar: "အမျိုးသားများအတွက် ယဉ်ကျေးစွာ ပြောဆိုရာတွင် khráp ကို ထည့်သွင်းသုံးစွဲရမည်ဖြစ်ပါသည်။",
                                examples: [
                                  { thai: "สวัสดีครับ", phonetic: "sa-wat-dee khráp", english: "Hello (male)", myanmar: "မင်္ဂလာပါခင်ဗျာ" },
                                  { thai: "สบายดีครับ", phonetic: "sa-baai-dee khráp", english: "I am fine (male)", myanmar: "နေကောင်းပါတယ်ခင်ဗျာ" },
                                  { thai: "ขอบคุณครับ", phonetic: "khòop-khun khráp", english: "Thank you (male)", myanmar: "ကျေးဇူးတင်ပါတယ်ခင်ဗျာ" },
                                  { thai: "ขอโทษครับ", phonetic: "khǎaw-thôot khráp", english: "Excuse me (male)", myanmar: "တောင်းပန်ပါတယ်ခင်ဗျာ" },
                                  { thai: "ยินดีครับ", phonetic: "yin-dee khráp", english: "My pleasure", myanmar: "ဝမ်းသာပါတယ်ခင်ဗျာ" },
                                  { thai: "ဟုတ်ကဲ့ပါခင်ဗျာ", phonetic: "khrap", english: "Yes", myanmar: "ဟုတ်ကဲ့ပါခင်ဗျာ" }
                                ]
                              }
                            ],
                            quiz: [
                              {
                                id: "quiz-" + Date.now() + "-1",
                                type: "translate-thai-to-mm",
                                prompt: "What does สวัสดี mean?",
                                promptThai: "สวัสดี",
                                options: ["နေကောင်းလား", "မင်္ဂလာပါ", "ကျေးဇူးတင်ပါတယ်", "သွားတော့မယ်"],
                                correctAnswer: "မင်္ဂလာပါ",
                                explanation: "Sawatdee is the common Thai greeting meaning 'Hello'",
                                explanationMyanmar: "Sawatdee သည် ထိုင်းနှုတ်ဆက်စကား 'မင်္ဂလာပါ' ဖြစ်သည်။"
                              }
                            ]
                          };
                          setLessons([...lessons, newLesson]);
                          setAdminSelectedLessonId(newLesson.id);
                          addSystemLog('admin', `Created a brand-new customized Lesson ${newLesson.id}`);
                        }}
                        className="px-3 py-1.5 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl text-[10px] font-sans font-black flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        CREATE LESSON
                      </button>

                      <button
                        onClick={() => {
                          const ok = window.confirm("Are you absolutely sure you want to reset all curriculum contents back to factory defaults? Custom lessons and word edits will be permanently wiped.");
                          if (ok) {
                            localStorage.removeItem('thai_lessons_curriculum');
                            lessons.forEach(l => {
                              localStorage.removeItem(`thai_custom_vocab_${l.id}`);
                            });
                            setLessons(lessonsData);
                            setAdminSelectedLessonId(lessonsData[0]?.id || null);
                            window.dispatchEvent(new Event('thai_vocab_updated'));
                            addSystemLog('admin', "Perform full factory reset of curriculum database");
                            alert("System curriculum reset to factory baseline!");
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-sans font-black flex items-center gap-1 cursor-pointer transition-colors border border-red-200"
                        title="Reset back to factory template curriculum"
                      >
                        <RefreshCw className="w-3 h-3" />
                        RESET ALL TO FACTORY
                      </button>
                    </div>
                  </div>

                  {/* Drag and Drop Lesson Ordering Deck */}
                  <div className="bg-amber-50/25 border border-amber-200/60 rounded-xl overflow-hidden transition-all duration-200 select-none">
                    {/* Clickable Header for Collapse/Expand toggle */}
                    <button
                      onClick={() => setIsDragReorderExpanded(!isDragReorderExpanded)}
                      className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-amber-100/30 transition-colors text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h5 className="text-[11px] font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 text-brand-purple">
                          🔀 DRAG & REORDER SYLLABUS LESSONS • သင်ခန်းစာများ အစီအစဉ် ပြောင်းလဲရန်
                        </h5>
                        <p className="text-[9.5px] font-sans font-medium text-brand-muted sm:ml-2">
                          {!isDragReorderExpanded ? '(Click to expand drag panel • တည်းဖြတ်ရန် နှိပ်ပါ)' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/50">
                          {lessons.length} LESSONS
                        </span>
                        {isDragReorderExpanded ? (
                          <ChevronUp className="w-4 h-4 text-brand-purple" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-brand-purple" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Section Body */}
                    {isDragReorderExpanded && (
                      <div className="p-4 pt-0 border-t border-gray-150/50 space-y-3.5 bg-white/40">
                        <div className="pt-3.5">
                          <p className="text-[9.5px] font-sans font-medium text-brand-muted">
                            Drag and drop any lesson box below to change the syllabus sequence for students. Click a box to select it for edits.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {lessons.map((l, index) => {
                            const isSelected = l.id === adminSelectedLessonId;
                            const isOver = draggedItemType === 'lessons' && dragOverTargetIndex === index;
                            const isDragging = draggedItemType === 'lessons' && draggedItemIndex === index;
                            return (
                              <div
                                key={l.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index, 'lessons')}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, index, 'lessons')}
                                onClick={() => setAdminSelectedLessonId(l.id)}
                                className={`p-2 rounded-xl border-2 flex items-center gap-2 select-none cursor-grab active:cursor-grabbing transition-all text-xs font-semibold ${
                                  isSelected
                                    ? 'bg-brand-purple/10 border-brand-purple text-brand-purple shadow-sm ring-1 ring-brand-purple/20'
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs text-brand-dark'
                                } ${isOver ? 'border-brand-purple border-dashed scale-95 bg-brand-purple/5' : ''} ${
                                  isDragging ? 'opacity-45 scale-95' : ''
                                }`}
                              >
                                <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none" />
                                <span className="pointer-events-none">
                                  L-{l.id}: <span className="font-extrabold">{l.titleEnglish}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dedicated Syllabus Lessons CSV Bulk Upload Card */}
                  <div className="bg-brand-purple/[0.02] border-2 border-brand-purple/10 p-4 sm:p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="font-sans font-black text-brand-dark text-xs uppercase tracking-wider flex items-center gap-1.5 text-brand-purple">
                          <FileText className="w-4 h-4 shrink-0 text-brand-purple" />
                          📂 Excel/CSV Bulk Syllabus Importer • သင်ခန်းစာများ ဖိုင်ဖြင့်အမြန်ထည့်ရန်
                        </h5>
                        <p className="text-[10px] font-sans font-semibold text-brand-muted mt-1 leading-relaxed text-left">
                          Busy users can download our sample lesson format below, fill in your lesson ids, titles, and descriptions, then drop it here to upload multiple lessons at once instead of manually entering them.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSyllabusImportExpanded(!isSyllabusImportExpanded)}
                        className="px-3 py-1.5 border-2 border-brand-purple/35 bg-[#fbfaff] hover:bg-brand-purple/10 text-brand-purple rounded-xl text-[10px] font-sans font-black flex items-center gap-1 cursor-pointer transition-all shrink-0"
                      >
                        {isSyllabusImportExpanded ? "CLOSE IMPORTER • ပိတ်ရန်" : "OPEN IMPORTER • ဖိုင်တင်ရန်"}
                      </button>
                    </div>

                    {isSyllabusImportExpanded && (
                      <div className="space-y-4 animate-fade-in border-t border-brand-purple/10 pt-4 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left column: Template Downloader */}
                          <div className="bg-white p-4 rounded-xl border border-gray-150 space-y-2.5 flex flex-col justify-between">
                            <div>
                              <h6 className="text-[10.5px] font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1">
                                📋 DOWNLOAD SAMPLE TEMPLATE
                              </h6>
                              <p className="text-[10px] font-sans font-medium text-brand-muted leading-relaxed">
                                Get our structured template to fill on Excel, Google Sheets or Numbers. Save as CSV prior to uploading.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => downloadCsvTemplate('lessons')}
                              className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10.5px] font-black font-sans px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                            >
                              <Download className="w-4 h-4 text-amber-700 animate-pulse" />
                              Download Lesson Template (.csv)
                            </button>
                          </div>

                          {/* Right column: Drag and Drop upload block */}
                          <div className="bg-white p-4 rounded-xl border border-gray-150 space-y-2">
                            <h6 className="text-[10.5px] font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1">
                              📤 UPLOAD & PARSE CSV FILE
                            </h6>
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsSyllabusCsvDragOver(true);
                              }}
                              onDragLeave={() => setIsSyllabusCsvDragOver(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsSyllabusCsvDragOver(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) {
                                  processSyllabusCsvFile(file);
                                }
                              }}
                              onClick={() => {
                                const input = document.getElementById('syllabus-csv-file-selector');
                                if (input) input.click();
                              }}
                              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isSyllabusCsvDragOver ? 'border-brand-purple bg-brand-purple/5 scale-98' : 'border-gray-200 hover:border-brand-purple bg-gray-50/50 hover:bg-white'
                              }`}
                            >
                              <input
                                type="file"
                                id="syllabus-csv-file-selector"
                                accept=".csv"
                                onChange={handleSyllabusCsvFileSelection}
                                className="hidden"
                              />
                              <Upload className="w-5 h-5 text-brand-purple/60 mb-2" />
                              <span className="text-[10.5px] font-sans font-black text-brand-dark text-center truncate max-w-full">
                                {syllabusCsvFileName ? `✓ Selected: ${syllabusCsvFileName}` : "Drag CSV file or Click here to Browse"}
                              </span>
                              <span className="text-[9px] text-brand-muted mt-1">Accepts standard lesson schema CSV file</span>
                            </div>
                          </div>
                        </div>

                        {/* Parsed Output Details */}
                        {syllabusCsvFile && (
                          <div className="bg-white border border-brand-purple/20 rounded-xl p-4 space-y-3.5 animate-fade-in text-brand-dark text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                              <div>
                                <h6 className="text-[10.5px] font-sans font-black uppercase text-brand-dark flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-brand-green" />
                                  PARSED LESSONS PREVIEW • အရေအတွက် စစ်ဆေးရန်
                                </h6>
                                <p className="text-[9px] text-brand-muted font-medium">
                                  Check parsed row values below. If IDs match an existing lesson, its english/myanmar values will be updated while preserving all vocab/quizzes inside.
                                </p>
                              </div>
                              <div className="text-[10px] font-mono font-black text-brand-purple bg-brand-purple/5 px-2.5 py-1 rounded-full shrink-0">
                                {syllabusCsvParsedData.length} Lessons Found
                              </div>
                            </div>

                            {/* Syllabus errors list */}
                            {syllabusCsvErrors.length > 0 && (
                              <div className="bg-red-50 border border-red-150 p-3 rounded-lg text-[10px] space-y-1 max-h-[120px] overflow-y-auto font-sans text-red-700">
                                <span className="font-extrabold flex items-center gap-1">⚠ Parsing Errors Detected:</span>
                                <ul className="list-disc pl-4 space-y-0.5 font-medium">
                                  {syllabusCsvErrors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Table of read results */}
                            <div className="max-h-[180px] overflow-y-auto border border-gray-200 rounded-lg overflow-x-auto">
                              <table className="w-full text-[10px] text-left border-collapse font-sans font-semibold">
                                <thead className="bg-gray-50 text-brand-muted font-black border-b border-gray-200">
                                  <tr>
                                    <th className="p-2 border-r border-gray-200 w-12 text-center">ID</th>
                                    <th className="p-2 border-r border-gray-200">ENGLISH TITLE</th>
                                    <th className="p-2 border-r border-gray-200">MYANMAR TITLE</th>
                                    <th className="p-2">THAI / PHONETIC</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {syllabusCsvParsedData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-brand-purple/5 transition-colors">
                                      <td className="p-2 border-r border-gray-200 font-mono font-extrabold text-brand-purple text-center">{row.id}</td>
                                      <td className="p-2 border-r border-gray-200 font-bold text-brand-dark">{row.titleEnglish}</td>
                                      <td className="p-2 border-r border-gray-200 text-brand-dark">{row.titleMyanmar}</td>
                                      <td className="p-2 text-brand-muted font-mono">{row.titleThai} ({row.titlePhonetic})</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={submitSyllabusCsvImport}
                                className="flex-1 bg-brand-purple hover:bg-brand-purple/95 text-white font-sans font-black text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                              >
                                <CheckSquare className="w-4 h-4" />
                                CONFIRM SYLLABUS IMPORT • တင်သွင်းမှု လျှောက်ထားမည်
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSyllabusCsvFile(null);
                                  setSyllabusCsvParsedData([]);
                                  setSyllabusCsvErrors([]);
                                  setSyllabusCsvFileName('');
                                }}
                                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-xl font-sans font-extrabold text-xs transition-colors cursor-pointer"
                              >
                                Clear File
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Course dropdown filter above select lesson to edit */}
                  <div className="p-3 bg-brand-purple/[0.03] rounded-xl border border-brand-purple/15 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <label className="text-[10px] font-sans font-black text-brand-purple uppercase tracking-wider shrink-0 flex items-center gap-1">
                        Filter Lessons by Course:
                      </label>
                      <select
                        value={adminCurriculumCourseFilter}
                        onChange={(e) => {
                          setAdminCurriculumCourseFilter(e.target.value);
                          setAdminSelectedLessonId(null);
                        }}
                        className="bg-white border-2 border-brand-purple/20 px-3 py-1.5 rounded-lg text-xs font-black font-sans text-brand-purple focus:border-brand-purple focus:outline-none cursor-pointer"
                      >
                        <option value="all">⚡ ALL COURSES (သင်တန်းအားလုံး)</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>
                            🎓 {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-[9.5px] font-sans font-semibold text-brand-muted sm:ml-auto">
                      Only displays lessons matching the selected course filter above.
                    </div>
                  </div>

                  {/* Lesson selection query dropdown */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <label className="text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider shrink-0">
                        SELECT LESSON TO EDIT:
                      </label>
                      <select
                        value={adminSelectedLessonId || ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          setAdminSelectedLessonId(id || null);
                        }}
                        className="bg-white border-2 border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choose a Lesson --</option>
                        {lessons
                          .filter(l => {
                            if (adminCurriculumCourseFilter === 'all') return true;
                            const lessonCourseId = l.courseId || 'course-basic';
                            return lessonCourseId === adminCurriculumCourseFilter;
                          })
                          .map(l => (
                            <option key={l.id} value={l.id}>
                              Lesson {l.id}: {l.titleEnglish} ({l.titleThai})
                            </option>
                          ))}
                      </select>
                    </div>

                    {adminSelectedLessonId && (
                      <button
                        onClick={() => {
                          const confirmed = window.confirm(`Are you absolutely sure you want to delete Lesson ${adminSelectedLessonId} and all its structural contexts?`);
                          if (confirmed) {
                            const updated = lessons.filter(l => l.id !== adminSelectedLessonId);
                            setLessons(updated);
                            addSystemLog('admin', `Permanently deleted Lesson ${adminSelectedLessonId} from curriculums`);
                            setAdminSelectedLessonId(updated[0]?.id || null);
                          }
                        }}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-sans font-black flex items-center gap-1 sm:ml-auto cursor-pointer border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        DELETE LESSON [{adminSelectedLessonId}]
                      </button>
                    )}
                  </div>

                  {/* Selected lesson edits section */}
                  {adminSelectedLessonId && (() => {
                    const selectedLesson = lessons.find(l => l.id === adminSelectedLessonId);
                    if (!selectedLesson) return <p className="text-xs text-brand-muted font-bold font-sans">Selected lesson metadata corrupt.</p>;

                    return (
                      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white">
                        {/* Sub-tab navigation bar */}
                        <div className="flex flex-wrap bg-gray-50 border-b border-gray-200">
                          {([
                            { id: 'metadata', label: '📝 METADATA' },
                            { id: 'vocabulary', label: '📖 VOCABULARY ({wordsCount})' },
                            { id: 'dialogue', label: '💬 DIALOGUE' },
                            { id: 'grammar', label: '🧠 GRAMMAR ({grammarCount})' },
                            { id: 'quiz', label: '⚡ QUIZZES ({quizCount})' }
                          ] as const).map((tab) => {
                            let labelText: string = tab.label;
                            if (tab.id === 'vocabulary') {
                              const wordsList = getCustomVocabList(selectedLesson.id);
                              labelText = tab.label.replace('{wordsCount}', String(wordsList.length));
                            } else if (tab.id === 'grammar') {
                              labelText = tab.label.replace('{grammarCount}', String((selectedLesson.grammarNotes || []).length));
                            } else if (tab.id === 'quiz') {
                              labelText = tab.label.replace('{quizCount}', String((selectedLesson.quiz || []).length));
                            }
                            const isActive = adminEditTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => setAdminEditTab(tab.id)}
                                className={`px-4 py-2.5 text-[10px] font-sans font-black tracking-wider transition-all border-r border-gray-200 cursor-pointer ${
                                  isActive
                                    ? 'bg-white text-brand-purple border-t-2 border-t-brand-purple font-extrabold focus:outline-none'
                                    : 'text-brand-muted hover:bg-gray-100 hover:text-brand-dark'
                                }`}
                              >
                                {labelText}
                              </button>
                            );
                          })}
                        </div>

                        <div className="p-4 sm:p-5 space-y-4">
                          
                          {/* SUB-TAB 1: METADATA */}
                          {adminEditTab === 'metadata' && (
                            <div className="space-y-4 animate-fade-in">
                              <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider border-b pb-1.5 text-brand-purple">
                                Basic Metadata Configuration • အခြေခံအချက်အလက်များ ပြင်ဆင်ရန်
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">English Title</label>
                                  <input
                                    type="text"
                                    value={selectedLesson.titleEnglish}
                                    onChange={(e) => updateLessonField(selectedLesson.id, 'titleEnglish', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">Thai Title</label>
                                  <input
                                    type="text"
                                    value={selectedLesson.titleThai}
                                    onChange={(e) => updateLessonField(selectedLesson.id, 'titleThai', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">Phonetic Title (Pronunciation)</label>
                                  <input
                                    type="text"
                                    value={selectedLesson.titlePhonetic}
                                    onChange={(e) => updateLessonField(selectedLesson.id, 'titlePhonetic', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">Myanmar Title</label>
                                  <input
                                    type="text"
                                    value={selectedLesson.titleMyanmar}
                                    onChange={(e) => updateLessonField(selectedLesson.id, 'titleMyanmar', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                  <label className="block text-[10px] font-sans font-black text-brand-purple uppercase tracking-wider">Assigned Language Course</label>
                                  <select
                                    value={selectedLesson.courseId || 'course-basic'}
                                    onChange={(e) => updateLessonField(selectedLesson.id, 'courseId', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-brand-purple/20 rounded-lg text-xs font-black font-sans text-brand-purple focus:border-brand-purple focus:outline-none cursor-pointer bg-white"
                                  >
                                    {courses.map(c => (
                                      <option key={c.id} value={c.id}>
                                        🎓 {c.name} ({c.id})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">English Short Description</label>
                                <textarea
                                  value={selectedLesson.descriptionEnglish}
                                  onChange={(e) => updateLessonField(selectedLesson.id, 'descriptionEnglish', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">Myanmar Short Description</label>
                                <textarea
                                  value={selectedLesson.descriptionMyanmar}
                                  onChange={(e) => updateLessonField(selectedLesson.id, 'descriptionMyanmar', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                          {/* SUB-TAB 2: VOCABULARY */}
                          {adminEditTab === 'vocabulary' && (() => {
                            const currentVocab = getCustomVocabList(selectedLesson.id);
                            return (
                              <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between gap-4">
                                  <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider border-b pb-1.5 text-brand-purple">
                                    Vocabulary Drills Database • ဝေါဟာရပြင်ဆင်ရန်
                                  </h5>
                                  <span className="text-[10px] font-mono text-brand-muted font-bold">
                                    {currentVocab.length} words registered
                                  </span>
                                </div>

                                {/* Add vocabulary word helper inline card */}
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const thai = (form.elements.namedItem('th') as HTMLInputElement).value.trim();
                                    const phonetic = (form.elements.namedItem('ph') as HTMLInputElement).value.trim();
                                    const english = (form.elements.namedItem('en') as HTMLInputElement).value.trim();
                                    const myanmar = (form.elements.namedItem('mm') as HTMLInputElement).value.trim();
                                    const pos = (form.elements.namedItem('pos') as HTMLSelectElement).value;

                                    if (!thai || !myanmar) {
                                      alert("Please specify at least Thai Characters and Myanmar translation!");
                                      return;
                                    }

                                    const newWord: WordBreakdown = { thai, phonetic, english, myanmar, partOfSpeech: pos };
                                    const updated = [...currentVocab, newWord];
                                    handleSaveVocabList(selectedLesson.id, updated);
                                    form.reset();
                                  }}
                                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-3"
                                >
                                  <div className="sm:col-span-5 border-b border-gray-200 pb-1.5 mb-1 flex items-center justify-between">
                                    <span className="text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                                      ➕ Add Word to Lesson Vocabulary List
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Thai Word</label>
                                    <input
                                      name="th"
                                      type="text"
                                      placeholder="สวัสดี"
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-semibold focus:border-brand-purple focus:outline-none"
                                      required
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Phonetic</label>
                                    <input
                                      name="ph"
                                      type="text"
                                      placeholder="sa-wat-dee"
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-semibold focus:border-brand-purple focus:outline-none"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">English</label>
                                    <input
                                      name="en"
                                      type="text"
                                      placeholder="Hello"
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-semibold focus:border-brand-purple focus:outline-none"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Myanmar</label>
                                    <input
                                      name="mm"
                                      type="text"
                                      placeholder="မင်္ဂလာပါ"
                                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-semibold focus:border-brand-purple focus:outline-none"
                                      required
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Part of Speech</label>
                                    <select name="pos" className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-semibold bg-white cursor-pointer focus:border-brand-purple focus:outline-none">
                                      <option value="noun">noun (နာမ်)</option>
                                      <option value="verb">verb (ကြိယာ)</option>
                                      <option value="adjective">adjective (နာမဝိသေသန)</option>
                                      <option value="pronoun">pronoun (နာမ်စား)</option>
                                      <option value="particle">particle (စကားလုံးနောက်ဆက်)</option>
                                      <option value="phrase">phrase (စကားစု)</option>
                                      <option value="interjection">interjection (အာမေဍိတ်)</option>
                                    </select>
                                  </div>

                                  <button
                                    type="submit"
                                    className="sm:col-span-5 w-full bg-brand-purple text-white text-[11px] font-sans font-black py-2 rounded-lg mt-2 cursor-pointer hover:bg-brand-purple/90 transition-colors uppercase tracking-wider"
                                  >
                                    ➕ ADD WORD TO LESSON {selectedLesson.id}
                                  </button>
                                </form>

                                 {/* List of current word database */}
                                 <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2.5 bg-gray-50/20">
                                   {currentVocab.length === 0 ? (
                                     <p className="text-center py-6 text-xs text-brand-muted font-bold font-sans">No vocabulary entries. Add some above!</p>
                                   ) : (
                                     currentVocab.map((w, index) => {
                                       const isEditing = editingVocabIndex === index;
                                       return (
                                         <div
                                           key={index}
                                           draggable={!isEditing}
                                           onDragStart={(e) => handleDragStart(e, index, 'vocab')}
                                           onDragOver={(e) => handleDragOver(e, index)}
                                           onDragEnd={handleDragEnd}
                                           onDrop={(e) => handleDrop(e, index, 'vocab')}
                                           className={`p-2.5 rounded-lg border-2 flex items-center justify-between gap-4 text-xs font-sans transition-all ${
                                             isEditing
                                               ? 'bg-amber-50/40 border-amber-200 shadow-md'
                                               : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs cursor-grab active:cursor-grabbing'
                                           } ${
                                             draggedItemType === 'vocab' && dragOverTargetIndex === index
                                               ? 'border-brand-purple border-dashed bg-brand-purple-light/10 scale-[0.98]'
                                               : ''
                                           } ${
                                             draggedItemType === 'vocab' && draggedItemIndex === index ? 'opacity-40 scale-[0.98]' : ''
                                           }`}
                                         >
                                           {!isEditing && (
                                             <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0 select-none cursor-grab active:cursor-grabbing hover:text-brand-purple" />
                                           )}
                                           <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                                             {isEditing ? (
                                               <>
                                                 <div>
                                                   <span className="text-[8px] font-black text-amber-600 uppercase block mb-0.5">Thai *</span>
                                                   <input
                                                     type="text"
                                                     value={editingVocabThai}
                                                     onChange={(e) => setEditingVocabThai(e.target.value)}
                                                     className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none bg-white"
                                                   />
                                                 </div>
                                                 <div>
                                                   <span className="text-[8px] font-black text-amber-600 uppercase block mb-0.5">Phonetic</span>
                                                   <input
                                                     type="text"
                                                     value={editingVocabPhonetic}
                                                     onChange={(e) => setEditingVocabPhonetic(e.target.value)}
                                                     className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-sans text-brand-dark focus:border-brand-purple focus:outline-none bg-white font-semibold"
                                                   />
                                                 </div>
                                                 <div>
                                                   <span className="text-[8px] font-black text-amber-600 uppercase block mb-0.5">English</span>
                                                   <input
                                                     type="text"
                                                     value={editingVocabEnglish}
                                                     onChange={(e) => setEditingVocabEnglish(e.target.value)}
                                                     className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-sans text-brand-dark focus:border-brand-purple focus:outline-none bg-white"
                                                   />
                                                 </div>
                                                 <div>
                                                   <span className="text-[8px] font-black text-amber-600 uppercase block mb-0.5">Myanmar // POS *</span>
                                                   <input
                                                     type="text"
                                                     value={editingVocabMyanmar}
                                                     onChange={(e) => setEditingVocabMyanmar(e.target.value)}
                                                     className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none bg-white mb-1.5"
                                                   />
                                                   <select
                                                     value={editingVocabPos}
                                                     onChange={(e) => setEditingVocabPos(e.target.value)}
                                                     className="w-full px-1.5 py-1 border border-gray-300 rounded text-[9px] uppercase font-bold font-sans text-brand-purple focus:border-brand-purple focus:outline-none bg-white"
                                                   >
                                                     <option value="noun">noun (နာမ်)</option>
                                                     <option value="verb">verb (ကြိယာ)</option>
                                                     <option value="adjective">adjective (နာမဝိသေသန)</option>
                                                     <option value="pronoun">pronoun (နာမ်စား)</option>
                                                     <option value="particle">particle (စကားလုံးနောက်ဆက်)</option>
                                                     <option value="phrase">phrase (စကားစု)</option>
                                                     <option value="interjection">interjection (အာမေဍိတ်)</option>
                                                   </select>
                                                 </div>
                                               </>
                                             ) : (
                                               <>
                                                 <div>
                                                   <span className="text-[8px] font-black text-brand-muted uppercase block">Thai</span>
                                                   <strong className="text-brand-dark text-sm">{w.thai}</strong>
                                                 </div>
                                                 <div>
                                                   <span className="text-[8px] font-black text-brand-muted uppercase block">Phonetic</span>
                                                   <span className="text-brand-dark italic">{w.phonetic || "-"}</span>
                                                 </div>
                                                 <div>
                                                   <span className="text-[8px] font-black text-brand-muted uppercase block">English Meaning</span>
                                                   <span className="text-brand-dark">{w.english || "-"}</span>
                                                 </div>
                                                 <div>
                                                   <span className="text-[8px] font-black text-brand-muted uppercase block">Myanmar // POS</span>
                                                   <span className="text-brand-dark block font-bold">{w.myanmar}</span>
                                                   <span className="text-[9px] uppercase font-bold text-brand-purple bg-brand-purple-light/40 px-1 py-0.5 rounded w-fit block mt-0.5">{w.partOfSpeech}</span>
                                                 </div>
                                               </>
                                             )}
                                           </div>

                                           <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                                             {isEditing ? (
                                               <>
                                                 <button
                                                   onClick={() => {
                                                     if (!editingVocabThai.trim() || !editingVocabMyanmar.trim()) {
                                                       alert("Please specify at least Thai characters and Myanmar translation!");
                                                       return;
                                                     }
                                                     const updated = [...currentVocab];
                                                     updated[index] = {
                                                       thai: editingVocabThai.trim(),
                                                       phonetic: editingVocabPhonetic.trim(),
                                                       english: editingVocabEnglish.trim(),
                                                       myanmar: editingVocabMyanmar.trim(),
                                                       partOfSpeech: editingVocabPos as any
                                                     };
                                                     handleSaveVocabList(selectedLesson.id, updated);
                                                     setEditingVocabIndex(null);
                                                   }}
                                                   className="p-1.5 bg-brand-green hover:bg-brand-green/90 text-white rounded cursor-pointer transition-colors"
                                                   title="Keep Edits"
                                                 >
                                                   <Check className="w-3.5 h-3.5" />
                                                 </button>
                                                 <button
                                                   onClick={() => setEditingVocabIndex(null)}
                                                   className="p-1.5 bg-gray-150 hover:bg-gray-200 text-gray-600 rounded cursor-pointer transition-colors"
                                                   title="Discard Edits"
                                                 >
                                                   <X className="w-3.5 h-3.5" />
                                                 </button>
                                               </>
                                             ) : (
                                               <>
                                                 <button
                                                   onClick={() => {
                                                     setEditingVocabIndex(index);
                                                     setEditingVocabThai(w.thai);
                                                     setEditingVocabPhonetic(w.phonetic || '');
                                                     setEditingVocabEnglish(w.english || '');
                                                     setEditingVocabMyanmar(w.myanmar);
                                                     setEditingVocabPos(w.partOfSpeech || 'noun');
                                                   }}
                                                   className="p-1.5 hover:bg-gray-100 text-brand-purple rounded cursor-pointer transition-colors"
                                                   title="Edit word entry"
                                                 >
                                                   <Pencil className="w-3.5 h-3.5" />
                                                 </button>
                                                 <button
                                                   onClick={() => {
                                                     const confirmed = window.confirm(`Are you sure you want to delete the word "${w.thai}"?`);
                                                     if (confirmed) {
                                                       const updated = currentVocab.filter((_, i) => i !== index);
                                                       handleSaveVocabList(selectedLesson.id, updated);
                                                     }
                                                   }}
                                                   className="p-1.5 hover:bg-red-50 text-red-500 rounded cursor-pointer transition-colors"
                                                   title="Delete Word"
                                                 >
                                                   <Trash2 className="w-3.5 h-3.5" />
                                                 </button>
                                               </>
                                             )}
                                           </div>
                                         </div>
                                       );
                                     })
                                   )}
                                 </div>
                              </div>
                            );
                          })()}

                          {/* SUB-TAB 3: DIALOGUE */}
                          {adminEditTab === 'dialogue' && (() => {
                            const currentDialogue = [...(selectedLesson.dialogue || [])];
                            return (
                              <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between gap-4">
                                  <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider border-b pb-1.5 text-brand-purple">
                                    Dialogue Configuration Builder • စကားပြောခန်းများ ပြင်ဆင်ရန်
                                  </h5>
                                  <button
                                    onClick={() => {
                                      const newLine: DialogueLine = {
                                        speaker: "A",
                                        thai: "สบายดีครับ",
                                        phonetic: "sa-baai-dee khráp",
                                        english: "I am fine.",
                                        myanmar: "နေကောင်းပါတယ်ခင်ဗျာ",
                                        words: []
                                      };
                                      handleSaveDialogue(selectedLesson.id, [...currentDialogue, newLine]);
                                    }}
                                    className="px-3 py-1 bg-brand-purple text-white text-[10px] font-sans font-black rounded-lg flex items-center gap-1 cursor-pointer hover:bg-brand-purple/90"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    ADD LINE
                                  </button>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto p-1 bg-gray-50/50 rounded-xl border p-2">
                                  {/* Dialogue Video Practice URL (Optional) whole lesson practice input before any dialogue cards */}
                                  <div className="bg-white p-3.5 rounded-xl border border-brand-purple/20 hover:border-brand-purple/40 transition-colors space-y-2 shadow-2xs">
                                    <label className="block text-[10px] font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                                      <span>🎥 Dialogue Video Practice URL (Optional)</span>
                                      <span className="text-[8px] bg-brand-purple-light text-brand-purple px-1.5 py-0.5 rounded font-bold uppercase select-none">Whole Lesson Practice</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={selectedLesson.wholeDialogueVideoUrl || ''}
                                      onChange={(e) => updateLessonField(selectedLesson.id, 'wholeDialogueVideoUrl', e.target.value)}
                                      placeholder="e.g. YouTube embed URL (https://www.youtube.com/embed/...)"
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none placeholder-gray-400"
                                    />
                                    <p className="text-[8.5px] font-sans text-brand-muted font-medium">
                                      Provide a video URL (e.g. YouTube iframe embed version) to play a full conversational practice sequence of the active dialogue.
                                    </p>
                                  </div>

                                  {currentDialogue.length === 0 ? (
                                    <p className="text-center py-6 text-xs text-brand-muted font-bold font-sans">No dialogue lines configured. Click Add above!</p>
                                  ) : (
                                    currentDialogue.map((dl, index) => (
                                      <div
                                        key={index}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index, 'dialogue')}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) => handleDrop(e, index, 'dialogue')}
                                        className={`bg-white border-2 rounded-xl p-4 space-y-3 relative shadow-xs cursor-grab active:cursor-grabbing transition-all ${
                                          draggedItemType === 'dialogue' && dragOverTargetIndex === index
                                            ? 'border-brand-purple border-dashed bg-brand-purple-light/10 scale-[0.98]'
                                            : 'border-gray-200 hover:border-gray-300'
                                        } ${
                                          draggedItemType === 'dialogue' && draggedItemIndex === index ? 'opacity-40 scale-[0.98]' : ''
                                        }`}
                                      >
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                          <div className="text-[9px] font-sans font-black text-brand-muted uppercase bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 select-none pointer-events-none">
                                            <GripVertical className="w-3 h-3 text-gray-400" />
                                            LINE {index + 1}
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updated = currentDialogue.filter((_, i) => i !== index);
                                              handleSaveDialogue(selectedLesson.id, updated);
                                            }}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                            title="Delete line"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                          <div className="space-y-1">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Speaker</label>
                                            <input
                                              type="text"
                                              value={dl.speaker}
                                              onChange={(e) => {
                                                const updated = [...currentDialogue];
                                                updated[index].speaker = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, dialogue: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Thai text</label>
                                            <input
                                              type="text"
                                              value={dl.thai}
                                              onChange={(e) => {
                                                const updated = [...currentDialogue];
                                                updated[index].thai = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, dialogue: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Phonetic</label>
                                            <input
                                              type="text"
                                              value={dl.phonetic}
                                              onChange={(e) => {
                                                const updated = [...currentDialogue];
                                                updated[index].phonetic = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, dialogue: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">English Meaning</label>
                                            <input
                                              type="text"
                                              value={dl.english}
                                              onChange={(e) => {
                                                const updated = [...currentDialogue];
                                                updated[index].english = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, dialogue: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-3">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Myanmar Translation</label>
                                            <input
                                              type="text"
                                              value={dl.myanmar}
                                              onChange={(e) => {
                                                const updated = [...currentDialogue];
                                                updated[index].myanmar = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, dialogue: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-5 border-t border-gray-100 pt-2 mt-1">
                                            <label className="block text-[9px] font-sans font-black text-brand-purple uppercase flex items-center gap-1.5">
                                              <span>📹 Line Speaker Video URL (Optional)</span>
                                              <span className="text-[8px] bg-brand-purple-light text-brand-purple px-1 py-0.2 rounded font-bold uppercase select-none">Dual-Speaker Line Video</span>
                                            </label>
                                            <input
                                              type="text"
                                              value={dl.videoUrl || ''}
                                              onChange={(e) => {
                                                const updated = [...currentDialogue];
                                                updated[index].videoUrl = e.target.value || undefined;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, dialogue: updated } : l));
                                              }}
                                              placeholder="e.g. video URL (direct .mp4 link)"
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none placeholder-gray-400"
                                            />
                                            <p className="text-[8px] font-sans text-brand-muted mt-0.5 font-medium leading-none">
                                              Specify a custom speaker-specific loop or demonstration video for this dialogue line.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <button
                                  onClick={() => handleSaveDialogue(selectedLesson.id, currentDialogue)}
                                  className="w-full bg-brand-green text-white text-[11px] font-sans font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer hover:bg-brand-green/90 transition-colors"
                                >
                                  💾 SAVE DIALOGUE CONFIGURATION
                                </button>
                              </div>
                            );
                          })()}

                          {/* SUB-TAB 4: GRAMMAR */}
                          {adminEditTab === 'grammar' && (() => {
                            const currentGrammar = [...(selectedLesson.grammarNotes || [])];
                            return (
                              <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between gap-4">
                                  <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider border-b pb-1.5 text-brand-purple">
                                    Grammar Notes Rules Engine • သဒ္ဒါစည်းမျဉ်းများ ပြင်ဆင်ရန်
                                  </h5>
                                  <button
                                    onClick={() => {
                                      const newGrammar: GrammarNote = {
                                        title: "New Grammar Point",
                                        titleMyanmar: "သဒ္ဒါအချက်အလတ်သစ်",
                                        explanation: "Explanation in English context.",
                                        explanationMyanmar: "မြန်မာလိုရှင်းလင်းချက် အကျဉ်းချုပ်။",
                                        examples: []
                                      };
                                      handleSaveGrammarNotes(selectedLesson.id, [...currentGrammar, newGrammar]);
                                    }}
                                    className="px-3 py-1 bg-brand-purple text-white text-[10px] font-sans font-black rounded-lg flex items-center gap-1 cursor-pointer hover:bg-brand-purple/90"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    ADD GRAMMAR POINT
                                  </button>
                                </div>

                                <div className="space-y-6 max-h-[500px] overflow-y-auto p-1 bg-gray-50/50 border rounded-xl p-2">
                                  {currentGrammar.length === 0 ? (
                                    <p className="text-center py-6 text-xs text-brand-muted font-bold font-sans">No grammar notes configured. Click Add above!</p>
                                  ) : (
                                    currentGrammar.map((gn, index) => (
                                      <div
                                        key={index}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index, 'grammar')}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) => handleDrop(e, index, 'grammar')}
                                        className={`bg-white border-2 rounded-xl p-4 space-y-4 relative shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                                          draggedItemType === 'grammar' && dragOverTargetIndex === index
                                            ? 'border-brand-purple border-dashed bg-brand-purple-light/10 scale-[0.98]'
                                            : 'border-gray-200 hover:border-gray-300'
                                        } ${
                                          draggedItemType === 'grammar' && draggedItemIndex === index ? 'opacity-40 scale-[0.98]' : ''
                                        }`}
                                      >
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                          <div className="text-[9px] font-sans font-black text-brand-muted uppercase bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 select-none pointer-events-none">
                                            <GripVertical className="w-3 h-3 text-gray-400" />
                                            RULE {index + 1}
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updated = currentGrammar.filter((_, i) => i !== index);
                                              handleSaveGrammarNotes(selectedLesson.id, updated);
                                            }}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Grammar Notes"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Grammar Title (English)</label>
                                            <input
                                              type="text"
                                              value={gn.title}
                                              onChange={(e) => {
                                                const updated = [...currentGrammar];
                                                updated[index].title = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Grammar Title (Myanmar)</label>
                                            <input
                                              type="text"
                                              value={gn.titleMyanmar}
                                              onChange={(e) => {
                                                const updated = [...currentGrammar];
                                                updated[index].titleMyanmar = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">English Explanation</label>
                                            <textarea
                                              value={gn.explanation}
                                              onChange={(e) => {
                                                const updated = [...currentGrammar];
                                                updated[index].explanation = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                              }}
                                              rows={2}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Myanmar Explanation</label>
                                            <textarea
                                              value={gn.explanationMyanmar}
                                              onChange={(e) => {
                                                const updated = [...currentGrammar];
                                                updated[index].explanationMyanmar = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                              }}
                                              rows={2}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>
                                        </div>

                                        {/* Examples for this Grammar Note */}
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                                          <div className="flex items-center justify-between gap-2 border-b border-gray-250 pb-1.5">
                                            <span className="text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider flex items-center gap-1">
                                              <CheckCircle className="w-3.5 h-3.5 text-brand-green" />
                                              Grammar Examples ({gn.examples?.length || 0}) (Must include exactly 6 for best performance!)
                                            </span>
                                            <button
                                              onClick={() => {
                                                const updated = [...currentGrammar];
                                                if (!updated[index].examples) updated[index].examples = [];
                                                updated[index].examples.push({
                                                  thai: "ไทย",
                                                  phonetic: "thai",
                                                  english: "Thai language",
                                                  myanmar: "ထိုင်းစကား"
                                                });
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                              }}
                                              className="px-2 py-1 bg-brand-purple-light text-brand-purple text-[9px] font-sans font-black rounded cursor-pointer hover:bg-brand-purple/10"
                                            >
                                              ➕ ADD EXAMPLE ROW
                                            </button>
                                          </div>

                                          <div className="space-y-2">
                                            {(!gn.examples || gn.examples.length === 0) ? (
                                              <p className="text-[10px] text-brand-muted font-bold block text-center">No grammatical examples defined.</p>
                                            ) : (
                                              gn.examples.map((ex, exIdx) => (
                                                <div key={exIdx} className="bg-white p-2 rounded border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-2 relative">
                                                  <button
                                                    onClick={() => {
                                                      const updated = [...currentGrammar];
                                                      updated[index].examples = updated[index].examples.filter((_, i) => i !== exIdx);
                                                      setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black cursor-pointer shadow-xs hover:bg-red-200"
                                                    title="Delete Example"
                                                  >
                                                    ×
                                                  </button>

                                                  <div>
                                                    <span className="text-[7.5px] font-black text-brand-muted uppercase block">Thai</span>
                                                    <input
                                                      type="text"
                                                      placeholder="Thai"
                                                      value={ex.thai}
                                                      onChange={(e) => {
                                                        const updated = [...currentGrammar];
                                                        updated[index].examples[exIdx].thai = e.target.value;
                                                        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                                      }}
                                                      className="w-full px-1.5 py-0.5 border border-gray-200 rounded text-xs text-brand-dark font-semibold mt-0.5"
                                                    />
                                                  </div>
                                                  <div>
                                                    <span className="text-[7.5px] font-black text-brand-muted uppercase block">Phonetic</span>
                                                    <input
                                                      type="text"
                                                      placeholder="Phonetic"
                                                      value={ex.phonetic}
                                                      onChange={(e) => {
                                                        const updated = [...currentGrammar];
                                                        updated[index].examples[exIdx].phonetic = e.target.value;
                                                        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                                      }}
                                                      className="w-full px-1.5 py-0.5 border border-gray-200 rounded text-xs text-brand-dark font-semibold mt-0.5"
                                                    />
                                                  </div>
                                                  <div>
                                                    <span className="text-[7.5px] font-black text-brand-muted uppercase block">English</span>
                                                    <input
                                                      type="text"
                                                      placeholder="English"
                                                      value={ex.english}
                                                      onChange={(e) => {
                                                        const updated = [...currentGrammar];
                                                        updated[index].examples[exIdx].english = e.target.value;
                                                        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                                      }}
                                                      className="w-full px-1.5 py-0.5 border border-gray-200 rounded text-xs text-brand-dark font-semibold mt-0.5"
                                                    />
                                                  </div>
                                                  <div>
                                                    <span className="text-[7.5px] font-black text-brand-muted uppercase block">Myanmar</span>
                                                    <input
                                                      type="text"
                                                      placeholder="Myanmar"
                                                      value={ex.myanmar}
                                                      onChange={(e) => {
                                                        const updated = [...currentGrammar];
                                                        updated[index].examples[exIdx].myanmar = e.target.value;
                                                        setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, grammarNotes: updated } : l));
                                                      }}
                                                      className="w-full px-1.5 py-0.5 border border-gray-200 rounded text-xs text-brand-dark font-semibold mt-0.5"
                                                    />
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <button
                                  onClick={() => handleSaveGrammarNotes(selectedLesson.id, currentGrammar)}
                                  className="w-full bg-brand-green text-white text-[11px] font-sans font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer hover:bg-brand-green/90 transition-colors"
                                >
                                  💾 SAVE GRAMMAR RULES
                                </button>
                              </div>
                            );
                          })()}

                          {/* SUB-TAB 5: QUIZZES */}
                          {adminEditTab === 'quiz' && (() => {
                            const currentQuiz = [...(selectedLesson.quiz || [])];
                            return (
                              <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between gap-4">
                                  <h5 className="text-xs font-sans font-black text-brand-dark uppercase tracking-wider border-b pb-1.5 text-brand-purple">
                                    Interactive Quizzes Database • ပဟေဠိမေးခွန်းများ ပြင်ဆင်ရန်
                                  </h5>
                                  <button
                                    onClick={() => {
                                      const newQuiz: QuizQuestion = {
                                        id: "quiz-" + Date.now() + "-" + (currentQuiz.length + 1),
                                        type: "translate-thai-to-mm",
                                        prompt: "What is the correct translation?",
                                        options: ["Choice A", "Choice B", "Choice C", "Choice D"],
                                        correctAnswer: "Choice A",
                                        explanation: "Explanation",
                                        explanationMyanmar: "ရှင်းလင်းချက်"
                                      };
                                      handleSaveQuizzes(selectedLesson.id, [...currentQuiz, newQuiz]);
                                    }}
                                    className="px-3 py-1 bg-brand-purple text-white text-[10px] font-sans font-black rounded-lg flex items-center gap-1 cursor-pointer hover:bg-brand-purple/90"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    ADD QUIZ QUESTION
                                  </button>
                                </div>

                                <div className="space-y-6 max-h-[500px] overflow-y-auto p-1 bg-gray-50/50 border rounded-xl p-2">
                                  {currentQuiz.length === 0 ? (
                                    <p className="text-center py-6 text-xs text-brand-muted font-bold font-sans">No quizzes configured. Click Add above!</p>
                                  ) : (
                                    currentQuiz.map((qz, index) => (
                                      <div
                                        key={qz.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index, 'quiz')}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) => handleDrop(e, index, 'quiz')}
                                        className={`bg-white border-2 rounded-xl p-4 space-y-3 relative shadow-xs cursor-grab active:cursor-grabbing transition-all ${
                                          draggedItemType === 'quiz' && dragOverTargetIndex === index
                                            ? 'border-brand-purple border-dashed bg-brand-purple-light/10 scale-[0.98]'
                                            : 'border-gray-200 hover:border-gray-300'
                                        } ${
                                          draggedItemType === 'quiz' && draggedItemIndex === index ? 'opacity-40 scale-[0.98]' : ''
                                        }`}
                                      >
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                          <div className="text-[9px] font-sans font-black text-brand-muted uppercase bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 select-none pointer-events-none">
                                            <GripVertical className="w-3 h-3 text-gray-400" />
                                            QUIZ {index + 1}
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updated = currentQuiz.filter((_, i) => i !== index);
                                              handleSaveQuizzes(selectedLesson.id, updated);
                                            }}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                            title="Delete Quiz"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                          <div className="space-y-1">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Question Type</label>
                                            <select
                                              value={qz.type}
                                              onChange={(e) => {
                                                const updated = [...currentQuiz];
                                                updated[index].type = e.target.value as any;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-semibold bg-white cursor-pointer focus:border-brand-purple focus:outline-none"
                                            >
                                              <option value="translate-thai-to-mm">Thai to Myanmar</option>
                                              <option value="translate-mm-to-thai">Myanmar to Thai</option>
                                              <option value="listening-match">Listening audio match</option>
                                              <option value="fill-gap">Fill in the missing gap</option>
                                            </select>
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Prompt (The Question Text)</label>
                                            <input
                                              type="text"
                                              value={qz.prompt}
                                              onChange={(e) => {
                                                const updated = [...currentQuiz];
                                                updated[index].prompt = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Prompt Thai segment (audio query)</label>
                                            <input
                                              type="text"
                                              value={qz.promptThai || ""}
                                              onChange={(e) => {
                                                const updated = [...currentQuiz];
                                                updated[index].promptThai = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold bg-white focus:border-brand-purple focus:outline-none"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-2">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Correct Answer Value (MUST MATCH EXACT OPTION STRING)</label>
                                            <input
                                              type="text"
                                              value={qz.correctAnswer}
                                              onChange={(e) => {
                                                const updated = [...currentQuiz];
                                                updated[index].correctAnswer = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-brand-green/30 rounded text-xs font-bold bg-brand-green-light/20 text-brand-green focus:outline-none"
                                              placeholder="Must match one of the options exactly"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-3">
                                            <span className="block text-[9px] font-sans font-black text-brand-muted uppercase mb-1">
                                              Multiple Choice Options (Exactly 4 Choices)
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                              {[0, 1, 2, 3].map((optIdx) => (
                                                <input
                                                  key={optIdx}
                                                  type="text"
                                                  placeholder={`Choice ${optIdx + 1}`}
                                                  value={qz.options[optIdx] || ""}
                                                  onChange={(e) => {
                                                    const updated = [...currentQuiz];
                                                    const opts = [...(updated[index].options || [])];
                                                    opts[optIdx] = e.target.value;
                                                    updated[index].options = opts;
                                                    setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                                  }}
                                                  className="px-2 py-1.5 border border-gray-300 rounded text-xs font-bold focus:border-brand-purple"
                                                />
                                              ))}
                                            </div>
                                          </div>

                                          <div className="space-y-1 sm:col-span-1.5">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">English Explanation</label>
                                            <input
                                              type="text"
                                              value={qz.explanation || ""}
                                              onChange={(e) => {
                                                const updated = [...currentQuiz];
                                                updated[index].explanation = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold focus:border-brand-purple"
                                            />
                                          </div>

                                          <div className="space-y-1 sm:col-span-1.5">
                                            <label className="block text-[9px] font-sans font-black text-brand-muted uppercase">Myanmar Explanation</label>
                                            <input
                                              type="text"
                                              value={qz.explanationMyanmar || ""}
                                              onChange={(e) => {
                                                const updated = [...currentQuiz];
                                                updated[index].explanationMyanmar = e.target.value;
                                                setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, quiz: updated } : l));
                                              }}
                                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-semibold focus:border-brand-purple"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <button
                                  onClick={() => handleSaveQuizzes(selectedLesson.id, currentQuiz)}
                                  className="w-full bg-brand-green text-white text-[11px] font-sans font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer hover:bg-brand-green/90 transition-colors"
                                >
                                  💾 SAVE QUIZ DATABASE
                                </button>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* CSV Excel Database Import Sync Hub */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 text-brand-purple">
                        <FileText className="w-4 h-4 shrink-0 text-brand-purple" />
                        📂 CSV & Excel Data Import Hub • သင်ခန်းစာများ ဖိုင်ဖြင့်ထည့်သွင်းရန်
                      </h4>
                      <p className="text-[10px] font-sans font-semibold text-brand-muted mt-1 leading-relaxed">
                        Import vocabulary rows, dialogue lines, grammar rules, quizzes, or whole lessons in bulk with standard Excel CSV files. All changes persist instantly to students.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCsvImportExpanded(!isCsvImportExpanded)}
                      className="px-3 py-1.5 border-2 border-brand-purple/20 bg-[#fbfaff] hover:bg-brand-purple/10 text-brand-purple rounded-xl text-[10px] font-sans font-black flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isCsvImportExpanded ? "COLLAPSE PANEL • ပိတ်ပါ" : "EXPAND IMPORT ENGINE • ဖွင့်ပါ"}
                    </button>
                  </div>

                  {isCsvImportExpanded && (
                    <div className="space-y-6 animate-fade-in shadow-xs">
                      {/* Step 1: Download Templates */}
                      <div className="bg-amber-50/25 border border-amber-200/55 p-4 rounded-xl space-y-3.5">
                        <h5 className="text-[11px] font-sans font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                          📊 STEP 1: DOWNLOAD EXCEL / CSV TEMPLATES • စံနမူနာ ဒေါင်းလုဒ် ရယူရန်
                        </h5>
                        <p className="text-[10.5px] font-sans font-medium text-brand-dark leading-relaxed">
                          Click any button below to download the official structural CSV template. Open in Microsoft Excel or Google Sheets, fill in your lesson data, click export/save as CSV, and upload in Step 2.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => downloadCsvTemplate('vocabulary')}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-brand-dark text-[10.5px] font-black font-sans px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
                            Vocabulary Template (.csv)
                          </button>
                          <button
                            onClick={() => downloadCsvTemplate('dialogue')}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-brand-dark text-[10.5px] font-black font-sans px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
                            Dialogue Lines Template (.csv)
                          </button>
                          <button
                            onClick={() => downloadCsvTemplate('grammar')}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-brand-dark text-[10.5px] font-black font-sans px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
                            Grammar Notes Template (.csv)
                          </button>
                          <button
                            onClick={() => downloadCsvTemplate('quiz')}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-brand-dark text-[10.5px] font-black font-sans px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
                            Quiz Questions Template (.csv)
                          </button>
                          <button
                            onClick={() => downloadCsvTemplate('lessons')}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-brand-dark text-[10.5px] font-black font-sans px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-3xs"
                          >
                            <Download className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
                            Lessons Metadata Template (.csv)
                          </button>
                        </div>
                      </div>

                      {/* Step 2: Upload Configurator */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 bg-gray-50 p-4.5 border border-gray-150 rounded-xl">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                            1. Select Import Content type
                          </label>
                          <select
                            value={csvImportType}
                            onChange={(e) => {
                              const type = e.target.value as any;
                              setCsvImportType(type);
                              setCsvFile(null);
                              setCsvParsedData([]);
                              setCsvErrors([]);
                              setCsvFileName('');
                            }}
                            className="w-full bg-white border-2 border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none cursor-pointer"
                          >
                            <option value="vocabulary">Vocabulary List • ဝေါဟာရအသစ်များ</option>
                            <option value="dialogue">Dialogue Conversational Lines • စကားပြောများ</option>
                            <option value="grammar">Grammar Notes & Examples • သဒ္ဒါစည်းမျဉ်း</option>
                            <option value="quiz">Quiz Questions & Choices • ပဟေဠိများ</option>
                            <option value="lessons">Bulk Syllabus Lessons (Metadata) • သင်ခန်းစာအသစ်များ</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                            2. SELECT TARGET LESSON
                          </label>
                          <select
                            disabled={csvImportType === 'lessons'}
                            value={csvImportTargetLesson}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCsvImportTargetLesson(val === 'all' ? 'all' : Number(val));
                            }}
                            className="w-full bg-white border-2 border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold font-sans text-[#3c3c3c] focus:border-brand-purple focus:outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="all">-- Active Selected Lesson ({adminSelectedLessonId || 'None'}) --</option>
                            {lessons.map(l => (
                              <option key={l.id} value={l.id}>
                                Lesson {l.id}: {l.titleEnglish}
                              </option>
                            ))}
                          </select>
                          {csvImportType === 'lessons' && (
                            <p className="text-[9px] text-brand-muted font-bold block pt-1">
                              * Entire curriculum directory mode
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                            3. CHOOSE FILE • ဖိုင်ရွေးချယ်ရန်
                          </label>
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsCsvDragOver(true);
                            }}
                            onDragLeave={() => setIsCsvDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsCsvDragOver(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                processCsvFile(file);
                              }
                            }}
                            className={`border-2 border-dashed rounded-xl px-4 py-2 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                              isCsvDragOver ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                            onClick={() => {
                              const input = document.getElementById('csv-file-selector-input');
                              if (input) input.click();
                            }}
                          >
                            <input
                              type="file"
                              id="csv-file-selector-input"
                              accept=".csv"
                              onChange={handleCsvFileSelection}
                              className="hidden"
                            />
                            <Upload className="w-4 h-4 text-gray-400 mb-1 animate-bounce" />
                            <span className="text-[10px] font-sans font-black text-brand-dark text-center truncate max-w-full">
                              {csvFileName ? `✓ ${csvFileName}` : "Click/Drag CSV here"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Parse Status Preview & Merging */}
                      {csvFile && (
                        <div className="bg-white border-2 border-brand-purple/20 rounded-xl p-4.5 space-y-4 shadow-3xs animate-fade-in text-brand-dark">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                            <div>
                              <h6 className="text-[11px] font-sans font-black uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-brand-purple" />
                                CSV PARSED PREVIEW DETAILS • သွင်းယူမည့် ဒေတာ အကျဉ်းချုပ်
                              </h6>
                              <p className="text-[9.5px] font-sans font-medium text-brand-muted mt-0.5">
                                Verify that column headers and structures align before finalizing the synchronization update.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {csvErrors.length === 0 ? (
                                <span className="bg-brand-green-light border border-brand-green/30 text-brand-green font-mono font-black text-[9.5px] px-3 py-1 rounded-full uppercase">
                                  ✓ Valid Format
                                </span>
                              ) : (
                                <span className="bg-red-50 border border-red-200 text-red-600 font-mono font-black text-[9.5px] px-3 py-1 rounded-full uppercase">
                                  ⚠ {csvErrors.length} Warning(s)
                                </span>
                              )}
                            </div>
                          </div>

                          {csvErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-150 p-3.5 rounded-xl text-[10.5px] font-sans font-semibold text-red-700 space-y-1.5 max-h-[150px] overflow-y-auto">
                              <p className="font-sans font-black">Warning Warnings found in lines/headers structure:</p>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {csvErrors.map((err, idx) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-brand-muted">
                                Content Type: <strong className="text-brand-dark font-black uppercase">{csvImportType}</strong>
                              </span>
                              <span className="text-[10px] font-mono font-bold text-brand-muted">
                                Row Count: <strong className="text-brand-dark font-black">{csvParsedData.length} records found</strong>
                              </span>
                            </div>

                            <div className="max-h-[180px] overflow-y-auto border border-gray-150 rounded-xl overflow-x-auto">
                              <table className="w-full text-[10px] text-left border-collapse font-sans">
                                <thead>
                                  <tr className="bg-gray-100/80 border-b border-gray-200 text-brand-dark font-black tracking-wide uppercase select-none">
                                    <th className="p-2 border-r border-gray-200">#</th>
                                    {csvImportType === 'vocabulary' && (
                                      <>
                                        <th className="p-2 border-r border-gray-200">Thai Word</th>
                                        <th className="p-2 border-r border-gray-200">Phonetic</th>
                                        <th className="p-2 border-r border-gray-200">English</th>
                                        <th className="p-2">Myanmar</th>
                                      </>
                                    )}
                                    {csvImportType === 'dialogue' && (
                                      <>
                                        <th className="p-2 border-r border-gray-200">Speaker</th>
                                        <th className="p-2 border-r border-gray-200">Thai Sentence</th>
                                        <th className="p-2 border-r border-gray-200">English</th>
                                        <th className="p-2">Myanmar</th>
                                      </>
                                    )}
                                    {csvImportType === 'grammar' && (
                                      <>
                                        <th className="p-2 border-r border-gray-200">Title</th>
                                        <th className="p-2 border-r border-gray-200">Title (MM)</th>
                                        <th className="p-2 border-r border-gray-200">Explanation</th>
                                        <th className="p-2">Example Count</th>
                                      </>
                                    )}
                                    {csvImportType === 'quiz' && (
                                      <>
                                        <th className="p-2 border-r border-gray-200">Type</th>
                                        <th className="p-2 border-r border-gray-200">Prompt</th>
                                        <th className="p-2 border-r border-gray-200">Options</th>
                                        <th className="p-2">Correct Answer</th>
                                      </>
                                    )}
                                    {csvImportType === 'lessons' && (
                                      <>
                                        <th className="p-2 border-r border-gray-200">ID</th>
                                        <th className="p-2 border-r border-gray-200">English Title</th>
                                        <th className="p-2 border-r border-gray-200">Myanmar Title</th>
                                        <th className="p-2">Description</th>
                                      </>
                                    )}
                                  </tr>
                                </thead>
                                <tbody className="bg-white/50 text-brand-dark font-semibold">
                                  {csvParsedData.slice(0, 5).map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-brand-purple/5 transition-colors">
                                      <td className="p-2 border-r border-gray-200 font-mono text-brand-muted text-center">{idx + 1}</td>
                                      {csvImportType === 'vocabulary' && (
                                        <>
                                          <td className="p-2 border-r border-gray-200 text-brand-purple font-bold text-xs">{row.thai}</td>
                                          <td className="p-2 border-r border-gray-200 italic font-mono text-brand-green">{row.phonetic}</td>
                                          <td className="p-2 border-r border-gray-200">{row.english}</td>
                                          <td className="p-2">{row.myanmar}</td>
                                        </>
                                      )}
                                      {csvImportType === 'dialogue' && (
                                        <>
                                          <td className="p-2 border-r border-gray-200 font-mono text-center font-black">{row.speaker}</td>
                                          <td className="p-2 border-r border-gray-200 text-brand-purple font-bold text-xs">{row.thai}</td>
                                          <td className="p-2 border-r border-gray-200">{row.english}</td>
                                          <td className="p-2">{row.myanmar}</td>
                                        </>
                                      )}
                                      {csvImportType === 'grammar' && (
                                        <>
                                          <td className="p-2 border-r border-gray-200 text-brand-purple font-bold">{row.title}</td>
                                          <td className="p-2 border-r border-gray-200">{row.titleMyanmar}</td>
                                          <td className="p-2 border-r border-gray-200 truncate max-w-xs">{row.explanation}</td>
                                          <td className="p-2 font-mono text-center">{row.examples?.length || 0} examples</td>
                                        </>
                                      )}
                                      {csvImportType === 'quiz' && (
                                        <>
                                          <td className="p-2 border-r border-gray-200 font-mono text-[9px] uppercase">{row.type}</td>
                                          <td className="p-2 border-r border-gray-200 truncate max-w-xs">{row.prompt}</td>
                                          <td className="p-2 border-r border-gray-200 truncate max-w-xs">{row.options?.join(' | ')}</td>
                                          <td className="p-2 text-brand-green font-bold">{row.correctAnswer}</td>
                                        </>
                                      )}
                                      {csvImportType === 'lessons' && (
                                        <>
                                          <td className="p-2 border-r border-gray-200 font-mono font-bold text-center">{row.id}</td>
                                          <td className="p-2 border-r border-gray-200">{row.titleEnglish}</td>
                                          <td className="p-2 border-r border-gray-200">{row.titleMyanmar}</td>
                                          <td className="p-2 truncate max-w-xs">{row.descriptionEnglish}</td>
                                        </>
                                      )}
                                    </tr>
                                  ))}
                                  {csvParsedData.length > 5 && (
                                    <tr className="bg-gray-50/50">
                                      <td colSpan={10} className="p-2 text-center text-brand-muted font-mono italic">
                                        ... and {csvParsedData.length - 5} more rows parsed and ready ...
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            <div className="pt-3 flex gap-3">
                              <button
                                type="button"
                                onClick={submitCsvImport}
                                className="flex-1 duo-btn duo-btn-purple text-xs font-black py-3 select-none uppercase tracking-wide flex items-center justify-center gap-1.5"
                              >
                                <CheckSquare className="w-4 h-4" />
                                IMPORT NOW • ဒေတာထည့်သွင်းပါ
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCsvFile(null);
                                  setCsvParsedData([]);
                                  setCsvErrors([]);
                                  setCsvFileName('');
                                }}
                                className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-sans font-black text-xs transition-colors cursor-pointer"
                              >
                                Clear File
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Audit Logs feed */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4">
                  <div className="flex items-center justify-between gap-4 pb-2 border-b border-gray-100">
                    <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-brand-purple shrink-0" />
                      Live Server Audit Log Feed
                    </h4>
                    <button
                      onClick={() => setSystemLogs([])}
                      className="text-xs text-brand-muted hover:text-red-500 font-sans font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3" />
                      Clear log traces
                    </button>
                  </div>

                  {systemLogs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-brand-muted font-sans font-semibold">No recent server actions logged.</div>
                  ) : (
                    <div className="space-y-1.5 h-64 overflow-y-auto pr-1 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                      {systemLogs.map((log) => (
                        <div key={log.id} className="text-[11px] leading-tight py-1.5 px-2 bg-white rounded border border-gray-50 font-mono text-[#444] flex items-center justify-between gap-6 flex-wrap">
                          <p>
                            <span className="text-brand-purple font-black">[@{log.user}]</span>
                            <span className="text-brand-dark font-semibold ml-2">{log.action}</span>
                          </p>
                          <span className="text-brand-muted text-[10px] font-sans font-bold shrink-0">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Active Lesson View: Displays study modules dashboard */
          <div className="space-y-6">
            
            {/* Context Header */}
            <div className="duo-card bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <button
                  onClick={() => setActiveLessonId(null)}
                  className="duo-btn duo-btn-white text-xs px-3.5 py-2.5 flex items-center mb-4 font-bold"
                  id="btn-back-dashboard"
                >
                  ← Back to Dashboard • မူလစာမျက်နှာသို့ပြန်သွားရန်
                </button>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-sans text-[#fff] bg-brand-purple px-2.5 py-1 rounded-full border-b-2 border-brand-purple-shadow font-extrabold select-none">
                    LESSON {activeLesson?.id}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-sans font-black text-[#3c3c3c] tracking-tight mt-2 flex flex-wrap items-baseline gap-2">
                  <span>{activeLesson?.titleEnglish}</span>
                  <span className="text-sm font-extrabold text-brand-green italic">({activeLesson?.titleThai} - {activeLesson?.titlePhonetic} = {getMyanmarPhonetic(activeLesson?.titlePhonetic)})</span>
                </h2>
              </div>

              {/* High Score rating badge */}
              <div className="duo-card p-4 shrink-0 text-center md:text-right min-w-36 bg-gradient-to-br from-[#f2eefc]/40 to-transparent">
                <div className="text-[10px] font-sans text-brand-purple uppercase tracking-wider font-extrabold">CHAPTER PROGRESS</div>
                <div className="text-2xl font-sans font-black text-[#583092] mt-0.5">
                  {(progress.quizHighScores[activeLesson?.id || 0] || 0)}%
                </div>
                <div className="text-[10px] font-sans text-brand-muted mt-0.5 font-bold">Highest Exam Score</div>
              </div>
            </div>

            {/* Sub modules study tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-gray-100 gap-2.5 py-2 select-none">
              <button
                onClick={() => setActiveTab('vocabulary')}
                className={`px-3 py-3 rounded-2xl font-sans font-black text-xs transition-transform active:translate-y-0.5 text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'vocabulary'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'bg-white border-2 border-[#e5e5e5] border-b-4 hover:bg-gray-50 text-brand-dark'
                }`}
                id="tab-vocabulary"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Vocab<span className="hidden xs:inline"> • ဝေါဟာရ</span></span>
              </button>

              <button
                onClick={() => setActiveTab('sentence')}
                className={`px-3 py-3 rounded-2xl font-sans font-black text-xs transition-transform active:translate-y-0.5 text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'sentence'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'bg-white border-2 border-[#e5e5e5] border-b-4 hover:bg-gray-50 text-brand-dark'
                }`}
                id="tab-sentence"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Sentence<span className="hidden xs:inline"> • ဝါကျ</span></span>
              </button>

              <button
                onClick={() => setActiveTab('grammar')}
                className={`px-3 py-3 rounded-2xl font-sans font-black text-xs transition-transform active:translate-y-0.5 text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'grammar'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'bg-white border-2 border-[#e5e5e5] border-b-4 hover:bg-gray-50 text-brand-dark'
                }`}
                id="tab-grammar"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Grammar<span className="hidden xs:inline"> • သဒ္ဒါ</span></span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-3 rounded-2xl font-sans font-black text-xs transition-transform active:translate-y-0.5 text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'bg-white border-2 border-[#e5e5e5] border-b-4 hover:bg-gray-50 text-brand-dark'
                }`}
                id="tab-quiz"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Quiz<span className="hidden xs:inline"> • စစ်ဆေးခြင်း</span></span>
              </button>
            </div>

            {/* Active Tab Screen Render */}
            <div className="mt-4">
              {activeTab === 'vocabulary' && activeLesson && (
                <VocabularyView
                  lessonId={activeLesson.id}
                  onWordMastered={handleToggleMasteredWord}
                  masteredWords={progress.masteredWords}
                  audioSpeedIndex={audioSpeedIndex}
                  setAudioSpeedIndex={setAudioSpeedIndex}
                />
              )}

              {activeTab === 'sentence' && activeLesson && (
                <SentenceView
                  sentences={(activeLesson.dialogue && activeLesson.dialogue.length > 0)
                    ? activeLesson.dialogue
                    : (lessonsData.find(l => l.id === activeLesson.id)?.dialogue || [])
                  }
                  onWordMastered={handleToggleMasteredWord}
                  masteredWords={progress.masteredWords}
                  audioSpeedIndex={audioSpeedIndex}
                  setAudioSpeedIndex={setAudioSpeedIndex}
                />
              )}

              {activeTab === 'grammar' && activeLesson && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                  {/* Grammar Notes Pagination Header with Dropdown */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border-2 border-gray-100/80 shadow-xs">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2 h-2 bg-brand-purple rounded-full shrink-0" />
                      <span className="text-xs font-sans text-brand-dark font-black uppercase tracking-wider">
                        Lesson {activeLesson.id} Grammar Guide • သဒ္ဒါလမ်းညွှန်
                      </span>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <label htmlFor="grammar-select" className="sr-only">Choose grammar point</label>
                      <select
                        id="grammar-select"
                        value={currentGrammarPageIndex}
                        onChange={(e) => setCurrentGrammarPageIndex(parseInt(e.target.value))}
                        className="bg-gray-50 border-2 border-gray-200 text-brand-dark text-xs rounded-xl focus:ring-brand-purple focus:border-brand-purple block w-full md:w-72 p-2 font-bold font-sans outline-none cursor-pointer shadow-2xs hover:bg-gray-100 transition-colors"
                      >
                        {activeLesson.grammarNotes.map((note, idx) => (
                          <option key={idx} value={idx}>
                            Goal {idx + 1}: {note.title.length > 35 ? note.title.substring(0, 35) + '...' : note.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-xs font-sans text-brand-muted font-bold shrink-0">
                      Page {currentGrammarPageIndex + 1} of {activeLesson.grammarNotes.length}
                    </div>
                  </div>

                  {/* Active Grammar Note */}
                  {activeLesson.grammarNotes[currentGrammarPageIndex] ? (() => {
                    const currentLessonMode = exampleModeForRules[`lesson-${activeLesson.id}-${currentGrammarPageIndex}`] || 'standard';
                    const activeLessonExamples = currentLessonMode === 'standard' 
                      ? (activeLesson.grammarNotes[currentGrammarPageIndex].examples || []) 
                      : getAdditionalPhrases(activeLesson.id * 100, currentGrammarPageIndex, currentLessonMode);

                    return (
                      <motion.div
                        key={currentGrammarPageIndex}
                        className="duo-card p-6 bg-white shadow-xs"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-brand-purple text-white rounded-2xl border-b-4 border-brand-purple-shadow shrink-0 select-none">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-sans font-black text-[#583092] text-base uppercase">
                              {activeLesson.grammarNotes[currentGrammarPageIndex].title}
                            </h3>
                          </div>
                        </div>

                        {/* Explanation */}
                        {isSingleSentenceEnglish(activeLesson.grammarNotes[currentGrammarPageIndex].explanation) && (
                          <p className="text-sm font-sans text-brand-dark font-semibold leading-relaxed">
                            {activeLesson.grammarNotes[currentGrammarPageIndex].explanation}
                          </p>
                        )}
                        <p className="text-sm font-sans text-brand-muted leading-relaxed font-semibold italic mt-2 border-l-4 border-brand-purple/20 pl-3">
                          {activeLesson.grammarNotes[currentGrammarPageIndex].explanationMyanmar}
                        </p>



                        {/* Examples Grid */}
                        {activeLessonExamples && activeLessonExamples.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <span className="text-[10px] font-sans text-brand-muted uppercase tracking-widest block font-black">
                              Grammatical Examples • ဥပမာဝါကျများ
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {activeLessonExamples.map((ex, exIdx) => (
                                <div key={exIdx} className="duo-card p-4.5 bg-brand-purple-light/10 border-brand-purple/10 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-center gap-4 mb-1">
                                      <span className="font-sans font-black text-brand-dark text-[15px]">{ex.thai}</span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <GrammarVocabDropdown sentence={ex.thai} allLessons={lessons} />
                                        <button
                                          onClick={() => speakText(ex.thai)}
                                          className="px-2 h-7 rounded-xl bg-white border-2 border-b-4 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1 font-bold transition-all active:translate-y-0.5 shadow-xs"
                                          title={`Listen (${audioSpeedIndex === 0 ? "Normal" : audioSpeedIndex === 1 ? "Slow 0.7x" : "Slower 0.5x"})`}
                                        >
                                          {audioSpeedIndex === 0 ? (
                                            <>
                                              <Volume2 className="w-3.5 h-3.5 text-brand-purple" />
                                              <span className="text-[8px] font-sans font-black text-brand-purple bg-brand-purple-light px-1 py-0.5 rounded-md select-none leading-none">1.0x</span>
                                            </>
                                          ) : audioSpeedIndex === 1 ? (
                                            <>
                                              <Volume1 className="w-3.5 h-3.5 text-indigo-500" />
                                              <span className="text-[8px] font-sans font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded-md select-none leading-none">0.7x</span>
                                            </>
                                          ) : (
                                            <>
                                              <Volume className="w-3.5 h-3.5 text-orange-500" />
                                              <span className="text-[8px] font-sans font-black text-orange-500 bg-orange-50 px-1 py-0.5 rounded-md select-none leading-none">0.5x</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                    <div className="text-xs font-sans text-brand-green font-extrabold italic mt-0.5">{ex.phonetic} = {getMyanmarPhonetic(ex.phonetic)}</div>
                                  </div>
                                  <div className="mt-3">
                                    <div className="text-xs text-brand-muted font-sans font-bold">{ex.english}</div>
                                    <div className="text-xs text-brand-dark font-sans font-bold leading-normal mt-0.5">{ex.myanmar}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })() : null}
                </div>
              )}

              {activeTab === 'quiz' && activeLesson && (
                <QuizView
                  questions={activeLesson.quiz || []}
                  lessonId={activeLesson.id}
                  dialogue={activeLesson.dialogue || []}
                  onWordMastered={handleToggleMasteredWord}
                  masteredWords={progress.masteredWords}
                  onQuizFinished={(score, xp) => handleQuizFinished(activeLesson.id, score, xp)}
                  audioSpeedIndex={audioSpeedIndex}
                  setAudioSpeedIndex={setAudioSpeedIndex}
                />
              )}
            </div>
          </div>
        )}

        {isGatewayOpen && (
          <CheckoutGateway
            isGatewayOpen={isGatewayOpen}
            setIsGatewayOpen={setIsGatewayOpen}
            gatewayCourse={gatewayCourse}
            checkoutName={checkoutName}
            setCheckoutName={setCheckoutName}
            gatewayEmail={gatewayEmail}
            setGatewayEmail={setGatewayEmail}
            gatewayPhone={gatewayPhone}
            setGatewayPhone={setGatewayPhone}
            gatewayStep={gatewayStep}
            setGatewayStep={setGatewayStep}
            gatewayPaymentMethod={gatewayPaymentMethod}
            setGatewayPaymentMethod={setGatewayPaymentMethod}
            gatewayOtp={gatewayOtp}
            setGatewayOtp={setGatewayOtp}
            gatewayTimer={gatewayTimer}
            setGatewayTimer={setGatewayTimer}
            gatewayProcessing={gatewayProcessing}
            setGatewayProcessing={setGatewayProcessing}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setIsLoggedIn={setIsLoggedIn}
            addSystemLog={addSystemLog}
            orders={orders}
            setOrders={setOrders}
            setIsCourseStoreExpanded={setIsCourseStoreExpanded}
          />
        )}

        {selectedDetailOrder && (
          <OrderDetailModal
            order={selectedDetailOrder}
            onClose={() => setSelectedDetailOrder(null)}
            isAdmin={isAdmin}
            onUpdateOrder={(updatedOrder) => {
              setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
              setSelectedDetailOrder(updatedOrder);
            }}
            addSystemLog={addSystemLog}
            storeItems={storeItems}
            triggerPdfDownload={triggerPdfDownload}
          />
        )}


        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border-2 border-gray-100 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={handleDismissPromo}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-5 h-5 text-brand-dark" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-sans font-black text-brand-dark uppercase tracking-tight">
                  Join Language Course!
                </h3>
                <p className="text-[11px] text-brand-muted font-sans font-semibold mt-1 leading-normal">
                  အကောင့်ဝင်ပြီး သင်ခန်းစာများ လေ့လာပါ။
                </p>
              </div>

              {/* Modal Tabs inside Auth Form */}
              <div className="flex gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100/80 mb-5 font-sans text-[10px] sm:text-xs font-black">
                <button 
                  onClick={() => {
                    setAuthTab('student-signup');
                    setAuthError('');
                  }}
                  className={`flex-1 py-1 text-center rounded-lg transition-all uppercase tracking-tight cursor-pointer ${authTab === 'student-signup' ? 'bg-brand-purple text-white shadow-xs' : 'text-brand-muted hover:text-brand-dark'}`}
                >
                  Sign Up
                </button>
                <button 
                  onClick={() => {
                    setAuthTab('student-login');
                    setAuthError('');
                  }}
                  className={`flex-1 py-1 text-center rounded-lg transition-all uppercase tracking-tight cursor-pointer ${authTab === 'student-login' ? 'bg-brand-purple text-white shadow-xs' : 'text-brand-muted hover:text-brand-dark'}`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => {
                    setAuthTab('admin');
                    setAuthError('');
                  }}
                  className={`flex-1 py-1 text-center rounded-lg transition-all uppercase tracking-tight cursor-pointer ${authTab === 'admin' ? 'bg-brand-purple text-white shadow-xs' : 'text-brand-muted hover:text-brand-dark'}`}
                >
                  Admin Box
                </button>
              </div>

              {authTab === 'student-signup' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (authUsername.trim()) {
                    const success = handleStandardSignUp(authUsername, authPassword);
                    if (success) {
                      setAuthUsername('');
                      setAuthPassword('');
                      setAuthError('');
                    }
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Choose Username • အမည်အသစ်ပေးပါ
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. ko_nay_min"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-brand-purple focus:outline-none transition-colors font-sans text-xs font-semibold text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Choose Password • စကားဝှက်အသစ်
                    </label>
                    <input 
                      type="password" 
                      placeholder="e.g. secret123"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-brand-purple focus:outline-none transition-colors font-sans text-xs font-semibold text-brand-dark"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full duo-btn duo-btn-purple text-xs font-black py-3.5 flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    CREATE STUDENT USER • အကောင့်သစ်ဖွင့်မည်
                  </button>
                </form>
              )}

              {authTab === 'student-login' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (authUsername.trim() && authPassword) {
                    const success = handleAdminLogin(authUsername, authPassword);
                    if (success) {
                      setAuthUsername('');
                      setAuthPassword('');
                      setAuthError('');
                    } else {
                      setAuthError('Error: Incorrect credentials or not found. (Note: standard demo password is password123)');
                    }
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Student Username • အသုံးပြုသူအမည်
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. ko_nay_min"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-brand-purple focus:outline-none transition-colors font-sans text-xs font-semibold text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Password • စကားဝှက်
                    </label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-brand-purple focus:outline-none transition-colors font-sans text-xs font-semibold text-brand-dark"
                    />
                  </div>

                  {authError && (
                    <p className="text-red-500 text-[10px] font-semibold leading-tight">{authError}</p>
                  )}

                  <button 
                    type="submit"
                    className="w-full duo-btn duo-btn-purple text-xs font-black py-3.5 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    LOG IN STUDENT • အကောင့်ဝင်မည်
                  </button>
                </form>
              )}

              {authTab === 'admin' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (authUsername.trim() && authPassword) {
                    const success = handleAdminLogin(authUsername, authPassword);
                    if (success) {
                      setAuthUsername('');
                      setAuthPassword('');
                      setAuthError('');
                    } else {
                      setAuthError('Invalid admin credentials! (Master admin: use admin & admin@4238)');
                    }
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Admin Username • စီမံသူအမည်
                    </label>
                    <input 
                      type="text" 
                      placeholder="Username (admin)"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-brand-purple focus:outline-none transition-colors font-sans text-xs font-semibold text-brand-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Password • စကားဝှက်
                    </label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-brand-purple focus:outline-none transition-colors font-sans text-xs font-semibold text-brand-dark"
                    />
                  </div>

                  {authError && (
                    <p className="text-red-500 text-[10px] font-semibold leading-tight">{authError}</p>
                  )}

                  <button 
                    type="submit"
                    className="w-full duo-btn duo-btn-purple text-xs font-black py-3.5 flex items-center justify-center gap-2 mb-2"
                  >
                    <Shield className="w-4 h-4" />
                    ADMIN LOG IN • စီမံသူဖြင့် ဝင်မည်
                  </button>
                </form>
              )}

              {/* DIRECT COURSE PURCHASE EXPANSION ZONE */}
              <div className="mt-4 pt-4 border-t border-gray-100/80">
                {!isAuthModalCoursePurchaseExpanded ? (
                  <button
                    onClick={() => setIsAuthModalCoursePurchaseExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-sans font-black text-xs text-white uppercase tracking-wider rounded-2xl shadow-sm transition-all transform active:translate-y-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse shrink-0 text-white" />
                    ⚡ Direct Enrollment / Buy Course
                  </button>
                ) : (
                  <div className="space-y-3 animate-fade-in text-left">
                    <div className="flex justify-between items-start bg-amber-50 border border-amber-200 p-2.5 rounded-xl gap-2">
                      <div>
                        <span className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-tight block">⚡ Premium Course Enrollment</span>
                        <p className="text-[9.5px] text-amber-700 font-sans font-semibold leading-tight mt-0.5">
                          Purchase any premium course & get an auto-provisioned student account instantly!
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAuthModalCoursePurchaseExpanded(false)}
                        className="text-[9.5px] font-sans font-black text-slate-500 hover:text-slate-800 underline uppercase shrink-0"
                      >
                        Hide
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                      {courses.filter(c => c.id !== 'course-basic').map((course) => (
                        <div
                          key={course.id}
                          className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-brand-purple/25 transition-all text-left flex flex-col justify-between gap-2"
                        >
                          <div>
                            <h4 className="text-[10px] sm:text-[11px] font-sans font-black text-brand-dark leading-snug">{course.name}</h4>
                            <p className="text-[9px] sm:text-[9.5px] italic text-[#583092] mt-0.5 font-bold leading-normal">{course.nameMm}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[8.5px] text-brand-muted font-bold">
                              <span>⏱️ {course.duration}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 mt-1 border-t border-gray-100 pt-2">
                            <span className="text-[11px] font-mono font-black text-brand-purple">
                              {course.priceAmount.toLocaleString()} MMK
                            </span>
                            <button
                              onClick={() => {
                                // Close auth modal and open secure checkout modal
                                setShowAuthModal(false);
                                setCheckoutName('');
                                setGatewayCourse(course);
                                setGatewayPhone("09-");
                                setGatewayEmail("student@classroom.edu");
                                setGatewayStep(1);
                                setGatewayPaymentMethod('kbzpay');
                                setGatewayOtp('');
                                setGatewayTimer(180);
                                setIsGatewayOpen(true);
                              }}
                              className="px-3 py-1.5 bg-brand-purple text-white text-[9.5px] font-sans font-black uppercase tracking-wider rounded-lg border-b-2 border-brand-purple-shadow hover:bg-brand-purple/90 transition-all cursor-pointer flex items-center gap-0.5"
                            >
                              ⚡ BUY • ဝယ်မည်
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button 
                  onClick={handleDismissPromo}
                  className="text-[10px] text-brand-muted hover:text-brand-dark font-sans font-black underline cursor-pointer"
                >
                  Skip for Now • ကျော်မည်
                </button>
                <div className="flex items-center gap-1 text-[9px] text-brand-muted font-sans font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  Secure Student Session
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Pinned Bottom Navigation Tab Bar */}
      <div id="bottom-tab-bar" className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[500px] sm:rounded-2xl sm:border sm:border-gray-150 sm:shadow-xl bg-white border-t border-gray-200 z-50 h-16 flex items-center justify-around px-3 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-safe">
        {activeLessonId !== null ? (
          <>
            {/* Back Arrow / Exit */}
            <button
              onClick={() => setActiveLessonId(null)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative text-brand-muted hover:text-brand-dark"
              id="tab-btn-back"
            >
              <div className="relative">
                <ChevronLeft className="w-5 h-5 transition-transform duration-200" />
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Exit</span>
            </button>

            {/* Vocab Module */}
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                activeTab === 'vocabulary' ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-vocab"
            >
              <div className="relative">
                <Sparkles className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'vocabulary' ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {activeTab === 'vocabulary' && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full" 
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Vocab</span>
            </button>

            {/* Sentence Module */}
            <button
              onClick={() => setActiveTab('sentence')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                activeTab === 'sentence' ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-sentence"
            >
              <div className="relative">
                <BookOpen className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'sentence' ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {activeTab === 'sentence' && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full" 
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Sentence</span>
            </button>

            {/* Grammar Module */}
            <button
              onClick={() => setActiveTab('grammar')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                activeTab === 'grammar' ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-grammar"
            >
              <div className="relative">
                <FileText className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'grammar' ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {activeTab === 'grammar' && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full" 
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Grammar</span>
            </button>

            {/* Quiz Module */}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                activeTab === 'quiz' ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-quiz"
            >
              <div className="relative">
                <Award className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'quiz' ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {activeTab === 'quiz' && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full" 
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Quiz</span>
            </button>
          </>
        ) : (
          <>
            {/* Learning Path */}
            <button
              onClick={() => handleTabClick('lessons')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                isLessonsActive ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-lessons"
            >
              <div className="relative">
                <MapPin className={`w-5 h-5 transition-transform duration-200 ${isLessonsActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {isLessonsActive && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full" 
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Path</span>
            </button>

            {/* Notebook */}
            <button
              onClick={() => handleTabClick('notebook')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                isNotebookActive ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-notebook"
            >
              <div className="relative">
                <FileText className={`w-5 h-5 transition-transform duration-200 ${isNotebookActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {isNotebookActive && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Notebook</span>
            </button>

            {/* Courses */}
            <button
              onClick={() => handleTabClick('courses')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                isCoursesActive ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-courses"
            >
              <div className="relative">
                <BookOpen className={`w-5 h-5 transition-transform duration-200 ${isCoursesActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {isCoursesActive && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Courses</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => handleTabClick('profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                isProfileActive ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
              }`}
              id="tab-btn-profile"
            >
              <div className="relative">
                <User className={`w-5 h-5 transition-transform duration-150 ${isProfileActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                {isProfileActive && (
                  <motion.span 
                    layoutId="activeTabIndicatorDot" 
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Profile</span>
            </button>

            {/* Conditional Admin Hub */}
            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer relative ${
                  isAdminActive ? 'text-brand-purple' : 'text-brand-muted hover:text-brand-dark'
                }`}
                id="tab-btn-admin"
              >
                <div className="relative">
                  <Shield className={`w-5 h-5 transition-transform duration-200 ${isAdminActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
                  {isAdminActive && (
                    <motion.span 
                      layoutId="activeTabIndicatorDot" 
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-purple rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-sans font-black tracking-tight mt-1 leading-none uppercase">Admin</span>
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}
