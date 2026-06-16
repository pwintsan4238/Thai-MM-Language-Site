import React, { useState, useEffect } from 'react';
import { lessonsData } from './data/lessonsData';
import { grammarChapters } from './data/grammarChapters';
import { orientationData } from './data/orientation';
import { pdfVocabulary } from './data/pdfVocabulary';
import { ProgressState, Lesson, WordBreakdown, DialogueLine, GrammarNote, QuizQuestion, RegisteredUser, PurchaseOrder } from './types';
import ProgressCard from './components/ProgressCard';
import DialogueView from './components/DialogueView';
import VocabularyView from './components/VocabularyView';
import QuizView from './components/QuizView';
import AlphabetGuide from './components/AlphabetGuide';
import { GrammarVocabDropdown } from './components/GrammarVocabDropdown';
import { CheckoutGateway } from './components/CheckoutGateway';
import { 
  BookOpen, 
  Award, 
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
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSingleSentenceEnglish } from './utils/sentenceUtils';
import { autoFillWord } from './utils/dictionary';

const STORE_ITEMS = [
  {
    id: "premium-book",
    name: "Advanced Thai-Myanmar Grammar Manual (Printed E-Book)",
    nameMm: "အဆင့်မြင့် ထိုင်း-မြန်မာ သဒ္ဒါလက်စွဲ စာအုပ် (အီးဘုခ်)",
    type: "e-book" as const,
    description: "Deep dive into 45 complex Sentence structures, silent consonants rules, and tone system markers with local audio tracks link.",
    descriptionMm: "ရှုပ်ထွေးသော ဝါကျတည်ဆောက်ပုံ ၄၅ မျိုး၊ အသံထွက် ခြွင်းချက်ပုံစံများနှင့် အသံနိမ့်မြင့်များ အသေးစိတ်ရှင်းလင်းချက်။",
    price: 25000,
    currency: "MMK" as const,
    popular: true
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
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved lessons:", e);
      }
    }
    return lessonsData;
  });

  const [adminSelectedLessonId, setAdminSelectedLessonId] = useState<number | null>(null);
  const [adminEditTab, setAdminEditTab] = useState<'metadata' | 'vocabulary' | 'dialogue' | 'grammar' | 'quiz'>('metadata');
  const [adminHubTab, setAdminHubTab] = useState<'orders' | 'accounts'>('orders');
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

  // Interactive Course Store and 2C2P Payment Gateway Simulation states
  const [isCourseStoreExpanded, setIsCourseStoreExpanded] = useState<boolean>(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState<boolean>(false);
  const [gatewayCourse, setGatewayCourse] = useState<any | null>(null);
  const [gatewayPaymentMethod, setGatewayPaymentMethod] = useState<'kbzpay' | 'cbpay' | 'truemoney' | 'promptpay'>('kbzpay');
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
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeOrientationId, setActiveOrientationId] = useState<string>('better-thai');
  const [mobileChapterDetailActive, setMobileChapterDetailActive] = useState<boolean>(false);
  const [currentGrammarPageIndex, setCurrentGrammarPageIndex] = useState<number>(0);
  const [expandedChapterRuleIndex, setExpandedChapterRuleIndex] = useState<number>(0);
  const [lessonSubPageIndex, setLessonSubPageIndex] = useState<number>(0);
  const [handbookSubPageIndex, setHandbookSubPageIndex] = useState<number>(0);
  const [exampleModeForRules, setExampleModeForRules] = useState<{[key: string]: 'standard' | 'more' | 'formal' | 'casual'}>({});
  const [audioSpeedIndex, setAudioSpeedIndex] = useState<number>(0); // 0: Normal, 1: Slow, 2: Much Slower

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
          dateJoined: u.dateJoined || new Date().toISOString().split('T')[0]
        }));
      } catch (e) {
        // Fallback
      }
    }
    return [
      { username: "ko_nay_min", password: "password123", role: "student", xp: 1250, dateJoined: "2026-05-12" },
      { username: "ma_khine", password: "password123", role: "student", xp: 820, dateJoined: "2026-06-01" },
      { username: "phyo_wai", password: "password123", role: "student", xp: 450, dateJoined: "2026-06-10" },
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
        orderDate: "2026-06-10"
      },
      {
         id: "ORD-99322",
         username: "ma_khine",
         itemName: "📕 Advanced Thai-Myanmar Grammar Manual (Printed E-Book)",
         itemType: "e-book",
         priceAmount: 25000,
         currency: "MMK",
         status: "pending",
         orderDate: "2026-06-13"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('thai_user_orders_list', JSON.stringify(orders));
  }, [orders]);

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

  const lessonsPerPage = 6;
  const totalLessons = lessons.length;
  const totalPages = Math.ceil(totalLessons / lessonsPerPage);
  const paginatedLessons = lessons.slice(
    (currentPage - 1) * lessonsPerPage,
    currentPage * lessonsPerPage
  );

  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  const activeLessonIndex = activeLesson ? lessons.findIndex(l => l.id === activeLesson.id) : -1;
  const prevLesson = activeLessonIndex > 0 ? lessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < lessons.length - 1 ? lessons[activeLessonIndex + 1] : null;

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark flex flex-col font-sans">
      
      {/* Top Header Navigation bar */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 bg-brand-purple text-white rounded-xl border-b-4 border-brand-purple-shadow flex items-center justify-center font-sans font-black text-lg select-none shrink-0">
              TH
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-sans font-black text-brand-dark tracking-tight leading-tight select-none uppercase truncate">
                Thai Language Tutor
              </h1>
              <p className="text-[9px] sm:text-[10px] text-brand-muted font-sans font-extrabold tracking-wide uppercase mt-0.5 truncate">
                <span className="hidden xs:inline">Myanmar Repat Course • </span>ထိုင်း-မြန်မာ အပြန်အလှန်လေ့လာရေး
              </p>
            </div>
          </div>

          {/* Offline/Online indicators and Auth/Identity Management Panel */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap">
            <span className="hidden leading-none xs:flex items-center gap-1 sm:gap-1.5 text-[10px] font-sans font-black text-brand-purple bg-brand-purple-light/50 px-2.5 py-1.5 rounded-full select-none">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>Offline Ready</span>
            </span>

            {/* Authentication controls */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-100 p-1 pl-2.5 rounded-xl">
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500/25 shrink-0" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                    )}
                    <span className="text-[10px] sm:text-xs font-sans font-black text-brand-dark truncate max-w-[96px] uppercase tracking-tight">
                      {currentUser}
                    </span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-brand-muted font-bold -mt-0.5">
                    {isAdmin ? 'ADMINISTRATOR' : `${progress.totalXp} XP • LEVEL ${Math.floor(progress.totalXp / 1000) + 1}`}
                  </span>
                </div>
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="p-2 sm:px-3 sm:py-1.5 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-colors cursor-pointer text-brand-muted"
                  title="Sign Out • အကောင့်ထွက်မည်"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0 sm:mr-1 inline-block" />
                  <span className="hidden sm:inline font-sans font-black text-[10px] leading-none uppercase tracking-wide">
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
                className="px-3.5 py-2.5 bg-brand-purple hover:bg-brand-purple-shadow text-white rounded-xl border-b-4 border-brand-purple-shadow flex items-center gap-1.5 font-sans font-black text-[10px] sm:text-xs transition-transform active:translate-y-0.5 cursor-pointer uppercase tracking-wider select-none shrink-0 shadow-xs"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                Sign In • ဝင်ရောက်ရန်
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-[88px] sm:pb-32">
        
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-gray-100">
                  <div>
                    <h3 className="font-sans font-black text-brand-dark text-base mb-0.5 uppercase tracking-tight">
                      Syllabus Lessons • သင်ခန်းစာများ
                    </h3>
                    <p className="text-xs text-brand-muted font-sans font-semibold">
                      Lessons {(currentPage - 1) * lessonsPerPage + 1} to {Math.min(currentPage * lessonsPerPage, totalLessons)} of {totalLessons}
                    </p>
                  </div>

                  {/* Compact Pagination Top Control */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 self-start sm:self-auto select-none">
                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-brand-dark disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center font-bold hover:bg-gray-50 active:translate-y-0.5 transition-all text-xs"
                        title="Previous lessons"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="text-[11px] font-sans font-black text-brand-purple bg-brand-purple-light/55 px-3 py-1.5 rounded-lg whitespace-nowrap">
                        PAGE {currentPage} / {totalPages}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-brand-dark disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center font-bold hover:bg-gray-50 active:translate-y-0.5 transition-all text-xs"
                        title="Next lessons"
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
                              {lesson.titlePhonetic} ({lesson.titleThai})
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
                                          <span className="text-brand-green italic font-black">({hl.termPhonetic})</span>
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
                                                    ({ex.phonetic})
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
                      <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-[10px] font-sans font-bold text-brand-muted leading-relaxed">
                        ✨ Local Session State has been synchronized. All orders and metrics are logged dynamically in local storage.
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
                      {PREMIUM_COURSES.map((course) => {
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
                                  if (!isLoggedIn) {
                                    alert("Oops! You must be registered and logged in as a student to purchase dynamic courses.");
                                    setAuthTab('student-signup');
                                    setShowAuthModal(true);
                                    return;
                                  }
                                  // Initialize simulated 2C2P checkout terminal state
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
                    {STORE_ITEMS.map((item) => {
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
                  <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-gray-100">
                    <ShoppingBag className="w-4 h-4 text-brand-purple shrink-0" />
                    📜 Personal Purchase Ledger & Order Compliance ({currentUser ? orders.filter(o => o.username.toLowerCase() === currentUser.toLowerCase()).length : 0})
                  </h4>

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
                                <tr key={ord.id} className="hover:bg-gray-50/50">
                                  <td className="py-3 px-3 font-mono font-black text-brand-purple">{ord.id}</td>
                                  <td className="py-3 px-3 font-bold text-brand-dark text-[11px]">{ord.itemName}</td>
                                  <td className="py-3 px-3 text-brand-muted font-bold">{ord.orderDate}</td>
                                  <td className="py-3 px-3 font-mono font-black text-brand-dark">
                                    {ord.priceAmount.toLocaleString()} {ord.currency}
                                  </td>
                                  <td className="py-3 px-3 text-right">
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
                    <div className="bg-white/10 p-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 w-full md:w-auto self-start md:self-auto select-none">
                      <button
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
                                    orderDate: "2026-06-10"
                                  },
                                  {
                                    id: "ORD-99322",
                                    username: "ma_khine",
                                    itemName: "📕 Advanced Thai-Myanmar Grammar Manual (Printed E-Book)",
                                    itemType: "e-book",
                                    priceAmount: 25000,
                                    currency: "MMK",
                                    status: "pending",
                                    orderDate: "2026-06-13"
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
                                  <tr key={ord.id} className="hover:bg-amber-50/10 transition-all">
                                    <td className="py-3 px-3 font-mono font-black text-brand-purple">{ord.id}</td>
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
                                    <td className="py-3 px-3 text-right">
                                      {ord.status === 'pending' && (
                                        <div className="flex gap-1 justify-end">
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
                                        </div>
                                      )}
                                      {ord.status !== 'pending' && (
                                        <span className="text-[10px] text-brand-muted italic font-bold">Processed</span>
                                      )}
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
                                        { username: "ko_nay_min", password: "password123", role: "student", xp: 1250, dateJoined: "2026-05-12" },
                                        { username: "ma_khine", password: "password123", role: "student", xp: 820, dateJoined: "2026-06-01" },
                                        { username: "phyo_wai", password: "password123", role: "student", xp: 450, dateJoined: "2026-06-10" },
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
                            className="w-full bg-white border-2 border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        {lessons.map(l => (
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
                  <span className="text-sm font-extrabold text-brand-green italic">({activeLesson?.titleThai} - {activeLesson?.titlePhonetic})</span>
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
                <DialogueView
                  dialogue={activeLesson.dialogue}
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
                                    <div className="text-xs font-sans text-brand-green font-extrabold italic mt-0.5">{ex.phonetic}</div>
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
            setOrders={setOrders}
            setIsCourseStoreExpanded={setIsCourseStoreExpanded}
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
                        <span className="text-[10px] text-amber-800 font-sans font-black uppercase tracking-tight block">Direct Buy Gateway (2C2P)</span>
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
                      {PREMIUM_COURSES.map((course) => (
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
                                // Close auth modal and open 2C2P secure checkout modal
                                setShowAuthModal(false);
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
            <User className={`w-5 h-5 transition-transform duration-200 ${isProfileActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'}`} />
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
      </div>

    </div>
  );
}
