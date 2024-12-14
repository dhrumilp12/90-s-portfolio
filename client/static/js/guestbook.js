// guestbook.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('guestbook-form');
    const entriesList = document.getElementById('guestbook-entries');
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationClose = document.getElementById('notification-close');

    // Update BACKEND_URL based on your deployment
    const isProduction = window.location.hostname !== 'localhost';
    const BACKEND_URL = isProduction ? 'https://nine0-s-portfolio.onrender.com/guestbook' : 'http://localhost:8000/guestbook';
    const HIT_COUNTER_URL = isProduction ? 'https://nine0-s-portfolio.onrender.com/hit-counter' : 'http://localhost:8000/hit-counter';

    /**
     * Sanitizes input to prevent XSS by escaping HTML characters.
     * @param {string} str - The string to sanitize.
     * @returns {string} - The sanitized string.
     */
    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Fetches guestbook entries from the backend and displays them.
     */
    function fetchEntries() {
        fetch(BACKEND_URL)
            .then(response => response.json())
            .then(data => {
                entriesList.innerHTML = ''; // Clear existing entries
                if (data.length === 0) {
                    const noEntries = document.createElement('li');
                    noEntries.classList.add('loading-message');
                    noEntries.innerHTML = '<span class="retro-text">No entries yet! Be the first to leave a note!</span>';
                    entriesList.appendChild(noEntries);
                } else {
                    data.forEach(entry => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <strong>${sanitizeHTML(entry.name)}</strong>&nbsp;says:&nbsp;
                            <em>${sanitizeHTML(entry.message)}</em>
                        `;
                        entriesList.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching entries:', error);
                entriesList.innerHTML = '<li class="loading-message"><span class="retro-text">Failed to load entries.</span></li>';
            });
    }

    /**
     * Displays a notification message.
     * @param {string} message - The message to display.
     * @param {string} type - The type of message ('success' or 'error').
     */
    function showNotification(message, type) {
        notificationMessage.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.remove('success', 'error');
        notification.classList.add(type);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }

    /**
     * Hides the notification message.
     */
    function hideNotification() {
        notification.classList.add('hidden');
    }

    /**
     * Handles form submission by sending data to the backend.
     * @param {Event} e - The form submission event.
     */
    function handleFormSubmit(e) {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            message: formData.get('message').trim()
        };

        // Basic front-end validation
        if (!data.name || !data.message) {
            showNotification('Both name and message are required!', 'error');
            return;
        }

        // Disable the form while submitting
        const submitButton = form.querySelector('button');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(result => {
            showNotification(result.message, 'success');
            form.reset(); // Clear the form
            fetchEntries(); // Refresh entries
        })
        .catch(error => {
            console.error('Error submitting entry:', error);
            if (error.error) {
                showNotification(error.error, 'error');
            } else {
                showNotification('Failed to submit your entry. Please try again.', 'error');
            }
        })
        .finally(() => {
            // Re-enable the form
            submitButton.disabled = false;
            submitButton.textContent = 'Sign Guestbook';
        });
    }

    // Attach event listeners to the form and notification close button
    if (form && entriesList) {
        // Initial fetch of entries on page load
        fetchEntries();

        // Attach event listener to the form
        form.addEventListener('submit', handleFormSubmit);
    }

    if (notificationClose) {
        notificationClose.addEventListener('click', hideNotification);
    }

    // Hit counter functionality
    const hitCounterElement = document.getElementById('hit-counter');
    if (hitCounterElement) {
        fetch(HIT_COUNTER_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                hitCounterElement.textContent = data.count;
            })
            .catch(error => {
                console.error('Error fetching hit counter:', error);
                hitCounterElement.textContent = 'N/A';
            });
    }

});
