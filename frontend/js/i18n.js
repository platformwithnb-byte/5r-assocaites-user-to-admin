/**
 * i18n - Multi-language Support
 * Loads content from JSON files and provides language switching
 */

let currentLanguage = localStorage.getItem('language') || 'en';
let translations = {};

/**
 * Initialize i18n
 * Must be called before using any translation functions
 */
export const initI18n = async (pageContent = 'common') => {
    try {
        // Load the appropriate language file for the page
        const response = await fetch(`/content/${currentLanguage}/${pageContent}.json`);

        if (!response.ok) {
            throw new Error(`Failed to load language file: ${pageContent}.json`);
        }

        translations = await response.json();
        applyTranslations();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
};

/**
 * Get translation for a key
 * Supports nested keys using dot notation: 'auth.login'
 */
export const t = (key) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key; // Return key if not found
        }
    }

    return value || key;
};

/**
 * Change language
 */
export const setLanguage = async (lang, pageContent = 'common') => {
    if (lang !== 'en' && lang !== 'kn') {
        console.warn(`Unsupported language: ${lang}`);
        return false;
    }

    currentLanguage = lang;
    localStorage.setItem('language', lang);

    await initI18n(pageContent);

    // Update language switcher UI
    updateLanguageSwitcher();

    return true;
};

/**
 * Get current language
 */
export const getCurrentLanguage = () => currentLanguage;

/**
 * Apply translations to HTML elements
 * Look for data-i18n attributes
 */
export const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.type === 'submit' || element.type === 'button') {
                element.value = translation;
            } else {
                element.placeholder = translation;
            }
        } else {
            element.textContent = translation;
        }
    });
};

/**
 * Update language switcher UI
 */
export const updateLanguageSwitcher = () => {
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
        const btnLang = btn.getAttribute('data-lang-toggle');
        if (btnLang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};

/**
 * Setup language switcher
 */
export const setupLanguageSwitcher = (pageContent = 'common') => {
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang-toggle');
            await setLanguage(lang, pageContent);
        });
    });

    updateLanguageSwitcher();
};

/**
 * Batch translate an object
 */
export const translateObject = (keys) => {
    const translated = {};
    keys.forEach((key) => {
        translated[key] = t(key);
    });
    return translated;
};

export default {
    initI18n,
    t,
    setLanguage,
    getCurrentLanguage,
    applyTranslations,
    updateLanguageSwitcher,
    setupLanguageSwitcher,
    translateObject,
};
