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
  CheckSquare,
  ShoppingBag,
  CreditCard,
  GripVertical
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

  // Checkout and Store purchase form state
  const [selectedStoreItem, setSelectedStoreItem] = useState<any | null>(null);
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutNetwork, setCheckoutNetwork] = useState<string>('KBZPay');

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
  const [dashboardTab, setDashboardTab] = useState<'lessons' | 'orientation' | 'handbook' | 'alphabet' | 'admin'>('lessons');
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* If no lesson is currently active: Display main student Dashboard */}
        {!activeLessonId ? (
          <div className="space-y-6 sm:space-y-8">
                        {/* Unified Dashboard Tab Selector - Duolingo Elegant Style */}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${isAdmin ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-gray-100 select-none`}>
              <button
                onClick={() => setDashboardTab('lessons')}
                className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'lessons'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                📚 Learning Path<span className="hidden md:inline"> • သင်ခန်းစာ</span>
              </button>
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
              <button
                onClick={() => setDashboardTab('notebook')}
                className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'notebook'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                💡 Notebook<span className="hidden md:inline"> • ဝေါဟာရသစ်များ</span>
              </button>
              <button
                onClick={() => setDashboardTab('profile')}
                className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'profile'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                👤 Profile<span className="hidden md:inline"> • ကိုယ်ပိုင်အကောင့်</span><span className="inline md:hidden"> Account</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setDashboardTab('admin')}
                  className={`py-3 px-1.5 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                    dashboardTab === 'admin'
                      ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                      : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                  }`}
                >
                  🛡️ Admin Panel<span className="hidden md:inline"> • စီမံခန္ခွဲသူ</span><span className="inline md:hidden"> Admin</span>
                </button>
              )}
            </div>

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
                                    <div key={hlIdx} className="p-3 bg-brand-light/50 border border-gray-100 rounded-xl flex flex-col justify-between">
                                      <div className="font-sans font-bold text-xs">
                                        {hl.termThai && (
                                          <span className="text-brand-purple text-sm font-black mr-1">{hl.termThai}</span>
                                        )}
                                        <span className="text-brand-green italic">({hl.termPhonetic})</span>
                                      </div>
                                      <div className="text-[11px] font-sans mt-1.5 font-bold text-brand-dark">
                                        {hl.meaningEnglish} • <span className="text-brand-muted">{hl.meaningMyanmar}</span>
                                      </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Announcement Manager */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4">
                    <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-gray-100">
                      <Sparkles className="w-4 h-4 text-brand-purple shrink-0" />
                      System Announcement Banner
                    </h4>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider">
                        Dynamic Marquee Notification Text
                      </label>
                      <textarea
                        placeholder="Welcome message..."
                        value={activeBroadcastInput}
                        onChange={(e) => setActiveBroadcastInput(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-semibold font-sans focus:border-brand-purple focus:outline-none transition-colors text-brand-dark"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActiveBroadcast(activeBroadcastInput);
                            localStorage.setItem('thai_active_broadcast', activeBroadcastInput);
                            addSystemLog('admin', `Updated system broadcast marquee alert`);
                          }}
                          className="flex-1 duo-btn duo-btn-purple text-xs font-black py-3.5"
                        >
                          BROADCAST TO WORLD
                        </button>
                        <button
                          onClick={() => {
                            setActiveBroadcast('');
                            localStorage.removeItem('thai_active_broadcast');
                            setActiveBroadcastInput('');
                            addSystemLog('admin', 'Disabled system broadcast marquee');
                          }}
                          className="px-4 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-sans font-black text-xs transition-colors cursor-pointer"
                          title="Clear banner and hide"
                        >
                          DISABLE Banner
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Registered Users Audit Card Directory */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4 flex flex-col justify-between lg:col-span-1">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-brand-purple shrink-0" />
                          Registered Accounts Directory ({registeredUsers.length})
                        </h4>
                      </div>

                      {/* Admin Form to Create Accounts */}
                      <div className="bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-200/85 space-y-2.5">
                        <h5 className="text-[10px] sm:text-xs font-sans font-black text-brand-purple uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          Create New Account (Admin Quick-Add Credentials)
                        </h5>
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
                        }} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <input
                              type="text"
                              placeholder="Username"
                              value={adminNewUserUsername}
                              onChange={(e) => setAdminNewUserUsername(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Password"
                              value={adminNewUserPassword}
                              onChange={(e) => setAdminNewUserPassword(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold font-sans text-brand-dark focus:border-brand-purple focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <select
                              value={adminNewUserRole}
                              onChange={(e) => setAdminNewUserRole(e.target.value as 'student' | 'admin')}
                              className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black font-sans text-brand-purple focus:border-brand-purple focus:outline-none"
                            >
                              <option value="student">STUDENT (ကျောင်းသား)</option>
                              <option value="admin">ADMIN (စီမံသူ)</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            className="sm:col-span-3 w-full py-2 bg-brand-purple text-white rounded-lg border-b-4 border-brand-purple-shadow text-[10px] font-black uppercase tracking-wider hover:brightness-105 active:translate-y-0.5 cursor-pointer"
                          >
                            Add New Credentials Securely
                          </button>
                        </form>
                      </div>

                      {/* Scrollable list of user cards - HIGH POLISH CARDS */}
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {registeredUsers.map((usr, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-3 shadow-xs hover:border-gray-200 transition-all text-left">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-sans font-black text-brand-dark text-xs">{usr.username}</span>
                                {usr.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                    <Shield className="w-2 h-2" /> Admin
                                  </span>
                                ) : (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                                    Student
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-brand-muted font-sans space-y-0.5 font-semibold">
                                <p>Password: <code className="bg-gray-50 text-brand-dark px-1 py-0.5 rounded font-mono font-bold">{usr.password || 'password123'}</code></p>
                                <p>Progress: <span className="text-brand-purple font-black font-mono">{usr.role === 'admin' ? '—' : `${usr.xp} XP (LVL ${Math.floor(usr.xp / 1000) + 1})`}</span></p>
                                <p>Joined: <span>{usr.dateJoined}</span></p>
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
                              className="p-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-red-100"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const confirmReset = window.confirm("Are you sure you want to reset user table? (Will reset standard entries)");
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
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-sans font-black text-brand-dark mt-4 cursor-pointer"
                    >
                      FACTORY RESET USER DIRECTORY
                    </button>
                  </div>
                </div>

                {/* Brand New Section: student Purchase Orders Manager */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 text-brand-purple">
                        <ShoppingBag className="w-4 h-4 shrink-0 text-brand-purple" />
                        📋 student Purchase Orders Manager (ကျောင်းသားများ ဝယ်ယူမှုအော်ဒါများ ပန်နယ်)
                      </h4>
                      <p className="text-[10px] font-sans font-bold text-brand-muted mt-1">
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
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[10px] font-sans font-black text-brand-dark rounded-lg cursor-pointer"
                    >
                      SEED DEFAULT ORDERS
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left font-sans text-xs">
                      <thead className="bg-gray-50/70">
                        <tr className="border-b border-gray-100 text-brand-muted text-[9px] font-black uppercase tracking-wider">
                          <th className="py-2.5 px-3">ORDER ID</th>
                          <th className="py-2.5 px-3">USERNAME</th>
                          <th className="py-2.5 px-3">PACKAGE DESCRIPTION</th>
                          <th className="py-2.5 px-3">DATE PLACED</th>
                          <th className="py-2.5 px-3">METHOD TOTAL</th>
                          <th className="py-2.5 px-3">STATUS</th>
                          <th className="py-2.5 px-3 text-right">ADMIN ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-sans">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-brand-muted font-bold">
                              No purchase orders currently submitted in system memory.
                            </td>
                          </tr>
                        ) : (
                          orders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-gray-50/50">
                              <td className="py-3 px-3 font-mono font-black text-brand-purple">{ord.id}</td>
                              <td className="py-3 px-3 font-bold text-brand-dark">{ord.username}</td>
                              <td className="py-3 px-3 font-semibold text-brand-dark text-[11px]">{ord.itemName}</td>
                              <td className="py-3 px-3 text-brand-muted font-bold">{ord.orderDate}</td>
                              <td className="py-3 px-3 font-mono font-black text-brand-dark">
                                {ord.priceAmount.toLocaleString()} {ord.currency}
                              </td>
                              <td className="py-3 px-3">
                                {ord.status === 'pending' ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                    Pending Review
                                  </span>
                                ) : ord.status === 'completed' ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-red-50 text-red-700 border border-red-200">
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
                                      className="px-2 py-1 bg-brand-green text-white text-[9px] font-black uppercase rounded hover:opacity-90 cursor-pointer"
                                      title="Mark order as Completed"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOrders(prev => prev.map(o => o.id === ord.id ? { ...o, status: 'cancelled' } : o));
                                        addSystemLog('admin', `Denied and Cancelled order "${ord.id}"`);
                                      }}
                                      className="px-2 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded hover:opacity-90 cursor-pointer"
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
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-sans font-black text-brand-dark text-[15px]">{ex.thai}</span>
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

                        {/* Under-The-Grammar Navigation Jumper Bar */}
                        <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-center gap-3 bg-[#fdfcff] -mx-6 -mb-6 p-4 rounded-b-2xl">
                          {currentGrammarPageIndex < activeLesson.grammarNotes.length - 1 ? (
                            <button
                              onClick={() => setCurrentGrammarPageIndex(currentGrammarPageIndex + 1)}
                              className="text-brand-purple font-sans font-black text-xs flex items-center gap-1 hover:underline active:translate-y-0.5 transition-transform"
                            >
                              Next
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTab('quiz')}
                              className="text-[#13a10e] font-sans font-black text-xs flex items-center gap-1 hover:underline active:translate-y-0.5 transition-transform"
                            >
                              Next
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })() : (
                    <div className="text-center font-sans text-brand-muted font-black py-12">
                      No grammar notes found.
                    </div>
                  )}

                  {/* Navigation Actions */}
                  <div className="flex items-center justify-between gap-4 mt-6">
                    <button
                      onClick={() => setCurrentGrammarPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentGrammarPageIndex === 0}
                      className="duo-btn duo-btn-white text-xs px-5 py-3 font-black disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                      PREV NOTE • ရှေ့သို့
                    </button>

                    <div className="flex gap-1.5 items-center">
                      {activeLesson.grammarNotes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentGrammarPageIndex(i)}
                          className={`w-2.5 h-2.5 rounded-full transition-all border-2 ${
                            i === currentGrammarPageIndex
                              ? 'bg-brand-purple border-brand-purple scale-125'
                              : 'bg-gray-200 border-transparent hover:bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (currentGrammarPageIndex < activeLesson.grammarNotes.length - 1) {
                          setCurrentGrammarPageIndex((prev) => prev + 1);
                        } else {
                          setActiveTab('quiz');
                        }
                      }}
                      className="duo-btn duo-btn-purple text-xs px-5 py-3 font-black flex items-center gap-1.5"
                    >
                      {currentGrammarPageIndex < activeLesson.grammarNotes.length - 1 ? (
                        <>
                          NEXT NOTE • နောက်သို့
                          <ChevronRight className="w-4 h-4 shrink-0" />
                        </>
                      ) : (
                        <>
                          TAKE QUIZ • စစ်ဆေးမည်
                          <Award className="w-4 h-4 shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && activeLesson && (
                <QuizView
                  questions={activeLesson.quiz}
                  lessonId={activeLesson.id}
                  dialogue={activeLesson.dialogue}
                  onWordMastered={handleToggleMasteredWord}
                  masteredWords={progress.masteredWords}
                  onQuizFinished={(score, xp) => handleQuizFinished(activeLesson.id, score, xp)}
                  audioSpeedIndex={audioSpeedIndex}
                  setAudioSpeedIndex={setAudioSpeedIndex}
                />
              )}
            </div>

            {/* Unified Bottom Lesson Control Deck */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-4 animate-fade-in" id="bottom-lesson-ctrl-deck">
              
              {/* Part 1: Page-to-Page Navigation for active lesson */}
              <div className="bg-white rounded-xl border border-gray-150 p-3 flex items-center justify-between gap-4">
                {/* Back Button */}
                <button
                  onClick={() => {
                    if (activeTab === 'quiz') {
                      setActiveTab('grammar');
                    } else if (activeTab === 'grammar') {
                      setActiveTab('sentence');
                    } else if (activeTab === 'sentence') {
                      setActiveTab('vocabulary');
                    } else if (activeTab === 'vocabulary') {
                      if (prevLesson) {
                        setActiveLessonId(prevLesson.id);
                        setActiveTab('quiz');
                      } else {
                        setActiveLessonId(null);
                      }
                    }
                  }}
                  className="duo-btn duo-btn-white text-xs px-4 py-2 font-black flex items-center justify-center gap-1.5 min-w-[120px] transition-all cursor-pointer"
                  id="nav-btn-back"
                >
                  <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                  {activeTab === 'vocabulary' ? (
                    prevLesson ? `LESSON ${prevLesson.id}` : 'DASHBOARD'
                  ) : (
                    'BACK • ရှေ့သို့'
                  )}
                </button>

                {/* Compact Current Page Indicator */}
                <span className="text-[10px] font-sans text-brand-purple bg-brand-purple-light px-3 py-1 rounded-full font-black select-none uppercase tracking-wider">
                  Page {activeTab === 'vocabulary' ? '1' : activeTab === 'sentence' ? '2' : activeTab === 'grammar' ? '3' : '4'} of 4
                </span>

                {/* Next Button */}
                <button
                  onClick={() => {
                    if (activeTab === 'vocabulary') {
                      setActiveTab('sentence');
                    } else if (activeTab === 'sentence') {
                      setActiveTab('grammar');
                      setCurrentGrammarPageIndex(0);
                    } else if (activeTab === 'grammar') {
                      setActiveTab('quiz');
                    } else if (activeTab === 'quiz') {
                      if (nextLesson) {
                        setActiveLessonId(nextLesson.id);
                        setActiveTab('vocabulary');
                      } else {
                        setActiveLessonId(null);
                      }
                    }
                  }}
                  className="duo-btn duo-btn-purple text-xs px-4 py-2 font-black flex items-center justify-center gap-1.5 min-w-[120px] transition-all cursor-pointer"
                  id="nav-btn-next"
                >
                  {activeTab === 'quiz' ? (
                    nextLesson ? (
                      <>
                        LESSON {nextLesson.id}
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    ) : (
                      <>
                        FINISH • ပြီးဆုံးပါပြီ
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )
                  ) : (
                    <>
                      NEXT • နောက်သို့
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </>
                  )}
                </button>
              </div>

              {/* Part 2: Lesson Switcher / All Lessons Pagination */}
              <div className="bg-gray-50/50 rounded-xl border border-gray-150 p-3" id="lessons-nav-pager">
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-100">
                  <span className="text-[10px] font-sans text-brand-dark font-black uppercase tracking-wider">
                    Hop to Lesson • သင်ခန်းစာများ
                  </span>
                  <span className="text-[9px] font-sans text-brand-purple bg-brand-purple-light/50 px-2 py-0.5 rounded-full font-black select-none">
                    LESSON {activeLesson.id} OF {lessons.length}
                  </span>
                </div>

                {/* Grid of All available Lesson Numbers */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {lessons.map((lesson) => {
                    const isLessonActive = lesson.id === activeLesson.id;
                    const isCompleted = (progress.quizHighScores[lesson.id] || 0) >= 80;
                    return (
                      <button
                        key={lesson.id}
                        id={`lesson-nav-btn-${lesson.id}`}
                        onClick={() => {
                          setActiveLessonId(lesson.id);
                          setActiveTab('vocabulary');
                        }}
                        className={`w-7 h-7 rounded-lg text-[10px] font-sans font-black transition-all border flex items-center justify-center cursor-pointer relative ${
                          isLessonActive
                            ? 'bg-brand-purple text-white border-brand-purple border-b-2 border-brand-purple-shadow scale-105 z-10'
                            : isCompleted
                            ? 'bg-brand-green-light border-brand-green/25 text-brand-green hover:bg-brand-green-light/80'
                            : 'bg-white border-gray-200 text-brand-dark hover:bg-gray-50 border-b-2'
                        }`}
                        title={lesson.titleEnglish}
                      >
                        {lesson.id}
                        {isCompleted && !isLessonActive && (
                          <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Dynamic Admin System Broadcast Marquee Banner (Low Priority Footer Banner) */}
      {showBroadcastBanner && activeBroadcast && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-brand-purple/90 to-brand-purple-shadow/90 text-white py-2.5 px-4 rounded-2xl shadow-xs text-[11px] sm:text-xs font-sans font-bold flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 animate-bounce shrink-0 text-amber-300" />
              <p className="truncate leading-none uppercase tracking-wide">{activeBroadcast}</p>
            </div>
            <button 
              onClick={() => setShowBroadcastBanner(false)}
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Dismiss Announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer credits */}
      <footer className="border-t border-gray-100 bg-white mt-16 py-8 text-center text-[11px] text-brand-muted font-sans font-semibold leading-relaxed">
        <p className="font-sans uppercase tracking-widest text-[9px]">Thai-Myanmar Vocabulary & Grammar Builder</p>
      </footer>

      {/* Elegantly Polished Authentication Modal (Floating Card overlay) */}
      <AnimatePresence>
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
      </AnimatePresence>

    </div>
  );
}
