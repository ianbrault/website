/*
** app/page.tsx
*/

import Image from "next/image";
import Link from "next/link";
import HFlex from "@/components/HFlex";
import VFlex from "@/components/VFlex";

import styles from "./page.module.css";

interface ImageLinkProps {
    text: string;
    src: string;
    href: string;
}

function ImageLink({text, src, href}: ImageLinkProps) {
    const image_size = 48;
    return (
        <a className={styles.image_wrapper} href={href}>
            <Image src={src} alt={text} width={image_size} height={image_size}/>
            <p className={styles.image_link}>{text}</p>
        </a>
    );
}

export default function Home() {
    return (
        <VFlex className={styles.wrapper} gap={28}>
            <p className={styles.title}>Ian Brault</p>
            <VFlex gap={7}>
                <p className={styles.subheading}>Currently</p>
                <p className={styles.text}>Flight Software Engineer</p>
                <p className={styles.subtext}><i>NASA Jet Propulsion Laboratory</i></p>
            </VFlex>
            <HFlex gap={8}>
                <Link className={styles.link} href="/projects">Projects</Link>
                <p className={styles.text}>•</p>
                <Link className={styles.link} href="/resume">Resume</Link>
            </HFlex>
            <VFlex gap={10}>
                <p className={styles.subheading}>Links</p>
                <HFlex gap={28}>
                    <ImageLink text="GitHub" src="/images/github.png" href="https://github.com/ianbrault"/>
                    <ImageLink text="LinkedIn" src="/images/linkedin.png" href="https://www.linkedin.com/in/ianbrault/"/>
                    <ImageLink text="Email" src="/images/fastmail.png" href="mailto:ian@brault.dev"/>
                </HFlex>
            </VFlex>
        </VFlex>
    );
}
