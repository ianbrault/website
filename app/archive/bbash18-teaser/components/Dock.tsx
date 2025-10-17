/*
** app/archive/bbash18-teaser/components/Dock.tsx
*/

/* eslint-disable @next/next/no-img-element */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Spacer from "@/components/Spacer";
import styles from "./Dock.module.css";

interface DockProps {
    onTicketsMenuClick: () => void;
    onLineupMenuClick: () => void;
}

function StartMenu({onTicketsMenuClick, onLineupMenuClick}: DockProps) {
    const separator = <div className={styles.menuSeparator}></div>;
    return (
        <div className={styles.startMenu}>
            <p className={styles.menuItem}>
                <Link className={styles.menuLink} target="_blank" href="http://uclacec.com">
                    Campus Events Commission
                </Link>
            </p>
            <p className={styles.menuItem}>
                <Link className={styles.menuLink} target="_blank" href="https://www.facebook.com/culturalaffairsla/">
                    Cultural Affairs Commission
                </Link>
            </p>
            {separator}
            <p className={styles.menuItem} onClick={onTicketsMenuClick}>
                <u>T</u>ickets&nbsp;...
            </p>
            <p className={styles.menuItem} onClick={onLineupMenuClick}>
                <u>B</u>ruin Bash Lineup&nbsp;...
            </p>
            {separator}
            <p className={styles.menuItem}>Full website coming soon!</p>
        </div>
    );
}

export default function Dock({onTicketsMenuClick, onLineupMenuClick}: DockProps) {
    const [menuShown, setMenuShown] = useState(false);
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    function toggleStartMenu() {
        setMenuShown(!menuShown);
    }

    const releaseDate = new Date("September 12, 2018 10:00:00").getTime();
    const offsetMs = Math.max(releaseDate - time, 0);
    const offset_s = Math.floor(offsetMs / 1000);
    const sec = offset_s % 60;
    const min = ((offset_s - sec) / 60) % 60;
    const hrs = (offset_s - (min * 60) - sec) / 3600;
    const countdown = `${hrs.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

    const startMenu = (
        <StartMenu onTicketsMenuClick={onTicketsMenuClick} onLineupMenuClick={onLineupMenuClick}/>
    );

    return (
        <>
            <div className={styles.dock}>
                <div className={styles.startContainer} onClick={toggleStartMenu}>
                    <div className={styles.startButton}>
                        <img className={styles.startImage} src="/images/archive/bruinbash/start.png" alt="Start"/>
                    </div>
                </div>
                <Spacer/>
                <Image src="/images/archive/bruinbash/cec.png" alt="CEC" height={20} width={20}/>
                <Image src="/images/archive/bruinbash/cac.png" alt="CAC" height={20} width={20}/>
                <div className={styles.countdownContainer}>
                    <p className={styles.countdown}>{countdown}</p>
                </div>
            </div>
            {menuShown && startMenu}
        </>
    );
}
