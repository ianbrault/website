/*
 * src/js/sectionHeader.js
 * author: Ian Brault <ianbrault@ucla.edu>
 */

/* global Snap, mina */

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

const onSectionLoad = (page) => {
    const header = Snap(`#${page}-header`);
    const wires = getWires(header);

    const y = [2, 6, 10];
    const baseBp = (page === "about") ? 140 : 168;
    const bp1 = baseBp, bp2 = bp1 - diag, bp3 = bp2 - diag;

    wires[0].attr({ points: [0, y[0], bp1, y[0], bp1 + 12, y[0] + 12] });
    wires[1].attr({ points: [0, y[1], bp2, y[1], bp2 + 12 + rDiag, y[1] + 12 + rDiag, bp2 + 32, y[1] + 12 + rDiag] });
    wires[2].attr({ points: [0, y[2], bp3, y[2], bp3 + 12, y[2] + 12] });

    const length = (page === "about") ? 180 : 208;
    animateWire(header, wires[0], length, 640, bp1 + 12, y[0] + 12);
    animateWire(header, wires[1], length, 400, bp2 + 32, y[1] + 12);
    animateWire(header, wires[2], length, 520, bp3 + 12, y[2] + 12);
};

const path = window.location.pathname.slice(1);
setTimeout(() => onSectionLoad(path), 160);
