/**
 * gloss-mapper.js — LSF Glose array → Playable video sequence
 *
 * Converts an array of uppercase glose strings (e.g. ["ÉCOLE", "ALLER"])
 * into a sequence of tokens understood by SignPlayer.
 *
 * Lookup strategy (in order):
 *  1. Exact lowercase match  → "moi" in dictionary
 *  2. Accent-stripped match  → "ÉCOLE" → "ecole" matched against normalized dict keys
 *  3. Fallback               → fingerspell letter by letter
 */

/**
 * Internal helper: strip diacritics and lowercase a string.
 * "ÉCOLE" → "ecole",  "garçon" → "garcon"
 */
function _normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Pre-compute a map: normalizedKey → original dictionary key
 * e.g. { "ecole": "ecole", "garcon": "garçon", "moi": "moi", ... }
 * Built once per call to avoid rebuilding on every glose.
 */
function _buildNormalizedMap(dictionary) {
    const map = {};
    for (const key of Object.keys(dictionary)) {
        map[_normalize(key)] = key;
    }
    return map;
}

/**
 * Maps an array of LSF gloses to a sequence of playable tokens.
 *
 * @param {string[]} glosses    - Array of uppercase glose strings from frenchToGlosses()
 * @param {Object}   dictionary - The SIGN_DICTIONARY global object
 * @returns {string[]}          - Array of dictionary keys or single letters for SignPlayer
 */
function glossesToSequence(glosses, dictionary) {
    if (!glosses || glosses.length === 0) return [];

    // Build normalized lookup map once
    const normalizedMap = _buildNormalizedMap(dictionary);

    const sequence = [];

    for (const gloss of glosses) {
        const lower      = gloss.toLowerCase();           // "école"
        const normalized = _normalize(gloss);             // "ecole"

        if (dictionary[lower] !== undefined) {
            // 1. Exact lowercase match (e.g. "moi", "aller")
            sequence.push(lower);

        } else if (normalizedMap[normalized] !== undefined) {
            // 2. Accent-stripped match via the pre-built map
            //    e.g. "ÉCOLE" → normalized "ecole" → maps to dict key "ecole"
            sequence.push(normalizedMap[normalized]);

        } else {
            // 3. No match → fingerspell letter by letter
            console.warn(`[GlossMapper] "${gloss}" non trouvé → épellation.`);
            for (const char of normalized) {
                if (char !== " ") sequence.push(char);
            }
        }
    }

    console.log("[GlossMapper] Sequence:", sequence);
    return sequence;
}
