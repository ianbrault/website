/*
 * src/js/home.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

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
