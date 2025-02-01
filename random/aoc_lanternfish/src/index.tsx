/*
** random/aoc_lanternfish/src/index.tsx
*/

import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App.tsx";

const root = createRoot(document.getElementById("app")!);
root.render(
    <App/>
);

