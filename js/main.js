/**
 * main.js — Sign Language Assistant entry point
 *
 * Full pipeline:
 *   French text / mic
 *     → frenchToGlosses()   [llm-gloss.js]   — OpenAI → glose array
 *     → glossesToSequence() [gloss-mapper.js] — gloses → token sequence
 *     → player.playSequence()                 — plays signs
 */
document.addEventListener("DOMContentLoaded", async () => {

    // ── DOM Elements ───────────────────────────────────────────────
    const textInput    = document.getElementById("text-input");
    const btnTranslate = document.getElementById("btn-translate");
    const btnAudio     = document.getElementById("btn-audio");
    const signOutput   = document.getElementById("sign-output");
    const micStatus    = document.getElementById("mic-status");
    const micDot       = document.getElementById("mic-dot");

    // ── Global State ───────────────────────────────────────────────
    const player = new SignPlayer("sign-output");
    const dictionary = SIGN_DICTIONARY;
    const alphabet   = ALPHABET_DICTIONARY;

    if (!dictionary || !alphabet) {
        signOutput.innerHTML = '<p style="color:red">Erreur : données non chargées.</p>';
        return;
    }

    // ── Shared Translation Pipeline ────────────────────────────────
    /**
     * Takes a raw French sentence, runs it through LLM → gloses → videos.
     * Shows a loading indicator while the API call is in progress.
     */
    async function translateAndPlay(frenchText) {
        if (!frenchText.trim()) return;

        // Show loading state
        signOutput.innerHTML = '<p style="color: var(--text-secondary)">⏳ Analyse en cours…</p>';
        btnTranslate.disabled = true;
        btnAudio.disabled     = true;

        try {
            // Step 1 — LLM: French → Gloses
            const glosses = await frenchToGlosses(frenchText);

            if (glosses.length === 0) {
                signOutput.innerHTML = '<p style="color: var(--text-secondary)">Aucune glose générée.</p>';
                return;
            }

            // Step 2 — Mapper: Gloses → token sequence
            const sequence = glossesToSequence(glosses, dictionary);

            if (sequence.length === 0) {
                signOutput.innerHTML = '<p style="color: var(--text-secondary)">Aucun signe trouvé.</p>';
                return;
            }

            // Step 3 — Player: play the sequence
            await player.playSequence(sequence, dictionary, alphabet);

        } catch (err) {
            console.error("[main] Pipeline error:", err);
            signOutput.innerHTML = `<p style="color:#ef4444">❌ ${err.message}</p>`;
        } finally {
            btnTranslate.disabled = false;
            btnAudio.disabled     = false;
        }
    }

    // ── Text Translation Button ────────────────────────────────────
    btnTranslate.addEventListener("click", () => {
        translateAndPlay(textInput.value);
    });

    // ── Speech Transcription (Mic) ─────────────────────────────────
    if (!SpeechTranscriber.isSupported()) {
        btnAudio.disabled = true;
        btnAudio.title    = "Reconnaissance vocale non supportée dans ce navigateur.";
        btnAudio.textContent = "Audio non supporté";
        console.warn("Web Speech API not supported.");
        return;
    }

    let transcriber = null;

    function setMicState(active) {
        if (active) {
            btnAudio.textContent = "⏹ Arrêter";
            btnAudio.classList.add("recording");
            micStatus.textContent = "Écoute en cours…";
            micDot.classList.add("active");
        } else {
            btnAudio.textContent = "🎤 Utiliser l'Audio";
            btnAudio.classList.remove("recording");
            micStatus.textContent = "";
            micDot.classList.remove("active");
        }
    }

    function showMicError(msg) {
        micStatus.textContent = msg;
        micStatus.classList.add("error");
        setTimeout(() => {
            micStatus.textContent = "";
            micStatus.classList.remove("error");
        }, 4000);
    }

    btnAudio.addEventListener("click", () => {
        if (transcriber && transcriber.isListening) {
            transcriber.stop();
            return;
        }

        transcriber = new SpeechTranscriber({
            lang: "fr-FR",
            continuous: true,
            interimResults: true,

            onStart: () => {
                setMicState(true);
                textInput.value = "";
                console.log("Microphone started.");
            },

            onInterim: (interim) => {
                textInput.value = interim;           // live preview
            },

            onFinal: (fullTranscript) => {
                textInput.value = fullTranscript;
            },

            onStop: async (finalTranscript) => {
                setMicState(false);
                if (!finalTranscript.trim()) {
                    showMicError("Aucune voix détectée. Veuillez réessayer.");
                    return;
                }
                textInput.value = finalTranscript;
                await translateAndPlay(finalTranscript);  // same pipeline as text input
            },

            onError: (msg) => {
                setMicState(false);
                showMicError(msg);
            },
        });

        transcriber.start();
    });

    console.log("Sign Language Assistant initialized — LLM pipeline active.");
});
