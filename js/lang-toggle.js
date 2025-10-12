;(function(){
  function cycle(next=true){
    const langs = window.i18n?.supported || ['ko','en','ja']
    const cur = window.getCurrentLang ? window.getCurrentLang() : 'ko'
    const idx = langs.indexOf(cur)
    const nextIdx = next ? (idx+1) % langs.length : (idx-1+langs.length) % langs.length
    const lang = langs[nextIdx]
    if (window.setLanguage) window.setLanguage(lang)
    updateButton()
  }

  function updateButton(){
    const btn = document.getElementById('lang-toggle')
    if (!btn) return
    const cur = window.getCurrentLang ? window.getCurrentLang() : 'ko'
    const label = cur.toUpperCase()
    btn.setAttribute('aria-label', (window.t? window.t('toggleLangAria') : 'Change language'))
    const slot = btn.querySelector('.lang-toggle-label')
    if (slot) slot.textContent = label
  }

  function applyI18nToUi(){
    const inp = document.getElementById('search-input')
    if (inp) inp.setAttribute('placeholder', window.t ? window.t('searchPlaceholder') : 'Keyword')
    const asideTit = document.querySelector('.aside-tit')
    if (asideTit) asideTit.textContent = window.t ? window.t('contentTitle') : 'Content'
    updateButton()
  }

  function mount(){
    const btn = document.getElementById('lang-toggle')
    if (btn && !btn.dataset.bound){
      btn.addEventListener('click', () => cycle(true))
      btn.dataset.bound = 'true'
    }
    applyI18nToUi()
  }

  document.addEventListener('DOMContentLoaded', mount)
  // In case this script loads after DOMContentLoaded
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    try { mount() } catch (_) {}
  }
  document.addEventListener('app:languagechange', applyI18nToUi)
})();
