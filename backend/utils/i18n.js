const fs = require('fs');
const path = require('path');

// Load translation files
const translations = {};
const localesDir = path.join(__dirname, '../locales');

// Supported languages
const supportedLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu'];

// Load all translation files
supportedLanguages.forEach(lang => {
  try {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error loading translation file for ${lang}:`, error);
  }
});

// Get user's preferred language from request
const getUserLanguage = (req) => {
  // Priority: user profile > Accept-Language header > default
  if (req.user && req.user.language) {
    return req.user.language;
  }
  
  if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language']
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase());
    
    for (const lang of acceptedLanguages) {
      if (supportedLanguages.includes(lang)) {
        return lang;
      }
      // Check for language without region (e.g., 'en' from 'en-US')
      const baseLang = lang.split('-')[0];
      if (supportedLanguages.includes(baseLang)) {
        return baseLang;
      }
    }
  }
  
  return 'en'; // Default to English
};

// Get nested property from object using dot notation
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Translate function with interpolation support
const translate = (req, key, variables = {}) => {
  const language = getUserLanguage(req);
  const languageTranslations = translations[language] || translations['en'];
  
  let translation = getNestedProperty(languageTranslations, key);
  
  // Fallback to English if translation not found
  if (!translation && language !== 'en') {
    translation = getNestedProperty(translations['en'], key);
  }
  
  // Fallback to key if no translation found
  if (!translation) {
    console.warn(`Translation missing for key: ${key} in language: ${language}`);
    return key;
  }
  
  // Replace variables in translation
  if (variables && typeof variables === 'object') {
    Object.keys(variables).forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      translation = translation.replace(regex, variables[variable]);
    });
  }
  
  return translation;
};

// Middleware to add translation function to request
const i18nMiddleware = (req, res, next) => {
  req.t = (key, variables) => translate(req, key, variables);
  next();
};

module.exports = {
  translate,
  i18nMiddleware,
  getUserLanguage,
  supportedLanguages
};