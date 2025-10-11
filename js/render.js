const categoryKeyDelimiter = window.CATEGORY_KEY_DELIMITER || "::";
const categoryUntaggedKey = window.CATEGORY_UNTAGGED_KEY || "__untagged__";

function search(keyword, kinds) {
  /*
    트러블슈팅: 실제 데이터가 없을 경우 API 호출을 한 번 실행.
    1. 블로그 리스트 검색 버튼 클릭 시 블로그 리스트 렌더링
    2. 카테고리 검색 버튼 클릭 시 카테고리 렌더링
    */
  const hasKeyword = typeof keyword === "string";
  const trimmedKeyword = hasKeyword ? keyword.trim() : "";
  const lowerKeyword = trimmedKeyword.toLowerCase();

  if (blogList.length === 0) {
    if (isInitData === false) {
      // 블로그 리스트 초기화
      initDataBlogList().then(() => {
        search(keyword, kinds);
      });
      return;
    }
  } else {
    if (!hasKeyword || (!trimmedKeyword && kinds !== "category")) {
      const searchInput = document.getElementById("search-input");
      const searchKeyword = searchInput.value.toLowerCase(); // 검색 키워드
      const searchResult = blogList.filter((post) => {
        // 검색 키워드가 포함된 블로그 리스트 필터링
        if (post.name.toLowerCase().includes(searchKeyword)) {
          return post;
        }
      });
      renderBlogList(searchResult);
    } else {
      // 카테고리 검색 버튼 클릭 시 카테고리 렌더링
      if (kinds) {
        if (kinds === "category") {
          const targetKey = trimmedKeyword || categoryUntaggedKey;
          const searchResult = blogList.filter((post) => {
            const postInfo = extractFileInfo(post.name);
            if (!postInfo) {
              return false;
            }
            const postKey = postInfo.categoryKey || categoryUntaggedKey;
            if (targetKey === categoryUntaggedKey) {
              return postKey === categoryUntaggedKey;
            }
            if (postKey === targetKey) {
              return true;
            }
            return postKey.startsWith(`${targetKey}${categoryKeyDelimiter}`);
          });
          renderBlogList(searchResult);
        } else {
          renderBlogList();
        }
      } else {
        const searchKeyword = lowerKeyword;
        const searchResult = blogList.filter((post) => {
          // 검색 키워드가 포함된 블로그 리스트 필터링
          if (post.name.toLowerCase().includes(searchKeyword)) {
            return post;
          }
        });
        // 검색 결과 렌더링
        renderBlogList(searchResult);
      }
    }
  }
}
const mobileFilterOpenButton = document.getElementById("mobile-filter-open");
const mobileFilterCloseButton = document.getElementById("mobile-filter-close");
const mobileOverlay = document.getElementById("mobile-category-overlay");
const mobileBackdrop = document.getElementById("mobile-category-backdrop");
const mobileSheet = document.getElementById("mobile-category-sheet");
const mobileCategoryList = document.getElementById("mobile-category-list");
const categoryWrapper = document.querySelector(".category-aside");
const categoryContainer = categoryWrapper?.querySelector("aside");
const desktopCategoryList = document.getElementById("desktop-category-list");
const categoryTitle = categoryWrapper?.querySelector(".aside-tit");
const categoryToggleButton = document.getElementById("aside-button");
const activeFilterBanner = document.getElementById("active-filter-banner");
const activeFilterText = document.getElementById("active-filter-text");
const activeFilterClear = document.getElementById("active-filter-clear");

let activeCategoryKey = null;
let categoryCounts = Object.create(null);

function updateActiveFilterBanner(label, count) {
  if (!activeFilterBanner || !activeFilterText) {
    return;
  }

  if (label) {
    activeFilterBanner.classList.remove("hidden");
    const countText =
      typeof count === "number" && !Number.isNaN(count)
        ? `${label} (${count} posts)`
        : label;
    activeFilterText.textContent = countText;
  } else {
    activeFilterBanner.classList.add("hidden");
    activeFilterText.textContent = "";
  }
}

if (activeFilterClear) {
  activeFilterClear.addEventListener("click", () => {
    activeCategoryKey = null;
    updateActiveFilterBanner(null);
    search("");
  });
}

const originalSearch = search;

function filteredSearch(keyword, kinds) {
  const trimmedKeyword = typeof keyword === "string" ? keyword.trim() : "";

  if (!trimmedKeyword && !kinds) {
    activeCategoryKey = null;
    updateActiveFilterBanner(null);
  }

  if (kinds === "category") {
    const info = categoryCounts[trimmedKeyword];
    const displayLabel = info?.fullLabel ?? info?.label ?? keyword;
    const displayCount = info?.count;
    activeCategoryKey = trimmedKeyword || null;
    updateActiveFilterBanner(displayLabel, displayCount);
  } else if (!kinds && trimmedKeyword) {
    activeCategoryKey = null;
    updateActiveFilterBanner(null);
  }

  originalSearch(keyword, kinds);
}

search = filteredSearch;

async function renderMenu() {
  /* 
    1. 블로그 리스트 렌더링
    2. 메뉴 상세 정보 렌더링
    */
  blogMenu.forEach((menu) => {
    // 메뉴 상세 정보 렌더링
    const link = document.createElement("a");

    // (static) index.html: <div id="contents" class="mt-6 grid-cols-3"></div>
    link.classList.add(...menuListStyle.split(" "));
    link.classList.add(`${menu.name}`);

    link.href = menu.download_url;
    link.setAttribute("data-menu-name", menu.name);
    // 메뉴 이름 추출
    const menuName = menu.name.split(".")[0];
    link.innerText = menuName;

    link.onclick = (event) => {
      // 메뉴 상세 정보 렌더링
      event.preventDefault();

      if (menu.name === "blog.md") {
        if (blogList.length === 0) {
          // 블로그 리스트 초기화
          initDataBlogList().then(() => {
            renderBlogList();
          });
        } else {
          renderBlogList();
        }
        const url = new URL(origin);
        url.searchParams.set("menu", menu.name);
        window.history.pushState({}, "", url);
      } else {
        renderOtherContents(menu);
      }
    };
    document.getElementById("menu").appendChild(link);
  });

  // 검색 버튼 클릭 시 검색 결과 렌더링
  const searchButton = document.getElementById("search-button");
  const searchCont = document.querySelector(".search-cont");

  let searchInputShow = false;

  window.addEventListener("click", (event) => {
    // 검색 버튼 클릭 시 검색 결과 렌더링
    if (window.innerWidth <= 768) {
      if (event.target == searchButton) {
        searchInputShow = !searchInputShow;
        if (searchInputShow) {
          searchButton.classList.add("active");
          searchCont.classList.remove("hidden");
          searchCont.classList.add("block");
        } else {
          searchButton.classList.remove("active");
          searchCont.classList.add("hidden");
          searchInputShow = false;
        }
      } else if (event.target == searchCont) {
      } else {
        searchButton.classList.remove("active");
        searchCont.classList.add("hidden");
        searchInputShow = false;
      }
    }
  });

  window.addEventListener("resize", (event) => {
    if (window.innerWidth > 768) {
      searchButton.classList.add("active");
      searchCont.classList.remove("hidden");
      searchInputShow = true;
    } else {
      searchButton.classList.remove("active");
      searchCont.classList.add("hidden");
    }
  });

  const searchInput = document.getElementById("search-input");
  searchInput.onkeyup = (event) => {
    if (event.key === "Enter") {
      // 검색 버튼 클릭 시 검색 결과 렌더링
      search();
    }
  };

  searchInput.onclick = (event) => {
    event.stopPropagation();
  };

  const searchInputButton = document.querySelector(".search-inp-btn");
  searchInputButton.onclick = (event) => {
    event.stopPropagation();
    search();
  };

  const resetInputButton = document.querySelector(".reset-inp-btn");
  searchInput.addEventListener("input", () => {
    // 검색 키워드 입력 시 검색 결과 렌더링
    if (searchInput.value) {
      resetInputButton.classList.remove("hidden");
    } else {
      resetInputButton.classList.add("hidden");
    }
  });
  resetInputButton.addEventListener("click", (event) => {
    event.stopPropagation();
    searchInput.value = "";
    resetInputButton.classList.add("hidden");
  });
}

function createCardElement(fileInfo, index) {
  /*
    fileInfo를 통해 bloglist card 요소를 생성하고 index를 통해 첫 번째 카드와 나머지 카드를 구분
    */
  const card = document.createElement("div");
  if (index === 0) {
    card.classList.add(...bloglistFirstCardStyle.split(" "));
  } else {
    card.classList.add(...bloglistCardStyle.split(" "));
  }

  if (fileInfo.thumbnail) {
    const img = document.createElement("img");
    img.src = fileInfo.thumbnail;
    img.alt = fileInfo.title;
    if (index === 0) {
      img.classList.add(...bloglistFirstCardImgStyle.split(" "));
    } else {
      img.classList.add(...bloglistCardImgStyle.split(" "));
    }
    card.appendChild(img);
  }

  const cardBody = document.createElement("div");
  cardBody.classList.add(...bloglistCardBodyStyle.split(" "));

  const category = document.createElement("span");
  category.classList.add(...bloglistCardCategoryStyle.split(" "));
  category.textContent =
    fileInfo.category || window.CATEGORY_UNTAGGED_LABEL || "Uncategorized";
  if (fileInfo.category) {
    category.title = fileInfo.category;
  }
  if (fileInfo.categoryKey) {
    category.dataset.categoryKey = fileInfo.categoryKey;
  }
  cardBody.appendChild(category);

  // 카테고리 클릭 시 해당 카테고리로 검색
  category.onclick = (event) => {
    // 카테고리 클릭 시 해당 카테고리로 검색
    event.stopPropagation();
    const targetKey = fileInfo.categoryKey || categoryUntaggedKey;
    search(targetKey, "category");
  };

  const title = document.createElement("h2");
  title.classList.add(...bloglistCardTitleStyle.split(" "));
  title.textContent = fileInfo.title;
  cardBody.appendChild(title);

  const description = document.createElement("p");
  if (index == 0) {
    description.classList.add(...bloglistFirstCardDescriptionStyle.split(" "));
  } else {
    description.classList.add(...bloglistCardDescriptionStyle.split(" "));
  }
  description.textContent = fileInfo.description;
  cardBody.appendChild(description);

  const authorDiv = document.createElement("div");
  authorDiv.classList.add(...bloglistCardAuthorDivStyle.split(" "));
  cardBody.appendChild(authorDiv);

  const authorImg = document.createElement("img");
  authorImg.src = users[fileInfo.author]["img"];
  authorImg.alt = users[fileInfo.author]["username"];
  authorImg.classList.add(...bloglistCardAuthorImgStyle.split(" "));
  authorDiv.appendChild(authorImg);

  const author = document.createElement("p");
  author.classList.add(...bloglistCardAuthorStyle.split(" "));
  author.textContent = users[fileInfo.author]["username"];
  authorDiv.appendChild(author);

  const date = document.createElement("p");
  date.classList.add(...bloglistCardDateStyle.split(" "));
  date.textContent = formatDate(fileInfo.date);
  cardBody.appendChild(date);

  card.appendChild(cardBody);

  return card;
}

function renderBlogList(searchResult = null, currentPage = 1) {
  /*
    bloglist 목록 렌더링
    1. 블로그 리스트 초기화
    2. 검색 결과가 있을 경우 검색 결과 렌더링
    */
  const pageUnit = 10;

  if (searchResult) {
    // 검색 결과가 있을 경우 검색 결과 렌더링
    document.getElementById("blog-posts").style.display = "grid";
    document.getElementById("blog-posts").innerHTML = "";

    const totalPage = Math.ceil(searchResult.length / pageUnit);
    initPagination(totalPage);
    renderPagination(totalPage, 1, searchResult);

    const startIndex = (currentPage - 1) * pageUnit;
    const endIndex = currentPage * pageUnit;
    searchResult.slice(startIndex, endIndex).forEach((post, index) => {
      const postInfo = extractFileInfo(post.name);
      if (postInfo) {
        const cardElement = createCardElement(postInfo, index);

        cardElement.onclick = (event) => {
          // 카드 클릭 시 카드 상세 정보 렌더링
          event.preventDefault();
          // contents 영역 보이기
          document.getElementById("contents").style.display = "block";
          // blog-posts 영역 숨기기
          document.getElementById("blog-posts").style.display = "none";
          document.getElementById("pagination").style.display = "none";
          fetch(post.download_url)
            .then((response) => response.text())
            .then((text) =>
              postInfo.fileType === "md"
                ? styleMarkdown("post", text, postInfo)
                : styleJupyter("post", text, postInfo)
            )
            .then(() => {
              // URL 쿼리 스트링 설정
              const url = new URL(origin);
              url.searchParams.set("post", post.name);
              window.history.pushState({}, "", url);
            });
        };
        document.getElementById("blog-posts").appendChild(cardElement);
      }
    });
    // contents 영역 숨기기
    document.getElementById("contents").style.display = "none";
  } else {
    // 검색 결과가 없을 경우 블로그 리스트 렌더링
    document.getElementById("blog-posts").style.display = "grid";
    document.getElementById("pagination").style.display = "flex";
    document.getElementById("blog-posts").innerHTML = "";

    const totalPage = Math.ceil(blogList.length / pageUnit);
    initPagination(totalPage);
    renderPagination(totalPage, 1);

    const startIndex = (currentPage - 1) * pageUnit;
    const endIndex = currentPage * pageUnit;

    // blogList 목록 렌더링
    blogList.slice(startIndex, endIndex).forEach((post, index) => {
      const postInfo = extractFileInfo(post.name);
      if (postInfo) {
        // 카드 생성
        const cardElement = createCardElement(postInfo, index);

        cardElement.onclick = (event) => {
          // 카드 클릭 시 카드 상세 정보 렌더링
          event.preventDefault();
          // contents 영역 보이기
          document.getElementById("contents").style.display = "block";
          // blog-posts 영역 숨기기
          document.getElementById("blog-posts").style.display = "none";
          document.getElementById("pagination").style.display = "none";

          // 카드 생성
          // console.log(post.download_url)
          let postDownloadUrl;
          if (!isLocal && localDataUsing) {
            postDownloadUrl = `${url.origin}/${siteConfig.repositoryName}${post.download_url}`;
          } else {
            postDownloadUrl = post.download_url;
          }
          try {
            fetch(postDownloadUrl)
              .then((response) => response.text())
              .then((text) =>
                postInfo.fileType === "md"
                  ? styleMarkdown("post", text, postInfo)
                  : styleJupyter("post", text, postInfo)
              )
              .then(() => {
                // URL
                const url = new URL(origin);
                url.searchParams.set("post", post.name);
                window.history.pushState({}, "", url);
              });
          } catch (error) {
            styleMarkdown("post", "# Error: 포스트 로딩 실패");
          }
        };
        document.getElementById("blog-posts").appendChild(cardElement);
      }
    });

    // contents 영역 숨기기
    document.getElementById("contents").style.display = "none";
  }
}

function renderOtherContents(menu) {
  /*
    menu 정보를 통해 메뉴 상세 정보 렌더링
    */
  // blog.md 클릭 시 메뉴 상세 정보 렌더링
  document.getElementById("blog-posts").style.display = "none";
  document.getElementById("contents").style.display = "block";

  // menu 정보 추출
  if (typeof menu === "string") {
    menu = {
      download_url: origin + "menu/" + menu,
      name: menu.split("/")[menu.split("/").length - 1],
    };
  }
  // 메뉴 정보 추출
  // console.log(menu.download_url)
  let menuDownloadUrl;
  if (!isLocal && localDataUsing) {
    menuDownloadUrl =
      menu.download_url = `${url.origin}/${siteConfig.repositoryName}${menu.download_url}`;
  } else {
    menuDownloadUrl = menu.download_url;
  }
  try {
    fetch(menuDownloadUrl)
      .then((response) => response.text())
      .then((text) => styleMarkdown("menu", text, undefined))
      .then(() => {
        // URL 쿼리 스트링 설정
        const url = new URL(origin);
        url.searchParams.set("menu", menu.name);
        window.history.pushState({}, "", url);
      });
  } catch (error) {
    styleMarkdown("menu", "# Error: 메뉴 로딩 실패", undefined);
  }
}

function renderBlogCategory() {
  const root = {
    children: new Map(),
  };
  let untaggedCount = 0;

  if (categoryContainer) {
    categoryContainer.classList.add(...categoryContainerStyle.split(" "));
  }

  blogList.forEach((post) => {
    const info = extractFileInfo(post.name);
    if (!info) {
      return;
    }

    const rawTags = Array.isArray(info.tags) ? info.tags : [];
    const cleanedTags = rawTags
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter((tag) => tag.length > 0);

    if (cleanedTags.length === 0) {
      untaggedCount += 1;
      return;
    }

    let node = root;
    const pathAccumulator = [];

    cleanedTags.forEach((tag) => {
      pathAccumulator.push(tag);
      const key =
        typeof window.normalizeCategoryKey === "function"
          ? window.normalizeCategoryKey(pathAccumulator)
          : pathAccumulator
              .map((part) => part.trim().toLowerCase())
              .join(categoryKeyDelimiter);

      if (!node.children.has(key)) {
        node.children.set(key, {
          key,
          label: tag,
          path: pathAccumulator.slice(),
          fullLabel: pathAccumulator.join(" / "),
          count: 0,
          children: new Map(),
        });
      }

      const nextNode = node.children.get(key);
      nextNode.count += 1;
      node = nextNode;
    });
  });

  const flattenTree = (node, depth = 0) => {
    const entries = [];
    const nodes = Array.from(node.children.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "ko")
    );

    nodes.forEach((child) => {
      entries.push({
        key: child.key,
        label: child.label,
        fullLabel: child.fullLabel,
        count: child.count,
        depth,
        path: child.path.slice(),
      });
      entries.push(...flattenTree(child, depth + 1));
    });

    return entries;
  };

  const categories = flattenTree(root, 0);

  if (untaggedCount > 0) {
    categories.push({
      key: categoryUntaggedKey,
      label: window.CATEGORY_UNTAGGED_LABEL || "Uncategorized",
      fullLabel: window.CATEGORY_UNTAGGED_LABEL || "Uncategorized",
      count: untaggedCount,
      depth: 0,
    });
  }

  categories.unshift({
    key: null,
    label: "All",
    fullLabel: "All",
    count: blogList.length,
    isAll: true,
    depth: 0,
  });

  categoryCounts = Object.create(null);
  categories.forEach((cat) => {
    if (!cat.isAll && cat.key) {
      categoryCounts[cat.key] = cat;
    }
  });

  if (desktopCategoryList) {
    desktopCategoryList.innerHTML = "";
  }
  if (mobileCategoryList) {
    mobileCategoryList.innerHTML = "";
  }

  const closeMobile = () => {
    if (!mobileOverlay || !mobileSheet) return;
    mobileSheet.classList.add("translate-y-full");
    setTimeout(() => {
      mobileOverlay.classList.add("hidden");
    }, 250);
  };

  const openMobile = () => {
    if (!mobileOverlay || !mobileSheet) return;
    mobileOverlay.classList.remove("hidden");
    requestAnimationFrame(() => {
      mobileSheet.classList.remove("translate-y-full");
    });
  };

  const handleSelect = (category) => {
    if (category.isAll) {
      activeCategoryKey = null;
      updateActiveFilterBanner(null);
      closeMobile();
      search("");
      return;
    }

    activeCategoryKey = category.key;
    updateActiveFilterBanner(category.fullLabel, category.count);
    closeMobile();
    search(category.key, "category");
  };

  const baseDesktopPadding = 20;
  const desktopIndent = 14;
  const mobileIndent = 12;

  categories.forEach((category) => {
    const isActive = category.isAll
      ? !activeCategoryKey
      : activeCategoryKey === category.key;

    if (desktopCategoryList) {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add(...categoryItemStyle.split(" "));
      button.classList.add("flex", "items-center", "justify-between", "gap-3", "w-full");
      if (isActive) {
        button.classList.add(
          "border-primary",
          "text-primary",
          "bg-primary/10",
          "dark:border-cyan-400",
          "dark:text-cyan-200",
          "dark:bg-cyan-500/10"
        );
      }
      if (!category.isAll && category.depth > 0) {
        button.style.paddingLeft = `${baseDesktopPadding + category.depth * desktopIndent}px`;
      }
      button.addEventListener("click", () => handleSelect(category));

      const labelSpan = document.createElement("span");
      labelSpan.className = "flex-1 text-left";
      labelSpan.textContent = category.depth > 0
        ? `↳ ${category.fullLabel}`
        : category.fullLabel;
      button.appendChild(labelSpan);

      const badge = document.createElement("span");
      badge.classList.add(...categoryItemCountStyle.split(" "));
      badge.textContent = `(${category.count})`;
      button.appendChild(badge);

      desktopCategoryList.appendChild(button);
    }

    if (mobileCategoryList) {
      const item = document.createElement("button");
      item.type = "button";
      item.className =
        "w-full flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-200 bg-white/80 dark:bg-slate-900/70 hover:border-primary hover:text-primary dark:hover:border-cyan-400 transition-colors";
      if (isActive) {
        item.classList.add(
          "border-primary",
          "text-primary",
          "bg-primary/10",
          "dark:border-cyan-400",
          "dark:text-cyan-200",
          "dark:bg-cyan-500/10"
        );
      }
      if (!category.isAll && category.depth > 0) {
        item.style.paddingLeft = `${16 + category.depth * mobileIndent}px`;
      }

      const labelSpan = document.createElement("span");
      labelSpan.className = "flex-1 text-left";
      labelSpan.textContent = category.depth > 0
        ? `↳ ${category.fullLabel}`
        : category.fullLabel;
      item.appendChild(labelSpan);

      const badge = document.createElement("span");
      badge.className =
        "ml-4 inline-flex items-center justify-center rounded-full bg-slate-200/70 dark:bg-slate-800/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-200";
      badge.textContent = category.count;
      item.appendChild(badge);
      item.addEventListener("click", () => handleSelect(category));
      mobileCategoryList.appendChild(item);
    }
  });

  if (mobileFilterOpenButton && !mobileFilterOpenButton.dataset.bound) {
    mobileFilterOpenButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openMobile();
    });
    mobileFilterOpenButton.dataset.bound = "true";
  }

  if (mobileFilterCloseButton && !mobileFilterCloseButton.dataset.bound) {
    mobileFilterCloseButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeMobile();
    });
    mobileFilterCloseButton.dataset.bound = "true";
  }

  if (mobileBackdrop && !mobileBackdrop.dataset.bound) {
    mobileBackdrop.addEventListener("click", closeMobile);
    mobileBackdrop.dataset.bound = "true";
  }

  if (mobileOverlay && !mobileOverlay.dataset.escapeBound) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileOverlay.classList.contains("hidden")) {
        closeMobile();
      }
    });
    mobileOverlay.dataset.escapeBound = "true";
  }

  if (categoryWrapper && categoryToggleButton && !categoryToggleButton.dataset.bound) {
    const toggleDesktopPanel = () => {
      if (categoryWrapper.classList.contains("active")) {
        categoryWrapper.classList.remove("active");
        categoryTitle?.classList.add("sr-only");
        categoryContainer?.classList.remove("md:flex");
      } else {
        categoryWrapper.classList.add("active");
        categoryTitle?.classList.remove("sr-only");
        categoryContainer?.classList.add("md:flex");
      }
    };

    categoryToggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDesktopPanel();
    });

    document.addEventListener("click", (event) => {
      if (
        categoryWrapper.classList.contains("active") &&
        !categoryWrapper.contains(event.target)
      ) {
        categoryWrapper.classList.remove("active");
        categoryTitle?.classList.add("sr-only");
        categoryContainer?.classList.remove("md:flex");
      }
    });

    categoryToggleButton.dataset.bound = "true";
  }
}
function initPagination(totalPage) {
  const pagination = document.getElementById("pagination");

  pagination.style.display = "flex";

  pagination.classList.add(...paginationStyle.split(" "));

  const prevButton = document.createElement("button");
  prevButton.setAttribute("id", "page-prev");
  prevButton.classList.add(...pageMoveButtonStyle.split(" "));
  const pageNav =
    pagination.querySelector("nav") || document.createElement("nav");
  pageNav.innerHTML = "";

  pageNav.setAttribute("id", "pagination-list");
  pageNav.classList.add(...pageNumberListStyle.split(" "));
  const docFrag = document.createDocumentFragment();
  for (let i = 0; i < totalPage; i++) {
    if (i === 7) {
      break;
    }

    const page = document.createElement("button");
    page.classList.add(...pageNumberStyle.split(" "));
    docFrag.appendChild(page);
  }
  pageNav.appendChild(docFrag);

  const nextButton = document.createElement("button");
  nextButton.setAttribute("id", "page-next");
  nextButton.classList.add(...pageMoveButtonStyle.split(" "));

  if (!pagination.innerHTML) {
    pagination.append(prevButton, pageNav, nextButton);
  }
  if (totalPage <= 1) {
    pagination.style.display = "none";
    return;
  }
}

function renderPagination(totalPage, currentPage, targetList = null) {
  const prevButton = document.getElementById("page-prev");
  const nextButton = document.getElementById("page-next");
  if (currentPage === 1) {
    prevButton.setAttribute("disabled", true);
    nextButton.removeAttribute("disabled");
  } else if (currentPage === totalPage) {
    nextButton.setAttribute("disabled", true);
    prevButton.removeAttribute("disabled");
  } else {
    prevButton.removeAttribute("disabled");
    nextButton.removeAttribute("disabled");
  }
  prevButton.onclick = (event) => {
    event.preventDefault();
    renderBlogList(targetList, currentPage - 1);
    renderPagination(totalPage, currentPage - 1, targetList);
  };
  nextButton.onclick = (event) => {
    event.preventDefault();
    renderBlogList(targetList, currentPage + 1);
    renderPagination(totalPage, currentPage + 1, targetList);
  };

  const pageNav = document.querySelector("#pagination nav");
  const pageList = pageNav.querySelectorAll("button");

  if (totalPage <= 7) {
    pageList.forEach((page, index) => {
      page.textContent = index + 1;
      if (index + 1 === currentPage) {
        page.classList.remove("font-normal");
        page.classList.add(...pageNumberActiveStyle.split(" "));
      } else {
        page.classList.remove(...pageNumberActiveStyle.split(" "));
        page.classList.add("font-normal");
      }
      page.onclick = (event) => {
        renderBlogList(targetList, index + 1);
        renderPagination(totalPage, index + 1, targetList);
      };
    });
  } else {
    if (currentPage <= 4) {
      ellipsisPagination(
        pageList,
        [1, 2, 3, 4, 5, "...", totalPage],
        targetList
      );
    } else if (currentPage > totalPage - 4) {
      ellipsisPagination(
        pageList,
        [
          1,
          "...",
          totalPage - 4,
          totalPage - 3,
          totalPage - 2,
          totalPage - 1,
          totalPage,
        ],
        targetList
      );
    } else {
      ellipsisPagination(
        pageList,
        [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPage,
        ],
        targetList
      );
    }
  }

  function ellipsisPagination(pageList, indexList, targetList = null) {
    pageList.forEach((page, index) => {
      page.textContent = indexList[index];
      if (indexList[index] === currentPage) {
        page.classList.remove("font-normal");
        page.classList.add(...pageNumberActiveStyle.split(" "));
      } else {
        page.classList.remove(...pageNumberActiveStyle.split(" "));
        page.classList.add("font-normal");
      }
      if (indexList[index] === "...") {
        page.style.pointerEvents = "none";
        page.onclick = (event) => {
          event.preventDefault();
        };
      } else {
        page.style.pointerEvents = "all";

        page.onclick = (event) => {
          renderPagination(totalPage, indexList[index], targetList);
        };
      }
    });
  }
}

async function initialize() {
  /*
    초기화 함수, URLparsing 함수를 통해 초기화 된 데이터를 통해 렌더링
    
    TODO: URL 쿼리 스트링 값이 있을 경우 메뉴 로딩, 블로그 리스트 로딩, 카테고리 로딩
    */
  if (!url.search.split("=")[1] || url.search.split("=")[1] === "blog.md") {
    // 메뉴 로딩
    await initDataBlogMenu();
    renderMenu();

    // 블로그 리스트 로딩
    await initDataBlogList();
    renderBlogList();

    // 카테고리 로딩
    renderBlogCategory();
  } else {
    // 메뉴 로딩
    await initDataBlogMenu();
    renderMenu();

    // 블로그 리스트 로딩
    if (url.search.split("=")[0] === "?menu") {
      document.getElementById("blog-posts").style.display = "none";
      document.getElementById("contents").style.display = "block";
      try {
        fetch(origin + "menu/" + url.search.split("=")[1])
          .then((response) => response.text())
          .then((text) => styleMarkdown("menu", text))
          .then(() => {
            // URL 쿼리 스트링 설정
            const url = new URL(window.location.href);
            window.history.pushState({}, "", url);
          });
      } catch (error) {
        styleMarkdown("menu", "# Error: 메뉴 로딩 실패");
      }
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
      try {
        const encodedPostPath = encodeURI(rawPostParam);
        fetch(origin + "blog/" + encodedPostPath)
          .then((response) => response.text())
          .then((text) =>
            postInfo.fileType === "md"
              ? styleMarkdown("post", text, postInfo)
              : styleJupyter("post", text, postInfo)
          )
          .then(() => {
            // URL 쿼리 스트링 설정
            const url = new URL(window.location.href);
            window.history.pushState({}, "", url);
          });
      } catch (error) {
        styleMarkdown("post", "# Error: 포스트 로딩 실패");
      }
    }
  }
}

initialize();

