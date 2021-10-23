/*
 * home.js
 */

const chars = "0123456789abcdef";

const rand_int = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const rand_char = () => {
    let index = rand_int(0, chars.length - 1);
    return chars[index];
};

let spans = document.getElementsByClassName("scramble");
// initialize with random chars
for (let i = 0; i < spans.length; i++) {
    spans[i].textContent = rand_char();
}

let iterations = 0;
let prev_idx = -1;
let actual = "ianbrault";

// 16 Hz per 9 letters
let scrambled_start = 0;
let scramble_freq = 24;
let unscramble_freq = 12;
let unscramble_start_count = 16;

const interval = () => {
    iterations++;
    // once the unscramble_start_count threshold is passed, increment the
    // scrambled_start every unscramble_freq cycles
    if (iterations > unscramble_start_count && iterations % unscramble_freq == 0) {
        scrambled_start++;
    }

    // set unscrambled letters
    for (let i = 0; i < Math.min(spans.length, scrambled_start); i++) {
        spans[i].textContent = actual[i];
    }

    // get random index
    let idx = rand_int(0, spans.length - 1);

    if (idx >= scrambled_start && idx < spans.length) {
        spans[idx].textContent = rand_char();
    }

    if (scrambled_start < spans.length) {
        setTimeout(interval, scramble_freq);
    }
};

setTimeout(interval, scramble_freq);

let active = document.getElementById("active");
let active_width = active.textContent.length;

let drips = [];
let drip_height = 5;
for (let i = 0; i < drip_height; i++) {
    drips[i] = document.createElement("p");
    drips[i].className = "drip";
    drips[i].style.position = "absolute";
    drips[i].style.left = active.offsetLeft + "px";
    drips[i].style.top = active.offsetTop + i * 20 + 4 + "px";
}
for (let i = 0; i < drip_height; i++) {
    document.body.appendChild(drips[i]);
}

const active_link = () => {
    for (let i = 0; i < drip_height; i++) {
        let text = "";
        for (let i = 0; i < active_width; i++) {
            text += rand_char();
        }
        drips[i].textContent = text;
    }
};

setInterval(active_link, 100);