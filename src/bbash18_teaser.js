/*
** bbash18_teaser.js
** create the popups for the Bruin Bash 2018 teaser page
**/

const GENE_BLOCK  = 0;
const NTH_VISITOR = 1;
const SCUSE_ME    = 2;
const EASY_TRICK  = 3;
const DUO_MFA     = 4;  // TODO
const N_POPUPS    = 4;  // 5;

const POPUP_WIDTH  = [450, 300, 300, 400];
const POPUP_HEIGHT = [300, 420, 350, 280];
const BUTTON_TEXT = ["Yes, please!", "Ok", "Yes:No", "Click here"];

const WHITE = "rgb(248, 248, 248)";
const GRAY = "rgb(198, 198, 198)";
const DARK_GRAY = "rgb(140, 140, 140)";
const DARKER_GRAY = "rgb(112, 112, 112)";
const BLUE = "#2748a8";

let w = window.innerWidth;
let h = window.innerHeight - 48;

window.onresize = function() {
    w = window.innerHeight;
    h = window.innerHeight - 48;
}

function getRandomWindowLocation(popup_w, popup_h) {
    let x_range = w - popup_w;
    let y_range = h - popup_h;

    let x = Math.floor(Math.random() * x_range);
    let y = Math.floor(Math.random() * y_range);

    return [x, y];
}

let cursor_x = 0;
let cursor_y = 0;

function dragWindow(event, win) {
    event = event || window.event;
    event.preventDefault();

    let win_x = cursor_x - event.clientX;
    let win_y = cursor_y - event.clientY;
    cursor_x = event.clientX;
    cursor_y = event.clientY;

    win.style.top = `${win.offsetTop - win_y}px`;
    win.style.left = `${win.offsetLeft - win_x}px`;
}

function dragMouseDown(event) {
    let target_fields = event.target.id.split("-");
    let win_num = target_fields[target_fields.length - 1];
    let win = document.getElementById(`nt-window-${win_num}`);

    event = event || window.event;
    event.preventDefault();

    cursor_x = event.clientX;
    cursor_y = event.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = function(event) {
        dragWindow(event, win);
    }
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}

function addNTMenuIcons(menuBar, favicon, closeFunc) {
    let closeButton = document.createElement("div");
    closeButton.className = "nt-menu-icon-close";
    closeButton.style.backgroundColor = GRAY;
    closeButton.style.border = `1px outset ${DARK_GRAY}`;
    closeButton.onclick = closeFunc;

    let close = document.createElement("img");
    close.style.pointerEvents = "none";
    close.style.height = "60%";
    close.src = "/img/bbash18_teaser/nt_close.png";
    closeButton.appendChild(close);

    let spacer = document.createElement("div");
    spacer.style.flexGrow = 1;

    favicon.className = "menu-favicon";
    menuBar.appendChild(favicon);
    menuBar.appendChild(spacer);
    menuBar.appendChild(closeButton);

    return menuBar;
}

function GlobeIcon() {
    let globe = document.createElement("img");

    globe.style.pointerEvents = "none";
    globe.style.maxHeight = "80%";
    globe.style.marginLeft = "6px";
    globe.src="/img/bbash18_teaser/xp_globe.png";

    return globe;
}

function NTMenuBar(favicon, closeFunc) {
    let menuBar = document.createElement("div");
    menuBar.className = "nt-menu-bar";
    menuBar.id = `nt-menu-bar-${n_windows - 1}`;
    menuBar.onmousedown = dragMouseDown;
    menuBar.style.backgroundColor = BLUE;

    addNTMenuIcons(menuBar, favicon, closeFunc);
    return menuBar;
}

function GeneBlockContent() {
    let container = document.createElement("div");
    container.className = "popup-content";

    let geneBlock = document.createElement("img");
    geneBlock.className = "gene-block";
    geneBlock.src = "/img/bbash18_teaser/gene_block.jpeg";
    container.appendChild(geneBlock)

    let rightContainer = document.createElement("div");
    rightContainer.style.margin = "20px";

    let topText = document.createElement("p");
    topText.className = "body-text";
    topText.innerHTML = "Hot, single";
    topText.style.marginTop = "20px";
    rightContainer.appendChild(topText);

    let wordArt = document.createElement("img");
    wordArt.className = "word-art";
    wordArt.src = "/img/bbash18_teaser/gene_block_wordart.png";
    rightContainer.appendChild(wordArt);

    let botText = document.createElement("p");
    botText.className = "body-text";
    botText.innerHTML = "in your area!";
    botText.style.textAlign = "right";
    rightContainer.appendChild(botText);

    container.appendChild(rightContainer);
    return container;
}

function NthVisitorContent() {
    let container = document.createElement("div");

    let logoContainer = document.createElement("div");
    logoContainer.className = "nth-vis-logo-container";

    let logo = document.createElement("img");
    logo.className = "nth-vis-logo";
    logo.src = "/img/bbash18_teaser/logo_black_transparent.png";
    logoContainer.appendChild(logo);

    let text1 = document.createElement("p");
    text1.className = "nth-vis-text";
    text1.innerHTML = "Congrats! You're the";

    let styledText = document.createElement("p");
    styledText.className = "nth-vis-styled-text";
    styledText.innerHTML = "1000th";

    let text3 = document.createElement("p");
    text3.className = "nth-vis-text";
    text3.innerHTML = "visitor to the site!"

    let text4 = document.createElement("p");
    text4.className = "nth-vis-text";
    text4.innerHTML = "Click the button below to reveal the "
        + "<span class='emphasis-blue'>Bruin Bash</span> "
        + "<span class='emphasis-red'>lineup!</span>";

    container.appendChild(logoContainer);
    container.appendChild(text1);
    container.appendChild(styledText);
    container.appendChild(text3);
    container.appendChild(text4);
    return container;
}

function ScuseMeContent() {
    let container = document.createElement("div");

    let imgContainer = document.createElement("div");
    imgContainer.className = "scuse-me-img-container";

    let img = document.createElement("img");
    img.className = "scuse-me-img";
    img.src = "/img/bbash18_teaser/scuse_me.png";
    imgContainer.appendChild(img);

    let text = document.createElement("p");
    text.className = "scuse-me-text";
    text.innerHTML = "Can I ask you a <span class='emphasis-blue'>question?</span>";

    container.appendChild(imgContainer);
    container.appendChild(text);
    return container;
}

function EasyTrickContent() {
    let container = document.createElement("div");
    container.className = "freshman-container";

    let img = document.createElement("img");
    img.className = "freshman-img";
    img.src = "/img/bbash18_teaser/freshmen.png";

    let text = document.createElement("p");
    text.className = "freshman-text";
    text.innerHTML = "This <span class='emphasis-blue'>freshman</span> found a "
        + "quick and easy way to get an <span class='emphasis-dark-blue'>early "
        + "enrollment time,</span> doctors <span class='emphasis-red-big'>hate"
        + "</span> him!";

    container.appendChild(img);
    container.appendChild(text);
    return container;
}

function DuoMFAContent() {
    let container = document.createElement("div");

    return container;
}

function getContent(type) {
    if (type === GENE_BLOCK) return GeneBlockContent();
    else if (type === NTH_VISITOR) return NthVisitorContent();
    else if (type === SCUSE_ME) return ScuseMeContent();
    else if (type === EASY_TRICK) return EasyTrickContent();
    else if (type === DUO_MFA) return DuoMFAContent();
}

function NTButton(text, noBorder) {
    let wrapper = document.createElement("div");
    wrapper.className = "nt-button-wrapper";

    let button = document.createElement("div");
    button.className = "nt-button";
    button.style.borderTopColor = WHITE;
    button.style.borderLeftColor = WHITE;
    button.style.borderRightColor = DARKER_GRAY;
    button.style.borderBottomColor = DARKER_GRAY;
    button.onclick = createPopup;

    let buttonText = document.createElement("p");
    buttonText.className = noBorder ? "nt-button-text" : "nt-button-text-border";
    buttonText.innerHTML = text;

    button.appendChild(buttonText);
    wrapper.appendChild(button);
    return wrapper;
}

function PopupBody(type) {
    let body = document.createElement("div");
    body.className = "nt-body";
    body.appendChild(getContent(type));

    let buttonContainer = document.createElement("div");
    buttonContainer.className = "nt-button-centered";

    let buttonText = BUTTON_TEXT[type];
    if (buttonText.includes(":")) {
        buttonContainer.appendChild(NTButton(buttonText.split(":")[0]));
        buttonContainer.appendChild(NTButton(buttonText.split(":")[1], true));
    } else {
        buttonContainer.appendChild(NTButton(buttonText));
    }

    body.appendChild(buttonContainer);
    return body;
}

let n_windows = 1;
let last_popup = N_POPUPS;

function NTWindow(width, height, centered) {
    let win = document.createElement("div");
    win.className = "nt-window";
    win.id = `nt-window-${n_windows}`;
    n_windows += 1;

    win.style.width = `${width}px`;
    win.style.height = height === "auto" ? height : `${height}px`;

    win.style.borderTopColor = WHITE;
    win.style.borderLeftColor = WHITE;
    win.style.borderRightColor = DARK_GRAY;
    win.style.borderBottomColor = DARK_GRAY;
    win.style.backgroundColor = GRAY;

    if (centered) {
        win.style.left = `${(w - width)/2}px`;

        if (height === "auto") {
            if (h < 800) win.style.top = "20px";
            else win.style.top = `${(h - 500)/2}px`;
        } else win.style.top = `${(h - winHeight)/2}px`
    } else {
        let [x, y] = getRandomWindowLocation(width, height);
        win.style.left = `${x}px`;
        win.style.top  = `${y}px`;
    }

    return win;
}

function createPopup() {
    let type = Math.floor(Math.random() * N_POPUPS);
    while (type === last_popup)
        type = Math.floor(Math.random() * N_POPUPS);
    last_popup = type;

    let popup = NTWindow(POPUP_WIDTH[type], POPUP_HEIGHT[type]);
    popup.appendChild(NTMenuBar(GlobeIcon(), createPopup));
    popup.appendChild(PopupBody(type));

    document.getElementById("content").appendChild(popup);
}

let paintWindow = NTWindow();

let paintIcon = document.createElement("img");
paintIcon.style.pointerEvents = "none";
paintIcon.style.maxHeight = "80%";
paintIcon.style.marginLeft = "6px";
paintIcon.src="/img/bbash18_teaser/paint_header.png";

let paintMenu = NTMenuBar(paintIcon, function(){});
paintMenu.style.backgroundColor = "rgb(3, 0, 111)";
paintWindow.appendChild(paintMenu);

let paintBg = document.createElement("img");
paintBg.src = "/img/bbash18_teaser/paint.jpg";
paintBg.style.maxWidth = "100%";

let logo = document.createElement("img");
logo.className = "bbash-logo";
logo.src = "/img/bbash18_teaser/new_logo.png";

let starburst = document.createElement("img");
starburst.className = "starburst";
starburst.src = "/img/bbash18_teaser/starburst2.png";
starburst.onclick = createPopup;

paintWindow.appendChild(paintBg);
paintWindow.appendChild(logo);
paintWindow.appendChild(starburst);
document.getElementById("paint-container").appendChild(paintWindow);

function openTicketsInfo() {
    if (document.getElementsByClassName("tickets-info").length !== 0)
        return;

    let width = Math.min(500, Math.floor(w * 0.95));
    let container = NTWindow(width, "auto", true);
    container.classList.add("tickets-info");
    let win_num = n_windows - 1;
    const closeWin = () => document.getElementById(`nt-window-${win_num}`).remove();
    container.appendChild(NTMenuBar(GlobeIcon(), closeWin));

    let title = document.createElement("p");
    title.className = "tickets-title";
    title.innerHTML = "tickets";

    let p1 = document.createElement("p");
    p1.className = "tickets-info-p";
    p1.innerHTML = "Due to the size of the concert venue, we unfortunately cannot guarantee that all current students will receive a wristband for the concert. This year, tickets for the concert will be distributed online in the following ways:";

    let p2 = document.createElement("p");
    p2.className = "tickets-info-p";
    p2.innerHTML = "<b>Floor (Ground Level, Standing) tickets -</b> Will be available <b>Monday, September 17th @ 10am.</b> Floor tickets will be available on a first come first served basis until none remain. Once all floor tickets have been claimed, you will have the opportunity to participate in the on-sales for 100/200 level (seated) tickets (please see below).";

    let p3 = document.createElement("p");
    p3.className = "tickets-info-p";
    p3.innerHTML = "<b>100 Level (Seated) tickets -</b> Will be available <b>Tuesday, September 18th @ 10am.</b> 100 Level tickets will be available on a first come first serve basis until none remain. Once all 100 Level tickets have been claimed, you will have the opportunity to participate in the on-sale for 200 level (seated) tickets (please see below).";

    let p4 = document.createElement("p");
    p4.className = "tickets-info-p tickets-info-last";
    p4.innerHTML = "<b>200 Level (Seated) tickets -</b> Will be available <b>Thursday, September 20th @ 10am.</b> 200 Level tickets will be available on a first come first serve basis until none remain. Note that not all students who participate in the on-sales will receive a ticket due to venue capacity restraints.";

    container.appendChild(title);
    container.appendChild(p1);
    container.appendChild(p2);
    container.appendChild(p3);
    container.appendChild(p4);
    document.getElementById("content").appendChild(container);
}

let releaseDate = new Date("September 12, 2018 10:00:00");
function updateCountdown() {
    let label = document.getElementById("countdown");

    let now = new Date();
    let offset_ms = releaseDate - now;
    if (offset_ms < 0) offset_ms = 0;

    const format = (n) => n.toString().padStart(2, "0");

    let offset_s = Math.floor(offset_ms / 1000);
    let sec = format(offset_s % 60);
    let min = format(((offset_s - sec) / 60) % 60);
    let hrs = format((offset_s - (min*60) - sec) / 3600);

    label.innerHTML = `${hrs}:${min}:${sec}`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

let shown = false;
function toggleStartMenu() {
    shown = !shown;
    let start_menu = document.getElementById("start-menu");
    start_menu.style.display = shown ? "inherit" : "none";
}

// add event listeners
document.getElementById("tickets-menu-item").onclick = openTicketsInfo;
document.getElementById("dock-start-button").onclick = toggleStartMenu;
document.getElementById("start-menu").onmouseleave = toggleStartMenu;
document.getElementById("popup-menu-item").onclick = createPopup;
document.getElementById("tickets-icon").ondblclick = openTicketsInfo;
