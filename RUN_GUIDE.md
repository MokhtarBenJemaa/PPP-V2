# 🚀 How to Run the App

Since this is a static web application, you need a local server to run it correctly (to avoid browser security restrictions when loading data).

### Option 1: Using Node.js (Recommended)
If you have Node.js installed, run this command in your terminal:
```bash
npx http-server . -p 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Using Python
If you have Python installed, run:
```bash
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 3: VS Code "Live Server"
If you use VS Code, you can install the **Live Server** extension:
1. Open `index.html`.
2. Click **"Go Live"** in the bottom-right corner of VS Code.

---
**Note:** Use **Google Chrome** if you want to use the Audio Transcription feature, as it relies on the Web Speech API.
