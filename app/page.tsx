/*
** app/page.tsx
*/

import Image from "next/image";

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
        <div className={styles.wrapper}>
            <p className={styles.title}>Ian Brault</p>
            <div className={styles.currently_wrapper}>
                <p className={styles.subheading}>Currently</p>
                <p className={styles.text}>Flight Software Engineer</p>
                <p className={styles.subtext}><i>NASA Jet Propulsion Laboratory</i></p>
            </div>
            <div className={styles.projects_resume_wrapper}>
                <a className={styles.link} href="/projects">Projects</a>
                <p className={styles.text}>•</p>
                <a className={styles.link} href="/resume">Resume</a>
            </div>
            <div className={styles.links_wrapper}>
                <p className={styles.subheading}>Links</p>
                <div className={styles.links_images_wrapper}>
                    <ImageLink text="GitHub" src="/images/github.png" href="https://github.com/ianbrault"/>
                    <ImageLink text="LinkedIn" src="/images/linkedin.png" href="https://www.linkedin.com/in/ianbrault/"/>
                    <ImageLink text="Email" src="/images/fastmail.png" href="mailto:ian@brault.dev"/>
                </div>
            </div>
        </div>
    );
}
