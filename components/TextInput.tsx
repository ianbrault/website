/*
** components/TextInput.tsx
*/

"use client";

import React, { useState } from "react";

interface TextInputProps {
    className?: string;
    label: string;
    onChange: (text: string) => void;
}

export default function TextInput({ className, label, onChange }: TextInputProps) {
    const [text, setText] = useState("");

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setText(event.target.value);
        onChange(event.target.value);
    }

    return (
        <>
            <label
                style={{
                    fontSize: "1rem",
                    color: "var(--secondary-text)",
                }}
            >
                {label}
            </label>
            <input
                type="text"
                value={text}
                className={className}
                onChange={onInputChange}
                style={{
                    appearance: "none",
                    MozAppearance: "none",
                    WebkitAppearance: "none",
                    fontSize: "1rem",
                    border: "1px solid black",
                    borderRadius: 6,
                    padding: "4px 8px",
                }}
            />
        </>
    );
}
