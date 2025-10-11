const defaultTitle = "WENIVLOG";
// 현재 url 가져와서 parsing (url 스키마는 readme.md 참고)
const url = new URL(window.location.href);
const origin = url.origin + url.pathname;
const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
// console.log(url)
// console.log(pathParts)

// 현재 url이 로컬인지 확인 (127.0.0.1 또는 localhost)
const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";

// 현재 url이 "index.html"로 끝나는지 확인
if (window.location.pathname.endsWith("/index.html")) {
  // "index.html"로 끝나는 경우 제거
  // pathParts에서 "index.html" 제거
  pathParts.pop();
  let newPath = window.location.pathname.replace(/index\.html$/, "");

  // history.replaceState()를 통해 URL 변경
  history.replaceState(null, "", newPath);
}

if (isLocal) {
  // 로컬인 경우

  // 블로그 제목 설정
  const $blogTitle = document.getElementById("blog-title");
  $blogTitle.innerText = siteConfig.blogTitle || defaultTitle;

  // 블로그 제목 설정
  document.title = siteConfig.blogTitle || defaultTitle;

  // 블로그 제목 클릭 시 블로그 리스트 렌더링
  $blogTitle.onclick = () => {
    const mainUrl = new URL(`http://127.0.0.1${url.port ? ":" + url.port : ""}`);
    window.history.pushState({}, "", mainUrl);
    renderBlogList();
  };
} else {
  // github 인 경우

  // config 파일이 없을 경우 추출
  if (!siteConfig.username || !siteConfig.repositoryName) {
    const urlConfig = extractFromUrl();
    siteConfig.username = siteConfig.username || urlConfig.username;
    siteConfig.repositoryName =
      siteConfig.repositoryName || urlConfig.repositoryName;
  }

  // 블로그 제목 설정
  const $blogTitle = document.getElementById("blog-title");
  $blogTitle.innerText = siteConfig.blogTitle || defaultTitle;

  // 블로그 제목 설정
  document.title = siteConfig.blogTitle || defaultTitle;

  // 블로그 제목 클릭 시 블로그 리스트 렌더링
  $blogTitle.onclick = () => {
    const url = new URL(`https://${siteConfig.username}.github.io/${siteConfig.repositoryName}/`);
    window.history.pushState({}, "", url);
    renderBlogList();
  };
}

// 뒤로 가기 이벤트 처리
window.addEventListener("popstate", (event) => {
  // 뒤로 가기 이벤트 처리
  // 1. 뒤로 가기 시 블로그 리스트 렌더링 (/), 뒤로 가기 시 메뉴 렌더링 (/?menu=blog.md) (블로그 리스트 클릭 시 메뉴 렌더링)
  // 2. 뒤로 가기 시 메뉴 렌더링 (/?menu=about.md)
  // 3. 뒤로 가기 시 포스트 렌더링 (/?post=20210601_[제목]_[카테고리]_[썸네일]_[저자].md)

  // 렌더링이 이미 된 것은 category, init, blogList, blogMenu

  // 현재 url 가져옴
  let url = new URL(window.location.href);

  if (!url.search.split("=")[1] || url.search.split("=")[1] === "blog.md") {
    // 블로그 리스트 렌더링
    renderBlogList();
  } else if (url.search.split("=")[0] === "?menu") {
    // 메뉴 렌더링
    // console.log('menu', url.search.split("=")[1])
    document.getElementById("blog-posts").style.display = "none";
    document.getElementById("contents").style.display = "block";
    // console.log(origin + "menu/" + url.search.split("=")[1])
    fetch(origin + "menu/" + url.search.split("=")[1])
      .then((response) => response.text())
      .then((text) => {
        // console.log(text)
        styleMarkdown("menu", text);
      });
  } else if (url.search.split("=")[0] === "?post") {
    // 포스트 렌더링
    if (url.search.split("=")[0] === "?menu") {
      document.getElementById("blog-posts").style.display = "none";
      document.getElementById("contents").style.display = "block";
      fetch(origin + "menu/" + url.search.split("=")[1])
        .then((response) => response.text())
        .then((text) => styleMarkdown("menu", text));
    } else if (url.search.split("=")[0] === "?post") {
      document.getElementById("contents").style.display = "block";
      document.getElementById("blog-posts").style.display = "none";
      const currentUrl = new URL(window.location.href);
      const rawPostParam = currentUrl.searchParams.get("post");
      if (!rawPostParam) {
        return;
      }
      postNameDecode = rawPostParam;
      // console.log(postNameDecode);
      postInfo = extractFileInfo(postNameDecode);
      const encodedPostPath = encodeURI(rawPostParam);
      fetch(origin + "blog/" + encodedPostPath)
        .then((response) => response.text())
        .then((text) =>
          postInfo.fileType === "md"
            ? styleMarkdown("post", text, postInfo)
            : styleJupyter("post", text, postInfo)
        );
    }
  } else {
    alert("잘못된 URL 스키마입니다.");
  }
});
