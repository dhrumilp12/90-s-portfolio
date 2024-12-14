""" Simple Flask web application with a hit counter and guestbook. """
# Import necessary modules
from flask import Flask, render_template, request, redirect, url_for
import os
from datetime import datetime
app = Flask(__name__)

# Simple in-memory "hit counter" and guestbook entries for demonstration:
visit_count = 0
guestbook_entries = []

# Define routes
@app.route('/')
def home():
    global visit_count
    visit_count += 1
    return render_template('index.html', visit_count=visit_count, now=datetime.utcnow)

@app.route('/about')
def about():
    return render_template('about.html', now=datetime.utcnow)

@app.route('/guestbook', methods=['GET', 'POST'])
def guestbook():
    global guestbook_entries
    if request.method == 'POST':
        name = request.form.get('name', 'Anonymous')
        message = request.form.get('message', '')
        if message.strip():
            guestbook_entries.append((name, message))
        return redirect(url_for('guestbook'))
    return render_template('guestbook.html', entries=guestbook_entries, now=datetime.utcnow)

# Run the application
if __name__ == '__main__':
    HOST = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    PORT = int(os.getenv("FLASK_RUN_PORT", 3000))
    app.run(debug=True, host=HOST, port=PORT)
