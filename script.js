document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Check local storage for theme
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // Network Animation Color Manager
    let colors = {
        packet: '#64ffda',
        node: 'rgba(100, 255, 218, 0.6)',
        line: 'rgba(100, 255, 218, 0.15)'
    };

    function updateAnimationColors() {
        const style = getComputedStyle(document.documentElement);
        // Fallback to accent if particle not defined (safeguard)
        let color = style.getPropertyValue('--particle-color').trim();
        if (!color) color = style.getPropertyValue('--accent-color').trim();

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        // Ensure hex processing works if color is hex
        let r = 100, g = 255, b = 218;

        if (color.startsWith('#')) {
            let hex = color.substring(1);
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
        }

        colors.packet = color;

        if (isLight) {
            // Light Mode: Reduced opacity for subtler effect
            colors.node = `rgba(${r}, ${g}, ${b}, 0.3)`;
            colors.line = `rgba(${r}, ${g}, ${b}, 0.1)`;
        } else {
            // Dark Mode: Subtle glow
            colors.node = `rgba(${r}, ${g}, ${b}, 0.6)`;
            colors.line = `rgba(${r}, ${g}, ${b}, 0.15)`;
        }
    }

    // Initial update
    updateAnimationColors();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
            // Update animation colors after transition
            setTimeout(updateAnimationColors, 50);
        });
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    galleryItems.forEach(img => {
        img.addEventListener('click', () => {
            if (lightbox && lightboxImg) {
                lightbox.style.display = "block";
                lightboxImg.src = img.src;
                if (captionText) captionText.innerHTML = img.alt;
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (lightbox) lightbox.style.display = "none";
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        });
    }

    // Skill Bar Animation with Intersection Observer
    const skillSection = document.getElementById('skills-container');
    const progressBars = document.querySelectorAll('.progress-bar-fill');

    function showProgress() {
        progressBars.forEach(progressBar => {
            const value = progressBar.dataset.width;
            progressBar.style.width = value;
        });
    }

    function hideProgress() {
        progressBars.forEach(progressBar => {
            progressBar.style.width = '0';
        });
    }

    if (skillSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    showProgress();
                } else {
                    hideProgress(); // Optional: reset when out of view
                }
            });
        }, { threshold: 0.2 });
        observer.observe(skillSection);
    }

    // Network Topology & Packet Flow Animation
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        const canvas = document.createElement('canvas');
        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let nodes = [];
        let packets = [];

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initNetwork();
        });

        // Mouse Tracker
        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        class Node {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.neighbors = [];
                // Moving particles
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Mouse Repulsion
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        // Strong repulsion
                        const directionX = forceDirectionX * force * 5;
                        const directionY = forceDirectionY * force * 5;
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }

                // Bounce
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = colors.node; // Dynamic Color
                ctx.fill();
            }
        }

        class Packet {
            constructor(startNode, endNode) {
                this.startNode = startNode;
                this.endNode = endNode;
                this.progress = 0;
                this.speed = 0.005 + Math.random() * 0.01;
            }
            update() {
                this.progress += this.speed;
                if (this.progress >= 1) {
                    this.progress = 0;
                    this.startNode = this.endNode;

                    // Find a new valid neighbor
                    if (this.startNode.neighbors.length > 0) {
                        this.endNode = this.startNode.neighbors[Math.floor(Math.random() * this.startNode.neighbors.length)];
                    } else {
                        // Respawn randomly if no path
                        this.startNode = nodes[Math.floor(Math.random() * nodes.length)];
                        if (this.startNode.neighbors.length === 0) {
                            const activeNodes = nodes.filter(n => n.neighbors.length > 0);
                            if (activeNodes.length > 0) {
                                this.startNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
                            }
                        }

                        if (this.startNode.neighbors.length > 0) {
                            this.endNode = this.startNode.neighbors[Math.floor(Math.random() * this.startNode.neighbors.length)];
                        }
                    }
                }
            }
            draw() {
                if (!this.startNode || !this.endNode) return;
                const x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
                const y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = colors.packet; // Dynamic Color
                ctx.shadowBlur = 5;
                ctx.shadowColor = colors.packet; // Dynamic Color
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function initNetwork() {
            nodes = [];
            packets = [];

            // Create Nodes
            const nodeCount = Math.floor((width * height) / 20000);
            for (let i = 0; i < nodeCount; i++) {
                nodes.push(new Node(Math.random() * width, Math.random() * height));
            }

            // Initial Connections for packet spawning
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 150) {
                        nodes[i].neighbors.push(nodes[j]);
                        nodes[j].neighbors.push(nodes[i]);
                    }
                }
            }

            // Create Packets
            for (let i = 0; i < 15; i++) {
                const start = nodes[Math.floor(Math.random() * nodes.length)];
                if (start.neighbors.length > 0) {
                    const end = start.neighbors[Math.floor(Math.random() * start.neighbors.length)];
                    packets.push(new Packet(start, end));
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, width, height);

            // Update Nodes & Reset Neighbors
            nodes.forEach(node => {
                node.update();
                node.neighbors = [];
            });

            // Rebuild Connections
            ctx.strokeStyle = colors.line; // Dynamic Color
            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 150) {
                        nodes[i].neighbors.push(nodes[j]);
                        nodes[j].neighbors.push(nodes[i]);

                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            nodes.forEach(node => node.draw());

            // Update and Draw Packets
            packets.forEach(packet => {
                packet.update();
                packet.draw();
            });
        }

        initNetwork();
        animate();
    }
});
