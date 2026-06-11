import { translations } from './translations';

export function initLanguage(): string {
  let savedLang = localStorage.getItem('easy-slides-lang');
  if (!savedLang) {
    const navLang = navigator.language || '';
    savedLang = navLang.startsWith('en') ? 'en' : 'es';
  }
  setLanguage(savedLang);
  return savedLang;
}

export function setLanguage(lang: string): void {
  localStorage.setItem('easy-slides-lang', lang);

  // Update toggle buttons text (show other language option)
  const otherLang = lang === 'es' ? 'EN' : 'ES';
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.textContent = otherLang;
  });

  // Translate standard tags
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Translate title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key && translations[lang] && translations[lang][key]) {
      el.setAttribute('title', translations[lang][key]);
    }
  });

  // Translate loading text
  const loadingText = document.getElementById('loading-text');
  if (loadingText && translations[lang]) {
    loadingText.textContent = translations[lang].loading;
  }
}

export function toggleLanguage(currentLang: string): string {
  const nextLang = currentLang === 'es' ? 'en' : 'es';
  setLanguage(nextLang);
  return nextLang;
}
