let mediaRecorder;
let audioChunks = [];
let timerInterval;
let recordingStartTime;
let transcriptText = "";
let summaryText = "";
let audioElement; // Used to replay the captured tab audio

const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const recordingIndicator = document.getElementById("recording-indicator");
const timer = document.getElementById("timer");
const transcriptArea = document.getElementById("transcript");
const summaryArea = document.getElementById("summary");
const downloadBtn = document.getElementById("download-btn");
const askBtn = document.getElementById("ask-btn");
const questionInput = document.getElementById("question-input");
const answerDiv = document.getElementById("answer");

stopBtn.disabled = true;
downloadBtn.disabled = true;
askBtn.disabled = true;
recordingIndicator.style.display = "none";

function startTimer() {
  recordingStartTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000);
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 500);
}

function stopTimer() {
  clearInterval(timerInterval);
  timer.textContent = "00:00";
}

startBtn.onclick = async () => {
  chrome.tabCapture.capture({ audio: true, video: false }, async (stream) => {
    if (!stream) {
      alert("Could not capture tab audio. Make sure you're on the correct tab and have permissions.");
      return;
    }

    // 🔊 Play audio back to avoid muting the meeting
    audioElement = new Audio();
    audioElement.srcObject = stream;
    audioElement.volume = 1.0;
    audioElement.play().catch((err) => {
      console.error("Playback error:", err);
    });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });

      // Stop playback
      audioElement.pause();
      audioElement.srcObject = null;

      // Stop timer
      recordingIndicator.style.display = "none";
      stopTimer();

      // Reset UI
      transcriptArea.value = "Transcribing...";
      summaryArea.value = "";
      answerDiv.textContent = "";
      downloadBtn.disabled = true;
      askBtn.disabled = true;

      try {
        transcriptText = await uploadAudio(blob);
        transcriptArea.value = transcriptText;

        summaryText = await getSummary(transcriptText);
        summaryArea.value = summaryText;

        downloadBtn.disabled = false;
        askBtn.disabled = false;
      } catch (err) {
        transcriptArea.value = "Error: " + err.message;
      } finally {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    mediaRecorder.start();
    recordingIndicator.style.display = "inline";
    startTimer();

    startBtn.disabled = true;
    stopBtn.disabled = false;
  });
};

stopBtn.onclick = () => {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
  }
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

downloadBtn.onclick = () => {
  const content = `Transcript:\n${transcriptText}\n\nSummary:\n${summaryText}`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meeting_notes.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

askBtn.onclick = async () => {
  const question = questionInput.value.trim();
  if (!question) return;

  answerDiv.textContent = "Waiting for answer...";
  try {
    const answer = await askQuestion(question);
    answerDiv.textContent = answer;
  } catch (err) {
    answerDiv.textContent = "Error: " + err.message;
  }
};

async function uploadAudio(blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  const response = await fetch("http://localhost:5000/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!data.transcript) throw new Error("Transcription failed");
  return data.transcript;
}

async function getSummary(transcript) {
  const response = await fetch("http://localhost:5000/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  const data = await response.json();
  if (!data.summary) throw new Error("Summary failed");
  return data.summary;
}

async function askQuestion(question) {
  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();
  if (!data.answer) throw new Error("Chatbot failed");
  return data.answer;
}
