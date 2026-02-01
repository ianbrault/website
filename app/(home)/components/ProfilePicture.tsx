/*
** app/(home)/components/ProfilePicture.tsx
*/

"use client";

import Image from "next/image";
import { CSSProperties, useState } from "react";

import styles from "./ProfilePicture.module.css";

export default function ProfilePicture() {
    const [hover, setHover] = useState(false);
    const size = 240;
    const offset = 4;
    const divStyle: CSSProperties = { width: size, height: size };
    const imageStyle: CSSProperties = {};
    if (hover) {
        divStyle.transform = `translate(-${offset}px, ${offset}px)`;
        imageStyle.transform = `translate(${offset}px, -${offset}px)`;
    }

    return (
        <div
            className={styles.profilePictureWrapper}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                className={styles.profilePictureShadow}
                style={divStyle}
            />
            <Image
                className={styles.profilePicture}
                src="/images/me.jpg"
                alt="It's me"
                width={size} height={size}
                style={imageStyle}
            />
        </div>
    )
}
