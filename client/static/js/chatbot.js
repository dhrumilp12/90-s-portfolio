// Updated chatbot.js

document.addEventListener('DOMContentLoaded', function() {
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const BACKEND_URL = isProduction ? 'https://nine0-s-portfolio.onrender.com' : 'http://localhost:8000';

    // Toggle Chatbot Window
    chatbotIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chatbotWindow.style.display === 'flex') {
            chatbotWindow.style.display = 'none';
        } else {
            chatbotWindow.style.display = 'flex';
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });

    // Close chatbot when clicking outside
    document.addEventListener('click', function(event) {
        if (!chatbotWindow.contains(event.target) && !chatbotIcon.contains(event.target)) {
            chatbotWindow.style.display = 'none';
        }
    });

    // Prevent clicks inside the chatbot window from closing it
    chatbotWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle Chat Form Submission
    chatbotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = chatbotInput.value.trim();
        if (message === '') return;

        // Display user message
        displayMessage(message, 'user');

        // Clear input
        chatbotInput.value = '';

        // Show typing indicator
        displayTypingIndicator();

        // Send message to backend
        fetch(`${BACKEND_URL}/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {  
            removeTypingIndicator();
            if (data.reply) {
                displayMessage(data.reply, 'bot');
            } else if (data.error) {
                displayMessage("Oops! Something went wrong.", 'bot');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            removeTypingIndicator();
            displayMessage("Oops! Couldn't reach the server.", 'bot');
        });
    });

    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const textSpan = document.createElement('span');
        textSpan.classList.add('text');
        textSpan.textContent = text;

        messageDiv.appendChild(textSpan);
        chatbotMessages.appendChild(messageDiv);

        // Play sound based on sender
        if (sender === 'user') {
            sendSound.play();
        } else if (sender === 'bot') {
            receiveSound.play();
        }

        // Scroll to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function displayTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot', 'typing-indicator');
        typingDiv.setAttribute('id', 'typing-indicator');
        typingDiv.textContent = 'Chatbot is typing...';
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    // Load sound effects using data attributes
    const sendSound = new Audio(document.getElementById('send-sound').getAttribute('data-send-sound'));
    const receiveSound = new Audio(document.getElementById('receive-sound').getAttribute('data-receive-sound'));
});