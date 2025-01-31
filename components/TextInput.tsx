/*
** components/TextInput.tsx
*/

import React from "react";

import "./styles/TextInput.css";

interface TextInputProps {
    label: string;
    onChange: (text: string) => void;
    className: string;
}

export default function TextInput({ label, onChange, className = "" }: TextInputProps) {
    const [text, setText] = React.useState("");
    const classes = ["components--text-input--input"];
    if (className) {
        classes.push(className);
    }

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setText(event.target.value);
        onChange(event.target.value);
    }

    return (
        <>
            <label className="components--text-input--label">{label}</label>
            <input
                type="text"
                className={classes.join(" ")}
                value={text}
                onChange={onInputChange}
            />
        </>
    );
}