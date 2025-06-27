from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def generate_summary(text):
    chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
    summary = ""
    for chunk in chunks:
        out = summarizer(chunk, max_length=130, min_length=30, do_sample=False)
        summary += out[0]["summary_text"] + " "
    return summary.strip()
