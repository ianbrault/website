/*
** public/scripts/archive/faroutfest/slideshow.js
*/

const nImages = 8;
let   nLoaded = 1;
const images = new Array(nImages);

const slideshow = document.getElementById("slideshow");

const loadImage = (n) => {
    const img = new Image();
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
    img.src = `/images/archive/faroutfest/slideshow/${n}.jpg`;
};

for (let i = 2; i <= nImages; i++) {
    loadImage(i);
}
