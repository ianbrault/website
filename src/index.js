/*
 * src/index.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

/* global Snap, mina */

// PAGE TRANSITIONS

const pageTime = 320; // ms
const navLinks = document.getElementsByClassName("nav-item");

const getSectionFromHref = (href) => {
    let target = href.slice(href.lastIndexOf("#"));
    if (target === "#" || target === "/") 
        target = "#home";

    return document.querySelector("section" + target);
};

const updateNavLinks = (href) => {
    for (let i = 0; i < navLinks.length; i++) {
        if (href === navLinks[i].href)
            navLinks[i].classList.add("nav-item--active");
        else if (href + "#" === navLinks[i].href)
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

    if (href.endsWith("#about"))
        setTimeout(() => onSectionLoad("about"), pageTime * 1.6);
    else if (href.endsWith("#portfolio"))
        setTimeout(() => onSectionLoad("portfolio"), pageTime * 1.6);
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

// SECTION HEADER EFFECTS

// wires break downward at 45 degrees
const diag = 4 * Math.sin(Math.PI / 4);
const r = 1.2;
const rDiag = r * Math.sin(Math.PI / 4);

const getWires = (header) => {
    return [
        header.select("#wire1"),
        header.select("#wire2"),
        header.select("#wire3")
    ];
};

const animateWire = (header, polyline, lineLength, duration, endX, endY) => {
    Snap.animate(0, lineLength, (length) => {
        polyline.attr({ "stroke-dasharray": length + " 400" });
    }, duration, mina.easeout);

    setTimeout(() => header.circle(endX + rDiag, endY + rDiag, r), duration);
};

const onSectionLoad = (name) => {
    const header = Snap(`#${name}-header`);
    const wires = getWires(header);

    const y = [2, 6, 10];
    const baseBp = (name === "about") ? 140 : 168;
    const bp1 = baseBp, bp2 = bp1 - diag, bp3 = bp2 - diag;

    wires[0].attr({ points: [0, y[0], bp1, y[0], bp1 + 12, y[0] + 12] });
    wires[1].attr({ points: [0, y[1], bp2, y[1], bp2 + 12 + rDiag, y[1] + 12 + rDiag, bp2 + 32, y[1] + 12 + rDiag] });
    wires[2].attr({ points: [0, y[2], bp3, y[2], bp3 + 12, y[2] + 12] });

    const length = (name === "about") ? 180 : 208;
    animateWire(header, wires[0], length, 640, bp1 + 12, y[0] + 12);
    animateWire(header, wires[1], length, 400, bp2 + 32, y[1] + 12);
    animateWire(header, wires[2], length, 520, bp3 + 12, y[2] + 12);
};
