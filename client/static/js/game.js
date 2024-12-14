document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const scoreSpan = document.getElementById('score');
    const timeLeftSpan = document.getElementById('time-left');
    const startButton = document.getElementById('start-game-button');
    const pauseButton = document.getElementById('pause-game-button');
    const stopButton = document.getElementById('stop-game-button');
    const endGameModal = document.getElementById('end-game-modal');
    const finalScoreSpan = document.getElementById('final-score');
    const bestScoreSpan = document.getElementById('best-score');
    const closeModalButton = document.getElementById('close-modal-button');

    let score = 0;
    let gameInterval;
    let countdownInterval;
    let gameActive = false;
    let paused = false;
    let timeLeft = 30;
    let bestScore = localStorage.getItem('bestScore') || 0;
    bestScoreSpan.textContent = bestScore;

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    stopButton.addEventListener('click', stopGame);
    closeModalButton.addEventListener('click', closeModal);

    function startGame() {
        if (gameActive) return;
        score = 0;
        timeLeft = 30;
        scoreSpan.textContent = score;
        timeLeftSpan.textContent = timeLeft;
        gameActive = true;
        paused = false;
        startButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;
        startButton.textContent = 'Game in Progress...';
        
        // Spawn runner every second
        gameInterval = setInterval(spawnRunner, 1000);

        // Countdown timer
        countdownInterval = setInterval(updateTimer, 1000);
    }

    function spawnRunner() {
        if (paused) return; // Don't spawn new runner if paused
        gameArea.innerHTML = '';
    
        const runner = document.createElement('img');
        runner.src = '/static/images/confetti.gif';
        runner.style.position = 'absolute';
        runner.style.cursor = 'pointer';
    
        gameArea.appendChild(runner);
    
        runner.addEventListener('load', () => {
            const runnerWidth = runner.offsetWidth;
            const runnerHeight = runner.offsetHeight;
    
            const maxX = gameArea.clientWidth - runnerWidth;
            const maxY = gameArea.clientHeight - runnerHeight;
    
            runner.style.left = Math.floor(Math.random() * maxX) + 'px';
            runner.style.top = Math.floor(Math.random() * maxY) + 'px';
        });
    
        runner.addEventListener('click', () => {
            if (!paused) {
                score++;
                scoreSpan.textContent = score;
                runner.remove();
            }
        });
    }

    function updateTimer() {
        if (paused) return; // Don't decrement time if paused
        timeLeft--;
        timeLeftSpan.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }

    function togglePause() {
        if (!gameActive) return;
        paused = !paused;
        if (paused) {
            pauseButton.textContent = 'Resume Game';
            // We don't clear intervals here because our logic checks 'paused'
            // But you could clear intervals to fully halt if preferred.
        } else {
            pauseButton.textContent = 'Pause Game';
        }
    }

    function stopGame() {
        if (gameActive) {
            endGame();
        }
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(countdownInterval);
        gameArea.innerHTML = '';
        startButton.disabled = false;
        pauseButton.disabled = true;
        stopButton.disabled = true;
        startButton.textContent = 'Restart Game';
        gameActive = false;
        paused = false;

        // Check for best score
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }

        finalScoreSpan.textContent = score;
        bestScoreSpan.textContent = bestScore;
        showModal();
    }

    function showModal() {
        endGameModal.style.display = 'block';
    }

    function closeModal() {
        endGameModal.style.display = 'none';
    }
});
