/*
 * lineup.js
 */

let lineup_title = document.getElementById("lineup-title");
let lineup_switch = document.getElementById("lineup-switch");
let lineup_body = document.getElementById("lineup-text-wrapper");

const lineup_2019 = [
    "PARTY SHIRT", "HVNNIBVL", "DJ Bbddy", "Apollo Bebop", "Thom.ko", "Dark Dazey", "Adobe House",
    "The Millenial Club", "Amir Kelly", "Chel", "Ryan Cassata", "Eva B. Ross", "Pragathi Guru",
    "BEL", "Jherz", "Lauren Reiner"
];

const lineup_2019_links = [
    "https://open.spotify.com/artist/5QsM7I7aDux4F7lm8aWBNA?si=H0FPjEqbRSm0gipUx2Kgpw",
    "https://open.spotify.com/artist/7vTVlsNH3dt1nn4TMkRQIN?si=w9jZlmvbSI25EZRpja7nYA",
    "https://open.spotify.com/artist/7wM8PGqgbjY7Oyo4ciVJnS?si=i2r2snDDR_mT9ypEzTM1Rg",
    "https://open.spotify.com/artist/5Ar4PuRM6i2krbQ8QduUFG?si=MlTfDwAfRoCtw4as_ySExQ",
    "https://open.spotify.com/artist/3dWWHuyPD2YOd7B8geKidf?si=oX07AAIMT-Wr0NHr97nI0Q",
    "https://open.spotify.com/artist/4hdbPv7t0amGbnuIMVcXja?si=iJX7dSl9S4K0IF_fnT5QQw",
    "https://open.spotify.com/artist/2f4V4yJ3BeQl2ZhQY7DpsB?si=JszZmVNBR0yTMdzEgQZMvQ",
    "https://open.spotify.com/artist/5Mk3yOBlfweeKamsDiap8H?si=PlyfUXalQCKoh19-vVXHaQ",
    "https://open.spotify.com/artist/6AoLcwHezrOIByvU0kP7ct?si=WdZtGiH7SgKSWaGKKG44WA",
    "https://open.spotify.com/artist/1GC4Fvx1sbDOkzIAPlNPxE?si=l79ZSsnUQj-pqktcXrLguw",
    "https://open.spotify.com/artist/0tFlCZaGI6bC1XxtfzIhmG?si=pekXVjsHRMyZvDDtd3pvAw",
    "https://open.spotify.com/artist/7GiQADKi0abGiu4N77vCDw?si=45IQjfrwSyORltGGCu5t_Q",
    "https://open.spotify.com/artist/1IMZlbjHW9DCrW6xbtjI6F?si=KS8CH9DJQDegHNKQyXLt3Q",
    "https://soundcloud.com/belwhelanmusic",
    "https://open.spotify.com/artist/35Xnj9H1l4mPcG9Ft3bKPU?si=cUmQDMO1Q_utEChqwuu71g",
    "https://open.spotify.com/artist/5xDlkjMvKOEsu304irPFxx?si=gugndAs0S5W2WdJXlqYdbQ",
];

const lineup_2018 = [
    "ANIMVLZ", "Blue Apples", "Dio Lewis", "My Friend Ryan", "Munir Griffin", "The Dreads",
    "Triangle Fire", "Ascanio", "Cerulean", "Drew Karperos", "Nightswimmers", "Officer Gavin",
    "BEL", "Cole Heramb & The Flame Train", "Miles Gibson", "Temme Scott", "Tree Down Kelton"
];

const lineup_2017_maj = [
    "Alec Be", "Austin Gatus", "Cassie Thompson", "Colin Tandy", "Girl Friday",
    "Global Soul Collective", "Griff Klawson", "GUP TRUP", "Miles Gibson", "Shawn Dawg",
    "Semichrome", "Temme Scott", "Triangle Fire", "97 Caravan"
];

const lineup_2017_min = [
    "AVTR", "Ear Ringers", "Good Luck Club", "Griff Klawson", "Kendirck", "Laura Savage",
    "Lost City Ratio", "Nightswimmers", "Putrifiers", "Rey Matthews", "Reyma", "The Rosewaters",
    "Ryan Chen", "Santiago’s Trip", "Stefan Dismond and the Love Supreme", "Tharp’s Logg",
    "Torso Twin", "Uncharted Territory", "Voodoo", "Willow and the Rain", "4kei"
];

const lineupDot = "&nbsp;<span class=\"dot\">•</span>&nbsp;";

const zipWith = (a, b, func) => a.map((e, i) => func(e, b[i]));
const artist_link_zip = (artist, link) => `<a target="_blank" href="${link}">${artist}</a>`;

const join_artist_strings = (lineup) => lineup.join(lineupDot);
const join_artist_strings_2019 = (lineup, links) => zipWith(lineup, links, artist_link_zip).join(lineupDot);

let lineup_p_2019 = document.createElement("p");
lineup_p_2019.id = "lineup2018";
lineup_p_2019.innerHTML = join_artist_strings_2019(lineup_2019, lineup_2019_links);

let lineup_p_2018 = document.createElement("p");
lineup_p_2018.id = "lineup2018";
lineup_p_2018.innerHTML = join_artist_strings(lineup_2018);

let lineup_p_2017_maj = document.createElement("p");
lineup_p_2017_maj.id = "lineup2017-maj";
lineup_p_2017_maj.innerHTML = join_artist_strings(lineup_2017_maj);

let lineup_p_2017_min = document.createElement("p");
lineup_p_2017_min.id = "lineup2017-min";
lineup_p_2017_min.innerHTML = join_artist_strings(lineup_2017_min);

const unset_lineup = () => {
    while (lineup_body.firstChild)
        lineup_body.removeChild(lineup_body.firstChild);
};

let lineups = [2019, 2018, 2017];
let current_index = 0;

const set_lineup = (lineup_index) => {
    let year = lineups[lineup_index];
    lineup_title.innerHTML = `${year} Lineup`;

    if (year === 2017)
        lineup_switch.innerHTML = "click to see this year's lineup";
    else
        lineup_switch.innerHTML = "click to see past lineups";

    if (year === 2019) {
        lineup_body.appendChild(lineup_p_2019);
    } else if (year === 2018) {
        lineup_body.appendChild(lineup_p_2018);
    } else {
        lineup_body.appendChild(lineup_p_2017_maj);
        lineup_body.appendChild(lineup_p_2017_min);
    }

    current_index = lineup_index;
};

const swap_lineups = () => {
    unset_lineup();
    set_lineup((current_index + 1) % 3);
};

lineup_title.onclick = swap_lineups;
document.getElementById("lineup-switch").onclick = swap_lineups;

set_lineup(0);
