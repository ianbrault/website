/*
 * src/index.js
 */

// CURSOR EFFECTS

const cursor = document.querySelector("#cursor");

document.addEventListener("mousemove", (event) => {
    cursor.style.top = event.pageY + "px";
    cursor.style.left = event.pageX + "px";
});
