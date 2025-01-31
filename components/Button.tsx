/*
** components/Button.tsx
*/

import React from "react";

import "./styles/Button.css";

interface ButtonProps {
    message: string;
    className: string;
}

export default function Button({ message, className = "" }: ButtonProps) {
    const classes = ["components--button"];
    if (className) {
        classes.push(className);
    }

    return (
        <button className={classes.join(" ")}>{message}</button>
    );
}