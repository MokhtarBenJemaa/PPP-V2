/**
 * Cleans the input text by:
 * 1. Converting to lowercase.
 * 2. Removing diacritics (accents).
 * 3. Removing punctuation and special characters.
 * 4. Collapsing multiple spaces into one.
 * @param {string} text - The input text to clean.
 * @returns {string} - The cleaned text.
 */
function cleanText(text) {
    if (!text) return "";
    
    return text
        .toLowerCase()
        // Remove diacritics (accents)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        // Remove punctuation except spaces and apostrophes
        .replace(/[^\w\s']/g, " ")
        // Collapse multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Splits the cleaned text into a sequence of signs from the dictionary.
 * Uses a greedy approach to find the longest matching phrases first.
 * Words not found in the dictionary are broken down into letters (fingerspelling).
 * @param {string} text - The cleaned text.
 * @param {Object} dictionary - The dictionary mapping words/phrases to video files.
 * @returns {Array<string>} - Sequence of sign names or letters.
 */
function splitIntoSigns(text, dictionary) {
    const cleaned = cleanText(text);
    if (!cleaned) return [];

    const words = cleaned.split(" ");
    const result = [];
    
    // Sort dictionary keys by word count (descending) to match longest phrases first
    const dictionaryKeys = Object.keys(dictionary).sort((a, b) => {
        const aCount = a.split(" ").length;
        const bCount = b.split(" ").length;
        if (aCount !== bCount) return bCount - aCount;
        return b.length - a.length;
    });

    let i = 0;
    while (i < words.length) {
        let matched = false;

        // Try to match the longest possible phrase starting at the current word
        for (const key of dictionaryKeys) {
            const keyWords = key.split(" ");
            const keyLen = keyWords.length;

            // Check if the next 'keyLen' words match the 'key'
            if (i + keyLen <= words.length) {
                const phrase = words.slice(i, i + keyLen).join(" ");
                if (phrase === key) {
                    result.push(key);
                    i += keyLen;
                    matched = true;
                    break;
                }
            }
        }

        // If no dictionary match for a phrase or word, fingerspell the first word
        if (!matched) {
            const wordToFingerspell = words[i];
            // Split the word into individual letters
            for (const char of wordToFingerspell) {
                result.push(char);
            }
            i++;
        }
    }

    return result;
}

// Export functions if using modules, or keep them global
if (typeof module !== "undefined" && module.exports) {
    module.exports = { cleanText, splitIntoSigns };
}
