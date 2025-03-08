/*
** components/FileInput.tsx
*/

import React from "react";

import "./styles/FileInput.css";

interface FileInputProps {
    label: string;
    accept: string;
    onChange: (file: File) => void;
}

export default function FileInput({ label, accept, onChange }: FileInputProps) {
    function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            onChange(event.target.files[0]);
        }
    }

    return (
        <form className="file-input">
            <label htmlFor="file-input">{label}</label>
            <input
                type="file"
                accept={accept}
                onChange={onFileChange}
                className="file-input--input"
            />
        </form>
    );
}
