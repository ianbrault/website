/*
 * src/js/onPageLoad.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

const navLinks = document.getElementsByClassName("nav-item");

const updateNavLinks = (href) => {
    for (let i = 0; i < navLinks.length; i++) {
        if (href === navLinks[i].href)
            navLinks[i].classList.add("nav-item--active");
    }
};

updateNavLinks(window.location.href);

/*** CLICK EFFECTS ***/

const createClickHalo = (event) => {
    const halo = document.createElement("div");
    halo.className = "click-halo";
    halo.style.top = event.pageY + "px";
    halo.style.left = event.pageX + "px";
    return halo;
};

document.addEventListener("click", (event) => {
    const halo = createClickHalo(event);
    document.body.appendChild(halo);
    setTimeout(() => document.body.removeChild(halo), 720);
});
