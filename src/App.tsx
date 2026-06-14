import { useState, useEffect } from 'react';
import { lessonsData } from './data/lessonsData';
import { grammarChapters } from './data/grammarChapters';
import { orientationData } from './data/orientation';
import { ProgressState, Lesson, WordBreakdown } from './types';
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
  X,
  TrendingUp,
  Activity,
  Users,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isSingleSentenceEnglish } from './utils/sentenceUtils';

const INITIAL_PROGRESS: ProgressState = {
  completedLessons: [],
  masteredWords: [],
  totalXp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  quizHighScores: {}
};

export default function App() {
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

  const [authTab, setAuthTab] = useState<'user' | 'admin'>('user');
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
  const [registeredUsers, setRegisteredUsers] = useState<{username: string; xp: number; dateJoined: string}[]>(() => {
    const saved = localStorage.getItem('thai_registered_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { username: "ko_nay_min", xp: 1250, dateJoined: "2026-05-12" },
      { username: "ma_khine", xp: 820, dateJoined: "2026-06-01" },
      { username: "phyo_wai", xp: 450, dateJoined: "2026-06-10" }
    ];
  });

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
  const handleAdminLogin = (usernameStr: string, passwordStr: string) => {
    if (usernameStr.trim() === 'admin' && passwordStr === 'admin@4238') {
      setIsLoggedIn(true);
      setCurrentUser('admin');
      setIsAdmin(true);
      localStorage.setItem('thai_user_logged_in', 'true');
      localStorage.setItem('thai_current_user', 'admin');
      localStorage.setItem('thai_user_is_admin', 'true');
      setShowAuthModal(false);
      setDashboardTab('admin'); // Navigate to administrator dashboard directly
      
      // Log connection
      addSystemLog('admin', 'Logged into Administrator Console');
      return true;
    }
    return false;
  };

  const handleStandardSignUp = (usernameStr: string) => {
    const cleanUser = usernameStr.trim();
    if (!cleanUser) return;
    
    setIsLoggedIn(true);
    setCurrentUser(cleanUser);
    setIsAdmin(false);
    localStorage.setItem('thai_user_logged_in', 'true');
    localStorage.setItem('thai_current_user', cleanUser);
    localStorage.setItem('thai_user_is_admin', 'false');
    setShowAuthModal(false);

    // Save registration
    setRegisteredUsers((prev) => {
      const alreadyHas = prev.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
      if (!alreadyHas) {
        const nextList = [...prev, { username: cleanUser, xp: progress.totalXp, dateJoined: new Date().toISOString().split('T')[0] }];
        localStorage.setItem('thai_registered_users_list', JSON.stringify(nextList));
        return nextList;
      }
      return prev;
    });

    addSystemLog(cleanUser, `Newly registered and synchronized progress (+${progress.totalXp} XP)`);
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
      id: 'log-' + Date.now(),
      user,
      action,
      time: 'Just now'
    };
    setSystemLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  // Dismiss auto promotion modal
  const handleDismissPromo = () => {
    setHasDismissedPromo(true);
    sessionStorage.setItem('thai_has_dismissed_promo', 'true');
    setShowAuthModal(false);
  };

  // Compile all words from all 20 lessons for the master dictionary grid
  const allMasterVocab: WordBreakdown[] = Object.values(
    lessonsData.reduce((acc: { [key: string]: WordBreakdown }, lesson) => {
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
  const totalLessons = lessonsData.length;
  const totalPages = Math.ceil(totalLessons / lessonsPerPage);
  const paginatedLessons = lessonsData.slice(
    (currentPage - 1) * lessonsPerPage,
    currentPage * lessonsPerPage
  );

  const activeLesson = lessonsData.find((l) => l.id === activeLessonId);

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
            <span className="hidden leading-none xs:flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-sans font-extrabold text-brand-purple bg-brand-purple-light px-2.5 sm:px-3.5 py-1.5 rounded-full border border-brand-purple/20 shadow-xs select-none">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">OFFLINE READY • အော့ဖ်လိုင်း ဆက်လက်လေ့လာနိုင်သည်</span>
              <span className="inline md:hidden">OFFLINE READY</span>
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

      {/* Dynamic Admin System Broadcast Marquee Banner */}
      {showBroadcastBanner && activeBroadcast && (
        <div className="bg-gradient-to-r from-brand-purple to-brand-purple-shadow text-white py-2 px-4 shadow-xs text-[11px] sm:text-xs font-sans font-bold flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 animate-bounce shrink-0 text-amber-300" />
            <p className="truncate leading-none uppercase tracking-wide">{activeBroadcast}</p>
          </div>
          <button 
            onClick={() => setShowBroadcastBanner(false)}
            className="text-white/70 hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors shrink-0 cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* If no lesson is currently active: Display main student Dashboard */}
        {!activeLessonId ? (
          <div className="space-y-6 sm:space-y-8">
                        {/* Unified Dashboard Tab Selector - Duolingo Elegant Style */}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-gray-100 select-none`}>
              <button
                onClick={() => setDashboardTab('lessons')}
                className={`py-3 px-2 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'lessons'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                📚 Learning Path • သင်ခန်းစာ
              </button>
              <button
                onClick={() => setDashboardTab('orientation')}
                className={`py-3 px-2 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'orientation'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                🧭 Orientation • လမ်းညွှန်ချက်
              </button>
              <button
                onClick={() => {
                  setDashboardTab('handbook');
                  setMobileChapterDetailActive(false);
                }}
                className={`py-3 px-2 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'handbook'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                📖 Grammar Handbook • သဒ္ဒါလက်စွဲ
              </button>
              <button
                onClick={() => setDashboardTab('alphabet')}
                className={`py-3 px-2 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'alphabet'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                🔠 Alphabet Guide • အက္ခရာများ
              </button>
              <button
                onClick={() => setDashboardTab('notebook')}
                className={`py-3 px-2 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                  dashboardTab === 'notebook'
                    ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                💡 Notebook • ဝေါဟာရသစ်များ
              </button>
              {isAdmin && (
                <button
                  onClick={() => setDashboardTab('admin')}
                  className={`py-3 px-2 text-center rounded-xl font-sans font-black text-[10px] sm:text-xs transition-all uppercase tracking-wider ${
                    dashboardTab === 'admin'
                      ? 'bg-brand-purple text-white border-b-4 border-brand-purple-shadow'
                      : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                  }`}
                >
                  🛡️ Admin Panel • စီမံခန္ခွဲသူ
                </button>
              )}
            </div>

            {/* TAB CONTENT: 1. Lessons pathways */}
            {dashboardTab === 'lessons' && (
              <div className="max-w-4xl mx-auto space-y-6 min-h-[500px]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-gray-100">
                  <div>
                    <h3 className="font-sans font-black text-brand-dark text-lg mb-1 uppercase tracking-tight">
                      Basic Course Curriculum • အခြေခံသင်ရိုးညွှန်းတမ်းများ
                    </h3>
                    <p className="text-sm text-brand-muted font-sans font-semibold">
                      Structured grammar and vocabulary drills (Lessons {(currentPage - 1) * lessonsPerPage + 1} to {Math.min(currentPage * lessonsPerPage, totalLessons)} of {totalLessons}).
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
                    <h3 className="font-sans font-black text-brand-dark text-lg mb-1 uppercase tracking-tight">
                      Course Orientation
                    </h3>
                    <p className="text-xs text-brand-muted font-sans font-semibold">
                      Study starting tips, linguistic structures, and pronunciation guidelines.
                    </p>
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
                    <h3 className="font-sans font-black text-brand-dark text-lg mb-1 uppercase tracking-tight">
                      Grammar Index
                    </h3>
                    <p className="text-xs text-brand-muted font-sans font-semibold">
                      Access official grammatical chapters comprehensively reconstructed.
                    </p>
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
                    <h3 className="font-sans font-black text-brand-dark text-xl sm:text-2xl mb-1 uppercase tracking-tight">
                      Thai Alphabet Masterclass • ထိုင်းအက္ခရာသင်ခန်းစာ
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted font-sans font-semibold">
                      Learn and vocalize all 44 consonants and 32 vowels with native pronunciations and Burmese sound structures.
                    </p>
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
                    <h3 className="font-sans font-black text-brand-dark text-xl sm:text-2xl mb-1 uppercase tracking-tight">
                      💡 Vocabulary Notebook • ဝေါဟာရအသစ်စုစည်းမှု
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-muted font-sans font-semibold">
                      Contribute, save, and listen to custom Thai vocabulary words and phrases. Admin or users can add vocabulary cards.
                    </p>
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
                          <div>
                            <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1">
                              Thai Script * (e.g. สวัสดี)
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
                              Phonetic pronunciation * (e.g. sà-wàt-dii)
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
                              English Translation * (e.g. Hello)
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
                              Myanmar Translation * (e.g. မင်္ဂလာပါ)
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
                              if (!cleanThai || !cleanPhonetic || !cleanEnglish || !cleanMyanmar) {
                                setNotebookError("Please fill out all required fields!");
                                return;
                              }
                              if (customWords.some(w => w.thai === cleanThai)) {
                                setNotebookError("This word already exists in your Notebook!");
                                return;
                              }
                              const wordPayload = {
                                thai: cleanThai,
                                phonetic: cleanPhonetic,
                                english: cleanEnglish,
                                myanmar: cleanMyanmar,
                                partOfSpeech: newWordPos,
                                notes: newWordNotes.trim() || undefined,
                                author: currentUser || 'User'
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
                              setNotebookSuccess(`Successfully added "${cleanThai}" to Notebook! (+5 XP gained)`);
                              saveProgress({
                                ...progress,
                                totalXp: progress.totalXp + 5
                              });
                              addSystemLog(currentUser || 'User', `Contributed new word "${cleanThai}" to Notebook`);
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
                                          {isLoggedIn && (isAdmin || (currentUser && item.author?.toLowerCase() === currentUser.toLowerCase())) && (
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
                                                className="p-0.5 hover:bg-gray-100 rounded text-brand-muted hover:text-brand-dark cursor-pointer"
                                                title="Edit Card"
                                              >
                                                <Plus className="w-4 h-4 rotate-45 shrink-0" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const updated = customWords.filter(w => w.thai !== item.thai);
                                                  setCustomWords(updated);
                                                  localStorage.setItem('thai_custom_words_v1', JSON.stringify(updated));
                                                  addSystemLog(currentUser || 'User', `Removed word "${item.thai}"`);
                                                }}
                                                className="p-0.5 hover:bg-red-50 rounded text-red-400 hover:text-red-500 cursor-pointer"
                                                title="Delete Card"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                              </button>
                                            </>
                                          )}
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

                  {/* Registered Users Audit Table */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-gray-100 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="font-sans font-black text-brand-dark text-sm uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-gray-100">
                        <Users className="w-4 h-4 text-brand-purple shrink-0" />
                        Registered Student Registry ({registeredUsers.length})
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="border-b border-gray-100 text-brand-muted text-[9px] font-black uppercase tracking-wider">
                              <th className="py-2">USERNAME</th>
                              <th className="py-2">XP POINTS</th>
                              <th className="py-2">LEVEL</th>
                              <th className="py-2">DATE JOINED</th>
                              <th className="py-2 text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {registeredUsers.map((usr, i) => (
                              <tr key={i} className="hover:bg-gray-50/50">
                                <td className="py-2.5 font-bold text-brand-dark">{usr.username}</td>
                                <td className="py-2.5 font-mono text-brand-purple font-black">{usr.xp} XP</td>
                                <td className="py-2.5 font-sans font-extrabold text-[10px] text-brand-green">LVL {Math.floor(usr.xp / 1000) + 1}</td>
                                <td className="py-2.5 text-brand-muted font-bold">{usr.dateJoined}</td>
                                <td className="py-2.5 text-right">
                                  <button
                                    onClick={() => {
                                      setRegisteredUsers((prev) => {
                                        const updated = prev.filter(u => u.username !== usr.username);
                                        localStorage.setItem('thai_registered_users_list', JSON.stringify(updated));
                                        return updated;
                                      });
                                      addSystemLog('admin', `Deregistered user database record of "${usr.username}"`);
                                    }}
                                    className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer animate-pulse"
                                    title="Deregister User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 inline-block shrink-0" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const confirmReset = window.confirm("Are you sure you want to reset user table? (Will reset standard entries)");
                        if (confirmReset) {
                          const initialUsers = [
                            { username: "ko_nay_min", xp: 1250, dateJoined: "2026-05-12" },
                            { username: "ma_khine", xp: 820, dateJoined: "2026-06-01" },
                            { username: "phyo_wai", xp: 450, dateJoined: "2026-06-10" }
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
                <span className="truncate">Vocab • ဝေါဟာရ</span>
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
                <span className="truncate">Sentence • ဝါကျ</span>
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
                <span className="truncate">Grammar • သဒ္ဒါ</span>
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
                <span className="truncate">Quiz • စစ်ဆေးခြင်း</span>
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
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-6 animate-fade-in" id="bottom-lesson-ctrl-deck">
              
              {/* Part 1: Page-to-Page Navigation for active lesson */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                      if (activeLesson.id > 1) {
                        const prevId = activeLesson.id - 1;
                        setActiveLessonId(prevId);
                        setActiveTab('quiz');
                      } else {
                        setActiveLessonId(null);
                      }
                    }
                  }}
                  className="duo-btn duo-btn-white text-xs px-5 py-3 font-black flex items-center justify-center gap-1.5 min-w-[150px] transition-all cursor-pointer"
                  id="nav-btn-back"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  {activeTab === 'vocabulary' ? (
                    activeLesson.id > 1 ? `LESSON ${activeLesson.id - 1}` : 'DASHBOARD'
                  ) : (
                    'BACK • ရှေ့သို့'
                  )}
                </button>

                {/* Page Pagination Segments / Tabs list */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    { id: 'vocabulary', label: '1. Vocab • ဝေါဟာရ' },
                    { id: 'sentence', label: '2. Sentence • ဝါကျ' },
                    { id: 'grammar', label: '3. Grammar • သဒ္ဒါ' },
                    { id: 'quiz', label: '4. Quiz • စစ်ဆေးခြင်း' }
                  ].map((p) => {
                    const isPageActive = activeTab === p.id;
                    return (
                      <button
                        key={p.id}
                        id={`page-bttn-${p.id}`}
                        onClick={() => {
                          setActiveTab(p.id as any);
                          if (p.id === 'grammar') {
                            setCurrentGrammarPageIndex(0);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans font-black transition-all cursor-pointer ${
                          isPageActive
                            ? 'bg-brand-purple text-white shadow-sm ring-2 ring-brand-purple-shadow'
                            : 'bg-gray-50 border border-gray-200 text-brand-muted hover:bg-gray-100 hover:text-brand-dark'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

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
                      if (activeLesson.id < lessonsData.length) {
                        const nextId = activeLesson.id + 1;
                        setActiveLessonId(nextId);
                        setActiveTab('vocabulary');
                      } else {
                        setActiveLessonId(null);
                      }
                    }
                  }}
                  className="duo-btn duo-btn-purple text-xs px-5 py-3 font-black flex items-center justify-center gap-1.5 min-w-[150px] transition-all cursor-pointer"
                  id="nav-btn-next"
                >
                  {activeTab === 'quiz' ? (
                    activeLesson.id < lessonsData.length ? (
                      <>
                        LESSON {activeLesson.id + 1}
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </>
                    ) : (
                      <>
                        FINISH • ပြီးဆုံးပါပြီ
                        <Check className="w-4 h-4 shrink-0" />
                      </>
                    )
                  ) : (
                    <>
                      NEXT • နောက်သို့
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>

              {/* Part 2: Lesson Switcher / All Lessons Pagination */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 shadow-xs" id="lessons-nav-pager">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="text-xs font-sans text-brand-dark font-black uppercase tracking-wider">
                      All Lessons Navigation • သင်ခန်းစာများအားလုံး
                    </h4>
                    <p className="text-[10px] font-sans font-bold text-brand-muted">
                      Quickly hop to any lesson index directly from below.
                    </p>
                  </div>
                  <span className="text-[10px] font-sans text-brand-purple bg-brand-purple-light px-2.5 py-1 rounded-full font-black select-none">
                    LESSON {activeLesson.id} OF {lessonsData.length}
                  </span>
                </div>

                {/* Grid of All available Lesson Numbers */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {lessonsData.map((lesson) => {
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
                        className={`w-9.5 h-9.5 rounded-xl text-xs font-sans font-black transition-all border-2 flex items-center justify-center cursor-pointer relative ${
                          isLessonActive
                            ? 'bg-brand-purple text-white border-brand-purple border-b-4 border-brand-purple-shadow scale-110 z-10'
                            : isCompleted
                            ? 'bg-brand-green-light border-brand-green/20 text-brand-green hover:bg-brand-green-light/80'
                            : 'bg-white border-gray-200 text-brand-dark hover:bg-gray-50 border-b-4'
                        }`}
                        title={lesson.titleEnglish}
                      >
                        {lesson.id}
                        {isCompleted && !isLessonActive && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#3b82f6] rounded-full border border-white" />
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
                  ဝင်ရောက်ပြီး သင်ခန်းစာများ စင့်ခ်လုပ်ကာ ဝေါဟာရအသစ်များ ထည့်သွင်းသိမ်းဆည်းပါ။
                </p>
              </div>

              {/* Modal Tabs inside Auth Form */}
              <div className="flex gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100/80 mb-5 font-sans text-[10px] sm:text-xs font-black">
                <button 
                  onClick={() => {
                    setAuthTab('user');
                    setAuthError('');
                  }}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all uppercase tracking-wide cursor-pointer ${authTab === 'user' ? 'bg-brand-purple text-white shadow-xs' : 'text-brand-muted hover:text-brand-dark'}`}
                >
                  Student Sign Up
                </button>
                <button 
                  onClick={() => {
                    setAuthTab('admin');
                    setAuthError('');
                  }}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all uppercase tracking-wide cursor-pointer ${authTab === 'admin' ? 'bg-brand-purple text-white shadow-xs' : 'text-brand-muted hover:text-brand-dark'}`}
                >
                  Admin Console
                </button>
              </div>

              {authTab === 'user' ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (authUsername.trim()) {
                    handleStandardSignUp(authUsername);
                    setAuthUsername('');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans font-black text-brand-dark uppercase tracking-wider mb-1.5">
                      Enter Username • သင့်အမည်ပေးပါ
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
                  <button 
                    type="submit"
                    className="w-full duo-btn duo-btn-purple text-xs font-black py-3.5 flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    ENTER COURSE • သင်ခန်းစာလေ့လာမည်
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (authUsername.trim() && authPassword) {
                    const success = handleAdminLogin(authUsername, authPassword);
                    if (success) {
                      setAuthUsername('');
                      setAuthPassword('');
                      setAuthError('');
                    } else {
                      setAuthError('Invalid admin credentials! (use admin & admin@4238)');
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
                    ADMIN LOG IN • အကောင့်ဝင်မည်
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
