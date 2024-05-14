// Cards Effect
function toggleCardInfo(id) {
    var info = document.getElementById(id);
    if (info.style.display === 'none') {
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }
  }


// Typing Effect
const element = document.querySelector('.display-2 span');
const textToType = 'Konstantinos Dritsass';
const typingSpeed = 150;
let charIndex = 0;

function typeWriter() {
  if (charIndex < textToType.length) {
    element.textContent += textToType.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, typingSpeed);
  } else {
    element.textContent = element.textContent.slice(0, -1);
  }
}

function blinkCursor() {
  if (charIndex < textToType.length) {
    element.classList.toggle('typing-cursor');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setInterval(blinkCursor, 500); // Cursor blink speed
  typeWriter();
});