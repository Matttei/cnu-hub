let fontSize = 100;
let accessibilityState = {
    grayscale: false,
    highContrast: false,
    negativeContrast: false,
    lightBackground: false,
    underlineLinks: false,
    readableFont: false
};
let messageCount = 0;
document.addEventListener('DOMContentLoaded', function () {
    
    loadAccessibilitySettings();
    addEventListeners();
    // ----------------------------
    // 1. INITIALIZATION & UTILITIES
    // ----------------------------

    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
        showMessage('✅ Anunțul a fost publicat cu succes!', true);
    }
    else if(params.get('scroll')){
        const scrollTargetId = params.get('scroll');
        // Scroll to the TargetId
        const targetElement = document.getElementById(scrollTargetId);
        if (targetElement){
            targetElement.scrollIntoView({behavior: 'smooth'})

            // Animation after scrolling
            targetElement.classList.add('highlight-animation');
        }
    }
    const searchBtn = document.getElementById("searchBtn");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn && searchForm && searchInput) {

        searchBtn.addEventListener("click", function(e) {
            e.preventDefault();

            searchForm.classList.toggle("active");
            searchBtn.classList.toggle("hide");

            if (searchForm.classList.contains("active")) {
                searchInput.focus();
            }
        });


        searchInput.addEventListener("keydown", function(e) {

            if (e.key === "Escape") {
                searchForm.classList.remove("active");
                searchBtn.classList.remove("hide");
                searchInput.value = "";
            }

        });


        document.addEventListener("click", function(e) {

            if (
                !searchForm.contains(e.target) &&
                !searchBtn.contains(e.target)
            ) {
                searchForm.classList.remove("active");
                searchBtn.classList.remove("hide");
            }

        });

    }
    // Mobile
    const mobileSearchBtn = document.getElementById("mobileSearchBtn");
    const mobileSearchForm = document.getElementById("mobileSearchForm");
    const mobileSearchInput = document.getElementById("mobileSearchInput");


    if(mobileSearchBtn){

        mobileSearchBtn.addEventListener("click", function(e){

            e.preventDefault();

            mobileSearchForm.classList.toggle("active");
            mobileSearchBtn.classList.toggle("hide");


            if(mobileSearchForm.classList.contains("active")){
                mobileSearchInput.focus();
            }

        });


        mobileSearchInput.addEventListener("keydown", function(e){

            if(e.key === "Escape"){

                mobileSearchForm.classList.remove("active");
                mobileSearchBtn.classList.remove("hide");

            }

        });


        document.addEventListener("click", function(e){

            if(
                !mobileSearchForm.contains(e.target) &&
                !mobileSearchBtn.contains(e.target)
            ){

                mobileSearchForm.classList.remove("active");
                mobileSearchBtn.classList.remove("hide");

            }

        });

    }

    const cards = document.querySelectorAll(".card-grid");
    const values = document.querySelectorAll(".value-item");
    const smiley1 = document.querySelector('.smiley-face');
    const smiley2 = document.querySelector('.smiley-face2');
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target); // Stop observing once it's animated
          }
        });
      },
      {
        threshold: 0.2 // Trigger when 20% of the element is visible
      }
    );

    cards.forEach(card => observer.observe(card));
    values.forEach(value => observer.observe(value));
    if (smiley1)
    observer.observe(smiley1);
    if (smiley2)
    observer.observe(smiley2);
    
    const contactForm = document.querySelector('.contact-form');
    const feedback = document.querySelector('.form-feedback'); 
    if (contactForm){
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault ();

        const formData = new FormData(contactForm);
        const message = document.getElementById('message');

        if (message.value.trim().length < 10) {
            alert('Mesaj scurt')
            return;
        }

        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) throw new Error('Eroare la trimitere.');
            return response.json(); 
        })
        .then(data => {
            showMessage(data.message, true);
            contactForm.reset();
        })
        .catch(error => {
            showMessage(error.message || 'Eroare la trimitere.', false);
        });
    });
    }
    // Listener for News
    const grids = document.querySelectorAll('.news-grid');
    grids.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('slide-in');
        }, index * 100); // 100ms delay per item
    });

        const select = document.getElementById("clasaSelect");
        const downloadSection = document.getElementById("downloadSection");
        const downloadLink = document.getElementById("downloadLink");

const bucketUrl = 'https://colegiulunirea-tr.s3.eu-north-1.amazonaws.com';

if (select) {
    select.addEventListener("change", function () {
        const clasa = select.value;

        if (clasa) {
            const fileUrl = `${bucketUrl}/media/orare/${clasa}.pdf`;
            console.log(fileUrl);

            fetch(fileUrl, { method: 'HEAD' })
                .then(res => {
                    if (res.ok) {
                        downloadLink.href = fileUrl;
                        downloadSection.classList.remove('d-none');
                    } else {
                        downloadSection.classList.add('d-none');
                        showMessage('⚠️ Orarul pentru această clasă nu a fost găsit sau nu a fost încă adăugat.');
                    }
                })
                .catch(() => {
                    downloadSection.classList.add('d-none');
                    showMessage('⚠️ Eroare la verificarea fișierului.');
                });
        } else {
            downloadSection.classList.add('d-none');
        }
    });

    downloadLink.addEventListener("click", function (e) {
        e.preventDefault(); // prevent normal navigation

        const url = downloadLink.href;
        const clasa = select.value;

        fetch(url)
            .then(resp => resp.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.download = `${clasa}.pdf`; // filename for download
                document.body.appendChild(tempLink);
                tempLink.click();
                tempLink.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => showMessage("⚠️ Eroare la descărcarea fișierului."));
    });
}
});

    function showMessage(message, isSuccess = false) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message';

        // Assign a unique ID
        const id = `message-${messageCount++}`;
        messageEl.id = id;

        messageEl.innerHTML = message;

        const hideBtn = document.createElement('button');
        hideBtn.innerHTML = 'X';
        hideBtn.classList.add('btn', 'btn-hide', 'ml-2');
        
        // Set the ID on the button
        hideBtn.setAttribute('data-target-id', id);
        hideBtn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target-id');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.remove();
        });

        messageEl.append(hideBtn);

        if (isSuccess) {
            messageEl.style.backgroundColor = '#d4edda';
            messageEl.style.color = '#155724';
        }

        document.body.appendChild(messageEl);

        setTimeout(() => {
            const targetEl = document.getElementById(id);
            if (targetEl) targetEl.remove();
        }, 3000);
    }

function closeMenu() {
    const menu = document.getElementById('accessibility-menu');
    if (menu) {
        menu.classList.remove('show');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 200);
    }
}



function toggleMenu() {
    const menu = document.getElementById("accessibility-menu");
    
    if (!menu) return;
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        // Small delay to allow display to take effect before animation
        setTimeout(() => {
            menu.classList.add('show');
        }, 10);
    } else {
        menu.classList.remove('show');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 200);
    }
}



function increaseFont() {
    fontSize = Math.min(200, fontSize + 10); // Max 200%
    document.body.classList.remove(
        'font-size-50', 'font-size-60', 'font-size-70', 'font-size-80', 'font-size-90',
        'font-size-100', 'font-size-110', 'font-size-120', 'font-size-130', 'font-size-140',
        'font-size-150', 'font-size-160', 'font-size-170', 'font-size-180', 'font-size-190',
        'font-size-200'
    );
    
    document.body.classList.add(`font-size-${fontSize}`);
    
    saveAccessibilitySettings();
    showFeedback('Text mărit');
}
function decreaseFont() {
    fontSize = Math.max(50, fontSize - 10); // Min 50%
    document.body.classList.remove(
        'font-size-50', 'font-size-60', 'font-size-70', 'font-size-80', 'font-size-90',
        'font-size-100', 'font-size-110', 'font-size-120', 'font-size-130', 'font-size-140',
        'font-size-150', 'font-size-160', 'font-size-170', 'font-size-180', 'font-size-190',
        'font-size-200'
    );
    
    document.body.classList.add(`font-size-${fontSize}`);
    
    saveAccessibilitySettings();
    showFeedback('Text micșorat');
}

function toggleGrayscale() {
    accessibilityState.grayscale = !accessibilityState.grayscale;
    document.body.classList.toggle('grayscale', accessibilityState.grayscale);
    saveAccessibilitySettings();
    
    showFeedback(accessibilityState.grayscale ? 'Tonuri de gri activate' : 'Tonuri de gri dezactivate');
}

function toggleHighContrast() {
    accessibilityState.negativeContrast = false;
    document.body.classList.remove('negative-contrast');
    
    accessibilityState.highContrast = !accessibilityState.highContrast;
    document.body.classList.toggle('high-contrast', accessibilityState.highContrast);
    saveAccessibilitySettings();
    
    showFeedback(accessibilityState.highContrast ? 'Contrast mare activat' : 'Contrast mare dezactivat');
}

function toggleNegativeContrast() {
    accessibilityState.highContrast = false;
    document.body.classList.remove('high-contrast');
    
    accessibilityState.negativeContrast = !accessibilityState.negativeContrast;
    document.body.classList.toggle('negative-contrast', accessibilityState.negativeContrast);
    saveAccessibilitySettings();
    
    showFeedback(accessibilityState.negativeContrast ? 'Contrast negativ activat' : 'Contrast negativ dezactivat');
}

function toggleLightBackground() {
    accessibilityState.lightBackground = !accessibilityState.lightBackground;
    document.body.classList.toggle('light-background', accessibilityState.lightBackground);
    saveAccessibilitySettings();
    
    showFeedback(accessibilityState.lightBackground ? 'Fundal luminos activat' : 'Fundal luminos dezactivat');
}

function toggleUnderlineLinks() {
    accessibilityState.underlineLinks = !accessibilityState.underlineLinks;
    document.body.classList.toggle('underline-links', accessibilityState.underlineLinks);
    saveAccessibilitySettings();
    
    showFeedback(accessibilityState.underlineLinks ? 'Legături subliniate activate' : 'Legături subliniate dezactivate');
}

function toggleReadableFont() {
    accessibilityState.readableFont = !accessibilityState.readableFont;
    document.body.classList.toggle('readable-font', accessibilityState.readableFont);
    saveAccessibilitySettings();
    
    showFeedback(accessibilityState.readableFont ? 'Font lizibil activat' : 'Font lizibil dezactivat');
}

function speakText() {
    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        const mainContent = document.querySelector('body') || document.querySelector('[role="body"]');
        let textToSpeak = '';
        const contentSelectors = [
            'body',
        ];
        
        let contentElement = null;
        for (const selector of contentSelectors) {
            contentElement = document.querySelector(selector);
            if (contentElement) break;
        }
        
        if (contentElement) {
            // Remove navigation, footer, and script elements
            const clone = contentElement.cloneNode(true);
            const elementsToRemove = clone.querySelectorAll('nav, footer, script, style, .accessibility-widget');
            elementsToRemove.forEach(el => el.remove());
            textToSpeak = clone.innerText;
        } else {
            // Fallback to body text
            textToSpeak = document.body.innerText;
        }
        
        // Clean up the text
        textToSpeak = textToSpeak.replace(/\s+/g, ' ').trim();
        
        if (textToSpeak) {
            const speech = new SpeechSynthesisUtterance(textToSpeak);
            speech.lang = 'ro-RO';
            speech.rate = 0.9;
            speech.pitch = 1;
            speech.volume = 1;
            
            // Handle speech events
            speech.onstart = () => showFeedback('Redare audio pornită');
            speech.onend = () => showFeedback('Redare audio terminată');
            speech.onerror = () => showFeedback('Eroare la redarea audio');
            
            window.speechSynthesis.speak(speech);
        } else {
            showFeedback('Nu s-a găsit text pentru redare');
        }
    } catch (error) {
        console.error('Speech synthesis error:', error);
        showFeedback('Redarea audio nu este disponibilă');
    }
}

function resetAccessibility() {
    // Reset font size
    fontSize = 100;
    document.body.classList.remove(
        'font-size-50', 'font-size-60', 'font-size-70', 'font-size-80', 'font-size-90',
        'font-size-100', 'font-size-110', 'font-size-120', 'font-size-130', 'font-size-140',
        'font-size-150', 'font-size-160', 'font-size-170', 'font-size-180', 'font-size-190',
        'font-size-200'
    );
    
    // Reset all accessibility states
    accessibilityState = {
        grayscale: false,
        highContrast: false,
        negativeContrast: false,
        lightBackground: false,
        underlineLinks: false,
        readableFont: false
    };
    
    // Remove all accessibility classes
    document.body.classList.remove(
        'grayscale',
        'high-contrast',
        'negative-contrast',
        'light-background',
        'underline-links',
        'readable-font'
    );
    
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    // Clear saved settings
    clearAccessibilitySettings();
    
    showFeedback('Setările de accesibilitate au fost resetate');
}

function showFeedback(message) {
    // Remove existing feedback
    const existingFeedback = document.querySelector('.accessibility-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'accessibility-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #004b8d;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 2000);
}

function addEventListeners() {
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const widget = document.querySelector('.accessibility-widget');
        const menu = document.getElementById('accessibility-menu');
        
        if (widget && menu && !widget.contains(event.target) && !menu.classList.contains('hidden')) {
            closeMenu();
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const menu = document.getElementById('accessibility-menu');
            if (menu && !menu.classList.contains('hidden')) {
                closeMenu();
            }
        }
    });
    
    // Handle keyboard navigation in menu
    document.addEventListener('keydown', function(event) {
        const menu = document.getElementById('accessibility-menu');
        if (!menu || menu.classList.contains('hidden')) return;
        
        const focusableElements = menu.querySelectorAll('button');
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % focusableElements.length;
                focusableElements[nextIndex].focus();
                break;
            case 'ArrowUp':
                event.preventDefault();
                const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                focusableElements[prevIndex].focus();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
                    document.activeElement.click();
                }
                break;
        }
    });
}

// Save settings to localStorage
function saveAccessibilitySettings() {
    const settings = {
        fontSize: fontSize,
        ...accessibilityState
    };
    
    try {
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    } catch (error) {
        console.warn('Could not save accessibility settings:', error);
    }
}

// Load settings from localStorage
function loadAccessibilitySettings() {
    try {
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Restore font size
            if (settings.fontSize) {
                fontSize = settings.fontSize;
                document.body.classList.add(`font-size-${fontSize}`);
            }
            
            // Restore accessibility states
            Object.keys(accessibilityState).forEach(key => {
                if (settings[key]) {
                    accessibilityState[key] = settings[key];
                    document.body.classList.add(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                }
            });
        }
    } catch (error) {
        console.warn('Could not load accessibility settings:', error);
    }
}
// Clear settings from localStorage
function clearAccessibilitySettings() {
    try {
        localStorage.removeItem('accessibilitySettings');
    } catch (error) {
        console.warn('Could not clear accessibility settings:', error);
    }
}

// Auto-save 
window.addEventListener('beforeunload', function() {
    saveAccessibilitySettings();
});

// Expose functions 
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.increaseFont = increaseFont;
window.decreaseFont = decreaseFont;
window.toggleGrayscale = toggleGrayscale;
window.toggleHighContrast = toggleHighContrast;
window.toggleNegativeContrast = toggleNegativeContrast;
window.toggleLightBackground = toggleLightBackground;
window.toggleUnderlineLinks = toggleUnderlineLinks;
window.toggleReadableFont = toggleReadableFont;
window.speakText = speakText;
window.resetAccessibility = resetAccessibility;