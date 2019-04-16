/*
 * src/index.js
 */

// CURSOR EFFECTS

const cursor = document.querySelector("#cursor");

document.addEventListener("mousemove", (event) => {
    cursor.style.top = event.pageY + "px";
    cursor.style.left = event.pageX + "px";
});

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
        const halos = document.getElementsByClassName("click-halo");
        for (let i = 0; i < halos.length; i++)
            document.body.removeChild(halos[i]);
    }, 720);
})
