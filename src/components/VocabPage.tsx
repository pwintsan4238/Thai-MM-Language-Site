import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, Search, Book, Sparkles } from 'lucide-react';
import { VOCAB_DATA, VocabCategory, VocabItem } from '../data/vocab';

interface VocabPageProps {
  onClose: () => void;
}

export const VocabPage: React.FC<VocabPageProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<VocabCategory[]>(() => {
    const saved = localStorage.getItem('thai_vocab_book_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved vocab book categories in VocabPage:", e);
      }
    }
    return VOCAB_DATA;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('thai_vocab_book_categories');
      if (saved) {
        try {
          setCategories(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved vocab book categories in VocabPage:", e);
        }
      } else {
        setCategories(VOCAB_DATA);
      }
    };
    window.addEventListener('thai_vocab_book_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('thai_vocab_book_categories_updated', handleUpdate);
    };
  }, []);

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(() => {
    const saved = localStorage.getItem('thai_vocab_book_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed[0].name;
        }
      } catch (e) {}
    }
    return VOCAB_DATA[0].name;
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const currentCategory = categories.find(c => c.name === selectedCategoryName) || categories[0] || { name: '', icon: '', items: [] };

  // Watch for dynamic category deletion from admin selection side
  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.name === selectedCategoryName)) {
      setSelectedCategoryName(categories[0].name);
    }
  }, [categories, selectedCategoryName]);

  // Search across either the selected category or all of them
  const filteredItems = (currentCategory.items || []).filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.thai.toLowerCase().includes(q) ||
      item.phonetic.toLowerCase().includes(q) ||
      item.phoneticMm.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q) ||
      item.myanmar.toLowerCase().includes(q)
    );
  });

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.85; // slightly slower for better learning
      
      utterance.onstart = () => setPlayingWord(text);
      utterance.onend = () => setPlayingWord(null);
      utterance.onerror = () => setPlayingWord(null);

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback blink animation
      setPlayingWord(text);
      setTimeout(() => setPlayingWord(null), 800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white border-2 border-slate-100 rounded-3xl w-full min-h-[70vh] flex flex-col overflow-hidden shadow-xs hover:border-slate-250 transition-all duration-300"
    >
      {/* Top action header */}
      <div className="p-4 sm:p-5 border-b border-rose-100/40 flex items-center justify-between bg-slate-50/50 shrink-0 gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-brand-purple/5 text-slate-700 hover:text-brand-purple border-2 border-slate-200 hover:border-brand-purple/30 rounded-2xl transition-all duration-200 cursor-pointer font-sans font-black text-xs sm:text-sm uppercase tracking-wider shadow-3xs hover:shadow-2xs active:scale-95 shrink-0"
            title="Back to Course pathways"
          >
            <ArrowLeft className="w-4 h-4 text-brand-purple stroke-[3]" />
            <span>Back</span>
          </button>
          
          <div className="text-left min-w-0 flex-1">
            <h3 className="font-sans font-black text-slate-800 text-sm sm:text-lg tracking-tight leading-snug flex items-center gap-2">
              <span className="p-1.5 bg-brand-purple/10 rounded-xl inline-flex text-brand-purple shrink-0">
                <Book className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="truncate">Classroom Vocabulary Book</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold font-sans mt-0.5 ml-0.5 truncate">
              ဝေါဟာရစကားလုံးပေါင်းစုံ လေ့လာခန်း • <span className="text-brand-purple">{categories.length} Categories</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="px-4 py-3 sm:px-5 border-b border-slate-100 bg-white flex items-center gap-2.5 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words by Thai, English, Myanmar, spelling..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-purple focus:bg-white transition-all text-brand-dark"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-brand-purple hover:text-brand-dark"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Grid view containing layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Dropdown for category on Mobile view only */}
        <div className="block md:hidden px-4 py-3.5 border-b border-rose-100/30 bg-slate-50/50">
          <label className="block text-xs font-sans font-black uppercase text-slate-600 mb-2 tracking-wide">
            📁 Select Vocabulary Category:
          </label>
          <div className="relative">
            <select
              value={selectedCategoryName}
              onChange={(e) => {
                setSelectedCategoryName(e.target.value);
                setSearchQuery('');
              }}
              className="w-full pl-3.5 pr-11 py-3 bg-white border-2 border-slate-200 hover:border-slate-350 rounded-xl font-sans text-sm sm:text-base font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-purple/15 focus:border-brand-purple transition-all appearance-none cursor-pointer shadow-3xs"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name} className="font-sans font-bold text-slate-800 text-sm sm:text-base">
                  {cat.icon} &nbsp;&nbsp; {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Sidebar Vertical Panel on desktop (hidden on mobile) */}
        <div className="hidden md:flex md:w-[230px] md:flex-col border-r border-slate-100 bg-slate-50/20 md:overflow-y-auto p-2 gap-1.5 shrink-0">
          {categories.map((cat) => {
            const isSelected = cat.name === selectedCategoryName;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategoryName(cat.name);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-sans text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 md:w-full text-left ${
                  isSelected
                    ? 'bg-brand-purple text-white border-r-4 border-brand-purple-shadow shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-slate-100'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic List Container Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/10">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item, idx) => {
                const isSpeaking = playingWord === item.thai;
                return (
                  <div
                    key={idx}
                    className={`p-4 bg-white rounded-2xl border-2 transition-all flex items-start justify-between gap-3 relative overflow-hidden group ${
                      isSpeaking 
                        ? 'border-brand-purple shadow-xs bg-brand-purple/5' 
                        : 'border-slate-100 hover:border-slate-250 hover:shadow-3xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Audio Speaker Touch Target */}
                      <button
                        onClick={() => handleSpeak(item.thai)}
                        className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-brand-purple text-white border-brand-purple border-b-2 border-brand-purple-shadow'
                            : 'bg-slate-50 text-slate-550 hover:bg-brand-purple/10 hover:text-brand-purple border-slate-100 group-hover:scale-105'
                        }`}
                        title="Listen Pronunciation"
                      >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      </button>

                      <div className="flex-1 min-w-0 text-left">
                        {/* Thai Writing Display */}
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-sans font-black text-xl sm:text-2xl text-slate-800 tracking-wide select-all">
                            {item.thai}
                          </span>
                        </div>

                        {/* Roman Spelling / Phonetics */}
                        <p className="text-sm sm:text-base text-brand-green font-bold italic font-sans flex items-center gap-1 mt-0.5 select-all">
                          <span>[{item.phonetic}]</span>
                        </p>

                        {/* Myanmar Transcript and Translation */}
                        <div className="mt-2.5 space-y-1 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[10.5px]">
                            <span className="text-[9px] font-sans font-extrabold text-indigo-500 uppercase tracking-widest shrink-0">အသံထွက်:</span>
                            <span className="font-sans font-extrabold text-slate-700 bg-indigo-50 px-1.5 py-0.5 rounded select-all">
                              {item.phoneticMm}
                            </span>
                          </div>

                          <div className="flex items-start gap-1 py-0.5 text-xs">
                            <span className="text-[9px] font-sans font-extrabold text-black uppercase tracking-widest mt-1 shrink-0">ENG:</span>
                            <span className="font-sans font-black text-black select-all">
                              {item.english}
                            </span>
                          </div>

                          <div className="flex items-start gap-1 text-xs">
                            <span className="text-[9px] font-sans font-extrabold text-black uppercase tracking-widest mt-0.5 shrink-0">MM:</span>
                            <span className="font-sans font-bold text-black select-all leading-tight">
                              {item.myanmar}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side Visual Illustration badge */}
                    <div className="w-16 h-16 bg-slate-50/70 border border-slate-150/80 rounded-2xl flex items-center justify-center text-4xl shrink-0 select-none shadow-3xs group-hover:scale-110 transition-transform duration-300 self-center">
                      {item.illustration}
                    </div>

                    {/* Top-right card index accent badge */}
                    <div className="absolute top-1.5 right-1 px-1 text-[7px] font-mono font-bold tracking-widest opacity-20 text-slate-400 group-hover:opacity-40">
                      #{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🔍</div>
              <h4 className="font-sans font-black text-slate-700">No results found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-bold">
                Try searching with simpler terms or browse some other vocabulary categories in the sidebar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar overlay */}
      <div className="px-4 py-3 sm:px-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-[10px] font-sans font-bold text-slate-400 select-none">
        <span className="flex items-center gap-1.5">
          💡 <span className="text-indigo-500">UX Hint:</span> Double-click any Thai text inside cards to highlight and copy!
        </span>
        <span className="text-brand-purple font-extrabold uppercase bg-brand-purple/5 px-2 py-0.5 rounded">
          Classroom Vocabulary is fully offline-ready
        </span>
      </div>
    </motion.div>
  );
};
