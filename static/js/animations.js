document.addEventListener('DOMContentLoaded', () => {
    // Card Glow Effect (Mouse Follow)
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.event-card, .role-card, .form-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-container');
    revealElements.forEach(el => observer.observe(el));

    // Video/Hero Bounce Click
    const hero = document.getElementById('mainHero');
    if (hero) {
        hero.addEventListener('click', () => {
            hero.classList.add('bounce-click');
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
            setTimeout(() => {
                hero.classList.remove('bounce-click');
            }, 600);
        });
    }

    document.body.classList.add('page-loaded');
});
