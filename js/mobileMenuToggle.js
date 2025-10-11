const menuButton = document.getElementById("menu-button");
const menu = document.getElementById("menu");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu() {
  mobileMenu.innerHTML = "";
}

function openMobileMenu() {
  mobileMenu.innerHTML = menu.innerHTML;
  const menuItems = mobileMenu.querySelectorAll("a[data-menu-name]");
  menuItems.forEach((item, index) => {
    item.classList.add(...mobileMenuStyle.split(" "));
    if (index === 0) {
      item.classList.add("mt-1.5");
    }
    item.style.animation = `slideDown forwards ${index * 0.2}s`;
    const menuName = item.getAttribute("data-menu-name");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeMobileMenu();

      const target = document.querySelector(
        `#menu a[data-menu-name="${menuName}"]`
      );
      if (target) {
        target.click();
        return;
      }

      if (menuName === "blog.md") {
        if (blogList.length === 0) {
          initDataBlogList().then(() => {
            renderBlogList();
          });
        } else {
          renderBlogList();
        }
      } else {
        renderOtherContents(menuName);
      }
    });
  });
}

menuButton.addEventListener("click", (event) => {
  event.stopPropagation();
  if (mobileMenu.innerHTML === "") {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
});

window.addEventListener("click", () => {
  closeMobileMenu();
});
