/*
** app/archive/bbash18-teaser/components/NTWindow.tsx
*/

"use client";

import React, { forwardRef } from "react";

import Spacer from "@/components/Spacer";
import styles from "./NTWindow.module.css";

export const NTMenuBarHeight = 32;

interface NTMenuBarProps {
    icon?: string;
    backgroundColor?: string;
    onClose: () => void;
}

function NTMenuBar({
    icon = "/images/archive/bruinbash/xp_globe.png", backgroundColor, onClose
}: NTMenuBarProps) {
    const style: React.CSSProperties = {height: `${NTMenuBarHeight}px`};
    if (backgroundColor !== undefined) {
        style.backgroundColor = backgroundColor;
    } else {
        style.backgroundColor = "var(--blue)";
    }

    return (
        <div className={styles.ntMenuBar} style={style}>
            <img className={styles.ntMenuIcon} src={icon} alt=""/>
            <Spacer/>
            <div className={styles.ntMenuIconClose} onClick={onClose}>
                <img className={styles.ntMenuIconCloseImg} src="/images/archive/bruinbash/nt_close.png" alt="Close"/>
            </div>
        </div>
    );
}

interface NTWindowProps {
    className?: string;
    icon?: string;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    zIndex?: number;
    menuBarColor?: string;
    preventClose?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
}

const NTWindow = forwardRef<HTMLDivElement, NTWindowProps>((
    {className, icon, top, left, width, height, zIndex, menuBarColor, preventClose, onClose, children},
    ref
) => {
    const classList = `${styles.ntWindow} ${className ? className : ""}`;
    const style: React.CSSProperties = {
        top: top,
        left: left,
        width: width,
        height: height,
        zIndex: zIndex,
    };

    function closeWindow() {
        if (onClose && !preventClose) {
            onClose();
        }
    }

    return (
        <div ref={ref} className={classList} style={style}>
            <NTMenuBar icon={icon} backgroundColor={menuBarColor} onClose={closeWindow}/>
            {children}
        </div>
    );
});

NTWindow.displayName = "NTWindow";
export default NTWindow;
