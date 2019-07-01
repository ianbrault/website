/*
 * src/index.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

// PAGE TRANSITIONS

const pageTime = 320; // ms
const navLinks = document.getElementsByClassName("nav-item");

const getSectionFromHref = (href) => {
    let target = href.slice(href.lastIndexOf("#"));
    if (target === "#")
        target = "#home";

    return document.querySelector("section" + target);
};

const updateNavLinks = (href) => {
    for (let i = 0; i < navLinks.length; i++) {
        if (href === navLinks[i].href)
            navLinks[i].classList.add("nav-item--active");
        else
            navLinks[i].classList.remove("nav-item--active");
    }
};

const pageOut = (href) => {
    let section = getSectionFromHref(href);
    // fade page out
    section.classList.add("page-out");
    // after fade-out, remove from DOM and remove fade class
    setTimeout(() => {
        section.style.display = "none";
        section.classList.remove("page-out");
    }, pageTime - 32);
};

const pageIn = (href) => {
    let section = getSectionFromHref(href);
    // wait for previous page to fade out, then fade-in and add to DOM
    setTimeout(() => {
        section.classList.add("page-in");
        section.style.display = "flex";
    }, pageTime);
    setTimeout(() => section.classList.remove("page-in"), pageTime * 2);
};

const navigate = (href) => {
    updateNavLinks(href);
    pageOut(window.location.href);
    pageIn(href);
};

const aEvent = (event) => {
    event.stopPropagation();
    navigate(event.target.href);
};

document.getElementById("icon-link").addEventListener("click", aEvent);
for (let i = 0; i < navLinks.length; i++)
    navLinks[i].addEventListener("click", aEvent);

// handle any initial target in page load
updateNavLinks(window.location.href);
pageIn(window.location.href);

// CLICK EFFECTS

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
    setTimeout(() => {
        document.body.removeChild(halo);
    }, 720);
});

// LOGO EFFECTS

/* global Snap */
const logo = Snap("#logo");
const wireColor = "#ffd700";

function getRandomWire() {
    const nWires = 23;  // from p1 to p23

    let min = 1;
    let max = nWires;
    let rand = Math.floor(Math.random() * (max - min + 1)) + min;

    return "#p" + rand;
}

setInterval(() => {
    let wire = logo.select(getRandomWire());
    Snap.animate(0, 80, (offset) => {
        wire.attr({ "stroke": wireColor, "stroke-dashoffset": "-" + offset });
    }, 500);
}, 800);

