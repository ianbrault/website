/*
** components/Button.tsx
*/

import React from "react";

import "./styles/Button.css";

interface ButtonProps {
    message: string;
    onClick?: () => void;
    className?: string;
}

export default function Button({ message, onClick = undefined, className = "" }: ButtonProps) {
    const classes = ["components--button"];
    if (className) {
        classes.push(className);
    }

    return (
        <button
            onClick={onClick}
            className={classes.join(" ")}
        >
            {message}
        </button>
    );
}