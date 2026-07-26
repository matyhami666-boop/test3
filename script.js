document.addEventListener('DOMContentLoaded', () => {

    // ===== Načtení aktualit z CSV =====
    const aktualityObsah = document.getElementById('aktuality-obsah');
    if (aktualityObsah) {
        fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRrb7LXy6aRKpp-LEmFYGCBJhzQTq1Q0yePxLLZ1Jsg_yfV6883yp-1woIOCLQuXVRyJMYJqxjuuKV8/pub?gid=0&single=true&output=csv')
            .then(r => {
                if (!r.ok) throw new Error('Soubor aktuality.csv nenalezen');
                return r.text();
            })
            .then(csvText => {
                const lines = csvText.trim().split('\n').slice(1); // přeskočit hlavičku
                const items = lines
                    .map(line => {
                        // Jednoduchý CSV parser respektující uvozovky
                        const cols = [];
                        let cur = '', inQ = false;
                        for (let i = 0; i < line.length; i++) {
                            const ch = line[i];
                            if (ch === '"') { inQ = !inQ; }
                            else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
                            else { cur += ch; }
                        }
                        cols.push(cur);
                        return cols.map(c => c.trim().replace(/^"|"$/g, ''));
                    })
                    .filter(cols => cols.length >= 3 && cols[0] && cols[1]);

                if (items.length === 0) {
                    aktualityObsah.innerHTML = '<p class="news-empty">Žádné aktuality nejsou k dispozici.</p>';
                    return;
                }

                aktualityObsah.innerHTML = items.map(([icon, nadpis, text]) => `
                    <div class="news-item">
                        <div class="news-icon"><i class="fa-solid fa-${icon}"></i></div>
                        <div class="news-text">
                            <strong>${nadpis}</strong>
                            <p>${text}</p>
                        </div>
                    </div>
                `).join('');
            })
            .catch(err => {
                console.warn('Aktuality:', err.message);
                aktualityObsah.innerHTML = '<p class="news-empty">Aktuality se nepodařilo načíst.</p>';
            });
    }

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

    // Helper: expand a group (remove collapsed, set max-height)
    function expandFaqGroup(group) {
        const items = group.querySelector('.faq-group-items');
        if (items) {
            // Clean up any pending timeouts
            if (items._timeoutId) {
                clearTimeout(items._timeoutId);
            }
            
            // Remove collapsed class first to let it display/animate
            group.classList.remove('collapsed');
            group.querySelector('.faq-group-label').setAttribute('aria-expanded', 'true');
            
            // Set max-height to current scroll height to animate open
            items.style.maxHeight = items.scrollHeight + 'px';
            
            // Once transition finishes (450ms), set to 'none' to allow dynamic resizing without clipping
            items._timeoutId = setTimeout(() => {
                items.style.maxHeight = 'none';
                items._timeoutId = null;
            }, 450);
        } else {
            group.classList.remove('collapsed');
            group.querySelector('.faq-group-label').setAttribute('aria-expanded', 'true');
        }
    }

    // Helper: collapse a group
    function collapseFaqGroup(group) {
        const items = group.querySelector('.faq-group-items');
        if (items) {
            // Clean up any pending timeouts
            if (items._timeoutId) {
                clearTimeout(items._timeoutId);
                items._timeoutId = null;
            }

            // If it was 'none', set it to pixel height first so the transition can run
            if (items.style.maxHeight === 'none' || !items.style.maxHeight) {
                items.style.maxHeight = items.scrollHeight + 'px';
                items.offsetHeight; // Force reflow
            }
            
            // Now start the collapse transition
            requestAnimationFrame(() => {
                group.classList.add('collapsed');
                group.querySelector('.faq-group-label').setAttribute('aria-expanded', 'false');
                items.style.maxHeight = null;
            });
        } else {
            group.classList.add('collapsed');
            group.querySelector('.faq-group-label').setAttribute('aria-expanded', 'false');
        }
        
        // Also close any open FAQ items inside
        group.querySelectorAll('.faq-item.open').forEach(openItem => {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-answer').style.maxHeight = null;
            openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
    }

    // Group label click – toggle expand/collapse
    document.querySelectorAll('.faq-group-label').forEach(label => {
        label.addEventListener('click', () => {
            const group = label.closest('.faq-group');
            if (group.classList.contains('collapsed')) {
                expandFaqGroup(group);
            } else {
                collapseFaqGroup(group);
            }
        });
    });

    // FAQ question accordion toggle
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const answer = btn.nextElementSibling;
            const isOpen = item.classList.contains('open');
            const group = item.closest('.faq-group');

            // Close all other open FAQ items inside the same group
            group.querySelectorAll('.faq-item.open').forEach(openItem => {
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

            // Recalculate parent group-items max-height ONLY if it is still transitioning (not 'none' yet)
            const groupItems = group.querySelector('.faq-group-items');
            if (groupItems && !group.classList.contains('collapsed') && groupItems.style.maxHeight !== 'none') {
                setTimeout(() => {
                    if (groupItems.style.maxHeight !== 'none') {
                        groupItems.style.maxHeight = groupItems.scrollHeight + 'px';
                    }
                }, 10);
            }
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


// ===== AI Chatbot =====
(function() {
    'use strict';

    // --- Knowledge Base built from website content ---
    const KNOWLEDGE_BASE = [
        {
            keywords: ['ordinační hodiny', 'otevírací doba', 'hodiny', 'kdy', 'otevřeno', 'zavřeno', 'pracovní doba', 'otvíračka', 'ordnační'],
            answer: `Naše ordinační hodiny jsou:\n\n🕐 <strong>Pondělí</strong>: 7:30 – 12:00, 13:00 – 15:30 (MUDr. Coufalová)\n🕐 <strong>Úterý</strong>: 13:00 – 17:00 (MUDr. Podráská)\n🕐 <strong>Středa</strong>: 7:30 – 12:00, 13:00 – 15:30 (MUDr. Podráská)\n🕐 <strong>Čtvrtek</strong>: 7:30 – 13:00 (MUDr. Podráská)\n🕐 <strong>Pátek</strong>: 7:30 – 12:00 (MUDr. Spěváček)`,
            priority: 10
        },
        {
            keywords: ['objednat', 'objednání', 'rezervace', 'termín', 'jak se objednat', 'sjednat', 'zarezervovat', 'reservio'],
            answer: `Objednat se můžete několika způsoby:\n\n📅 <strong>Online</strong> – přes systém <a href="#rezervace">Reservio</a> (24/7, potvrzení na e-mail)\n📞 <strong>Telefonicky</strong> – <a href="tel:+420416838186">416 838 186</a>\n📧 <strong>E-mailem</strong> – <a href="mailto:gynekolog.ps@seznam.cz">gynekolog.ps@seznam.cz</a>\n\nNejrychlejší je online rezervace, kde vidíte volné termíny.`,
            priority: 10
        },
        {
            keywords: ['kontakt', 'telefon', 'email', 'volat', 'číslo', 'zavolat', 'napsat', 'spojení'],
            answer: `Naše kontaktní údaje:\n\n📞 <strong>Telefon</strong>: <a href="tel:+420416838186">416 838 186</a>, <a href="tel:+420724866920">724 866 920</a>\n📧 <strong>E-mail</strong>: <a href="mailto:gynekolog.ps@seznam.cz">gynekolog.ps@seznam.cz</a>\n📍 <strong>Adresa</strong>: Riegrova 637, 413 01 Roudnice nad Labem`,
            priority: 9
        },
        {
            keywords: ['adresa', 'kde', 'najít', 'lokace', 'poloha', 'mapa', 'cesta', 'kde jste', 'kde vás', 'kde se nacházíte', 'roudnice'],
            answer: `Najdete nás na adrese:\n\n📍 <strong>Riegrova 637, 413 01 Roudnice nad Labem</strong>\n\n<a href="https://www.google.com/maps/place/Riegrova+637,+413+01+Roudnice+nad+Labem" target="_blank">🗺️ Zobrazit na mapě</a>`,
            priority: 9
        },
        {
            keywords: ['služby', 'nabízíte', 'co děláte', 'nabídka', 'specializace', 'obory'],
            answer: `Nabízíme komplexní péči v těchto oblastech:\n\n🩺 <strong>Gynekologie</strong>:\n• Screening a prevence\n• Diagnostika a léčba\n• Antikoncepční poradenství\n• Spolupráce s klinickými pracovišti\n\n🤰 <strong>Porodnictví</strong>:\n• Těhotenské poradny (i rizikové)\n• Ultrazvuk a screening\n• Poradenství u neplodnosti\n• Spolupráce s porodnicemi\n\nVíce se dozvíte v sekci <a href="#sluzby">Služby</a>.`,
            priority: 9
        },
        {
            keywords: ['prevence', 'preventivní', 'prohlídka', 'screening', 'cytologie'],
            answer: `Preventivní prohlídka zahrnuje:\n\n✅ Gynekologické vyšetření\n✅ Odběr cytologie (stěr z čípku)\n✅ Ultrazvuk malé pánve a prsu\n✅ Konzultaci o zdravotním stavu\n\nNa preventivní prohlídku máte nárok <strong>jednou ročně</strong> hrazený pojišťovnou. Využijte náš <a href="#prevence">Průvodce prevencí</a> pro doporučení dle vašeho věku.`,
            priority: 8
        },
        {
            keywords: ['těhotná', 'těhotenství', 'otěhotnět', 'čekám dítě', 'miminko', 'pozitivní test', 'jsem těhotná'],
            answer: `Pokud jste zjistila těhotenství, gratulujeme! 🎉\n\nDoporučujeme navštívit lékaře <strong>co nejdříve, nejpozději do 8. týdne</strong>. Lékař potvrdí těhotenství ultrazvukem a zahájí vedení těhotenské poradny.\n\nNabízíme kompletní péči včetně rizikových těhotenství. <a href="#rezervace">Objednejte se online</a>.`,
            priority: 8
        },
        {
            keywords: ['antikoncepce', 'pilulky', 'tělísko', 'hormonální', 'nehormonální', 'kroužek', 'náplast'],
            answer: `Pomůžeme Vám vybrat tu nejvhodnější antikoncepci dle Vašeho věku, zdravotního stavu a životního stylu.\n\nNabízíme:\n💊 Hormonální antikoncepce (pilulky, náplasti, kroužky)\n🔷 Nitroděložní tělíska\n✨ Nehormonální metody\n\nSprávně užívaná hormonální antikoncepce má spolehlivost přes <strong>99 %</strong>. Vše probereme při konzultaci.`,
            priority: 8
        },
        {
            keywords: ['nové pacientky', 'přijímáte', 'registrace', 'nová pacientka', 'zaregistrovat', 'nový pacient'],
            answer: `Ano, aktuálně <strong>přijímáme nové pacientky</strong>! 🎉\n\nZaregistrujte se jednoduše přes náš <a href="#rezervace">online rezervační systém</a> nebo nás kontaktujte telefonicky na <a href="tel:+420416838186">416 838 186</a>.\n\nTěšíme se na Vás!`,
            priority: 10
        },
        {
            keywords: ['porod', 'porodnice', 'kontrakce', 'plodová voda', 'porodit'],
            answer: `Porod probíhá ve třech fázích: otevírací, vypuzovací a poporodní.\n\n🚗 <strong>Kdy jet do porodnice</strong>:\n• Pravidelné kontrakce každých 5 minut\n• Odtekla plodová voda\n• Silné krvácení\n\nÚzce spolupracujeme s předními porodnicemi v okolí a zajistíme plynulou navazující péči.`,
            priority: 7
        },
        {
            keywords: ['menstruace', 'nepravidelná', 'krvácení', 'cyklus', 'perioda'],
            answer: `Nepravidelná menstruace může mít mnoho příčin – stres, hormonální nerovnováha, změna váhy nebo onemocnění.\n\n⚠️ Pokud nepravidelnosti trvají déle než <strong>2–3 cykly</strong>, doporučujeme návštěvu naší ordinace pro bližší vyšetření.\n\n<a href="#rezervace">Objednejte se</a> k vyšetření.`,
            priority: 7
        },
        {
            keywords: ['akutní', 'okamžitě', 'urgentní', 'bolest', 'zánět', 'horečka', 'výtok', 'krvácení mimo'],
            answer: `⚠️ <strong>Okamžitě vyhledejte pomoc</strong> při:\n\n• Silné bolesti v podbřišku\n• Neobvyklém krvácení mimo menstruaci\n• Příznacích zánětu (horečka, výtok se zápachem)\n• Podezření na mimoděložní těhotenství\n\nKontaktujte nás na <a href="tel:+420416838186">416 838 186</a> nebo navštivte nejbližší pohotovost.`,
            priority: 10
        },
        {
            keywords: ['připravit', 'příprava', 'před prohlídkou', 'co s sebou', 'co vzít'],
            answer: `Jak se připravit na gynekologickou prohlídku:\n\n📋 Naplánujte návštěvu <strong>mimo menstruaci</strong>\n🚫 24–48 hodin před prohlídkou bez pohlavního styku\n💳 Přineste průkaz pojišťovny\n💊 Seznam užívaných léků\n\nŽádná speciální příprava není potřeba – není se čeho bát! 😊`,
            priority: 7
        },
        {
            keywords: ['poprvé', 'první návštěva', 'první', 'panenství', 'mladá', 'dívka'],
            answer: `Doporučujeme první návštěvu gynekologie kolem <strong>15–18 roku věku</strong>, nebo při zahájení pohlavního života.\n\nGynekolog Vás provede prevencí a zodpoví veškeré Vaše otázky ohledně zdraví. Není se čeho bát! 😊`,
            priority: 7
        },
        {
            keywords: ['neplodnost', 'otěhotnět', 'nedaří', 'reprodukce', 'ivf', 'umělé oplodnění'],
            answer: `Pokud se Vám nedaří otěhotnět, provedeme prvotní diagnostiku příčin a připravíme návrhy řešení.\n\nNásledně zajišťujeme plynulou spolupráci se <strong>špičkovými centry asistované reprodukce</strong>.\n\n<a href="#rezervace">Objednejte se</a> na konzultaci.`,
            priority: 8
        },
        {
            keywords: ['lékař', 'doktor', 'doktorka', 'tým', 'kdo ordinuje', 'jméno lékaře'],
            answer: `Náš lékařský tým:\n\n👩‍⚕️ <strong>MUDr. Monika Coufalová</strong> – pondělí\n👩‍⚕️ <strong>MUDr. Simona Podráská</strong> – úterý, středa, čtvrtek\n👨‍⚕️ <strong>MUDr. Pavel Spěváček</strong> – pátek\n\nVíce v sekci <a href="#tym">Lékařský tým</a>.`,
            priority: 8
        },
        {
            keywords: ['ultrazvuk', 'usg', 'sono', 'sonografie'],
            answer: `Naše ambulance je vybavena <strong>moderní ultrazvukovou technikou</strong> pro přesné sledování.\n\nNabízíme:\n• Ultrazvuk malé pánve\n• Prvotrimestrální screening vrozených vad\n• Podrobná morfologická vyšetření\n• Ultrazvuk v rámci preventivní prohlídky`,
            priority: 7
        },
        {
            keywords: ['ičo', 'firma', 'společnost', 'právní', 'spisová značka'],
            answer: `Firemní údaje:\n\n🏢 <strong>Femira</strong> – Poradna pro ženy\n📋 IČO: 10964011\n⚖️ Spisová značka: C 47304/KSUL Krajský soud v Ústí nad Labem`,
            priority: 5
        },
        {
            keywords: ['ahoj', 'dobrý den', 'zdravím', 'čau', 'nazdar', 'helou', 'hello', 'hi', 'hej'],
            answer: `Dobrý den! 👋 Jsem virtuální asistentka Femira. Ráda Vám pomohu s jakýmkoliv dotazem ohledně naší ambulance.\n\nMůžete se mě zeptat například na ordinační hodiny, služby, jak se objednat, nebo cokoliv dalšího.`,
            priority: 3
        },
        {
            keywords: ['děkuji', 'díky', 'dekuji', 'dík', 'díkes', 'mockrát', 'thanks'],
            answer: `Není za co! 😊 Pokud budete potřebovat cokoliv dalšího, jsem tu pro Vás. Přeji hezký den! 🌸`,
            priority: 3
        },
        {
            keywords: ['pojišťovna', 'hrazeno', 'zdarma', 'cena', 'kolik stojí', 'platit', 'poplatek'],
            answer: `Preventivní gynekologická prohlídka je hrazena zdravotní pojišťovnou <strong>jednou ročně</strong>.\n\nPodrobné informace o tom, na co máte nárok v rámci veřejného pojištění, najdete v sekci <a href="#prevence">Průvodce prevencí</a>.\n\nKonkrétní dotazy na ceny individuálních služeb zodpovíme telefonicky na <a href="tel:+420416838186">416 838 186</a>.`,
            priority: 7
        }
    ];

    // --- Normalize text for matching ---
    function normalize(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')   // remove diacritics
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // --- Find best matching answer ---
    function findAnswer(userInput) {
        const normalizedInput = normalize(userInput);
        const inputWords = normalizedInput.split(' ');

        let bestMatch = null;
        let bestScore = 0;

        for (const entry of KNOWLEDGE_BASE) {
            let score = 0;

            for (const keyword of entry.keywords) {
                const normalizedKeyword = normalize(keyword);
                const keywordWords = normalizedKeyword.split(' ');

                // Exact phrase match (highest value)
                if (normalizedInput.includes(normalizedKeyword)) {
                    score += 10 * keywordWords.length;
                } else {
                    // Individual word matches
                    for (const kw of keywordWords) {
                        for (const iw of inputWords) {
                            if (iw === kw) {
                                score += 3;
                            } else if (iw.length > 3 && kw.length > 3 && (iw.includes(kw) || kw.includes(iw))) {
                                score += 1.5;
                            }
                        }
                    }
                }
            }

            // Apply priority weighting
            if (score > 0) {
                score += entry.priority * 0.5;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = entry;
            }
        }

        // Minimum threshold for a match
        if (bestScore >= 3) {
            return bestMatch.answer;
        }

        return null;
    }

    // --- Fallback responses ---
    const FALLBACK_RESPONSES = [
        `Omlouvám se, na tuto otázku nemám přesnou odpověď. 😊 Zkuste se zeptat na:\n\n• Ordinační hodiny\n• Jak se objednat\n• Naše služby\n• Kontaktní údaje\n\nNebo nás kontaktujte přímo na <a href="tel:+420416838186">416 838 186</a>.`,
        `Tuto informaci bohužel nemám k dispozici. Doporučuji kontaktovat naši ambulanci přímo:\n\n📞 <a href="tel:+420416838186">416 838 186</a>\n📧 <a href="mailto:gynekolog.ps@seznam.cz">gynekolog.ps@seznam.cz</a>`,
        `Na toto se mi nepodařilo najít odpověď. Zkuste položit otázku jinak, nebo se podívejte do sekce <a href="#faq">FAQ</a>, kde najdete nejčastější otázky a odpovědi.`
    ];

    let fallbackIndex = 0;
    function getFallback() {
        const response = FALLBACK_RESPONSES[fallbackIndex];
        fallbackIndex = (fallbackIndex + 1) % FALLBACK_RESPONSES.length;
        return response;
    }

    // --- DOM Elements ---
    const widget = document.getElementById('chatbot-widget');
    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const panel = document.getElementById('chatbot-panel');
    const messagesContainer = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const suggestionsContainer = document.getElementById('chatbot-suggestions');

    if (!widget || !toggle || !form) return;

    // --- State ---
    let isOpen = false;
    let isFirstOpen = true;

    // --- Message rendering ---
    function createMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `chatbot-msg ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'chatbot-msg-avatar';
        avatar.innerHTML = sender === 'bot'
            ? '<i class="fa-solid fa-leaf"></i>'
            : '<i class="fa-solid fa-user"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'chatbot-msg-bubble';
        bubble.innerHTML = text.replace(/\n/g, '<br>');

        msg.appendChild(avatar);
        msg.appendChild(bubble);

        return msg;
    }

    function addMessage(text, sender) {
        messagesContainer.appendChild(createMessage(text, sender));
        scrollToBottom();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    }

    // --- Typing indicator ---
    function showTyping() {
        const typingMsg = document.createElement('div');
        typingMsg.className = 'chatbot-msg bot';
        typingMsg.id = 'chatbot-typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'chatbot-msg-avatar';
        avatar.innerHTML = '<i class="fa-solid fa-leaf"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'chatbot-msg-bubble';
        bubble.innerHTML = `
            <div class="chatbot-typing">
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
            </div>
        `;

        typingMsg.appendChild(avatar);
        typingMsg.appendChild(bubble);
        messagesContainer.appendChild(typingMsg);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById('chatbot-typing-indicator');
        if (typing) typing.remove();
    }

    // --- Bot response with delay ---
    function botRespond(userText) {
        showTyping();
        const delay = 600 + Math.random() * 800;

        setTimeout(() => {
            hideTyping();
            const answer = findAnswer(userText);
            addMessage(answer || getFallback(), 'bot');
        }, delay);
    }

    // --- Toggle panel ---
    function openChat() {
        isOpen = true;
        widget.classList.add('open');

        if (isFirstOpen) {
            isFirstOpen = false;
            setTimeout(() => {
                addMessage(
                    'Dobrý den! 👋 Jsem virtuální asistentka <strong>Femira</strong>. Pomohu Vám s informacemi o naší ambulanci, službách, ordinačních hodinách a více.\n\nNa co se chcete zeptat?',
                    'bot'
                );
            }, 400);
        }

        setTimeout(() => input.focus(), 500);
    }

    function closeChat() {
        isOpen = false;
        widget.classList.remove('open');
    }

    function toggleChat() {
        if (isOpen) closeChat();
        else openChat();
    }

    // --- Event Listeners ---
    toggle.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        // Hide suggestions after first user message
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        botRespond(text);
    });

    // Suggestion chips
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.chatbot-suggestion');
            if (!btn) return;

            const query = btn.dataset.query;
            addMessage(query, 'user');
            suggestionsContainer.style.display = 'none';
            botRespond(query);
        });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) closeChat();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (isOpen && !widget.contains(e.target)) {
            closeChat();
        }
    });

})();