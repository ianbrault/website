/*
** app/sleeper/components/LoadingBar.tsx
*/

import styles from "./LoadingBar.module.css";

interface LoadingBarProps {
    loading: boolean;
}

export default function LoadingBar({ loading }: LoadingBarProps) {
    return (
        <div
            className={styles.loadingBarWrapper}
            style={{
                display: loading ? "inherit" : "none"
            }}
        >
            <div className={styles.loadingBarSlider}/>
        </div>
    );
}
