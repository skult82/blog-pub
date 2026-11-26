/**
 * @file main.js
 * @description 사이트 전역 인터랙션 (다크모드 토글, 카테고리 서브메뉴 탭 필터링) 제어 스크립트
 */

/**
 * 테마 상수 정의 열거형 (Enum)
 * @readonly
 * @enum {string}
 */
const ThemeMode = Object.freeze({
  DARK: 'dark',
  LIGHT: 'light'
});

/**
 * 스토리지 키 상수 정의
 */
const STORAGE_KEYS = Object.freeze({
  THEME: 'theme_preference'
});

/**
 * 전역 UI 컨트롤러 클래스
 */
class UIController {
  // 현재 활성화된 테마 상태
  currentTheme = ThemeMode.LIGHT;

  /**
   * 컨트롤러 초기화 및 이벤트 리스너 바인딩
   */
  constructor() {
    this.initTheme();
    this.initCategoryTabs();
  }

  /**
   * 저장된 테마 설정 로드 및 적용
   */
  initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else if (systemPrefersDark) {
      this.currentTheme = ThemeMode.DARK;
    } else {
      this.currentTheme = ThemeMode.LIGHT;
    }

    this.applyTheme(this.currentTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  }

  /**
   * 테마 전환 및 저장
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
    this.applyTheme(this.currentTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, this.currentTheme);
  }

  /**
   * HTML data-theme 속성 업데이트
   * @param {string} theme 
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === ThemeMode.DARK ? '☀️' : '🌙';
      toggleBtn.setAttribute('title', theme === ThemeMode.DARK ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
  }

  /**
   * 카테고리 서브 메뉴 탭 필터링 이벤트 등록
   */
  initCategoryTabs() {
    const tabButtons = document.querySelectorAll('.category-tab-btn');
    const postCards = document.querySelectorAll('.post-card');

    if (!tabButtons.length || !postCards.length) {
      return;
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetCategory = btn.getAttribute('data-category');

        // 탭 활성화 UI 업데이트
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 포스트 카드 필터링 애니메이션
        postCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (targetCategory === 'all' || cardCategory === targetCategory) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            setTimeout(() => { card.style.opacity = '1'; }, 10);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}

// DOM 로드 완료 시 컨트롤러 인스턴스화
document.addEventListener('DOMContentLoaded', () => {
  new UIController();
});
