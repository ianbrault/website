/*
** components/Button.tsx
*/

interface ButtonProps {
    className?: string;
    message: string;
    onClick?: () => void;
}

export default function Button({ className, message, onClick }: ButtonProps) {
    return (
        <button
            className={className}
            onClick={onClick}
            style={{
                appearance: "none",
                MozAppearance: "none",
                WebkitAppearance: "none",
                fontSize: "0.9rem",
                fontWeight: "bold",
                backgroundColor: "var(--blue)",
                color: "var(--white)",
                border: "none",
                borderRadius: 6,
                padding: "8px 20px",
                cursor: "pointer",
            }}
        >
            {message}
        </button>
    );
}