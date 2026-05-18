

let audio = null;

// Function to switch between sections
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
        section.classList.remove('active');
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

// Initialize the Home section as visible
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});

// Convert Text to Speech
function convertTextToSpeech() {
    let text = document.getElementById("textInput").value;
    if (!text) {
        alert("Please enter text.");
        return;
    }

    fetch('/text_to_speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.audio_file) {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            audio = new Audio(data.audio_file + "?t=" + new Date().getTime());
            audio.play();
        } else {
            console.error("Audio file not found in the response.");
        }
    })
    .catch(error => {
        console.error('Error fetching audio:', error);
    });

    analyzeSentiment(text, "textToSpeech");
}

// Analyze Sentiment
function analyzeSentiment(text, source) {
    fetch('/analyze_sentiment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.sentiment) {
            if (source === "textToSpeech") {
                document.getElementById("sentimentResult").textContent = `Sentiment: ${data.sentiment}`;
            } else if (source === "speechToText") {
                document.getElementById("speechSentimentResult").textContent = `Sentiment: ${data.sentiment}`;
            }
        } else {
            console.error("Sentiment analysis result missing.");
        }
    })
    .catch(error => {
        console.error('Error fetching sentiment analysis:', error);
    });
}

// Speech-to-Text
function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        document.getElementById("speechResult").textContent = "Listening...";
    };

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("speechResult").textContent = `Recognized: ${transcript}`;
        analyzeSentiment(transcript, "speechToText");
    };

    recognition.onerror = function(event) {
        document.getElementById("speechResult").textContent = "Error during speech recognition.";
        console.error("Speech recognition error:", event.error);
    };

    recognition.start();
}
