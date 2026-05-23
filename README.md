# 🎯 Sign Language Assistant

## 🎯 Project Overview
A module that converts French text or audio to animated sign language (LSF) for deaf people. This is an individual contribution to a larger accessibility platform project at INSAT, built by a team of 3.

## ⚙️ How It Works
The system supports two input paths for generating sign language sequences:

### Path 1 — Text input :
1.  **Input**: User types a French sentence.
2.  **LLM Glose Conversion**: The sentence is sent to the **OpenAI API** (`gpt-4o-mini`), which converts it to a sequence of LSF gloses respecting sign language grammar (SOV order, time first, NEG/QUESTION markers).
3.  **Glose Mapping**: Each glose is looked up in `dictionary.json`; unknowns are fingerspelled.
4.  **Playback**: The matching `.mp4` videos play sequentially in the `#sign-output` div.
5.  **Termination**: Displays "Fin" when the sequence is complete.

**Example:**
```
Input  : "Le garçon donne un livre à la fille."
LLM    : "GARÇON FILLE LIVRE DONNER"
Output : garcon.mp4 → fille.mp4 → livre.mp4 → donner.mp4
```

### Path 2 — Audio input (Microphone) :
1.  **Input**: User clicks the microphone button and speaks in French.
2.  **Transcription**: `speech.js` uses the **Web Speech API** to transcribe speech in real-time.
3.  **Pipeline**: Once transcription is final, the same LLM-based pipeline as Path 1 is triggered automatically.

## 🔑 Configuration (API Key)
The OpenAI API key is stored as a local JavaScript variable in `js/config.js`:
```js
// js/config.js
const OPENAI_API_KEY = "sk-...your-key-here...";
```
> ⚠️ **Never commit this file to a public repository.**  
> Add `js/config.js` to `.gitignore` before pushing.

To obtain a key: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

## 🛠️ Tech Stack :
-   **Languages**: HTML, CSS, Vanilla JavaScript (No frameworks).
-   **APIs**: Web Speech API (Chrome/Edge, audio transcription) · OpenAI Chat Completions API (glose conversion).
-   **Model**: `gpt-4o-mini` — fast and low cost (~0.002€ / 100 sentences).
-   **Data Storage**: Local JSON dictionary and alphabet maps.
-   **Media**: Local `.mp4` sign video clips and hand image assets.
-   **Environment**: No npm, no build step required.

## 📁 Project Structure :
-   `index.html` — Interface (text input, mic button, sign display area).
-   `css/style.css` — Styling.
-   `js/config.js` — ⚠️ OpenAI API key (local, not versioned).
-   `js/main.js` — Entry point; wires all modules together.
-   `js/llm-gloss.js` — Sends French sentence to OpenAI and returns LSF glose string.
-   `js/gloss-mapper.js` — Converts glose sequence to a playable video sequence.
-   `js/dictionary.js` — Text cleaning and dictionary lookup logic.
-   `js/player.js` — Sequential video playback controller.
-   `js/fingerspelling.js` — Fallback letter-by-letter signing.
-   `js/speech.js` — Live microphone transcription via Web Speech API.
-   `assets/signs/` — LSF sign video clips (.mp4).
-   `assets/fingerspelling/` — Alphabet hand images (A-Z).
-   `data/dictionary.json` — French word/glose → video filename mapping.
-   `data/alphabet.json` — Letter → fingerspelling image mapping.

## ✅ Progress Tracker :
- [x] Create project structure and empty files
- [x] Write dictionary.json with minimum 30 common French words
- [x] Write alphabet.json with all 26 letters mapped to image filenames
- [x] Download and add sign videos to assets/signs/
- [x] Download and add fingerspelling images to assets/fingerspelling/
- [x] Build text cleaner and word splitter in dictionary.js
- [x] Build video sequencer in player.js
- [x] Build fingerspelling fallback in fingerspelling.js
- [x] Build audio transcription in speech.js using Web Speech API
- [x] Build minimal HTML interface (textarea + mic button + sign-output div)
- [x] Style with style.css
- [x] Wire everything together in main.js
- [x] Build LLM glose converter in llm-gloss.js (OpenAI gpt-4o-mini)
- [x] Build glose-to-video mapper in gloss-mapper.js
- [ ] Test full pipeline with typed French sentences
- [ ] Test full pipeline with microphone audio
- [ ] Expose playSignsFromText() and document for teammates
- [ ] Prepare module for final integration

## 📖 Dictionary Coverage :
Initial dictionary target (30+ common French words/gloses):
`bonjour`, `merci`, `au revoir`, `oui`, `non`, `aide`, `eau`, `urgence`, `s'il vous plaît`, `je`, `tu`, `il`, `elle`, `nous`, `vouloir`, `avoir`, `manger`, `boire`, `aller`, `venir`, `maison`, `nom`, `comment`, `où`, `quand`, `pourquoi`

## 🔌 Integration Notes for Teammates :
- **HTML**: Embed `<div id="sign-output"></div>` in your layout.
- **Scripts**: Include in this order:
    1. `data/dictionary.js`
    2. `data/alphabet.js`
    3. `js/config.js`
    4. `js/dictionary.js`
    5. `js/fingerspelling.js`
    6. `js/player.js`
    7. `js/speech.js`
    8. `js/llm-gloss.js`
    9. `js/gloss-mapper.js`
    10. `js/main.js`
- **Global Functions**:
    - `playSignsFromText("your sentence")`: Direct text → LLM → signs.
    - `playSignsFromAudio()`: Mic transcription → LLM → signs.
- **Dependencies**: Only OpenAI API (internet required for LLM step).
- **Compatibility**: Requires **Google Chrome** or **Edge** for microphone transcription.

## ⚠️ Known Limitations :
- Audio transcription is Chrome/Edge-dependent (Web Speech API).
- LLM step requires an active internet connection and a valid OpenAI API key.
- Vocabulary limited to entries in `dictionary.json`; unknown gloses are fingerspelled.
- Sequential video mapping; no spatial/directional sign rendering yet (planned for V2).

## 🚀 Roadmap :
- **Phase 1 (Current)**: Text + Mic input → LLM glose conversion → video-based playback.
- **Phase 2 (Upcoming)**: 3D avatar (`Three.js`) with directional verb support (DONNER-a-b).
- **Phase 3 (Future)**: spaCy backend for offline NLP as LLM fallback.
