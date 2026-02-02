document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing after animation triggers
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial check for elements in view
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-container');
    revealElements.forEach(el => observer.observe(el));

    // Video/Hero Bounce Click
    const hero = document.getElementById('mainHero');
    if (hero) {
        hero.addEventListener('click', () => {
            hero.classList.add('bounce-click');

            // Optional: Smooth scroll to content on click for "browsing" flow
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }

            setTimeout(() => {
                hero.classList.remove('bounce-click');
            }, 600);
        });
    }

    // Special handling for hover sounds (optional, placeholder for premium feel)
    const interactiveElements = document.querySelectorAll('.btn-primary, .btn-secondary, .role-card, .event-card, .filter-btn');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            // You can add subtle haptic or sound effects here if desired
        });
    });

    // Page Transition effect
    document.body.classList.add('page-loaded');
});
