/**
 * Reading time calculation utility for DevStory articles.
 * Uses an average reading speed of 200 words per minute (WPM)
 * and returns a minimum of 1 minute.
 */

export const WORDS_PER_MINUTE = 200;

/**
 * Counts the number of words in a plain text or HTML string.
 * @param {string} content
 * @returns {number}
 */
export function countWords(content) {
  if (!content || typeof content !== "string") {
    return 0;
  }

  // Strip HTML tags and replace with space to avoid joining words across tags
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ") // decode basic HTML entities
    .trim();

  if (!plainText) {
    return 0;
  }

  // Split by whitespace and filter out empty strings
  const words = plainText.split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Calculates estimated reading time in minutes.
 * @param {string} content
 * @param {number} wordsPerMinute
 * @returns {number}
 */
export function calculateReadingTimeMinutes(content, wordsPerMinute = WORDS_PER_MINUTE) {
  const wordCount = countWords(content);
  if (wordCount <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Calculates formatted reading time string (e.g. "3 min read").
 * @param {string} content
 * @param {number} wordsPerMinute
 * @returns {string}
 */
export function calculateReadingTime(content, wordsPerMinute = WORDS_PER_MINUTE) {
  const minutes = calculateReadingTimeMinutes(content, wordsPerMinute);
  return `${minutes} min read`;
}

export default {
  WORDS_PER_MINUTE,
  countWords,
  calculateReadingTimeMinutes,
  calculateReadingTime,
};
