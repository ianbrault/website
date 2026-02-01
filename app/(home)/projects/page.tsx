/*
** app/(home)/projects/page.tsx
*/

import { Metadata } from "next";
import Link from "next/link";
import React from "react";

import Header from "@/components/Header";
import VFlex from "@/components/VFlex";

import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Projects",
};

interface ListLinkProps {
    href: string;
    text: string;
    target?: string;
    monospace?: boolean;
}

function ListLink({ href, text, target = "_blank", monospace = false, }: ListLinkProps) {
    const style: React.CSSProperties = {};
    if (monospace) {
        style.fontFamily = "monospace";
        style.fontSize = "16px";
    }
    return <Link href={href} target={target} style={style}>{text}</Link>;
}

export default function Projects() {
    return (
        <>
            <Header text="Projects" homeButton />
            <VFlex gap={20}>
                <p className={styles.text}>Some projects I have worked on:</p>
                <ul className={styles.linkList}>
                    <li className={styles.list}>
                        <ListLink text="Basil" href="https://github.com/ianbrault/basil" />, an iOS app to store recipes and more
                    </li>
                    <li className={styles.list}>
                        The source code for <ListLink text="this website" href="https://github.com/ianbrault/website" />
                    </li>
                    <li className={styles.list}>
                        <ListLink text="case_iterable" monospace href="https://crates.io/crates/case_iterable" />, a Rust procedural macro to iterate over enum variants in the same manner as Swift
                    </li>
                    <li className={styles.list}>
                        <ListLink text="Sleeper Stats" href="/sleeper" />, a dashboard for Sleeper fantasy football statistics
                    </li>
                    <li className={styles.list}>
                        My <ListLink text="Advent of Code" href="https://github.com/ianbrault/aoc" /> solutions implemented in Rust
                    </li>
                    <li className={styles.list}>
                        Some <ListLink text="websites" href="/cec_portfolio.pdf" />{" I worked on for UCLA's Campus Events Commission"}
                    </li>
                </ul>
                <p className={styles.text}>Some open-source projects I have contributed to:</p>
                <ul className={styles.linkList}>
                    <li className={styles.list}>
                        <ListLink text="fprime" monospace href="https://github.com/nasa/fprime" />{", NASA's flight software and embedded systems framework"}
                    </li>
                    <li className={styles.list}>
                        <ListLink text="fprime-vorago" monospace href="https://github.com/fprime-community/fprime-vorago" />, an fprime board support package for Vorago microcontrollers
                    </li>
                    <li className={styles.list}>
                        <ListLink text="fprime-baremetal" monospace href="https://github.com/fprime-community/fprime-baremetal" />, an fprime support package for baremetal environments
                    </li>
                </ul>
            </VFlex>
        </>
    );
}
