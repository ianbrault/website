/*
 * src/index.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

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
    Snap.animate(0, 100, (offset) => {
        wire.attr({ "stroke": wireColor, "stroke-dashoffset": "-" + offset });
    }, 800);
}, 1200);
