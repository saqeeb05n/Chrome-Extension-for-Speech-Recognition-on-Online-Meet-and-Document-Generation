import os
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import google.generativeai as genai

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load Whisper model
whisper_model = whisper.load_model("base")

# Load Summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Gemini API Key
genai.configure(api_key="") 
model = genai.GenerativeModel("gemini-pro")

# Store transcripts in memory
transcripts = {}

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filepath = os.path.join("uploads", file.filename)
    file.save(filepath)

    result = whisper_model.transcribe(filepath)
    transcript = result["text"]
    transcripts["latest"] = transcript

    return jsonify({"transcript": transcript})


@app.route("/summarize", methods=["POST"])
def summarize_text():
    data = request.get_json()
    transcript = data.get("transcript") or transcripts.get("latest")
    if not transcript:
        return jsonify({"error": "No transcript found"}), 400

    chunks = [transcript[i:i+1000] for i in range(0, len(transcript), 1000)]
    summaries = [summarizer(chunk)[0]["summary_text"] for chunk in chunks]
    full_summary = " ".join(summaries)

    return jsonify({"summary": full_summary})


@app.route("/chat", methods=["POST"])
def chat_with_transcript():
    data = request.get_json()
    user_question = data.get("question")
    transcript = transcripts.get("latest")

    if not user_question or not transcript:
        return jsonify({"error": "Question or transcript missing"}), 400

    prompt = (
        "Here is a meeting transcript:\n\n"
        f"{transcript}\n\n"
        f"User's Question: {user_question}\n"
        "Answer the question based on the transcript above."
    )

    try:
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    app.run(debug=True, port=5000)
