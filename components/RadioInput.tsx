/*
** components/RadioInput.tsx
*/

import React from "react";

import "./styles/RadioInput.css";

interface RadioInputProps {
    value: string;
    label: string;
    checked: boolean;
    onChange: (selection: string) => void;
}

export default function LeagueSelector({ value, label, checked, onChange }: RadioInputProps) {

    function onSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value);
    }

    return (
        <label className="components--radio-input--label">
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
