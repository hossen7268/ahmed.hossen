// Basic particle network animation for background
const canvas = document.createElement('canvas');
document.getElementById('canvas-container').appendChild(canvas);
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 60;
const connectionDistance = 150;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = '#64ffda';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    resize();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connections
    ctx.strokeStyle = '#64ffda';
    ctx.lineWidth = 0.2;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                ctx.globalAlpha = 1 - (distance / connectionDistance);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resize();
    init();
});

init();
animate();


console.log('Portfolio Loaded');

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when a link is clicked
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Active Section Highlighting (ScrollSpy)
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links li a');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3 // Trigger when 30% of the section is visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            // Remove active class from all
            navItems.forEach(item => item.classList.remove('active'));
            // Add active class to corresponding link
            const activeLink = document.querySelector(`.nav-links a[href="#${currentId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Dynamic Content Rendering
function renderContent() {
    if (typeof portfolioData === 'undefined') return;

    // Render Skills
    const skillsContainer = document.getElementById('skills-container');
    if (skillsContainer) {
        skillsContainer.innerHTML = '';
        skillsContainer.className = 'skill-bar-container'; // Switch to list view for bars

        portfolioData.skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.innerHTML = `
                <div class="skill-info">
                    <span>${skill.name}</span>
                    <span>${skill.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: 0" data-width="${skill.percent}%"></div>
                </div>
            `;
            skillsContainer.appendChild(skillItem);
        });
    }

    // Render Tech Details
    const techContainer = document.getElementById('tech-details-container');
    if (techContainer && portfolioData.technical_details) {
        const ul = document.createElement('ul');
        ul.className = 'tech-details-list';
        portfolioData.technical_details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            ul.appendChild(li);
        });
        techContainer.appendChild(ul);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderContent();

    // Animate bars on scroll
    const skillBars = document.querySelectorAll('.progress-bar-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.getAttribute('data-width');
            }
        });
    }, { threshold: 0.1 });

    skillBars.forEach(bar => skillObserver.observe(bar));
});



