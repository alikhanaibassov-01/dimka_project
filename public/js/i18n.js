const I18n = {
  lang: localStorage.getItem('lang') || 'kk',
  strings: {},

  async init() {
    const [kk, ru, en] = await Promise.all([
      fetch('/locales/kk.json').then((r) => r.json()),
      fetch('/locales/ru.json').then((r) => r.json()),
      fetch('/locales/en.json').then((r) => r.json()),
    ]);
    I18n.strings = { kk, ru, en };
    I18n.apply();
    I18n.bindLangSwitcher();
  },

  t(key) {
    return I18n.strings[I18n.lang]?.[key] || I18n.strings.ru?.[key] || key;
  },

  setLang(lang) {
    I18n.lang = lang;
    localStorage.setItem('lang', lang);
    I18n.apply();
    I18n.updateLangButtons();
    window.dispatchEvent(new Event('lang-changed'));
  },

  apply() {
    document.documentElement.lang = I18n.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = I18n.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.type !== 'radio' && el.type !== 'checkbox') {
          el.placeholder = val;
        }
      } else {
        el.textContent = val;
      }
    });
    I18n.updateLangButtons();
  },

  updateLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      const active = btn.getAttribute('data-lang-btn') === I18n.lang;
      btn.classList.toggle('bg-qaz-teal', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('text-gray-600', !active);
    });
  },

  bindLangSwitcher() {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        I18n.setLang(btn.getAttribute('data-lang-btn'));
      });
    });
  },
};
