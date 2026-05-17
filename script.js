document.addEventListener('DOMContentLoaded', () => {
    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            
            // Close other currently open items in the same accordion group (optional, but good for UX)
            const parentAccordion = item.closest('.accordion');
            const otherActiveItems = parentAccordion.querySelectorAll('.accordion-item.active');
            
            otherActiveItems.forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // Toggle current item
            item.classList.toggle('active');

            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
            navbar.classList.add('scrolled'); // pridani bileteho pozadi s blurem
        } else {
            navbar.style.boxShadow = 'none';
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open (feature stub, see below)
                const navLinks = document.querySelector('.nav-links');
                if (navLinks.style.display === 'flex' && window.innerWidth <= 992) {
                    navLinks.style.display = 'none';
                }

                // Scroll to element with offset for navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const extraOffset = targetId === '#kontakt' ? 40 : 0;
                const offsetPosition = elementPosition + window.scrollY - navbarHeight - extraOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Simple mobile menu placeholder functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navContact = document.querySelector('.nav-contact');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // For a robust implementation we'd add CSS classes to handle the mobile menu sliding in/out
            // Here is a simple inline toggle for demonstration
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
                if(navContact) navContact.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 15px rgba(0,0,0,0.05)';
                navLinks.style.gap = '20px';
                
                if(navContact) {
                    navContact.style.display = 'block';
                    navContact.style.position = 'absolute';
                    navContact.style.top = '100%';
                    navContact.style.right = '20px';
                    navContact.style.marginTop = '20px';
                }
            }
        });
    }

    // Custom Select Logic
    const customSelectWrapper = document.getElementById('customDepartmentMenu');
    if (customSelectWrapper) {
        const customSelect = customSelectWrapper.querySelector('.custom-select');
        const customOptions = customSelectWrapper.querySelectorAll('.custom-option');
        const hiddenSelect = document.getElementById('department');
        const triggerText = customSelectWrapper.querySelector('.custom-select-trigger');

        // Toggle dropdown
        customSelect.addEventListener('click', function(e) {
            e.stopPropagation();
            customSelectWrapper.classList.toggle('open');
            customSelect.classList.toggle('active');
        });

        // Handle option click
        customOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Update text and color
                triggerText.textContent = this.textContent;
                customSelect.classList.add('has-value');
                
                // Update hidden select
                hiddenSelect.value = this.getAttribute('data-value');
                
                // Close dropdown
                customSelectWrapper.classList.remove('open');
                customSelect.classList.remove('active');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', function() {
            if (customSelectWrapper.classList.contains('open')) {
                customSelectWrapper.classList.remove('open');
                customSelect.classList.remove('active');
            }
        });
    }

    // Lightbox Logic
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.className = 'lightbox-content';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.setAttribute('aria-label', 'Zavřít galerii');
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
        
        // Open lightbox event
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                // Open lightbox even for placeholders if they have a src not empty
                if (img && img.hasAttribute('src') && img.getAttribute('src') !== '') {
                    lightboxImg.src = img.getAttribute('src');
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; // prevent scrolling
                }
            });
        });
        
        // Close lightbox function
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                lightboxImg.src = '';
            }, 400); // clear after animation
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // Contact Form AJAX Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnHtml = submitBtn.innerHTML;

            // Change button to loading state
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Odesílám...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            
            fetch('https://formsubmit.co/ajax/gynekolog.ps@seznam.cz', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    alert('Děkujeme za vaši zprávu! Byla úspěšně odeslána a brzy se vám ozveme.');
                    contactForm.reset();
                    // Reset custom select visually
                    const customSelectTrigger = document.querySelector('.custom-select-trigger');
                    if (customSelectTrigger) {
                        customSelectTrigger.textContent = 'Vyberte oddělení';
                        document.querySelector('.custom-select').classList.remove('has-value');
                    }
                } else {
                    alert('Něco se pokazilo. Zpráva nebyla odeslána. Zkuste to prosím později.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Něco se pokazilo, zkuste to prosím znovu.');
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
            });
        });
    }

    // ===== FAQ Logic =====
    // Accordion toggle
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const answer = btn.nextElementSibling;
            const isOpen = item.classList.contains('open');

            // Close all other open FAQ items
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-answer').style.maxHeight = null;
                    openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            if (isOpen) {
                item.classList.remove('open');
                answer.style.maxHeight = null;
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Tab filtering
    const faqTabs = document.querySelectorAll('.faq-tab');
    const faqGroups = document.querySelectorAll('.faq-group');

    faqTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            faqTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const category = tab.dataset.category;

            faqGroups.forEach(group => {
                if (category === 'all' || group.dataset.category === category) {
                    group.removeAttribute('hidden');
                } else {
                    group.setAttribute('hidden', '');
                    // Close any open items inside hidden groups
                    group.querySelectorAll('.faq-item.open').forEach(openItem => {
                        openItem.classList.remove('open');
                        openItem.querySelector('.faq-answer').style.maxHeight = null;
                        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    });
                }
            });
        });
    });
});


// ===== Průvodce prevencí =====
const EXAMINATIONS = [
    {
        name: "Preventivní prohlídka u praktického lékaře",
        interval: "1× za 2 roky",
        description: "Komplexní vyšetření, krevní tlak, EKG (ve stanovených věkových obdobích), moč, cholesterol a glykémie.",
        minAge: 18,
        category: "Praktický lékař",
        icon: "fa-user-doctor"
    },
    {
        name: "Preventivní prohlídka u zubního lékaře",
        interval: "1× ročně (těhotné 2× ročně)",
        description: "Kontrola chrupu, dásní a měkkých tkání dutiny ústní.",
        minAge: 18,
        category: "Stomatologie",
        icon: "fa-tooth"
    },
    {
        name: "Preventivní gynekologická prohlídka",
        interval: "1× ročně",
        description: "Vyšetření prsů, palpační vyšetření, odběr cytologie z děložního čípku.",
        minAge: 15,
        category: "Gynekologie",
        icon: "fa-stethoscope"
    },
    {
        name: "Screening karcinomu děložního hrdla",
        interval: "1× ročně",
        description: "Onkologická cytologie z děložního čípku v rámci gynekologické prohlídky.",
        minAge: 15,
        category: "Onkologie",
        icon: "fa-ribbon"
    },
    {
        name: "HPV test",
        interval: "Jednorázově ve věku 35 a 45 let",
        description: "Test na vysoce rizikové typy HPV, hrazený ve dvou věkových bodech.",
        minAge: 35, maxAge: 45,
        category: "Onkologie",
        icon: "fa-vial"
    },
    {
        name: "Mamografický screening",
        interval: "1× za 2 roky",
        description: "Mamografické vyšetření prsou, hrazené od 45 let bez horní věkové hranice.",
        minAge: 45,
        category: "Onkologie",
        icon: "fa-x-ray"
    },
    {
        name: "Screening kolorektálního karcinomu (TOKS)",
        interval: "50–54 let: 1× ročně, od 55 let: 1× za 2 roky",
        description: "Test na okultní krvácení do stolice, případně primární screeningová kolonoskopie od 55 let.",
        minAge: 50,
        category: "Onkologie",
        icon: "fa-flask"
    },
    {
        name: "Screening karcinomu plic",
        interval: "1× ročně (pro silné kuřačky)",
        description: "Nízkodávkové CT plic pro osoby 55–74 let s anamnézou silného kouření.",
        minAge: 55, maxAge: 74,
        category: "Onkologie",
        icon: "fa-lungs"
    }
];

const preventionForm = document.getElementById('prevention-form');
if (preventionForm) {
    const ageInput = document.getElementById('prevention-age');
    const errorEl = document.getElementById('prevention-error');
    const resultsEl = document.getElementById('prevention-results');
    const titleEl = document.getElementById('prevention-results-title');
    const countEl = document.getElementById('prevention-results-count');
    const listEl = document.getElementById('prevention-list');

    preventionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorEl.textContent = '';

        const raw = ageInput.value.trim();
        const age = Number(raw);
        if (!raw || !Number.isInteger(age) || age < 1 || age > 120) {
            errorEl.textContent = 'Zadejte platný věk (1–120 let).';
            resultsEl.hidden = true;
            return;
        }

        const matched = EXAMINATIONS.filter(ex =>
            age >= ex.minAge && (ex.maxAge === undefined || age <= ex.maxAge)
        );

        titleEl.textContent = `Doporučená vyšetření pro věk ${age} let`;
        countEl.textContent = `${matched.length} ${matched.length === 1 ? 'vyšetření' : (matched.length >= 2 && matched.length <= 4 ? 'vyšetření' : 'vyšetření')}`;

        listEl.innerHTML = matched.length === 0
            ? '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">Pro zadaný věk nejsou specifická vyšetření. Doporučujeme konzultaci s praktickým lékařem.</p>'
            : matched.map(ex => `
                <article class="prevention-item">
                    <div class="prevention-item-header">
                        <h4 class="prevention-item-name">${ex.name}</h4>
                        <div class="prevention-item-icon"><i class="fa-solid ${ex.icon}"></i></div>
                    </div>
                    <span class="prevention-item-category">${ex.category}</span>
                    <p class="prevention-item-interval">${ex.interval}</p>
                    <p class="prevention-item-desc">${ex.description}</p>
                </article>
            `).join('');

        resultsEl.hidden = false;
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}
