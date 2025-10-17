/*
** app/sleeper/[userId]/[leagueId]/loading.tsx
*/

import LoadingBar from "../../components/LoadingBar";

export default function Loading() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <p
                style={{
                    fontSize: "0.8rem",
                    color: "var(--secondary-text)",
                }}
            >
                Loading league info...
            </p>
            <LoadingBar loading={true}/>
        </div>
    );
}
