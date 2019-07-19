/*
 * src/js/about.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

/* global Snap, mina */

const links = [
    Snap("#github").select("circle"),
    Snap("#linkedin").select("circle"),
    Snap("#email").select("circle"),
    Snap("#resume").select("circle"),
];

const setDasharray = (link, length) => {
    link.attr({
        "stroke-dasharray": length + " 202",
        "stroke-linecap": "round"
    });
};

const animDelay = 720;
const animTime = 1600;

setTimeout(() => {
    Snap.animate(0, 202, (length) => {
        setDasharray(links[0], length);
        setDasharray(links[1], length);
        setDasharray(links[2], length);
        setDasharray(links[3], length);
    }, animTime, mina.easeinout);
}, animDelay);
