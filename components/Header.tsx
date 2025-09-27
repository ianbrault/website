/*
** components/Header.tsx
*/

import Link from "next/link";

import VFlex from "@/components/VFlex";

interface HeaderProps {
    text: string;
    homeButton?: boolean;
    className?: string;
}

export default function Header({ text, homeButton, className }: HeaderProps) {
    const textStyle = {
        fontWeight: "bold",
        fontSize: "40px",
    };
    const linkTextStyle = {
        fontSize: "14px",
    };

    const homeButtonElement = (
        <Link href="/">
            <p style={linkTextStyle}>{"< Home"}</p>
        </Link>
    );
    return (
        <VFlex className={className} gap={4}>
            <p style={textStyle}>{text}</p>
            {homeButton && homeButtonElement}
        </VFlex>
    )
}
