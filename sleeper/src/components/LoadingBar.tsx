/*
** sleeper/src/components/LoadingBar.tsx
*/

import React from "react";

import "../styles/LoadingBar.css"

interface LoadingBarProps {
    loading: boolean;
}

export default function LoadingBar({ loading }: LoadingBarProps) {
    return (
        <div
            className="loading-bar-wrapper"
            style={{display: loading ? "inherit" : "none"}}
        >
            <div className="loading-bar-slider"></div>
        </div>
    );
}