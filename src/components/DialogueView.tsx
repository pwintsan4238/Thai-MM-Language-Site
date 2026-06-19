import React, { useState } from 'react';
import { DialogueLine, WordBreakdown } from '../types';
import { Play, Volume2, Volume1, Volume, HelpCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DialogueViewProps {
  dialogue: DialogueLine[];
  onWordMastered: (word: string) => void;
  masteredWords: string[];
  audioSpeedIndex: number;
  setAudioSpeedIndex: React.Dispatch<React.SetStateAction<number>>;
  wholeDialogueVideoUrl?: string;
}

export default function DialogueView({ dialogue, onWordMastered, masteredWords, audioSpeedIndex, setAudioSpeedIndex, wholeDialogueVideoUrl }: DialogueViewProps) {
  const [selectedWord, setSelectedWord] = useState<WordBreakdown | null>(null);
  const [activeSpeechLine, setActiveSpeechLine] = useState<number | null>(null);

  // Detect available video structures
  const hasWholeVideo = !!wholeDialogueVideoUrl;
  const hasLineVideos = dialogue.some(line => !!line.videoUrl);
  
  // Default to whole video if available, otherwise fallback
  const [videoMode, setVideoMode] = useState<'whole' | 'lines' | 'none'>(
    hasWholeVideo ? 'whole' : (hasLineVideos ? 'lines' : 'none')
  );

  // Video parsing helper handles YouTube converting and native HTML5 MP4 videos cleanly
  const renderVideoElement = (url: string, title: string = "Video Player", containerClass: string = "w-full") => {
    if (!url) return null;
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('/embed/');
    if (isYoutube) {
      let embedUrl = url;
      try {
        if (url.includes('watch?v=')) {
          const urlObj = new URL(url);
          const videoId = urlObj.searchParams.get('v');
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (url.includes('youtu.be/')) {
          const parts = url.split('youtu.be/');
          if (parts[1]) {
            const videoId = parts[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        }
      } catch (e) {
        console.warn('Failed parsing video URL, using raw:', url, e);
      }
      return (
        <div className={`relative aspect-video ${containerClass} overflow-hidden bg-black shadow-inner border border-brand-purple/10 rounded-xl`}>
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full border-none rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else {
      return (
        <div className={`relative aspect-video ${containerClass} overflow-hidden bg-black border border-brand-purple/10 rounded-xl`}>
          <video
            src={url}
            controls
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover rounded-xl bg-black"
          />
        </div>
      );
    }
  };

  // Use Web Speech API for Pronunciation
  const speakThai = (text: string, index?: number) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech not supported in this browser. Please use Chrome/Safari/Firefox.");
      return;
    }

    // Cycle the shared speed index: 0 -> 1 -> 2 -> 0
    const nextIndex = (audioSpeedIndex + 1) % 3;
    setAudioSpeedIndex(nextIndex);

    const rates = [0.85, 0.7, 0.5];
    const rate = rates[nextIndex];

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = rate;

    if (index !== undefined) {
      setActiveSpeechLine(index);
      utterance.onend = () => setActiveSpeechLine(null);
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Dialogue Left/Mid Column (Interactive conversation flow) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mobile Video Widget */}
        {wholeDialogueVideoUrl && (
          <div className="lg:hidden duo-card p-4 bg-white border-2 border-brand-purple/20 shadow-xs space-y-3">
            <h4 className="font-sans font-black text-brand-dark text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-sans font-black uppercase tracking-wider text-brand-purple">
                <span className="text-sm">📺</span>
                <span>Full Practice Video • သင်ခန်းစာဗီဒီယို</span>
              </span>
              <span className="text-[9px] bg-brand-purple-light text-brand-purple px-2 py-0.5 rounded-full font-bold">Full Video Practice</span>
            </h4>
            {renderVideoElement(wholeDialogueVideoUrl, "Dialogue Lesson Full Practice Session Mobile")}
          </div>
        )}

        <div className="duo-card p-6 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b border-brand-border pb-4">
            <h3 className="font-sans font-black text-brand-dark text-lg flex items-center gap-2">
              <span className="w-3" style={{ content: '""', aspectRatio: '1', backgroundColor: 'var(--color-brand-purple)', borderRadius: '9999px' }} />
              Dialogue Practice • စကားပြောလေ့ကျင့်ခန်း
            </h3>
            <span className="text-[10px] font-sans font-extrabold text-brand-purple bg-brand-purple-light px-3 py-1 rounded-full border-b-2 border-brand-purple-subtle">
              Tap any word for translation • စကားလုံးကိုနှိပ်ဂရုစိုက်ပါ
            </span>
          </div>

          {/* Dynamic Video Selector Segmented Control when both exist */}
          {hasWholeVideo && hasLineVideos && (
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100 max-w-md mb-6 justify-between items-center text-xs font-sans">
              <span className="text-[10px] uppercase font-black text-brand-muted tracking-wider px-2 shrink-0">🎥 Practice Mode</span>
              <div className="flex bg-white shadow-3xs p-0.5 rounded-lg border border-gray-100 gap-1 flex-1 max-w-xs justify-end ml-auto">
                <button
                  onClick={() => setVideoMode('whole')}
                  className={`px-3 py-1 text-[10px] font-sans font-black rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                    videoMode === 'whole'
                      ? 'bg-brand-purple text-white shadow-2xs'
                      : 'text-brand-muted hover:text-brand-dark'
                  }`}
                >
                  📺 Whole Video
                </button>
                <button
                  onClick={() => setVideoMode('lines')}
                  className={`px-3 py-1 text-[10px] font-sans font-black rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                    videoMode === 'lines'
                      ? 'bg-brand-purple text-white shadow-2xs'
                      : 'text-brand-muted hover:text-brand-dark'
                  }`}
                >
                  👥 Lines Video
                </button>
              </div>
            </div>
          )}

          {/* If they have whole video and selected whole video, show inline player at top of dialogues */}
          {hasWholeVideo && videoMode === 'whole' && (
            <div className="mb-6 bg-brand-purple/5 p-4 rounded-2xl border-2 border-brand-purple/15 animate-fade-in space-y-3">
              <div className="flex items-center justify-between text-[10px] font-sans font-black text-brand-purple uppercase tracking-wider">
                <span>🎬 CONVERSATION BROADCAST VIDEO</span>
                <span className="bg-[#efefef] text-brand-dark px-1.5 py-0.5 rounded text-[8px] border font-bold">Dialogue Video</span>
              </div>
              {renderVideoElement(wholeDialogueVideoUrl, "Dialogue Lesson Full Practice Session Top")}
              <p className="text-[9px] text-brand-muted font-sans font-medium text-center leading-normal">
                Listen to the full conversational dialogue in context. Pause then repeat back line-by-line below to master natural rhythm!
              </p>
            </div>
          )}

          <div className="space-y-6" id="dialogue-chat-flow">
            {dialogue.map((line, idx) => {
              const isSpeakerA = line.speaker.includes('A');
              const cleanWords = (line.words || []).filter(w => {
                const eng = w.english.toLowerCase();
                const mya = w.myanmar;
                return !(
                  eng.includes("(name)") || 
                  mya.includes("(အမည်)") || 
                  eng === "john" || 
                  w.thai === "จอห์น" || 
                  w.thai === "ปรีชา" || 
                  w.thai === "สมศักดิ์" || 
                  w.thai === "นงนุช"
                );
              });

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isSpeakerA ? 'items-start' : 'items-end'} space-y-2`}
                >
                  {/* Speaker Label */}
                  <div className="flex items-center gap-2 text-xs font-extrabold text-brand-muted font-sans">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-xs ${
                      isSpeakerA 
                        ? 'bg-brand-purple text-white border-b-2 border-brand-purple-shadow' 
                        : 'bg-[#58cc02] text-white border-b-2 border-brand-green-shadow'
                    }`}>
                      {line.speaker}
                    </span>
                  </div>

                  {/* Word Bubble Container */}
                  <div className={`relative max-w-[95%] md:max-w-[85%] rounded-2xl p-5 pt-8 border-2 ${
                    isSpeakerA 
                      ? 'bg-white text-brand-dark border-brand-border shadow-[0_3px_0_0_#efefef]' 
                      : 'bg-brand-purple-light/30 text-brand-dark border-brand-purple/20 shadow-[0_3px_0_0_#ede9fe]'
                  }`}>
                    {/* Right upper-corner drop down vocab list */}
                    {cleanWords.length > 0 && (
                      <div className="absolute top-2 right-2.5 z-10">
                        <label htmlFor={`vocab-select-${idx}`} className="sr-only">Choose vocabulary word</label>
                        <select
                          id={`vocab-select-${idx}`}
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const found = cleanWords.find(w => w.thai === val);
                              if (found) setSelectedWord(found);
                            }
                          }}
                          className="bg-white/95 border border-gray-200 text-brand-dark text-[10px] rounded-lg font-black font-sans px-2 py-0.5 outline-none cursor-pointer max-w-[130px] sm:max-w-[200px] shadow-3xs hover:border-brand-purple/40 hover:bg-white transition-colors"
                        >
                          <option value="">Vocab • ဝေါဟာရ</option>
                          {cleanWords.map((w, wIdx) => (
                            <option key={wIdx} value={w.thai}>
                              {w.myanmar} = {w.phonetic || w.thai}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* Native Thai spacing representation word-by-word */}
                    <div className="flex flex-wrap gap-2 items-center mb-3.5">
                      {cleanWords.map((wordObj, wordIdx) => {
                        const isMastered = masteredWords.includes(wordObj.thai);
                        const isSelected = selectedWord?.thai === wordObj.thai;

                        return (
                          <motion.button
                            key={wordIdx}
                            onClick={() => setSelectedWord(wordObj)}
                            className={`px-3 py-1.5 rounded-xl text-sm font-sans font-extrabold transition-all border-2 border-b-4 ${
                              isSelected
                                ? 'bg-brand-purple text-white border-brand-purple border-b-brand-purple-shadow'
                                : isMastered
                                ? 'bg-brand-green-light text-brand-green border-brand-green/30 border-b-brand-green-shadow/30 hover:bg-brand-green-light/80'
                                : 'bg-white text-brand-dark border-[#e5e5e5] border-b-[#d5d5d5] hover:bg-gray-50'
                            }`}
                            whileTap={{ scale: 0.95 }}
                            title={`${wordObj.phonetic} - ${wordObj.myanmar}`}
                          >
                            {wordObj.thai}
                          </motion.button>
                        );
                      })}

                      {/* Line Audio button */}
                      <button
                        onClick={() => speakThai(line.thai, idx)}
                        className={`px-2.5 h-9 rounded-2xl border-2 border-b-4 flex items-center justify-center gap-1.5 transition-all ${
                          activeSpeechLine === idx
                            ? 'bg-brand-purple text-white border-brand-purple border-b-brand-purple-shadow animate-bounce'
                            : 'bg-white text-brand-purple border-brand-purple/20 border-b-brand-purple/40 hover:bg-brand-purple-light'
                        }`}
                        title={`Pronounce entire sentence (${audioSpeedIndex === 0 ? "Normal" : audioSpeedIndex === 1 ? "Slow 0.7x" : "Slower 0.5x"})`}
                      >
                        {audioSpeedIndex === 0 ? (
                          <>
                            <Volume2 className="w-4 h-4 fill-current animate-pulse-slow" />
                            <span className={`text-[9px] font-sans font-black px-1.5 py-0.5 rounded-md leading-none select-none ${
                              activeSpeechLine === idx ? 'bg-white/20 text-white' : 'bg-brand-purple-light text-brand-purple'
                            }`}>1.0x</span>
                          </>
                        ) : audioSpeedIndex === 1 ? (
                          <>
                            <Volume1 className="w-4 h-4 fill-current text-indigo-500 animate-pulse-slow" />
                            <span className={`text-[9px] font-sans font-black px-1.5 py-0.5 rounded-md leading-none select-none ${
                              activeSpeechLine === idx ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-500'
                            }`}>0.7x</span>
                          </>
                        ) : (
                          <>
                            <Volume className="w-4 h-4 fill-current text-orange-500 animate-pulse-slow" />
                            <span className={`text-[9px] font-sans font-black px-1.5 py-0.5 rounded-md leading-none select-none ${
                              activeSpeechLine === idx ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-500'
                            }`}>0.5x</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pronunciation Transcript */}
                    <div className="text-xs font-mono text-brand-purple border-l-3 border-brand-purple/30 pl-3 mb-2 font-semibold tracking-wide">
                      {line.phonetic}
                    </div>

                    {/* Translations */}
                    <div className="text-xs text-brand-muted mt-2 font-sans font-medium">
                      {line.english}
                    </div>
                    <div className="text-sm text-brand-dark font-sans mt-1 font-bold leading-relaxed">
                      {line.myanmar}
                    </div>

                    {/* Integrated dual-speaker video loop (only shown if in 'lines' mode or if no whole video exists to avoid clutter) */}
                    {line.videoUrl && (videoMode === 'lines' || !hasWholeVideo) && (
                      <div className="mt-4 rounded-xl overflow-hidden border-2 border-brand-purple/10 bg-black/5 p-1 max-w-full sm:max-w-xs shadow-3xs animate-fade-in w-full">
                        {renderVideoElement(line.videoUrl, `Speaker ${line.speaker} Line Video`)}
                        <div className="px-2 py-1 flex items-center justify-between text-[9px] font-sans font-black text-brand-muted uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping shrink-0" />
                            <span>Speaker {line.speaker} • ဗီဒီယို</span>
                          </span>
                          <span className="text-brand-purple font-extrabold font-mono text-[8px]">Dialogue Video</span>
                        </div>
                      </div>
                    )}


                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vocabulary breakout details card (Right Column) - Hidden on mobile, persistent on desktop */}
      <div className="hidden lg:block space-y-6 bg-transparent">
        {wholeDialogueVideoUrl && (
          <div className="duo-card p-5 bg-white border-2 border-brand-purple/20 shadow-xs space-y-3">
            <h4 className="font-sans font-black text-brand-dark text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-sans font-black uppercase tracking-wider text-brand-purple">
                <span className="text-sm">📺</span>
                <span>Full Practice Video • သင်ခန်းစာဗီဒီယို</span>
              </span>
              <span className="text-[9px] bg-brand-purple-light text-brand-purple px-2 py-0.5 rounded-full font-bold">Full Video Practice</span>
            </h4>
            {renderVideoElement(wholeDialogueVideoUrl, "Dialogue Lesson Full Practice Session Desktop")}
            <div className="bg-brand-purple/5 p-3 rounded-xl border border-brand-purple/10">
              <p className="text-[10px] font-sans text-brand-purple font-bold leading-normal">
                💡 Full practice track enabled! Watch native actors speak, then select words in bubbles below to analyze meanings and parts of speech.
              </p>
            </div>
          </div>
        )}

        <div className="duo-card p-6 bg-white sticky top-20">
          <h4 className="text-xs font-sans text-brand-muted uppercase tracking-widest mb-4 font-extrabold border-b border-brand-border pb-2">
            Constituent Parser • စကားလုံးခွဲခြမ်းစိတ်ဖြာချက်
          </h4>

          {selectedWord ? (
            <motion.div
              key={selectedWord.thai}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Thai Word Title */}
              <div className="duo-card p-5 border-brand-purple/20 bg-brand-purple-light/20 flex justify-between items-center">
                <div>
                  <div className="text-3xl font-sans font-black text-brand-purple select-all">{selectedWord.thai}</div>
                  <div className="text-xs font-mono text-[#58cc02] font-black tracking-wide mt-1">{selectedWord.phonetic}</div>
                </div>
                <button
                  onClick={() => speakThai(selectedWord.thai)}
                  className="px-3 h-11 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-2xl border-b-4 border-brand-purple-shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                  title={`Speak this word (${audioSpeedIndex === 0 ? "Normal" : audioSpeedIndex === 1 ? "Slow 0.7x" : "Slower 0.5x"})`}
                >
                  {audioSpeedIndex === 0 ? (
                    <>
                      <Volume2 className="w-5 h-5 fill-current text-white" />
                      <span className="text-[10px] font-sans font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md select-none leading-none">1.0x</span>
                    </>
                  ) : audioSpeedIndex === 1 ? (
                    <>
                      <Volume1 className="w-5 h-5 fill-current text-white" />
                      <span className="text-[10px] font-sans font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md select-none leading-none">0.7x</span>
                    </>
                  ) : (
                    <>
                      <Volume className="w-5 h-5 fill-current text-white" />
                      <span className="text-[10px] font-sans font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md select-none leading-none">0.5x</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tag / Part of Speech */}
              <div className="inline-block bg-[#efe6fc] text-brand-purple border border-brand-purple/20 text-[10px] font-sans font-black uppercase px-3 py-1 rounded-full">
                {selectedWord.partOfSpeech}
              </div>

              {/* Definitions */}
              <div className="space-y-3">
                <div className="duo-card p-4 bg-white border-brand-border shadow-[0_2px_0_0_#efefef]">
                  <div className="text-[10px] uppercase font-sans text-brand-muted font-bold tracking-wider">Myanmar Translation • မြန်မာပြန်အဓိပ္ပာယ်</div>
                  <div className="text-sm font-sans font-black text-brand-dark mt-1">{selectedWord.myanmar}</div>
                </div>

                <div className="duo-card p-4 bg-white border-brand-border shadow-[0_2px_0_0_#efefef]">
                  <div className="text-[10px] uppercase font-sans text-brand-muted font-bold tracking-wider">English Meaning • အင်္ဂလိပ်ပြန်</div>
                  <div className="text-xs font-sans font-medium text-brand-muted mt-1 leading-normal">{selectedWord.english}</div>
                </div>
              </div>

              {/* Master Word Trigger */}
              <button
                onClick={() => onWordMastered(selectedWord.thai)}
                className={`w-full py-4.5 px-4 rounded-2xl font-sans font-bold text-xs flex items-center justify-center gap-2 transition-all border-2 border-b-4 ${
                  masteredWords.includes(selectedWord.thai)
                    ? 'bg-[#58cc02] hover:bg-[#61df02] text-white border-[#58cc02] border-b-brand-green-shadow'
                    : 'bg-white border-[#e5e5e5] border-b-[#ccc] text-brand-purple hover:bg-gray-50'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${masteredWords.includes(selectedWord.thai) ? 'fill-current text-white' : 'text-brand-muted'}`} />
                {masteredWords.includes(selectedWord.thai)
                  ? 'Mastered! • နှုတ်တိုက်ရပြီးဖြစ်သည်'
                  : 'Mark as Mastered • မှတ်သားရန်'}
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-brand-muted">
              <HelpCircle className="w-12 h-12 text-[#9333ea]/30 mb-3 animate-bounce" />
              <p className="text-xs font-sans max-w-[200px] leading-relaxed text-brand-muted font-medium">
                Click any word in the conversation bubble to view its meaning, parts of speech, and Burmese translation.
              </p>
              <p className="text-[10px] text-brand-purple mt-3.5 font-bold uppercase tracking-widest bg-brand-purple-light px-3 py-1 rounded-full">
                နှိပ်ပြီး လေ့လာပါ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sliding Bottom Sheet - Rendered with backdrop overlay and interactive close controls */}
      <AnimatePresence>
        {selectedWord && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="absolute inset-0 bg-brand-dark/50"
            />
            
            {/* Bottom Drawer Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl p-6 overflow-y-auto border-t border-brand-purple/10 z-10"
            >
              {/* Drag Indicator Bar */}
              <div 
                className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full mb-5 cursor-pointer hover:bg-gray-300" 
                onClick={() => setSelectedWord(null)} 
              />
              
              {/* Drawer Title Block */}
              <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-3">
                <span className="text-[10px] font-sans text-brand-purple uppercase tracking-widest font-black">
                  Constituent Parser • စကားလုံးခွဲခြမ်းစိတ်ဖြာချက်
                </span>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-sans font-black text-sm text-brand-muted hover:bg-gray-200 hover:text-brand-dark transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Main Word Information */}
              <div className="space-y-4">
                <div className="p-4.5 border border-brand-purple/10 bg-brand-purple-light/20 flex justify-between items-center rounded-2xl">
                  <div>
                    <div className="text-2xl font-sans font-black text-brand-purple select-all">{selectedWord.thai}</div>
                    <div className="text-xs font-mono text-[#58cc02] font-black tracking-wide mt-1">{selectedWord.phonetic}</div>
                  </div>
                  <button
                    onClick={() => speakThai(selectedWord.thai)}
                    className="px-3 h-12 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-2xl border-b-4 border-brand-purple-shadow flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                    title={`Speak this word (${audioSpeedIndex === 0 ? "Normal" : audioSpeedIndex === 1 ? "Slow 0.7x" : "Slower 0.5x"})`}
                  >
                    {audioSpeedIndex === 0 ? (
                      <>
                        <Volume2 className="w-5 h-5 fill-current text-white" />
                        <span className="text-[10px] font-sans font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md select-none leading-none">1.0x</span>
                      </>
                    ) : audioSpeedIndex === 1 ? (
                      <>
                        <Volume1 className="w-5 h-5 fill-current text-white" />
                        <span className="text-[10px] font-sans font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md select-none leading-none">0.7x</span>
                      </>
                    ) : (
                      <>
                        <Volume className="w-5 h-5 fill-current text-white" />
                        <span className="text-[10px] font-sans font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md select-none leading-none">0.5x</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="inline-block bg-[#efe6fc] text-brand-purple border border-brand-purple/20 text-[10px] font-sans font-black uppercase px-3 py-1 rounded-full">
                  {selectedWord.partOfSpeech}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="duo-card p-4 bg-white border-brand-border shadow-[0_2px_0_0_#efefef]">
                    <div className="text-[10px] uppercase font-sans text-brand-muted font-bold tracking-wider">Myanmar Translation • မြန်မာပြန်အဓိပ္ပာယ်</div>
                    <div className="text-sm font-sans font-black text-brand-dark mt-1">{selectedWord.myanmar}</div>
                  </div>

                  <div className="duo-card p-4 bg-white border-brand-border shadow-[0_2px_0_0_#efefef]">
                    <div className="text-[10px] uppercase font-sans text-brand-muted font-bold tracking-wider">English Meaning • အင်္ဂလိပ်ပြန်</div>
                    <div className="text-xs font-sans font-medium text-brand-muted mt-1 leading-normal">{selectedWord.english}</div>
                  </div>
                </div>

                {/* Master word state trigger button inside mobile drawer */}
                <button
                  onClick={() => {
                    onWordMastered(selectedWord.thai);
                  }}
                  className={`w-full py-4 px-4 rounded-2xl font-sans font-bold text-xs flex items-center justify-center gap-2 transition-all border-2 border-b-4 ${
                    masteredWords.includes(selectedWord.thai)
                      ? 'bg-[#58cc02] text-white border-[#58cc02] border-b-brand-green-shadow'
                      : 'bg-white border-[#e5e5e5] border-b-[#ccc] text-brand-purple'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${masteredWords.includes(selectedWord.thai) ? 'fill-current text-white' : 'text-brand-muted'}`} />
                  {masteredWords.includes(selectedWord.thai)
                    ? 'Mastered! • နှုတ်တိုက်ရပြီးဖြစ်သည်'
                    : 'Mark as Mastered • မှတ်သားရန်'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
