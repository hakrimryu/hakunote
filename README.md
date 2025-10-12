# HAKU_NOTE

정적 블로그 템플릿입니다. 블로그 글은 log/ 폴더의 마크다운/노트북 파일로 관리하며, 메뉴는 menu/ 폴더의 마크다운으로 구성합니다. 빌드 과정 없이 브라우저에서 바로 동작합니다.

## 빠른 시작

- 로컬에서 미리보기
  - Python: python -m http.server 8000 → http://localhost:8000 열기
  - 또는 폴더를 IDE Live Server로 실행
- 브라우저 캐시가 남아 있으면 변경 사항이 바로 반영되지 않을 수 있으니, 강력 새로고침(캐시 비움)을 권장합니다.

## 폴더 구조

- index.html: 엔트리 HTML
- log/: 블로그 글(마크다운 .md, Jupyter .ipynb)
- menu/: 고정 페이지(소개, About 등) 마크다운
- img/: 이미지 자산(썸네일 포함)
- js/: 클라이언트 스크립트
- style/: 스타일 및 렌더링 보조 스크립트
- data/: 로컬 데이터(JSON) 옵션
- library/: 외부 라이브러리(Highlight.js, Marked 등)
- config.js: 사이트 기본 설정(블로그 제목, 기본 언어 등)

## 글 작성 규칙(파일명 스펙)

기본 스펙(6개 필드):

`
[YYYYMMDD]_[title]_[category]_[thumbnail]_[description]_[author].(md|ipynb)
`

확장 스펙(선택 필드 추가):

`
[YYYYMMDD]_[title]_[category]_[thumbnail]_[description]_[author]_[postId]_[lang].(md|ipynb)
`

- 	humbnail: img/ 폴더 내 파일명(예: 	humb_0001.webp). 이미지 확장자가 아니면 기본 썸네일이 사용됩니다.
- uthor: config.js의 users 배열 인덱스(숫자).
- postId(선택): 동일 글의 다국어/변형을 묶는 고유 ID. 영문/숫자/-/_만 허용.
- lang(선택): ko|en|ja. 언어별 변형 파일에만 지정. 언어 미지정 파일은 모든 언어의 기본(fallback)으로 취급됩니다.

예시(동일 글의 한/일 변형):

`
[20251012]_[Unity6 에서 UGS를사용해보자_00]_[Unity+UGS]_[thumb_0001.webp]_[Unity Gaming Service 소개]_[0]_[ugs-001]_[ko].md
[20251012]_[Unity6でUGSを使ってみよう_00]_[Unity+UGS]_[thumb_0001.webp]_[Unity Gaming Service 紹介]_[0]_[ugs-001]_[ja].md
`

## 다국어(i18n)

- 헤더에 언어 토글 버튼(ko/en/ja)이 있습니다. 선택 언어는 localStorage('hakunote:lang')에 저장됩니다.
- 기본 언어는 config.js의 siteConfig.defaultLanguage(기본값 ko)를 사용합니다.
- 목록/카테고리/검색 결과는 동일 postId 묶음 중 1개만 노출되며, 선택 우선순위는 다음과 같습니다.
  1) 현재 언어
  2) 기본 언어(siteConfig.defaultLanguage, 기본 ko)
  3) 언어 미지정(null)
  4) 그 외 언어(중복 제거 후 [default, 'ko', 'ja', 'en'] 순에서 현재 언어 제외)
- 상세 화면에서 언어를 변경하면 같은 postId의 해당 언어 파일이 있을 경우 해당 파일로 전환합니다. 없으면 기존 화면을 유지합니다.

UI 텍스트 관리(js/i18n.js):

- searchPlaceholder, postsLabel, 	oggleThemeAria, 	oggleLangAria, openFilters, closeFilter, openSearch, openMenu, contentTitle 키를 언어별로 정의합니다.

## 메뉴 관리

- menu/ 폴더에 마크다운 파일을 추가합니다(예: bout.md).
- 메뉴 링크는 런타임에 자동 로드되며, 클릭 시 해당 마크다운을 본문에 렌더링합니다.

## 설정(config.js)

`js
const siteConfig = {
  username: "<your-github>",
  repositoryName: "<your-repo>",
  mainColor: "#3498db",
  textColor: "#333333",
  blogTitle: "HAKU_NOTE",
  defaultLanguage: "ko", // i18n 기본 언어
};

const users = [
  { id: 0, username: "RYU", company: "Ryukuza Studio (Solo Developer)", position: "Game Developer", img: "img/user/profile-haku.png" },
];
`

## 개발 팁

- 캐시로 인한 반영 지연을 피하려면 로컬 서버에서 확인하세요.
- 마크다운 내용에 Base64 이미지가 포함된 경우도 자동 변환됩니다.
- 보안상 토큰/비밀키는 저장소에 포함하지 마세요.
