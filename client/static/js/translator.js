/* This script is used to translate the website content to the user's preferred language. */
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BACKEND_URL = isProduction ? 'https://nine0-s-portfolio.onrender.com' : 'http://localhost:8000';

async function translateTexts(texts, targetLanguage) {
    try {
      const response = await fetch(`${BACKEND_URL}/translate`, {
        method: 'POST',
        body: JSON.stringify({ texts, target_language: targetLanguage }),
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Translation API responded with status ${response.status}: ${errorData}`);
        throw new Error(`Translation API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      if (!data.data || !data.data.translations) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid translation response');
      }
  
      return data.data.translations.map(t => t.translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      return texts; // Fallback to original texts if translation fails
    }
}

async function translatePageContent() {
    const userPreferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    
    if (userPreferredLanguage === 'en') {
      // No need to translate if English is selected
      return;
    }

    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    const textsToTranslate = [];

    elementsToTranslate.forEach(element => {
      const originalText = element.getAttribute('data-original-text') || element.textContent.trim();
      if (!element.getAttribute('data-original-text')) {
        element.setAttribute('data-original-text', originalText);
      }
      textsToTranslate.push(originalText);
    });

    const elementsWithPlaceholder = document.querySelectorAll('[data-translate-placeholder]');
    elementsWithPlaceholder.forEach(element => {
      const originalPlaceholder = element.getAttribute('data-original-placeholder') || element.placeholder;
      if (!element.getAttribute('data-original-placeholder')) {
        element.setAttribute('data-original-placeholder', originalPlaceholder);
      }
      textsToTranslate.push(originalPlaceholder);
    });

    const optionElements = document.querySelectorAll('select option[data-translate-option]');
    optionElements.forEach(option => {
      const originalText = option.getAttribute('data-original-text') || option.textContent.trim();
      if (!option.getAttribute('data-original-text')) {
        option.setAttribute('data-original-text', originalText);
      }
      textsToTranslate.push(originalText);
    });

    // Now, translate all collected texts
    const translatedTexts = await translateTexts(textsToTranslate, userPreferredLanguage);

    // Update elements with translated texts
    let index = 0;
    elementsToTranslate.forEach(element => {
      element.textContent = translatedTexts[index];
      index++;
    });
    elementsWithPlaceholder.forEach(element => {
      element.placeholder = translatedTexts[index];
      index++;
    });
    optionElements.forEach(option => {
      option.textContent = translatedTexts[index];
      index++;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const userPreferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    
    // Set the dropdown to the userPreferredLanguage
    if (languageSelect) {
      languageSelect.value = userPreferredLanguage;
      
      languageSelect.addEventListener('change', () => {
        const newLanguage = languageSelect.value;
        localStorage.setItem('preferredLanguage', newLanguage);
        // Re-translate the page
        translatePageContent();
      });
    }

    // Run initial translation if needed
    translatePageContent();
});