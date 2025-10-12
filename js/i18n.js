// Simple i18n utilities and state
;(function(){
  const supported = ['ko','en','ja']
  const defaultLang = (window.siteConfig && (siteConfig.defaultLanguage || siteConfig.lang)) || 'ko'

  const dict = {
    ko: {
      searchPlaceholder: '키워드',
      postsLabel: '포스트',
      toggleThemeAria: '테마 전환',
      toggleLangAria: '언어 변경',
      openFilters: '필터 열기',
      closeFilter: '필터 닫기',
      openSearch: '검색 열기',
      openMenu: '메뉴 열기',
      contentTitle: '콘텐츠',
    },
    en: {
      searchPlaceholder: 'Keyword',
      postsLabel: 'posts',
      toggleThemeAria: 'Toggle theme',
      toggleLangAria: 'Change language',
      openFilters: 'Open filters',
      closeFilter: 'Close filter',
      openSearch: 'Open search',
      openMenu: 'Open menu',
      contentTitle: 'Contents',
    },
    ja: {
      searchPlaceholder: 'キーワード',
      postsLabel: '投稿',
      toggleThemeAria: 'テーマを切替',
      toggleLangAria: '言語を変更',
      openFilters: 'フィルターを開く',
      closeFilter: 'フィルターを閉じる',
      openSearch: '検索を開く',
      openMenu: 'メニューを開く',
      contentTitle: 'コンテンツ',
    }
  }

  function detectLang(){
    const saved = localStorage.getItem('hakunote:lang')
    if (saved && supported.includes(saved)) return saved
    const nav = (navigator.language || '').slice(0,2)
    if (supported.includes(nav)) return nav
    return defaultLang
  }

  let current = detectLang()
  document.documentElement.setAttribute('lang', current)

  function t(key){
    const pack = dict[current] || dict[defaultLang]
    return (pack && pack[key]) || (dict[defaultLang] && dict[defaultLang][key]) || key
  }

  function setLanguage(lang){
    if (!supported.includes(lang)) return
    if (current === lang) return
    current = lang
    localStorage.setItem('hakunote:lang', current)
    document.documentElement.setAttribute('lang', current)
    const evt = new CustomEvent('app:languagechange', { detail: { lang: current } })
    document.dispatchEvent(evt)
  }

  function getCurrentLang(){ return current }

  // Expose
  window.i18n = { t, setLanguage, getCurrentLang, supported }
  window.t = t
  window.setLanguage = setLanguage
  window.getCurrentLang = getCurrentLang
})();

