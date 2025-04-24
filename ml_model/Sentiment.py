import ssl
import certifi
ssl._create_default_https_context = ssl._create_default_https_context = ssl.create_default_context(cafile=certifi.where())

import pandas as pd
import numpy as np
import nltk
import re
import string
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import LancasterStemmer
from nltk.probability import FreqDist
import joblib

# Download NLTK data


nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')

# Read the dataset
df = pd.read_csv('/Users/shahdayman/Documents/Projects/Flutter Projects/mindmed/train.csv', encoding='ISO-8859-1')

# Clean the dataset by handling missing values (filling NaN with 'missing text')
df['text'] = df['text'].fillna('missing text')

# Removing unnecessary characters
def remove_unnecessary_characters(text):
    text = re.sub(r'<.*?>', '', str(text))  # Remove HTML tags
    text = re.sub(r'[^a-zA-Z0-9\s]', '', str(text))  # Remove non-alphanumeric characters
    text = re.sub(r'\s+', ' ', str(text)).strip()  # Remove extra spaces
    return text
df['clean_text'] = df['text'].apply(remove_unnecessary_characters)

# Tokenization
def tokenize_text(text):
    try:
        text = str(text)
        tokens = word_tokenize(text)
        return tokens
    except Exception as e:
        print(f"Error tokenizing text: {e}")
        return []
df['tokens'] = df['text'].apply(tokenize_text)

# Data Normalization (Lowercase, remove punctuation, and extra spaces)
def normalize_text(text):
    if isinstance(text, str):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
    else:
        text = str(text)
    return text
df['normalized_text'] = df['text'].apply(normalize_text)

# Removing Stopwords
def remove_stopwords(text):
    if isinstance(text, str):
        words = text.split()        
        filtered_words = [word for word in words if word.lower() not in stopwords.words('english')]
        filtered_text = ' '.join(filtered_words)
    else:
        filtered_text = ''
    return filtered_text
df['text_without_stopwords'] = df['text'].apply(remove_stopwords)

# Removing Missing Values
df.dropna(inplace=True)

# Sentiment Value Counts
df['sentiment'].value_counts(normalize=True).plot(kind='bar')
plt.show()

# Sentiment Distribution (Categorical Encoding)
df['sentiment_code'] = df['sentiment'].astype('category').cat.codes
sentiment_distribution = df['sentiment_code'].value_counts(normalize=True)
sentiment_distribution.plot(kind='bar')
plt.show()

# Visualize Sentiment Distribution using Histplot
sns.histplot(df['sentiment'], kde=True, color='r')
plt.show()

# Stemming with Lancaster Stemmer
stemmer = LancasterStemmer()
df['stemmed_text'] = df['text_without_stopwords'].apply(lambda x: ' '.join([stemmer.stem(word) for word in x.split()]))
corpus = df['stemmed_text'].tolist()
print(len(corpus))
print(corpus[0])

# Word Frequency Distribution
word_freq = FreqDist(word_tokenize(' '.join(df['sentiment'])))
plt.figure(figsize=(10, 6))
word_freq.plot(20, cumulative=False)
plt.title('Word Frequency Distribution')
plt.xlabel('Word')
plt.ylabel('Frequency')
plt.show()

# Convert to String (final_corpus) for model
final_corpus = df['text'].astype(str).tolist()
data_eda = pd.DataFrame()
data_eda['text'] = final_corpus
data_eda['sentiment'] = df["sentiment"].values
print(data_eda.head())

# Converting categorical features to numerical codes
df['Time of Tweet'] = df['Time of Tweet'].astype('category').cat.codes
df['Country'] = df['Country'].astype('category').cat.codes
df['Age of User'] = df['Age of User'].replace({'0-20': 18, '21-30': 25, '31-45': 38, '46-60': 53, '60-70': 65, '70-100': 80})

# Removing Irrelevant Columns
df = df.drop(columns=['textID', 'Time of Tweet', 'Age of User', 'Country', 'Population -2020', 'Land Area (Km²)', 'Density (P/Km²)'])

# Preprocess Text (Remove URLs, HTML, Punctuation, etc.)
import string
def wp(text):
    text = re.sub('https?://\S+|www\.\S+', '', text)  # Remove URLs
    text = re.sub('<.*?>+', '', text)  # Remove HTML tags
    text = re.sub('[%s]' % re.escape(string.punctuation), '', text)  # Remove punctuation
    text = re.sub('\n', '', text)  # Remove newline characters
    text = re.sub('\w*\d\w*', '', text)  # Remove alphanumeric words containing digits
    return text
df['selected_text'] = df["selected_text"].apply(wp)

# Evaluate Dataset
X = df['selected_text']
y = df['sentiment']

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create TF-IDF Features with adjusted parameters
vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=3, max_df=0.9)
XV_train = vectorizer.fit_transform(X_train)
XV_test = vectorizer.transform(X_test)

# Score Baseline
score_baseline = df['sentiment'].value_counts(normalize=True).max()
print("Baseline Accuracy Score:", score_baseline)

# Implement SMOTE for class balancing
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(XV_train, y_train)

# Apply Logistic Regression with parallel processing (n_jobs=-1) and balanced class weights
lr = LogisticRegression(n_jobs=-1, class_weight='balanced')
lr.fit(X_train_res, y_train_res)

# Predict and Evaluate
y_pred = lr.predict(XV_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy Score: {accuracy}")

# Classification Report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save the model and vectorizer
joblib.dump(lr, 'logistic_regression_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')
