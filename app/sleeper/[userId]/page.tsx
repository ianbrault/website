/*
** app/sleeper/[userId]/page.tsxs
*/

import { League, getUserCurrentLeagues } from "../api";

import LeagueForm from "./components/LeagueForm";

interface SleeperUserProps {
    params: Promise<{ userId: string }>;
}

export default async function SleeperUser({ params }: SleeperUserProps) {
    const { userId } = await params;

    let leagues: League[] = [];
    let error = "";
    try {
        leagues = await getUserCurrentLeagues(userId);
    } catch (err) {
        error = `${err}`;
    }

    return (
        <LeagueForm userId={userId} leagues={leagues} error={error} />
    );
}
