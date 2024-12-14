/* This script listens for the Konami code 
(up, up, down, down, left, right, left, right, B, A) 
and triggers an Easter Egg when the code is entered. */
document.addEventListener('DOMContentLoaded', () => {
    const konamiCode = [38,38,40,40,37,39,37,39,66,65];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Konami code complete
                triggerKonamiEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function triggerKonamiEasterEgg() {
        const eggDiv = document.createElement('div');
        eggDiv.style.position = 'fixed';
        eggDiv.style.top = '50%';
        eggDiv.style.left = '50%';
        eggDiv.style.transform = 'translate(-50%, -50%)';
        eggDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
        eggDiv.style.padding = '20px';
        eggDiv.style.border = '2px solid #FF00FF';
        eggDiv.style.borderRadius = '10px';
        eggDiv.style.zIndex = '10002';
        eggDiv.innerHTML = `
            <h2 style="font-family:'Comic Sans MS'; color:#00FF00;">You found the Easter Egg!</h2>
            <p><img src="/static/images/rave_bg.gif" width="100"></p>
            <p style="color:#FFFF00; font-family:'Comic Sans MS';">Press any key to continue...</p>
        `;

        document.body.appendChild(eggDiv);

        document.addEventListener('keydown', function hideEgg() {
            eggDiv.remove();
            document.removeEventListener('keydown', hideEgg);
        });
    }
});
