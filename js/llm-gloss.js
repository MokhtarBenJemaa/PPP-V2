/**
 * llm-gloss.js — French sentence → LSF Glose sequence via Groq API
 *
 * Uses llama-3.3-70b-versatile (FREE — 14 400 req/day, no credit card).
 * Get your free key at: https://console.groq.com/keys
 * API is OpenAI-compatible, so the request format is identical.
 *
 * Usage:
 *   const glosses = await frenchToGlosses("Le garçon donne un livre à la fille.");
 *   // → ["GARÇON", "FILLE", "LIVRE", "DONNER"]
 */

// ─── System Prompt ────────────────────────────────────────────────────────────
const LSF_SYSTEM_PROMPT = `Tu es un expert en Langue des Signes Française (LSF).
Ta seule tâche est de convertir une phrase française en une séquence de gloses LSF.

RÈGLES OBLIGATOIRES :
1. Ordre des mots : SOV — Sujet, puis Objet, puis Verbe (pas l'ordre français).
2. Si un destinataire est présent : Sujet → Destinataire → Objet → Verbe.
3. Le complément de temps (hier, demain, lundi...) se place EN PREMIER.
4. Les déterminants sont supprimés (le, la, les, un, une, des, du, de la, l').
5. Les verbes sont mis à l'INFINITIF.
6. Si la phrase est négative (ne...pas, jamais, rien, plus) → ajoute NEG à la fin.
7. Si la phrase est une question (?, est-ce que, inversion) → ajoute QUESTION à la fin.
8. Les gloses sont en MAJUSCULES.
9. Les gloses sont séparées par des espaces.
10. Tu réponds UNIQUEMENT avec les gloses. Aucun texte explicatif, aucune ponctuation.

EXEMPLES :
- "Le garçon mange une pomme." → GARÇON POMME MANGER
- "Le garçon donne un livre à la fille." → GARÇON FILLE LIVRE DONNER
- "Demain, le garçon va à l'école." → DEMAIN GARÇON ÉCOLE ALLER
- "Le garçon ne mange pas." → GARÇON MANGER NEG
- "Le garçon mange ?" → GARÇON MANGER QUESTION
- "Bonjour, comment allez-vous ?" → BONJOUR COMMENT QUESTION`;

// ─── Groq API Config ──────────────────────────────────────────────────────────
const GROQ_MODEL    = "llama-3.3-70b-versatile";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Converts a French sentence to an array of LSF gloses using Groq.
 *
 * @param {string} frenchSentence - The input French sentence.
 * @returns {Promise<string[]>}   - Array of uppercase glose strings.
 * @throws {Error}               - If the API call fails or key is missing.
 */
async function frenchToGlosses(frenchSentence) {
    if (!frenchSentence || !frenchSentence.trim()) return [];

    // Validate API key
    if (typeof GROQ_API_KEY === "undefined" || !GROQ_API_KEY || GROQ_API_KEY.startsWith("gsk_...")) {
        throw new Error(
            "Clé API Groq manquante. Veuillez renseigner GROQ_API_KEY dans js/config.js " +
            "(clé gratuite sur https://console.groq.com/keys)"
        );
    }

    const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0,      // deterministic output
            max_tokens: 80,      // gloses are always short
            messages: [
                { role: "system", content: LSF_SYSTEM_PROMPT },
                { role: "user",   content: frenchSentence.trim() },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const msg = error?.error?.message ?? `HTTP ${response.status}`;
        throw new Error(`Groq API error: ${msg}`);
    }

    const data     = await response.json();
    const rawGloss = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!rawGloss) {
        throw new Error("Réponse vide reçue de l'API Groq.");
    }

    // Parse: split on whitespace, uppercase, filter empty tokens
    const glosses = rawGloss
        .toUpperCase()
        .split(/\s+/)
        .filter(g => g.length > 0);

    console.log(`[LLM] "${frenchSentence}" → [${glosses.join(", ")}]`);
    return glosses;
}
