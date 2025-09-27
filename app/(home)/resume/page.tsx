/*
** app/(home)/resume/page.tsx
*/

import { Metadata } from "next";

import Header from "@/components/Header";
import VFlex from "@/components/VFlex";

import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Resume",
};

export default function Resume() {
    return (
        <VFlex className={styles.wrapper} gap={30}>
            <Header text="Resume" homeButton/>
            <p>Coming soon...</p>
        </VFlex>
    );
}
