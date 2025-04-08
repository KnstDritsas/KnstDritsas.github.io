// Typing Effect with Dynamic Cursor
document.addEventListener('DOMContentLoaded', () => {
  const typedText = document.getElementById('typed-dynamic');
  const phrases = [
    "Kostntinos dritas",
    "Ops! Lets try again..",
    "Costantinos Dritsas",
    "Oh no! Close enough..",
    "Konstantinos Dritsas",
    "Yep! That's it!",
    "Konstantinos Dritsas.",
  ];

  let phraseIndex = 0;
  let letterIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;
  const erasingSpeed = 50;
  const delayBetweenPhrases = 1500;

  function typeLoop() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typedText.textContent = currentPhrase.substring(0, letterIndex + 1);
      letterIndex++;

      if (letterIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeLoop, delayBetweenPhrases);
        return;
      }
    } else {
      typedText.textContent = currentPhrase.substring(0, letterIndex - 1);
      letterIndex--;

      if (letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(typeLoop, isDeleting ? erasingSpeed : typingSpeed);
  }

  typeLoop();
});

// Blinking Cursor Animation
setInterval(() => {
  document.querySelector('.blinking').classList.toggle('hidden');
}, 500);

// Smooth Scrolling Effect
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

// Scroll Reveal Animations
ScrollReveal().reveal('#first-section, #About, #Qualification, #Skills, #Projects, #WorkExperience, #Volunteering, #Contact', {
  delay: 300,
  distance: '50px',
  duration: 800,
  easing: 'ease-in-out',
  origin: 'bottom',
  interval: 100
});

// Project Cards Hover Effect
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.classList.add('glow-effect');
  });
  card.addEventListener('mouseleave', () => {
    card.classList.remove('glow-effect');
  });
});





