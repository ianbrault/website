/*
** components/RadioInput.tsx
*/

import React from "react";

interface RadioInputProps {
    value: string;
    label: string;
    checked: boolean;
    onChange: (selection: string) => void;
}

export default function RadioInput({ value, label, checked, onChange }: RadioInputProps) {

    function onSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return (
        <label
            style={{
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "1em auto",
                gap: "0.5em",
                fontSize: "1rem",
            }}
        >
            <input
                type="radio"
                value={value}
                checked={checked}
                onChange={onSelectionChange}
            />
            {label}
        </label>
    );
}
