from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd
import datetime as dt
import numpy as np
import openai
import pdfplumber
import os
import json

load_dotenv() 

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
        ], model="gpt-3.5-turbo")

        questions = completion.choices[0].message.content
        print(questions)
        lines = questions.split('\n')

        if lines[0] == '```json':
            lines = lines[1:]
        if lines[-1] == '```':
            lines = lines[:-1]

        response = '\n'.join(lines)

        return response, 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/fill-in-the-blank', methods=['POST'])
def fill_in_the_blank():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        with pdfplumber.open(file) as pdf:
            text = ''.join([page.extract_text() for page in pdf.pages if page.extract_text()])

        prompt = (
            "Generate five fill-in-the-blank questions based on the following text. "
            "Format the questions as a JSON array, where each question is an object with the keys 'question' and 'answer'. "
            "The questions should only be related to computer science concepts and should not rely on any images that may have been in the PDF."
            "\n\nText:\n" + text
        )

        completion = client.chat.completions.create(messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ], model="gpt-3.5-turbo")

        questions = completion.choices[0].message.content
        print(questions)
        lines = questions.split('\n')

        if lines[0] == '```json':
            lines = lines[1:]
        if lines[-1] == '```':
            lines = lines[:-1]

        response = '\n'.join(lines)

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
        print(questions)
        lines = questions.split('\n')

        if lines[0] == '```json':
            lines = lines[1:]
        if lines[-1] == '```':
            lines = lines[:-1]

        response = '\n'.join(lines)

        return response, 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run()
