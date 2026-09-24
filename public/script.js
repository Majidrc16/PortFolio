document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const main = document.querySelector('main');
    const routeWipe = document.createElement('div');
    routeWipe.className = 'route-wipe';
    body.appendChild(routeWipe);

    const themeButtons = document.querySelectorAll('[data-theme-choice]');
    const savedTheme = localStorage.getItem('portfolio-theme') || 'default';
    const applyTheme = (theme) => {
        if (theme === 'default') {
            body.removeAttribute('data-theme');
        } else {
            body.dataset.theme = theme;
        }
        themeButtons.forEach((button) => button.classList.toggle('active', button.dataset.themeChoice === theme));
        localStorage.setItem('portfolio-theme', theme);
    };
    applyTheme(savedTheme);
    themeButtons.forEach((button) => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice)));

    const routeNames = { hero: 'Home', services: 'Services', about: 'Skills', experience: 'Experience', projects: 'Projects', analytics: 'Analytics', certifications: 'Credentials', contact: 'Contact' };
    const navigateToHash = (hash, animate = true) => {
        const targetId = hash.replace('#', '') || 'hero';
        const target = document.getElementById(targetId);
        if (!target) return;
        if (animate) {
            routeWipe.classList.remove('active');
            void routeWipe.offsetWidth;
            routeWipe.classList.add('active');
            main.classList.remove('route-enter');
            void main.offsetWidth;
            main.classList.add('route-enter');
        }
        document.title = `${routeNames[targetId] || 'Portfolio'} | Majid Razak`;
        target.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
    };
    window.addEventListener('hashchange', () => navigateToHash(window.location.hash));
    if (window.location.hash) navigateToHash(window.location.hash, false);

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const updateNavbar = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const icon = menuToggle.querySelector('i');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
    document.querySelectorAll('.section-rail a').forEach(link => link.addEventListener('click', () => {
        document.querySelectorAll('.section-rail a').forEach((railLink) => railLink.classList.remove('active'));
        link.classList.add('active');
    }));

    // Keep the navigation context-aware while the visitor moves through the page.
    const trackedSections = [...document.querySelectorAll('main section[id]')];
    const navItems = [...document.querySelectorAll('.nav-links a')];
    const railItems = [...document.querySelectorAll('.section-rail a')];
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
                railItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
            }
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    trackedSections.forEach((section) => sectionObserver.observe(section));

    const cursorGlow = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', (event) => {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = contactForm.querySelector('.btn-submit');
        const originalBtnText = btnSubmit.innerHTML;
        
        // Show loading state
        btnSubmit.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
        btnSubmit.disabled = true;
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                formStatus.textContent = result.message;
                formStatus.className = 'form-status success';
                contactForm.reset();
            } else {
                formStatus.textContent = result.message || 'Something went wrong. Please try again.';
                formStatus.className = 'form-status error';
            }
        } catch (error) {
            formStatus.textContent = 'Failed to connect to the server. Please try again later.';
            formStatus.className = 'form-status error';
            console.error('Error submitting form:', error);
        } finally {
            // Restore button state
            btnSubmit.innerHTML = originalBtnText;
            btnSubmit.disabled = false;
            
            // Hide status message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
                formStatus.className = 'form-status'; // reset classes
            }, 5000);
            
            // make sure it actually displays initially (CSS handles block display via classes)
        }
    });

    // Scroll Reveal Animation & Stats Counter
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's a stat card, animate the count
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('counted')) {
                    const target = +statNumber.getAttribute('data-target');
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;

                    const updateCount = () => {
                        current += increment;
                        if (current < target) {
                            statNumber.innerText = Math.ceil(current) + '+';
                            requestAnimationFrame(updateCount);
                        } else {
                            statNumber.innerText = target + '+';
                            statNumber.classList.add('counted');
                        }
                    };
                    updateCount();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el, index) => {
        el.dataset.revealDelay = (index % 4).toString();
        observer.observe(el);
    });

    // Initialize ApexCharts if elements exist
    if (document.querySelector('#techDonutChart') && typeof ApexCharts !== 'undefined') {
        const capabilityMixOptions = {
            series: [
                {
                    name: 'Delivery Focus',
                    type: 'bar',
                    data: [88, 94, 82, 90, 76, 84]
                },
                {
                    name: 'Impact Index',
                    type: 'line',
                    data: [72, 86, 78, 92, 68, 87]
                }
            ],
            chart: {
                type: 'line',
                height: 350,
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif',
                foreColor: '#dfe7ff'
            },
            theme: { mode: 'dark', palette: 'palette10' },
            colors: ['#8b5cf6', '#38bdf8'],
            stroke: {
                width: [0, 3],
                curve: 'smooth'
            },
            fill: {
                opacity: [0.9, 0.2]
            },
            markers: {
                size: [0, 5],
                strokeWidth: 0
            },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    columnWidth: '42%'
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: ['AI', 'Oracle', 'PMO', 'Frontend', 'Backend', 'QA'],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: ['#dfe7ff', '#dfe7ff', '#dfe7ff', '#dfe7ff', '#dfe7ff', '#dfe7ff']
                    }
                }
            },
            yaxis: {
                max: 100,
                labels: {
                    formatter: (value) => `${value}%`,
                    style: { colors: ['#dfe7ff'] }
                }
            },
            grid: {
                borderColor: 'rgba(255,255,255,0.05)',
                strokeDashArray: 4,
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: true } }
            },
            legend: {
                position: 'bottom',
                labels: {
                    colors: ['#dfe7ff']
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                theme: 'dark'
            }
        };

        const capabilityMixChart = new ApexCharts(document.querySelector('#techDonutChart'), capabilityMixOptions);
        capabilityMixChart.render();

        const deliveryMomentumOptions = {
            series: [{
                name: 'Project Output',
                type: 'area',
                data: [40, 52, 66, 74, 88, 96]
            }, {
                name: 'Team Velocity',
                type: 'line',
                data: [35, 48, 60, 70, 82, 92]
            }],
            chart: {
                type: 'line',
                height: 350,
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif',
                foreColor: '#dfe7ff'
            },
            theme: { mode: 'dark' },
            colors: ['#22c55e', '#f59e0b'],
            stroke: {
                width: [0, 3],
                curve: 'smooth'
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    opacityFrom: 0.7,
                    opacityTo: 0.08,
                    stops: [0, 100]
                }
            },
            markers: {
                size: [0, 4],
                strokeWidth: 0
            },
            xaxis: {
                categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: ['#dfe7ff', '#dfe7ff', '#dfe7ff', '#dfe7ff', '#dfe7ff', '#dfe7ff']
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: (value) => `${value}%`,
                    style: { colors: ['#dfe7ff'] }
                }
            },
            grid: {
                borderColor: 'rgba(255,255,255,0.05)',
                strokeDashArray: 4,
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: false } }
            },
            legend: {
                position: 'bottom',
                labels: {
                    colors: ['#dfe7ff']
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                theme: 'dark'
            }
        };

        const deliveryMomentumChart = new ApexCharts(document.querySelector('#focusBarChart'), deliveryMomentumOptions);
        deliveryMomentumChart.render();
    }
});
