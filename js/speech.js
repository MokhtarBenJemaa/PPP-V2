/**
 * speech.js — Audio Transcription using the Web Speech API
 *
 * Provides a SpeechTranscriber class that:
 *  - Checks for Web Speech API support
 *  - Records live microphone input in French (fr-FR)
 *  - Fires callbacks for interim and final transcription results
 *  - Manages recording state and exposes it to callers
 */

class SpeechTranscriber {
    /**
     * @param {object} options
     * @param {string}   [options.lang='fr-FR']          - BCP-47 language tag
     * @param {boolean}  [options.continuous=true]        - Keep listening across pauses
     * @param {boolean}  [options.interimResults=true]    - Emit partial results
     * @param {function} [options.onInterim]              - Called with interim transcript string
     * @param {function} [options.onFinal]                - Called with final transcript string
     * @param {function} [options.onStart]                - Called when recognition starts
     * @param {function} [options.onStop]                 - Called when recognition stops
     * @param {function} [options.onError]                - Called with error message string
     */
    constructor(options = {}) {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            throw new Error(
                "Web Speech API n'est pas supporté dans ce navigateur. " +
                "Veuillez utiliser Chrome ou Edge."
            );
        }

        this._recognition = new SpeechRecognition();
        this._recognition.lang             = options.lang            ?? 'fr-FR';
        this._recognition.continuous       = options.continuous       ?? true;
        this._recognition.interimResults   = options.interimResults   ?? true;
        this._recognition.maxAlternatives  = 1;

        // Callbacks
        this._onInterim = options.onInterim ?? (() => {});
        this._onFinal   = options.onFinal   ?? (() => {});
        this._onStart   = options.onStart   ?? (() => {});
        this._onStop    = options.onStop    ?? (() => {});
        this._onError   = options.onError   ?? (() => {});

        this.isListening = false;
        this._finalTranscript = '';

        this._bindEvents();
    }

    // ─── Private ────────────────────────────────────────────────────────────

    _bindEvents() {
        this._recognition.onstart = () => {
            this.isListening = true;
            this._finalTranscript = '';
            this._onStart();
        };

        this._recognition.onend = () => {
            this.isListening = false;
            this._onStop(this._finalTranscript);
        };

        this._recognition.onerror = (event) => {
            this.isListening = false;
            const messages = {
                'not-allowed'     : "Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres du navigateur.",
                'no-speech'       : "Aucune voix détectée. Veuillez réessayer.",
                'audio-capture'   : "Aucun microphone détecté.",
                'network'         : "Erreur réseau lors de la transcription.",
                'aborted'         : "Transcription annulée.",
                'service-not-allowed' : "Service de reconnaissance vocale non autorisé.",
            };
            const msg = messages[event.error] ?? `Erreur : ${event.error}`;
            this._onError(msg);
        };

        this._recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text   = result[0].transcript;

                if (result.isFinal) {
                    this._finalTranscript += text + ' ';
                    this._onFinal(this._finalTranscript.trim(), text.trim());
                } else {
                    interimTranscript += text;
                }
            }

            if (interimTranscript) {
                this._onInterim(interimTranscript);
            }
        };
    }

    // ─── Public API ─────────────────────────────────────────────────────────

    /** Start listening. */
    start() {
        if (this.isListening) return;
        this._finalTranscript = '';
        this._recognition.start();
    }

    /** Stop listening gracefully (fires onend / onStop). */
    stop() {
        if (!this.isListening) return;
        this._recognition.stop();
    }

    /** Abort immediately without firing onStop with accumulated text. */
    abort() {
        this._recognition.abort();
    }

    /** Returns the accumulated final transcript so far. */
    getTranscript() {
        return this._finalTranscript.trim();
    }

    /** Check whether the browser supports the Web Speech API. */
    static isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
}
