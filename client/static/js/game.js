document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const scoreSpan = document.getElementById('score');
    const timeLeftSpan = document.getElementById('time-left');
    const startButton = document.getElementById('start-game-button');
    const endGameModal = document.getElementById('end-game-modal');
    const finalScoreSpan = document.getElementById('final-score');
    const bestScoreSpan = document.getElementById('best-score');
    const closeModalButton = document.getElementById('close-modal-button');

    let score = 0;
    let gameInterval;
    let countdownInterval;
    let gameActive = false;
    let timeLeft = 30;

    // Load best score from localStorage
    let bestScore = localStorage.getItem('bestScore') || 0;
    bestScoreSpan.textContent = bestScore;

    startButton.addEventListener('click', startGame);
    closeModalButton.addEventListener('click', closeModal);

    function startGame() {
        if (gameActive) return;
        score = 0;
        timeLeft = 30;
        scoreSpan.textContent = score;
        timeLeftSpan.textContent = timeLeft;
        gameActive = true;
        startButton.disabled = true;
        startButton.textContent = 'Game in Progress...';

        // Spawn runner every second
        gameInterval = setInterval(spawnRunner, 1000);

        // Countdown timer
        countdownInterval = setInterval(() => {
            timeLeft--;
            timeLeftSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function spawnRunner() {
        // Clear previous runner if any
        gameArea.innerHTML = '';

        const runner = document.createElement('img');
        runner.src = '/static/images/confetti.gif';
        runner.style.position = 'absolute';
        runner.style.cursor = 'pointer';

        const maxX = gameArea.clientWidth - 40;
        const maxY = gameArea.clientHeight - 40;
        runner.style.left = Math.floor(Math.random() * maxX) + 'px';
        runner.style.top = Math.floor(Math.random() * maxY) + 'px';

        runner.addEventListener('click', () => {
            score++;
            scoreSpan.textContent = score;
            runner.remove();
        });

        gameArea.appendChild(runner);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearInterval(countdownInterval);
        gameArea.innerHTML = '';
        startButton.disabled = false;
        startButton.textContent = 'Restart Game';
        gameActive = false;

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
