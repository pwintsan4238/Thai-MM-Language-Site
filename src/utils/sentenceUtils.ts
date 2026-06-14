/**
 * Checks if an English explanation text consists of at most one sentence.
 * If it has more than one sentence, it returns false, signaling that it should be removed/hidden.
 */
export function isSingleSentenceEnglish(text: string | null | undefined): boolean {
  if (!text) return false;
  
  // Clean common abbreviations to avoid false positive sentence breaks
  const clean = text
    .replace(/e\.g\./gi, 'eg')
    .replace(/i\.e\./gi, 'ie')
    .replace(/F\.S\.I\./gi, 'FSI')
    .replace(/U\.S\./gi, 'US');

  // Split by sentence ending punctuation followed by trailing spaces or ending line
  const sentences = clean.split(/[.?!](?:\s+|$)/).filter(s => s.trim().length > 3);
  
  return sentences.length <= 1;
}
