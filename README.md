# 🎙️ Chrome Extension for Speech Recognition on Google Meet & Document Generation

This Chrome extension records and transcribes audio from Google Meet meetings using advanced speech recognition models. After the meeting, it generates a downloadable document with the full transcript and can optionally summarize the conversation or provide Q&A support using NLP.

![Screenshot of Extension UI](image.jpg)

---

## Key Features

- Real-time speech recognition during Google Meet
- Automatically records system audio (not just mic)
- Generates a full transcript document (TXT/DOCX/PDF)
- One-click start/stop recording from the extension popup
- Blinking red dot + timer to indicate recording status
- Chatbot-style Q&A and summarization of meeting
- Downloads transcript post-meeting
- Backend using Node.js + Whisper for transcription + NLP

---

## Extension Components

| Component        | Description                                              |
|------------------|----------------------------------------------------------|
| `popup.html`     | User interface for the Chrome extension popup            |
| `popup.js`       | Controls UI behavior, recording triggers, timer display  |
| `background.js`  | Manages background recording and tab access              |
| `content.js`     | Injected into Google Meet pages to monitor audio         |
| `manifest.json`  | Chrome Extension configuration                           |
| `server/`        | Backend server (Node.js + Express)                       |
| `utils/`         | Whisper + NLP logic for transcription and Q&A            |

---

## Tech Stack

### 🔹 Frontend
- Chrome Extension APIs
- HTML, CSS, JavaScript

### 🔹 Backend
- Node.js + Express
- Python (via child process for Whisper and NLP)
- OpenAI Whisper (for transcription)
- Transformers / LangChain (for NLP summary & Q&A)

---

## Installation

### Local Setup

1. **Clone the Repo**

git clone https://github.com/saqeeb05n/Chrome-Extension-for-Speech-Recognition-on-Online-Meet-and-Document-Generation.git
cd Chrome-Extension-for-Speech-Recognition-on-Online-Meet-and-Document-Generation
Set Up the Chrome Extension

Open Chrome and go to chrome://extensions

Enable "Developer mode"

Click Load unpacked

Select the extension/ folder

Run the Backend Server

cd server
npm install
node index.js
Make sure whisper.cpp or openai-whisper and any required NLP models are installed if using local inference.

📤 Usage Guide
Join a Google Meet.

Open the extension popup.

Click Start Recording – timer and red dot will appear.

When the meeting ends, click Stop Recording.

The transcript will be processed and made downloadable.

Optionally, use Summarize or Ask Questions features.

**How It Works**
Audio is recorded from the active tab (Meet).

Sent to the backend using MediaRecorder blob stream.

Whisper transcribes the audio.

Summary and Q&A are generated using OpenAI/Transformers models.

A document file is generated and returned to the user.

## Folder Structure

Chrome-Extension-for-Speech-Recognition-on-Online-Meet-and-Document-Generation/
├── extension/
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   └── manifest.json
├── server/
│   ├── index.js
│   ├── whisper.py
│   ├── summarizer.py
│   └── qna_bot.py
