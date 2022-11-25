/*
 * js/slideshow.js
 */

const nImages = 8;
let nLoaded = 1;
let images = new Array(nImages);

let slideshow = document.getElementById("slideshow");

const loadImage = (n) => {
    let img = new Image();
    img.onload = () => {
        images[n] = img;
        nLoaded++;

        if (nLoaded === nImages) {
            images.forEach((image) => slideshow.appendChild(image));
            $(function() {
                $("#slideshow img:gt(0)").hide();
                setInterval(function() {
                    $("#slideshow :first-child").fadeOut(600)
                        .next("img").fadeIn(600)
                        .end().appendTo("#slideshow");
                }, 4000);
            });
        }
    };
    img.onerror = (err) => console.error(`error loading slideshow image ${n}: ${err}`);
    img.src = `/img/slideshow/${n}.jpg`;
};

for (let i = 2; i <= nImages; i++)
    loadImage(i);
