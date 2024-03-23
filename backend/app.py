from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import datetime as dt
import numpy as np
import requests
import pdfplumber

app = Flask(__name__)
app.config['DEBUG'] = False
CORS(app)

@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Extract text from PDF
        with pdfplumber.open(file) as pdf:
            text = ''.join([page.extract_text() for page in pdf.pages])

        # Call the quiz generator API
        api_url = 'https://api.quizgenerator.com/generate'
        response = requests.post(api_url, json={'text': text})

        if response.status_code == 200:
            questions = response.json().get('questions', [])
            return jsonify({'questions': questions}), 200
        else:
            return jsonify({'error': 'Failed to generate questions'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run()
