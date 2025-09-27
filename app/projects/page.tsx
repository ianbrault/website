/*
** app/projects/page.tsx
*/

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import VFlex from "@/components/VFlex";

import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "Projects",
};

interface Project {
    name: string;
    nameElement?: React.ReactNode;
    description: string;
    image: string;
    href: string;
    tags: string[];
}

interface ProjectItemProps {
    project: Project;
}

function ProjectItem({project}: ProjectItemProps) {
    const imageSize = 50;
    return (
        <div className={styles.projectGrid}>
            <Image
                className={styles.projectImage}
                src={project.image}
                alt={project.name}
                width={imageSize} height={imageSize}
                quality={85}
            />
            <Link className={styles.projectName} href={project.href} target="_blank">
                {project.nameElement !== undefined ? project.nameElement : project.name}
            </Link>
            <p className={styles.projectDescription}>{project.description}</p>
            <p className={styles.projectTags}>{project.tags.join(", ")}</p>
        </div>
    );
}

export default function Projects() {
    const projects = [
        {
            name: "Basil",
            description: "iOS app to store recipes and more",
            image: "https://raw.githubusercontent.com/ianbrault/basil/refs/heads/master/Images/AppIcon.png",
            href: "https://github.com/ianbrault/basil",
            tags: ["iOS", "Swift"],
        },
        {
            name: "Personal Website",
            description: "this one",
            image: "/images/react.png",
            href: "https://github.com/ianbrault/website",
            tags: ["Typescript", "React", "NextJS"],
        },
        {
            name: "case_iterable",
            nameElement: <><span className={styles.project_name_mono}>case_iterable</span> crate</>,
            description: "procedural macro to iterate over enum variants ala Swift",
            image: "/images/rust.png",
            href: "https://crates.io/crates/case_iterable",
            tags: ["Rust"],
        },
        {
            name: "Sleeper Stats",
            description: "dashboard for Sleeper fantasy football statistics",
            image: "/images/sleeper.jpg",
            href: "/sleeper",
            tags: ["Typescript", "React"],
        },
        {
            name: "NYT Cooking Downloader",
            description: "downloads recipes from NYT Cooking into Apple Notes",
            image: "/images/nyt_cooking.png",
            href: "https://github.com/ianbrault/nyt_cooking",
            tags: ["Python"],
        },
        {
            name: "Advent of Code",
            description: "solutions implemented in Rust",
            image: "/images/rust.png",
            href: "https://github.com/ianbrault/aoc",
            tags: ["Rust"],
        },
        {
            name: "Bruin Bash 2018",
            description: "teaser site for UCLA's 2018 Bruin Bash concert",
            image: "/images/ucla.jpg",
            href: "/archive/bbash18-teaser",
            tags: ["Javascript"],
        },
    ];
    const openSource = [
        {
            name: "F-Prime",
            description: "flight software and embedded systems framework",
            image: "/images/nasa.png",
            href: "https://github.com/nasa/fprime",
            tags: ["C++"],
        },
        {
            name: "F-Prime Vorago",
            description: "F-Prime board support package for Vorago microcontrollers",
            image: "/images/fprime.png",
            href: "https://github.com/fprime-community/fprime-vorago",
            tags: ["C++"],
        },
    ];
    const projectList = projects.map((project, i) => (
        <ProjectItem key={i} project={project}/>
    ));
    const openSourceList = openSource.map((project, i) => (
        <ProjectItem key={i} project={project}/>
    ));

    return (
        <VFlex className={styles.wrapper}>
            <Header text="Projects" homeButton/>
            {projectList}
            <p className={styles.subheading}>Open-source contributions</p>
            {openSourceList}
        </VFlex>
    );
}
