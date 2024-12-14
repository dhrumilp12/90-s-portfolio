/* This script is used to toggle background music on and off.*/
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bg-audio');
    const musicToggleButton = document.getElementById('music-toggle-button');
    const musicBtnText = document.getElementById('music-btn-text');
    const musicBtnIcon = document.getElementById('music-btn-icon');

    // Check localStorage to see if music was previously playing
    let isMusicPlaying = localStorage.getItem('musicPlaying') === 'true';

    // Function to update button state
    function updateButtonState(isPlaying) {
        if (isPlaying) {
            musicBtnText.textContent = "Stop Tunes!";
            // Change icon to a "stop" icon/gif if desired
            musicBtnIcon.src = "/static/images/gplay.gif"; 
            musicToggleButton.classList.remove('blink'); 
        } else {
            musicBtnText.textContent = "Play Tunes!";
            musicBtnIcon.src = "/static/images/gplay.gif";
            musicToggleButton.classList.add('blink'); 
        }
    }

    // If music was playing before, start playing on load
    if (isMusicPlaying) {
        audio.play();
        updateButtonState(true);
    } else {
        updateButtonState(false);
    }

    // Toggle music on button click
    musicToggleButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            isMusicPlaying = true;
            localStorage.setItem('musicPlaying', 'true');
            updateButtonState(true);
        } else {
            audio.pause();
            audio.currentTime = 0; // reset to start
            isMusicPlaying = false;
            localStorage.setItem('musicPlaying', 'false');
            updateButtonState(false);
        }
    });
});
