from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import openai

openai.api_key = ""  # Replace with your key

embedder = SentenceTransformer('all-MiniLM-L6-v2')

def init_vector_store(text):
    sentences = text.split('. ')
    embeddings = embedder.encode(sentences)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return {"index": index, "sentences": sentences}

def answer_question(store, question):
    q_embed = embedder.encode([question])
    D, I = store['index'].search(np.array(q_embed), k=3)
    context = " ".join([store['sentences'][i] for i in I[0]])
    prompt = f"Context: {context}\n\nQuestion: {question}\nAnswer:"
    
    response = openai.Completion.create(
        engine="text-davinci-003", prompt=prompt,
        temperature=0.3, max_tokens=150
    )
    return response['choices'][0]['text'].strip()
