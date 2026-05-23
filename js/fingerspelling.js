/**
 * Returns the path to the fingerspelling image for a given character.
 * @param {string} char - The character to look up.
 * @param {Object} alphabet - The alphabet mapping from alphabet.json.
 * @returns {string|null} - The path to the image or null if not found.
 */
function getFingerspellingAsset(char, alphabet) {
    const filename = alphabet[char.toLowerCase()];
    if (filename) {
        return `assets/fingerspelling/${filename}`;
    }
    return null;
}

// Export if using modules
if (typeof module !== "undefined" && module.exports) {
    module.exports = { getFingerspellingAsset };
}
