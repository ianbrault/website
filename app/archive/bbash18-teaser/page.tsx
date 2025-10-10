/*
** archive/bbash18-teaser/page.tsx
*/

"use client";

import Image from "next/image";
import React, { forwardRef, useLayoutEffect, useRef, useState } from "react";

import Dock from "./components/Dock";
import NTButton from "./components/NTButton";
import NTWindow, { NTMenuBarHeight } from "./components/NTWindow";
import styles from "./page.module.css";

type WindowSetPosition = React.Dispatch<React.SetStateAction<{x: number; y: number;}>>;

enum Popup {
    GENE_BLOCK = 0,
    NTH_VISITOR = 1,
    SCUSE_ME = 2,
    EASY_TRICK = 3,
    // const DUO_MFA = 4,
    COUNT = 4,
}

const PopupSizes: [number, number][] = [
    [450, 300], [300, 420], [300, 350], [400, 280],
];

interface Point {
    x: number;
    y: number;
}

interface PopupInfo {
    style: Popup;
    position: Point;
}

interface DragInfo {
    start: Point;
    windowStart: Point;
    updateFunc: WindowSetPosition;
}

interface TicketsWindowProps {
    top: number;
    left: number;
    onLayout: WindowSetPosition;
    onClose: () => void;
}

const TicketsWindow = forwardRef<HTMLDivElement, TicketsWindowProps>((
    {top, left, onLayout, onClose}, ref
) => {
    const [loaded, setLoaded] = useState(false);
    useLayoutEffect(() => {
        if (loaded || typeof ref !== "object" || !ref || !ref.current) {
            return;
        }
        const {width, height} = ref.current.getBoundingClientRect();
        const top = (window.innerHeight - height - 48) / 2;
        const left = (window.innerWidth - width) / 2;
        onLayout({x: left, y: top});
        setLoaded(true);
    }, [loaded, ref, onLayout]);

    const width = Math.min(500, Math.floor(window.innerWidth * 0.95));
    return (
        <NTWindow
            ref={ref}
            className={styles.ticketsInfo}
            width={width}
            top={top}
            left={left}
            onClose={onClose}
        >
            <p className={styles.ticketsTitle}>tickets</p>
            <p className={styles.ticketsInfoP}>
                Due to the size of the concert venue, we unfortunately cannot guarantee that all
                current students will receive a wristband for the concert. This year, tickets for
                the concert will be distributed online in the following ways:
            </p>
            <p className={styles.ticketsInfoP}>
                <b>Floor (Ground Level, Standing) tickets </b> will be available <b>Monday, September 17th @ 10am. </b> Floor
                tickets will be available on a first come first served basis until none
                remain. Once all floor tickets have been claimed, you will have the opportunity to
                participate in the on-sales for 100/200 level (seated) tickets (please see below).
            </p>
            <p className={styles.ticketsInfoP}>
                <b>100 Level (Seated) tickets </b> will be available <b>Tuesday, September 18th @ 10am. </b> 100
                Level tickets will be available on a first come first serve basis until none
                remain. Once all 100 Level tickets have been claimed, you will have the opportunity
                to participate in the on-sale for 200 level (seated) tickets (please see below).
            </p>
            <p className={styles.ticketsInfoP}>
                <b>200 Level (Seated) tickets </b> will be available <b>Thursday, September 20th @ 10am. </b> 200
                Level tickets will be available on a first come first serve basis until none
                remain. Note that not all students who participate in the on-sales will receive a
                ticket due to venue capacity restraints.
            </p>
        </NTWindow>
    )
});
TicketsWindow.displayName = "TicketsWindow";

interface PopupContentProps {
    style: Popup;
    onClick: () => void;
}

function PopupContent({style, onClick}: PopupContentProps) {
    let content;
    switch (style) {
    case Popup.GENE_BLOCK:
        content = (
            <div className={styles.popupContent}>
                <img className={styles.geneBlock} src="/images/archive/bruinbash/gene_block.jpeg" alt="Gene Block"/>
                <div style={{margin: 20}}>
                    <p className={styles.bodyText} style={{marginTop: 20}}>Hot, single</p>
                    <img className={styles.wordArt} src="/images/archive/bruinbash/gene_block_wordart.png" alt=""/>
                    <p className={styles.bodyText} style={{textAlign: "right"}}>in your area!</p>
                </div>
            </div>
        );
        break;
    case Popup.NTH_VISITOR:
        content = (
            <div>
                <div className={styles.nthVisLogoContainer}>
                    <img className={styles.nthVisLogo} src="/images/archive/bruinbash/logo_black_transparent.png" alt=""/>
                </div>
                <p className={styles.nthVisText}>Congrats! You are the</p>
                <p className={styles.nthVisStyledText}>1000th</p>
                <p className={styles.nthVisText}>visitor to the site!</p>
                <p className={styles.nthVisText}>
                    Click the button below to reveal the <span className={styles.emphasisBlue}>Bruin Bash</span> <span className={styles.emphasisRed}>lineup!</span>
                </p>
            </div>
        );
        break;
    case Popup.SCUSE_ME:
        content = (
            <div>
                <div className={styles.scuseMeImgContainer}>
                    <img className={styles.scuseMeImg} src="/images/archive/bruinbash/scuse_me.png" alt=""/>
                </div>
                <p className={styles.scuseMeText}>
                    Can I ask you a <span className={styles.emphasisBlue}>question?</span>
                </p>
            </div>
        );
        break;
    case Popup.EASY_TRICK:
        content = (
            <div className={styles.freshmanContainer}>
                <img className={styles.freshmanImg} src="/images/archive/bruinbash/freshmen.png" alt=""/>
                <p className={styles.freshmanText}>
                    This <span className={styles.emphasisBlue}>freshman</span> found a quick and easy way to get an <span className={styles.emphasisDarkBlue}>early enrollment time,</span> doctors <span className={styles.emphasisRedBig}>hate</span> him!
                </p>
            </div>
        );
        break;
    }

    let buttons;
    switch (style) {
    case Popup.GENE_BLOCK:
        buttons = [<NTButton key={0} text="Yes, please!" onClick={onClick}/>];
        break;
    case Popup.NTH_VISITOR:
        buttons = [<NTButton key={0} text="Ok" onClick={onClick}/>];
        break;
    case Popup.SCUSE_ME:
        buttons = [
            <NTButton key={0} text="Yes" onClick={onClick}/>,
            <NTButton key={1} text="No" onClick={onClick} noBorder/>,
        ];
        break;
    case Popup.EASY_TRICK:
        buttons = [<NTButton key={0} text="Click here" onClick={onClick}/>];
        break;
    }

    return (
        <div className={styles.ntBody}>
            {content}
            <div className={styles.ntButtonCentered}>
                {buttons}
            </div>
        </div>
    );
}

export default function BruinBashTeaser() {
    const paintRef = useRef<HTMLDivElement>(null);
    const ticketsRef = useRef<HTMLDivElement>(null);
    const [paintWindowPosition, setPaintWindowPosition] = useState({x: 0, y: 0});
    const [ticketsWindowPosition, setTicketsWindowPosition] = useState({x: 0, y: 0});
    const [popupWindows, setPopupWindows] = useState<PopupInfo[]>([]);
    const [lastPopup, setLastPopup] = useState(Popup.COUNT);
    const [dragInfo, setDragInfo] = useState<DragInfo | undefined>(undefined);
    const [showTickets, setShowTickets] = useState(false);

    function mouseInWindowMenu(event: React.MouseEvent<HTMLDivElement>, boundingRect: DOMRect | undefined): boolean{
        if (boundingRect == undefined) {
            return false;
        }
        const {clientX, clientY} = event;
        const {x, y, width} = boundingRect;
        return (
            (clientX >= x) && (clientX <= x + width) &&
            (clientY >= y) && (clientY <= y + NTMenuBarHeight)
        );
    }

    function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        const start = {x: event.clientX, y: event.clientY};
        // Check if the click happened on a window menu bar
        for (let i = popupWindows.length - 1; i >= 0; i--) {
            const popup = popupWindows[i];
            const [width, height] = PopupSizes[popup.style.valueOf()];
            const boundingRect = new DOMRect(popup.position.x, popup.position.y, width, height);
            if (mouseInWindowMenu(event, boundingRect)) {
                const info: DragInfo = {
                    start: start,
                    windowStart: popup.position,
                    updateFunc: (state) => {
                        const {x, y} = state as {x: number; y: number;};
                        const nextPopupWindows = popupWindows.map((popup, j) => {
                            if (i === j) {
                                return {
                                    ...popup,
                                    position: {x: x, y: y},
                                };
                            } else {
                                return popup;
                            }
                        });
                        setPopupWindows(nextPopupWindows);
                    },
                };
                setDragInfo(info);
                return;
            }
        }
        if (mouseInWindowMenu(event, ticketsRef.current?.getBoundingClientRect())) {
            const {x, y} = ticketsRef.current!.getBoundingClientRect();
            const info: DragInfo = {
                start: start,
                windowStart: {x: x, y: y},
                updateFunc: setTicketsWindowPosition,
            };
            setDragInfo(info);
            return;
        }
        if (mouseInWindowMenu(event, paintRef.current?.getBoundingClientRect())) {
            const {x, y} = paintRef.current!.getBoundingClientRect();
            const info: DragInfo = {
                start: start,
                windowStart: {x: x, y: y},
                updateFunc: setPaintWindowPosition,
            };
            setDragInfo(info);
            return;
        }
    }

    function onMouseUp() {
        setDragInfo(undefined);
    }

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!dragInfo) {
            return;
        }
        const {clientX, clientY} = event;
        const newWindowX = dragInfo.windowStart.x + (clientX - dragInfo.start.x);
        const newWindowY = dragInfo.windowStart.y + (clientY - dragInfo.start.y);
        dragInfo.updateFunc({x: newWindowX, y: newWindowY});
    }

    function onPaintLoad() {
        if (!paintRef.current) {
            return;
        }
        const {width, height} = paintRef.current!.getBoundingClientRect();
        const top = (window.innerHeight - height - 48) / 2;
        const left = (window.innerWidth - width) / 2;
        setPaintWindowPosition({x: left, y: top});
    }

    function openTicketsInfo() {
        setShowTickets(true);
    }

    function onTicketsWindowClosed() {
        setShowTickets(false);
    }

    function createPopup() {
        let style = Math.floor(Math.random() * Popup.COUNT);
        while (style === lastPopup) {
            style = Math.floor(Math.random() * Popup.COUNT);
        }
        const [width, height] = PopupSizes[style.valueOf()];
        const position = {
            x: Math.floor(Math.random() * (window.innerWidth - width)),
            y: Math.floor(Math.random() * (window.innerHeight - 48 - height)),
        };
        /*
        console.log("before", popupWindows);
        const nextPopupWindows = [
            ...popupWindows,
            {style: style, position: position},
        ];
        console.log("after", nextPopupWindows);
        setPopupWindows(nextPopupWindows);
        */
        setPopupWindows([
            ...popupWindows,
            {style: style, position: position},
        ]);
        setLastPopup(style);
    }

    const popups = popupWindows.map((info, i) => {
        const [width, height] = PopupSizes[info.style.valueOf()];
        const onClose = () => {
            setPopupWindows(popupWindows.filter((_, j) => i !== j));
        };
        return (
            <NTWindow
                key={i}
                className={styles.popupBase}
                top={info.position.y}
                left={info.position.x}
                width={width}
                height={height}
                onClose={onClose}
            >
                <PopupContent style={info.style} onClick={createPopup}/>
            </NTWindow>
        )
    });

    return (
        <div
            className={styles.content}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <Dock onTicketsMenuClick={openTicketsInfo} onLineupMenuClick={createPopup}/>
            <div className={styles.iconContainer} onDoubleClick={openTicketsInfo}>
                <Image src="/images/archive/bruinbash/word.png" alt="Desktop" width={50} height={50}/>
                <p className={styles.iconText}>tickets.txt</p>
            </div>
            <NTWindow
                ref={paintRef}
                icon="/images/archive/bruinbash/paint_header.png"
                menuBarColor="rgb(3, 0, 111)"
                top={paintWindowPosition.y}
                left={paintWindowPosition.x}
                preventClose
            >
                <img className={styles.paintImage} src="/images/archive/bruinbash/paint.jpg" onLoad={onPaintLoad}/>
                <img className={styles.bbashLogo} src="/images/archive/bruinbash/new_logo.png" alt="Bruin Bash"/>
                <img className={styles.starburst} onClick={createPopup} src="/images/archive/bruinbash/starburst2.png" alt="Tickets"/>
            </NTWindow>
            {
                showTickets &&
                <TicketsWindow
                    ref={ticketsRef}
                    top={ticketsWindowPosition.y}
                    left={ticketsWindowPosition.x}
                    onLayout={setTicketsWindowPosition}
                    onClose={onTicketsWindowClosed}
                />
            }
            {popups}
        </div>
    );
}
