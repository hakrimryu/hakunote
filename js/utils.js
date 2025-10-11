function extractFromUrl() {
  // URLparsing.js에서 사용
  // URL에서 username과 repositoryName 추출
  const url = new URL(window.location.href);

  // 호스트 이름에서 username 추출
  // 예: "weniv.github.io"에서 "weniv" 추출
  const hostnameParts = url.hostname.split(".");
  const username = hostnameParts.length > 2 ? hostnameParts[0] : "";

  // pathname을 사용하여 repositoryName 추출
  // 예: "/reponame"에서 "reponame" 추출
  const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
  const repositoryName = pathParts.length > 0 ? pathParts[0] : "";

  return {
    username: username,
    repositoryName: repositoryName,
  };
}

const CATEGORY_KEY_DELIMITER = "::";
const CATEGORY_UNTAGGED_KEY = "__untagged__";
const CATEGORY_UNTAGGED_LABEL = "\uBD84\uB958 \uC5C6\uC74C";

function normalizeCategoryKey(pathParts) {
  if (!Array.isArray(pathParts) || pathParts.length === 0) {
    return CATEGORY_UNTAGGED_KEY;
  }

  return pathParts
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0)
    .join(CATEGORY_KEY_DELIMITER);
}

function parseCategoryField(rawValue) {
  if (!rawValue) {
    return [];
  }

  const trimmed = rawValue.trim();
  if (!trimmed) {
    return [];
  }

  const normalizedHier = trimmed.replace(/[+~>]/g, "/");

  if (
    (normalizedHier.startsWith("[") && normalizedHier.endsWith("]")) ||
    (normalizedHier.startsWith("{") && normalizedHier.endsWith("}"))
  ) {
    try {
      const parsed = JSON.parse(normalizedHier);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter((item) => item.length > 0);
      }
    } catch (error) {
      // ignore
    }
  }

  const separators = ["|", "/", ","];
  for (let i = 0; i < separators.length; i += 1) {
    const separator = separators[i];
    if (normalizedHier.includes(separator)) {
      return normalizedHier
        .split(separator)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
    }
  }

  return [normalizedHier];
}

window.CATEGORY_KEY_DELIMITER = CATEGORY_KEY_DELIMITER;
window.CATEGORY_UNTAGGED_KEY = CATEGORY_UNTAGGED_KEY;
window.CATEGORY_UNTAGGED_LABEL = CATEGORY_UNTAGGED_LABEL;
window.normalizeCategoryKey = normalizeCategoryKey;
window.parseCategoryField = parseCategoryField;

function convertSourceToImage(source) {
  // convertIpynbToHtml.js에서 사용
  // Base64 이미지 데이터 식별을 위한 정규 표현식
  const base64ImageRegex = /!\[.*?\]\(data:image\/(png|jpeg);base64,(.*?)\)/g;

  // 이미지 데이터를 찾고, 각 매치에 대해 이미지 태그 생성
  return source.replace(base64ImageRegex, (match, fileType, imageData) => {
    return `<img src="data:image/${fileType};base64,${imageData}" alt="Embedded Image" />`;
  });
}

function escapeHtml(text) {
  // convertIpynbToHtml.js에서 사용
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractFileInfo(filename) {
  // render.js에서 사용
  // 파일 이름에서 정보 추출하는 함수

  // 정규 표현식을 사용하여 날짜, 제목, 카테고리, 썸네일, 저자 정보 추출
  const regex =
    /^\[(\d{8})\]_\[(.*?)\]_\[(.*?)\]_\[(.*?)\]_\[(.*?)\]_\[(.*?)\].(md|ipynb)$/;
  const matches = filename.match(regex);
  // console.log(`extractFileInfo: ${matches}`);

  if (matches) {
    const tags = parseCategoryField(matches[3]);
    const tagPath = tags.length > 0 ? tags : [];
    const categoryKey = normalizeCategoryKey(tagPath);
    const categoryLabel =
      tagPath.length > 0 ? tagPath.join(" / ") : CATEGORY_UNTAGGED_LABEL;

    return {
      date: matches[1],
      title: matches[2],
      category: categoryLabel,
      tags: tagPath,
      categoryKey,
      categoryRaw: matches[3],
      thumbnail: matches[4]
        ? "img/" + matches[4]
        : `img/thumb${Math.floor(Math.random() * 10) + 1}.webp`,
      // description: matches[5].length > 25 ? matches[5].substring(0, 25) + '...' : matches[5],
      description: matches[5],
      author: matches[6] ? parseInt(matches[6]) : 0,
      fileType: matches[7],
    };
  }
  return null;
}

function formatDate(dateString) {
  // render.js에서 사용
  // YYYYMMDD 형식의 문자열을 받아 YYYY/MM/DD 형식으로 변환
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  return `${year}/${month}/${day}`;
}
