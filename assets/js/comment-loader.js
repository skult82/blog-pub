/**
 * @file comment-loader.js
 * @description 서드파티 코멘트 위젯(Giscus 등) 비동기 격리 로딩 및 장애 격리 제어 스크립트
 */

/**
 * 코멘트 로더 설정 상수
 */
const COMMENT_CONFIG = Object.freeze({
  // 로딩 타임아웃 제한 시간 (밀리초)
  LOAD_TIMEOUT_MS: 4000,
  // 위젯 컨테이너 셀렉터
  CONTAINER_ID: 'comments-container',
  // 로더 스피너 셀렉터
  LOADER_ID: 'comments-loader'
});

/**
 * 코멘트 비동기 격리 로더 클래스
 */
class CommentLoader {
  // 타임아웃 타이머 참조 변수
  timeoutTimer = null;
  // 로딩 완료 여부 플래그
  isLoaded = false;

  /**
   * 코멘트 로더 생성자
   */
  constructor() {
    this.init();
  }

  /**
   * 로더 초기화 및 설정 데이터 확인
   */
  init() {
    const container = document.getElementById(COMMENT_CONFIG.CONTAINER_ID);
    if (!container) {
      return;
    }

    const provider = container.getAttribute('data-provider');
    const repo = container.getAttribute('data-repo');

    // 비활성화 상태이거나 설정이 없는 경우 조용히 종료
    if (!provider || provider === 'none' || !repo || repo === 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME') {
      container.style.display = 'none';
      return;
    }

    this.startTimeoutGuard();
    this.injectWidget(provider, container);
  }

  /**
   * 타임아웃 가드 타이머 시작
   */
  startTimeoutGuard() {
    this.timeoutTimer = setTimeout(() => {
      if (!this.isLoaded) {
        this.handleTimeout();
      }
    }, COMMENT_CONFIG.LOAD_TIMEOUT_MS);
  }

  /**
   * 제공자에 따른 서드파티 스크립트 주입
   * @param {string} provider 
   * @param {HTMLElement} container 
   */
  injectWidget(provider, container) {
    try {
      if (provider === 'giscus') {
        this.injectGiscus(container);
      }
    } catch (error) {
      console.warn('[CommentLoader] 서드파티 댓글 스크립트 로드 중 예외 발생:', error);
      this.handleTimeout();
    }
  }

  /**
   * Giscus 스크립트 비동기 생성 및 삽입
   * @param {HTMLElement} container 
   */
  injectGiscus(container) {
    const repo = container.getAttribute('data-repo');
    const repoId = container.getAttribute('data-repo-id');
    const category = container.getAttribute('data-category');
    const categoryId = container.getAttribute('data-category-id');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId || '');
    script.setAttribute('data-category', category || 'Announcements');
    script.setAttribute('data-category-id', categoryId || '');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', currentTheme === 'dark' ? 'dark_dimmed' : 'light');
    script.setAttribute('data-lang', 'ko');
    script.crossOrigin = 'anonymous';
    script.async = true;

    // 로드 성공 이벤트
    script.onload = () => {
      this.isLoaded = true;
      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer);
      }
      const loader = document.getElementById(COMMENT_CONFIG.LOADER_ID);
      if (loader) {
        loader.style.display = 'none';
      }
    };

    // 로드 실패 이벤트
    script.onerror = () => {
      this.handleTimeout();
    };

    container.appendChild(script);
  }

  /**
   * 타임아웃 또는 로드 오류 발생 시 안전한 폴백 UI 표시
   */
  handleTimeout() {
    const loader = document.getElementById(COMMENT_CONFIG.LOADER_ID);
    if (loader) {
      loader.innerHTML = `
        <div class="comments-fallback-message">
          <p>⚠️ 댓글 서비스를 연결할 수 없거나 불러오는 데 시간이 걸리고 있습니다.</p>
          <small>네트워크 상태를 확인하시거나 페이지를 새로고침해 주세요.</small>
        </div>
      `;
    }
  }
}

// DOM 준비 시 로더 실행
document.addEventListener('DOMContentLoaded', () => {
  new CommentLoader();
});
