
from flask import Flask, request, jsonify, render_template
import os
from gtts import gTTS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)

# Directory to store audio files
AUDIO_FOLDER = os.path.join(app.root_path, 'static', 'audio')
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Function for Text-to-Speech (gTTS)
def text_to_speech(text, lang='en'):
    tts = gTTS(text=text, lang=lang, slow=False)
    audio_filename = "output.mp3"
    audio_path = os.path.join(AUDIO_FOLDER, audio_filename)
    tts.save(audio_path)
    return f"/static/audio/{audio_filename}"  # Return the URL to access the audio file

# Function for Sentiment Analysis using Vader
def analyze_sentiment(text):
    analyzer = SentimentIntensityAnalyzer()
    sentiment_score = analyzer.polarity_scores(text)
    if sentiment_score['compound'] >= 0.05:
        return "Positive"
    elif sentiment_score['compound'] <= -0.05:
        return "Negative"
    else:
        return "Neutral"

# Endpoint for Text to Speech
@app.route('/text_to_speech', methods=['POST'])
def text_to_speech_endpoint():
    data = request.json
    text = data.get('text', '')
    if text:
        audio_file = text_to_speech(text)
        return jsonify({"audio_file": audio_file})
    return jsonify({"error": "Text is required"}), 400

# Endpoint for Sentiment Analysis
@app.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment_endpoint():
    data = request.json
    text = data.get('text', '')
    if text:
        sentiment = analyze_sentiment(text)
        return jsonify({"sentiment": sentiment})
    return jsonify({"error": "Text is required"}), 400

# Serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

