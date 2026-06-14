export interface WordBreakdown {
  thai: string;
  phonetic: string;
  english: string;
  myanmar: string;
  myanmarPhonetic?: string;
  partOfSpeech: string;
  notes?: string;
}

export interface DialogueLine {
  speaker: string; // 'A' or 'B' or human name like 'Prabas', 'John'
  thai: string;
  phonetic: string;
  english: string;
  myanmar: string;
  words: WordBreakdown[];
}

export interface GrammarNote {
  title: string;
  titleMyanmar: string;
  explanation: string;
  explanationMyanmar: string;
  examples: {
    thai: string;
    phonetic: string;
    english: string;
    myanmar: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  type: 'translate-thai-to-mm' | 'translate-mm-to-thai' | 'listening-match' | 'fill-gap';
  prompt: string; // the question prompt (e.g. "What does สบายดี (sabaajdii) mean?")
  promptThai?: string; // used for listening questions or fill-gaps
  options: string[]; // 4 multiple choice options
  correctAnswer: string;
  explanation?: string;
  explanationMyanmar?: string;
}

export interface Lesson {
  id: number;
  titleThai: string;
  titlePhonetic: string;
  titleEnglish: string;
  titleMyanmar: string;
  descriptionEnglish: string;
  descriptionMyanmar: string;
  dialogue: DialogueLine[];
  grammarNotes: GrammarNote[];
  quiz: QuizQuestion[];
}

export interface ProgressState {
  completedLessons: number[]; // Lesson IDs
  masteredWords: string[]; // List of Thai words marked mastered
  totalXp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  quizHighScores: { [lessonId: number]: number }; // Lesson ID -> highest score percentage
}
