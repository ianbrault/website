/*
** app/(home)/page.tsx
*/

import Link from "next/link";

import Header from "@/components/Header";
import VFlex from "@/components/VFlex";
import ProfilePicture from "./components/ProfilePicture";

import styles from "./page.module.css";

export default function Home() {
    return (
        <>
            <ProfilePicture />
            <Header className={styles.header} text="Ian Brault" />
            <VFlex className={styles.textWrapper} gap={20}>
                <p className={styles.text}>
                    Flight Software Engineer at the <b>NASA Jet Propulsion Laboratory</b>.
                    Writing software for <Link href="https://www.jpl.nasa.gov/missions/mars-sample-return-msr/" target="_blank">Mars Sample Return</Link>.
                    Wrote software for <Link href="https://www.jpl.nasa.gov/missions/europa-clipper/" target="_blank">Europa Clipper</Link>, currently en route to Jupiter.
                    Interested in all things embedded software, operating systems, compilers, and the Lakers.
                </p>
                <p className={styles.text}>For more information:</p>
                <ul className={styles.linkList}>
                    <li className={styles.list}>
                        <Link href="/Resume.pdf" target="_blank">Resume</Link>
                    </li>
                    <li className={styles.list}>
                        <Link href="/projects">Projects</Link>
                    </li>
                </ul>
                <p className={styles.text}>You can find me online at:</p>
                <ul className={styles.linkList}>
                    <li className={styles.list}>
                        GitHub: <Link href="https://github.com/ianbrault" target="_blank">https://github.com/ianbrault</Link>
                    </li>
                    <li className={styles.list}>
                        LinkedIn: <Link href="https://www.linkedin.com/in/ianbrault" target="_blank">https://www.linkedin.com/in/ianbrault</Link>
                    </li>
                    <li className={styles.list}>
                        Email: <Link href="mailto:ian@brault.dev" target="_blank">ian@brault.dev</Link>
                    </li>
                    <li className={styles.list}>
                        Bluesky: <Link href="https://bsky.app/profile/ianbrault.bsky.social" target="_blank">https://bsky.app/profile/ianbrault.bsky.social</Link>
                    </li>
                </ul>
            </VFlex>
        </>
    );
}
