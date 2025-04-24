from flask import Flask, request, jsonify
from flask_cors import CORS
from joblib import load
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Replace with your secret API key
API_KEY = '2qPHzBAML1ICY5TpNDScAt3Rz2o_6Mj51tGzXY7XhPfGfiQTi'

# Load the saved model and vectorizer
model = load('logistic_regression_model.pkl')
vectorizer = load('vectorizer.pkl')

# Download NLTK resources
nltk.download('stopwords')
nltk.download('punkt')

# Function to clean and preprocess the text
def preprocess_text(text):
    # Remove unnecessary characters (e.g., special characters, HTML tags)
    text = re.sub(r'<.*?>', '', str(text))  # Remove HTML tags
    text = re.sub(r'[^a-zA-Z0-9\s]', '', str(text))  # Remove non-alphanumeric characters
    text = re.sub(r'\s+', ' ', str(text)).strip()  # Remove extra spaces

    # Tokenize the text
    tokens = word_tokenize(text)

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word.lower() not in stop_words]

    # Return the processed text
    return ' '.join(filtered_tokens)

@app.route('/predict', methods=['POST'])
def predict():
    # Check for API key in the request headers
    if request.headers.get('Authorization') != f'Bearer {API_KEY}':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        # Extract the text from the request
        data = request.get_json()
        if 'text' not in data or not data['text'].strip():
            return jsonify({'error': 'No valid text provided'}), 400
        
        text = data['text']

        # Preprocess the text
        processed_text = preprocess_text(text)
        
        # Convert the text to TF-IDF features using the loaded vectorizer
        text_tfidf = vectorizer.transform([processed_text])
        
        # Predict sentiment using the loaded model
        prediction = model.predict(text_tfidf)
        
        # Return the prediction result
        return jsonify({'prediction': prediction[0]})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Make sure to expose the app to the network
