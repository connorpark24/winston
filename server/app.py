from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import openai
import pdfplumber
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity 

client = openai.OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

app = Flask(__name__)
app.config['DEBUG'] = False
CORS(app)

client = openai.OpenAI()

@app.route('/multiple-choice', methods=['POST'])
def multiple_choice():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Extract text from PDF
        with pdfplumber.open(file) as pdf:
            text = ''.join([page.extract_text() for page in pdf.pages if page.extract_text()])

        # Generate questions using OpenAI API
        prompt = (
            "Generate five multiple-choice questions with four options each based on the following text. "
            "Format the questions as a JSON array, where each question is an object with the keys 'question', "
            "'choices', and 'answer'. The 'choices' key should be an array of strings that are each a choice. "
            "The questions should only be related to computer science concepts and should not rely on any images that may have been in the PDF."
            "\n\nText:\n" + text
        )

        completion = client.chat.completions.create(messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ], model="gpt-4")

        questions = completion.choices[0].message.content
        lines = questions.split('\n')

        if lines[0] == '```json':
            lines = lines[1:]
        if lines[-1] == '```':
            lines = lines[:-1]

        response = '\n'.join(lines)
        print(response)

        return response, 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/open-ended', methods=['POST'])
def open_ended():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        with pdfplumber.open(file) as pdf:
            text = ''.join([page.extract_text() for page in pdf.pages if page.extract_text()])

        prompt = (
            "Generate five open-ended questions based on the following text. "
            "Format the questions as a JSON array, where each question is an object with the keys 'question' and 'answer', where 'question'"
            "contains the provided question and 'answer' contains the correct answer. " 
            "The questions should only be related to computer science concepts and should not rely on any images that may have been in the PDF."
            "\n\nText:\n" + text
        )

        completion = client.chat.completions.create(messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ], model="gpt-3.5-turbo")

        questions = completion.choices[0].message.content
        lines = questions.split('\n')

        if lines[0] == '```json':
            lines = lines[1:]
        if lines[-1] == '```':
            lines = lines[:-1]

        response = '\n'.join(lines)
        print(response)

        return response, 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/true-false', methods=['POST'])
def true_false():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        with pdfplumber.open(file) as pdf:
            text = ''.join([page.extract_text() for page in pdf.pages if page.extract_text()])

        prompt = (
            "Generate five true/false questions based on the following text. "
            "Format the questions as a JSON array, where each question is an object with the keys 'question' and 'answer'. "
            "The 'answer' key should be either 'True' or 'False'. "
            "The questions should only be related to computer science concepts and should not rely on any images that may have been in the PDF."
            "\n\nText:\n" + text
        )

        completion = client.chat.completions.create(messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ], model="gpt-3.5-turbo")

        questions = completion.choices[0].message.content
        lines = questions.split('\n')

        if lines[0] == '```json':
            lines = lines[1:]
        if lines[-1] == '```':
            lines = lines[:-1]

        response = '\n'.join(lines)
        print(response)

        return response, 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/check-similarity', methods=['POST'])
def check_similarity():
    data = request.json
    responses = data.get('responses')
    answers = data.get('answers')

    if not responses or not answers or len(responses) != len(answers):
        return jsonify({'error': 'Invalid or missing responses or answers'}), 400

    similarities = []
    vectorizer = TfidfVectorizer()

    for response, answer in zip(responses, answers):
        text_pair = [response, answer]
        tfidf_matrix = vectorizer.fit_transform(text_pair)
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        similarity_percentage = (similarity + 1) / 2 
        similarities.append(similarity_percentage)

    print(similarities)

    return jsonify({'similarities': similarities}), 200

    
if __name__ == '__main__':
    app.run()
