document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.custom-cursor');

    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('click', function() {
        cursor.classList.add('click-animation');
        setTimeout(() => {
            cursor.classList.remove('click-animation');
        }, 300);
    });
});

// Cursor trail animation for retro effect
const style = document.createElement('style');
style.innerHTML = `
@keyframes cursor-trail {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(0.5);
        opacity: 0;
    }
}

.cursor-trail-element {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #FF00FF;
    border-radius: 50%;
    pointer-events: none;
    animation: cursor-trail 1s forwards;
}
`;
document.head.appendChild(style);

document.addEventListener('mousemove', function(e) {
    const trail = document.createElement('div');
    trail.classList.add('cursor-trail-element');
    trail.style.left = `${e.clientX}px`;
    trail.style.top = `${e.clientY}px`;
    document.body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 1000);
});
