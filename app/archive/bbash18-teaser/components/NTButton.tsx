/*
** app/archive/bbash18-teaser/components/NTButton.tsx
*/

import styles from "./NTButton.module.css";

interface NTButtonProps {
    text: string;
    noBorder?: boolean;
    onClick: () => void;
}

export default function NTButton({text, noBorder = false, onClick}: NTButtonProps) {
    return (
        <div className={styles.ntButtonWrapper}>
            <div className={styles.ntButton} onClick={onClick}>
                <p className={noBorder ? styles.ntButtonText : styles.ntButtonTextBorder}>
                    {text}
                </p>
            </div>
        </div>
    );
}
