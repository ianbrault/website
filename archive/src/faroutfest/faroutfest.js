/*
** archive/src/faroutfest/faroutfest.js
*/

(function($) {
    const scrollFactor = 0.4;
    const linkScrollSpeed = 1000;

    const $document = $(document);
    const $body = $("body");
    const $bodyHtml = $("body,html");

    const $progBar = $("#progress");
    const $van = $("#van");

    const logo = document.getElementById("logo");
    const logoPosInit = logo.getBoundingClientRect().x;

    function isMobile() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    (function() {
        const mobile = isMobile();

        const screenUnit = mobile ? $body.innerHeight() : $body.innerWidth();

        const navWidth = $("#nav").innerWidth();
        const totalProgress = $("#background").innerWidth();

        const vanLeftMin = -0.6 * $body.innerWidth();
        const vanLeftMax = ($body.innerWidth() / 2) - ($van.innerWidth() / 2);
        const vanPathLength = Math.abs(vanLeftMin) + vanLeftMax;
        const vanScrollEnd = screenUnit;
        $van.css("bottom", (mobile ? 40 : 12) + $("#nav-wrapper").innerHeight());

        const normalizeWheel = function(event) {
            const pixelStep = 10;
            const lineHeight = 40, pageHeight = 800;
            let sX = 0, sY = 0;
            let pX = 0, pY = 0;

            if ("detail" in event)
                sY = event.detail;
            else if ("wheelDelta" in event)
                sY = event.wheelDelta / -120;
            else if ("wheelDeltaY" in event)
                sY = event.wheelDeltaY / -120;

            if ("wheelDeltaX" in event)
                sX = event.wheelDeltaX / -120;

            if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
                sX = sY;
                sY = 0;
            }

            pX = sX * pixelStep;
            pY = sY * pixelStep;
            if ("deltaY" in event)
                pY = event.deltaY;
            if ("deltaX" in event)
                pX = event.deltaX;

            if ((pX || pY) && event.deltaMode) {
                if (event.deltaMode === 1) {
                    pX *= lineHeight;
                    pY *= lineHeight;
                } else {
                    pX *= pageHeight;
                    pY *= pageHeight;
                }
            }

            // fallback if spin cannot be determined
            if (pX && !sX)
                sX = (pX < 1) ? -1 : 1;
            if (pY && !sY)
                sY = (pY < 1) ? -1 : 1;

            return {
                spinX: sX, spinY: sY,
                pixelX: pX, pixelY: pY
            };
        };

        const scrollVan = function(scroll) {
            let position;
            if (scroll <= 0)
                position = vanLeftMin;
            else if (scroll > vanScrollEnd)
                position = vanLeftMax;
            else
                position = ((scroll / vanScrollEnd) * vanPathLength) + vanLeftMin;

            $van.css("left", position);
        };

        const updateProgress = function(progress) {
            if (progress > 0) {
                const barW = navWidth - Math.round((progress / totalProgress) * navWidth);
                $progBar.css("width", barW);
            }
        };

        // supports desktop scrolling via wheel events
        $body.on("wheel", function(event) {
            event.preventDefault();
            event.stopPropagation();
            // stop link scroll
            $bodyHtml.stop();

            const n = normalizeWheel(event.originalEvent);
            const x = (n.pixelX !== 0 ? n.pixelX : n.pixelY);
            const delta = Math.min(Math.abs(x), 150) * scrollFactor * (x > 0 ? 1 : -1);

            const docLeft = $document.scrollLeft();
            $document.scrollLeft(docLeft + delta);

            updateProgress(docLeft);
            scrollVan(docLeft);
        });

        // supports mobile scrolling via requestAnimationFrame API
        function mobileFrame() {
            const scroll = logoPosInit - logo.getBoundingClientRect().x;
            updateProgress(scroll);
            scrollVan(scroll);

            requestAnimationFrame(mobileFrame);
        } if (mobile) {
            requestAnimationFrame(mobileFrame);
        }

        function linkScroll(event) {
            const $this = $(this);
            const href = $this.attr("href");

            let $target;
            if (href == "#" || ($target = $(href)).length == 0)
                return;

            event.preventDefault();
            event.stopPropagation();

            // calculate target position
            const x = $target.offset().left - (Math.max(0, $(window).width() - $target.outerWidth()) / 2);
            const y = { scrollLeft: x };

            $bodyHtml.stop().animate(y, linkScrollSpeed, "swing");
            updateProgress(y.scrollLeft);
            scrollVan(y.scrollLeft);
        }

        // link scroll animation is janky on mobile
        if (!mobile) {
            const navItems = document.getElementsByClassName("navitem");
            for (let i = 0; i < navItems.length; i++)
                navItems[i].onclick = linkScroll;
        }
    })();
})(jQuery);
