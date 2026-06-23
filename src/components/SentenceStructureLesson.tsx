import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Volume2, ArrowLeft } from 'lucide-react';

interface SentenceStructureLessonProps {
  onBack: () => void;
}

// 6 Verbs defined in the prompt mockup
const VERBS = [
  { thai: "กิน", myanmar: "စားသည်", english: "eat", phonetic: "kin" },
  { thai: "ไป", myanmar: "သွားသည်", english: "go", phonetic: "bpai" },
  { thai: "ทำ", myanmar: "လုပ်သည်", english: "do", phonetic: "tham" },
  { thai: "นอน", myanmar: "အိပ်သည်", english: "sleep", phonetic: "nɔ́ɔn" },
  { thai: "ซื้อ", myanmar: "ဝယ်သည်", english: "buy", phonetic: "sʉ́ʉ" },
  { thai: "มา", myanmar: "လာသည်", english: "come", phonetic: "maa" },
];

// Subjects/Pronouns for dropdown builder
const SUBJECTS = [
  { thai: "ฉัน", myanmar: "ကျွန်မ (I - female)", english: "I (fem.)" },
  { thai: "ผม", myanmar: "ကျွန်တော် (I - male)", english: "I (masc.)" },
  { thai: "เรา", myanmar: "ငါတို့ (We)", english: "We" },
  { thai: "คุณ", myanmar: "မင်း (You)", english: "You" },
  { thai: "เขา", myanmar: "သူ (He/She)", english: "He/She" },
];

export default function SentenceStructureLesson({ onBack }: SentenceStructureLessonProps) {
  // Sentence builder state
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedGrammar, setSelectedGrammar] = useState("จะ");
  const [selectedVerb, setSelectedVerb] = useState(VERBS[1]); // Default Verb is "ไป" (go) as [ฉัน] [จะ] [ไป]
  const [activeSpeechWord, setActiveSpeechWord] = useState<string | null>(null);

  // Pronounce function for Thai text
  const speakThaiText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("TTS not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.85; // Natural slow educational rate

    setActiveSpeechWord(text);
    utterance.onend = () => setActiveSpeechWord(null);
    window.speechSynthesis.speak(utterance);
  };

  // Get Myanmar translation of compiled Subject + จะ + Verb
  const getCompiledBurmese = () => {
    const s = selectedSubject.thai;
    const v = selectedVerb.thai;

    // Pronouns
    let subjMm = "ကျွန်မ";
    if (s === "ผม") subjMm = "ကျွန်တော်";
    if (s === "เรา") subjMm = "ငါတို့";
    if (s === "คุณ") subjMm = "မင်း";
    if (s === "เขา") subjMm = "သူ";

    // Verbs Future markers
    let verbMm = "သွားမယ်။";
    if (v === "กิน") verbMm = "စားမယ်။";
    if (v === "ทำ") verbMm = "လုပ်မယ်။";
    if (v === "นอน") verbMm = "အိပ်မယ်။";
    if (v === "ซื้อ") verbMm = "ဝယ်မယ်။";
    if (v === "มา") verbMm = "လာမယ်။";

    return `${subjMm} ${verbMm}`;
  };

  return (
    <div id="grammar-lesson-device-wrapper" className="flex justify-center items-center py-6 px-4 bg-[#f8fafc]/30 min-h-[calc(100vh-140px)]">
      {/* Outer Smartphone Mockup Shell Container */}
      <div 
        id="phone-mockup-frame" 
        className="w-full max-w-[430px] bg-white rounded-[50px] border-[10px] border-slate-900 shadow-2xl overflow-hidden flex flex-col relative aspect-[9/19.5]"
      >
        {/* Phone Notch/Speaker Header Accent */}
        <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 flex justify-center items-end pb-1.5 z-50">
          <div className="w-28 h-4.5 bg-slate-900 rounded-b-xl flex items-center justify-between px-4">
            <span className="text-[10px] font-semibold text-white/90">9:41</span>
            <div className="flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <div className="flex gap-0.5 items-end h-2">
                <span className="w-0.5 h-1 bg-white/95 rounded-3xs" />
                <span className="w-0.5 h-1.5 bg-white/95 rounded-3xs" />
                <span className="w-0.5 h-2 bg-white/95 rounded-3xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Header bar inside App */}
        <header id="phone-app-header" className="pt-10 pb-4 px-6 border-b border-gray-100 flex items-center justify-between bg-white z-43">
          <button 
            id="btn-structure-back"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group active:scale-95"
            aria-label="Back to previous menu"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <h1 className="text-lg font-sans font-black text-slate-800 tracking-tight text-center flex-1 pr-10">
            โครงสร้างประโยค
          </h1>
        </header>

        {/* Scrollable Lesson Body Frame */}
        <main id="phone-app-body" className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 select-none scrollbar-none bg-[#fafbfc]">
          
          {/* 1. Large Top Grammar Focus Card */}
          <div 
            id="top-grammar-focus-card"
            className="bg-[#f0f9eb] border border-[#e1f3d8] rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#e1f3d8]/40 rounded-full translate-x-4 -translate-y-4" />
            
            <h2 className="text-5xl font-sans font-black text-[#67c23a] tracking-tight mb-2">
              จะ
            </h2>
            <p className="text-sm font-sans font-extrabold text-[#6ac043]/90 mb-1">
              จะ (will)
            </p>
            <p className="text-lg font-sans font-black text-emerald-800 leading-tight">
              မယ့် / လိမ့်မယ်။
            </p>
          </div>

          {/* 2. Visual Sentence-Construction Diagram */}
          <section id="sentence-tree-diagram" className="space-y-3">
            <h3 className="text-xs uppercase font-sans text-slate-400 font-black tracking-widest text-center">
              Sentence Mapping • စကားလုံးချိတ်ဆက်ပုံ
            </h3>
            
            {/* The SVG & Flex Diagram Box */}
            <div className="relative flex items-center justify-between gap-1 py-7 px-2 border-2 border-slate-100/60 rounded-3xl bg-white shadow-3xs overflow-visible">
              
              {/* Left Column container with [จะ] square & '+' block */}
              <div className="flex flex-col items-center justify-center z-10 pl-2">
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileTap={{ scale: 0.92 }}
                    onClick={() => speakThaiText("จะ")}
                    className={`w-14 h-14 bg-[#f8fcf5] border-2 border-[#e1f3d8] rounded-2xl flex flex-col items-center justify-center shadow-2xs cursor-pointer transition-all ${
                      activeSpeechWord === "จะ" ? 'ring-4 ring-green-100 border-green-400 bg-green-50' : 'hover:bg-[#f0f9eb]'
                    }`}
                  >
                    <span className="text-lg font-sans font-black text-[#5dae34]">จะ</span>
                  </motion.div>
                  <span className="text-lg font-mono font-black text-slate-300 select-none">+</span>
                </div>
              </div>

              {/* Center Connective SVG S-Curves with motion drawing */}
              <div className="absolute inset-y-0 left-[82px] right-[230px] pointer-events-none z-0">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[8.33, 25, 41.67, 58.33, 75, 91.67].map((yEnd, idx) => (
                    <motion.path
                      key={idx}
                      d={`M 0 50 C 40 50, 60 ${yEnd}, 100 ${yEnd}`}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0.8 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                    />
                  ))}
                </svg>
              </div>

              {/* Right Column with Horizontal Vocabulary verb cards */}
              <div className="flex flex-col gap-2 z-10 w-[215px]">
                {VERBS.map((v, idx) => {
                  const combinedPhrase = `จะ${v.thai}`;
                  const isSpeaking = activeSpeechWord === combinedPhrase;
                  
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 2 }}
                      className={`h-11 bg-white border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1 shadow-3xs transition-all ${
                        isSpeaking ? 'ring-2 ring-emerald-400/30 border-emerald-350 bg-[#fbfefb]' : ''
                      }`}
                    >
                      {/* Thai Word */}
                      <span className="text-sm font-sans font-black text-slate-705">
                        {v.thai}
                      </span>
                      
                      {/* Myanmar translation */}
                      <span className="text-xs font-sans text-slate-400 font-extrabold truncate max-w-[100px] text-center">
                        {v.myanmar}
                      </span>

                      {/* Mini Speaker circle button */}
                      <button
                        onClick={() => speakThaiText(combinedPhrase)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 group active:scale-90 cursor-pointer ${
                          isSpeaking ? 'bg-emerald-100 border-emerald-300 text-emerald-700 animate-pulse' : 'text-slate-500'
                        }`}
                        title={`Listen combined pattern "จะ${v.thai}"`}
                      >
                        <Volume2 className={`w-3.5 h-3.5 transition-transform ${isSpeaking ? 'scale-110 text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* 3. Dropdown-based Interactive Sentence-Builder Canvas */}
          <section id="sentence-builder-block" className="space-y-3">
            <div className="bg-[#f3f1fc] border border-[#e6e2f9] rounded-3xl p-5 shadow-3xs flex flex-col gap-4">
              
              {/* Title inside lavender section */}
              <h4 className="text-sm font-sans font-black text-[#583092] tracking-tight">
                สร้างประโยคของคุณ
              </h4>

              {/* Row of Dropdowns */}
              <div className="grid grid-cols-3 gap-2">
                
                {/* Dropdown 1: Subject Selector */}
                <div id="builder-sel-subj" className="relative group">
                  <label htmlFor="subject-input" className="sr-only">Choose Subject</label>
                  <select
                    id="subject-input"
                    value={selectedSubject.thai}
                    onChange={(e) => {
                      const found = SUBJECTS.find(s => s.thai === e.target.value);
                      if (found) setSelectedSubject(found);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-1.5 pr-6 text-[12px] font-sans font-black text-slate-700 shadow-2xs outline-none cursor-pointer appearance-none hover:border-violet-300 transition-colors"
                  >
                    {SUBJECTS.map((s, idx) => (
                      <option key={idx} value={s.thai} className="font-extrabold">
                        {s.thai}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-600" />
                </div>

                {/* Dropdown 2: Grammar Word Selector (Locked to 'จะ') */}
                <div id="builder-sel-gram" className="relative">
                  <label htmlFor="grammar-word-select" className="sr-only">Grammar Future Auxiliary Word "จะ"</label>
                  <select
                    id="grammar-word-select"
                    value={selectedGrammar}
                    onChange={(e) => setSelectedGrammar(e.target.value)}
                    className="w-full bg-emerald-50/60 border border-emerald-200 rounded-xl py-2 px-1.5 text-[12px] font-sans font-black text-emerald-700 shadow-2xs outline-none appearance-none cursor-not-allowed text-center"
                    disabled
                  >
                    <option value="จะ">จะ</option>
                  </select>
                </div>

                {/* Dropdown 3: Verb Selector */}
                <div id="builder-sel-verb" className="relative group">
                  <label htmlFor="verb-input" className="sr-only">Choose Verb</label>
                  <select
                    id="verb-input"
                    value={selectedVerb.thai}
                    onChange={(e) => {
                      const found = VERBS.find(v => v.thai === e.target.value);
                      if (found) setSelectedVerb(found);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-1.5 pr-6 text-[12px] font-sans font-black text-slate-700 shadow-2xs outline-none cursor-pointer appearance-none hover:border-violet-300 transition-colors"
                  >
                    {VERBS.map((v, idx) => (
                      <option key={idx} value={v.thai} className="font-extrabold">
                        {v.thai}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-600" />
                </div>

              </div>

              {/* Compiled Dynamic Sentence Card */}
              <div className="bg-white rounded-2xl p-4.5 border border-purple-100 flex items-center justify-between shadow-xs mt-1 transition-all">
                <div className="space-y-1 flex-1 pr-4">
                  {/* Thai Generated compound text */}
                  <div className="text-[21px] font-sans font-black text-slate-800 tracking-wide select-all leading-snug">
                    {selectedSubject.thai}{selectedGrammar}{selectedVerb.thai}
                  </div>
                  {/* Myanmar generated transliteration phrase */}
                  <div className="text-sm font-sans font-bold text-slate-600 leading-normal">
                    {getCompiledBurmese()}
                  </div>
                </div>

                {/* Circular audio playback speaker button */}
                <button
                  onClick={() => speakThaiText(`${selectedSubject.thai}${selectedGrammar}${selectedVerb.thai}`)}
                  className={`w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-violet-50 hover:border-violet-300 cursor-pointer group transition-all active:scale-90 ${
                    activeSpeechWord === `${selectedSubject.thai}${selectedGrammar}${selectedVerb.thai}` ? 'bg-violet-100 text-violet-700 border-violet-400' : 'text-slate-500'
                  }`}
                  title="Play constructed sentence"
                >
                  <Volume2 className="w-4.5 h-4.5 text-slate-400 group-hover:text-violet-600 transition-transform group-hover:scale-105" />
                </button>
              </div>

              {/* Bottom control row containing the Prominent Purple Gradient Listen/Pronounce Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => speakThaiText(`${selectedSubject.thai}${selectedGrammar}${selectedVerb.thai}`)}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-[#7c3aed] hover:from-violet-700 hover:to-[#6d28d9] text-white rounded-full font-sans font-black text-xs tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer uppercase transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-purple-200 active:scale-95"
                  id="btn-listen-action"
                >
                  <Volume2 className="w-4 h-4 fill-current text-white animate-pulse" />
                  <span>ฟังเสียง</span>
                </button>
              </div>

            </div>
          </section>

          {/* User Guide Tip Footer */}
          <p className="text-[10px] text-center text-slate-400 font-sans font-bold leading-normal pt-2 px-4">
            Study sentence combinations using subjects and verbs in future tense! Click "ฟังเสียง" for complete reading exercises.
          </p>

        </main>

        {/* Outer Phone Home Indicator Accent */}
        <div className="absolute bottom-1 inset-x-0 h-5 flex justify-center items-center pointer-events-none z-50">
          <div className="w-28 h-1 bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
