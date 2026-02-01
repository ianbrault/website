/*
** app/archive/faroutfest/page.tsx
*/

/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import Link from "next/link";
import Script from "next/script";

import "./styles/faroutfest.css";

export default function FarOutFest() {
    return (
        <>
            <div id="content">
                <section id="s1">
                    <div id="slideshow">
                        <img src="/images/archive/faroutfest/slideshow/1.jpg"/>
                    </div>
                    <div className="home">
                        <img id="logo" src="/images/archive/faroutfest/logo_new.png"/>
                        <div className="home-row date-row">
                            <svg className="date" width="100%">
                                <text id="date" x="50%" dy="1em">
                                    May 4th 2019, 2pm - 12am
                                </text>
                            </svg>
                        </div>
                        <div className="home-row location-row">
                            <svg className="location" width="100%">
                                <text id="location" x="50%" dy="1em">
                                    Broxton Avenue, Los Angeles
                                </text>
                            </svg>
                        </div>
                        <div className="home-row">
                            <Link href="/archive/faroutfest/faq">
                                <div className="button">faq</div>
                            </Link>
                            <Link target="_blank" href="https://www.eventbrite.com/e/westwoods-far-out-fest-tickets-58032997257">
                                <div className="button">rsvp</div>
                            </Link>
                        </div>
                    </div>
                </section>
                <div id="content-wrapper">
                    <img id="background" src="/images/archive/faroutfest/background-opt-comp.svg"/>
                    <p id="copy">
                        Welcome to Westwood’s Far Out Fest (formerly known as “Westwoodstock”) - a music and art festival
                        showcasing local up-and-coming artists. Far Out Fest is a celebration of the incredible talent we host
                        right here in our community. Whether it’s from the UCLA student body, the residents of Westwood Village,
                        or from the greater region of West LA, this community is rich with music and artistic culture, and it’s
                        about time we showed the world what we can do! Let’s kick it off together, May 4th 2pm to midnight.
                    </p>
                    <div id="lineup-wrapper">
                        <p id="lineup-title"></p>
                        <p id="lineup-switch">click to see past lineups</p>
                        <div id="lineup-text-wrapper"></div>
                    </div>
                    <div id="sponsors-wrapper">
                        <p className="sponsors-title">sponsors</p>
                        <p className="sponsor">The North Westwood Neighborhood Council</p>
                        <p className="sponsor">The Westwood Village Improvement Association</p>
                        <div className="sponsors-row">
                            <img className="ww-logo" src="/images/archive/faroutfest/ww_village.png"/>
                            <img className="ww-logo" src="/images/archive/faroutfest/nwnc.png"/>
                        </div>
                        <img className="getaround" src="/images/archive/faroutfest/getaround.png"/>
                    </div>
                    <div id="stage-wrapper">
                        <img id="stage-logo" src="/images/archive/faroutfest/logo_new.png"/>
                        <div className="stage-row">
                            <Link href="/archive/faroutfest/faq">
                                <div className="button stage-button">faq</div>
                            </Link>
                            <Link target="_blank" href="https://www.eventbrite.com/e/westwoods-far-out-fest-tickets-58032997257">
                                <div className="button stage-button">rsvp</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <img id="van" src="/images/archive/faroutfest/van-opt-comp.svg"/>
            <div id="nav-wrapper">
                <nav id="nav">
                    <a className="navitem" href="#s1">home</a>
                    <a className="navitem" href="#copy">about</a>
                    <a className="navitem" href="#lineup-wrapper">lineup</a>
                    <a className="navitem" href="#sponsors-wrapper">sponsors</a>
                    <a className="navitem" href="#stage-wrapper">faq/rsvp</a>
                    <div id="progressbg"></div>
                    <div id="progress"></div>
                </nav>
            </div>
            <Script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"/>
            <Script src="/scripts/archive/faroutfest/faroutfest.js"/>
            <Script src="/scripts/archive/faroutfest/slideshow.js"/>
            <Script src="/scripts/archive/faroutfest/lineup.js"/>
        </>
    );
}
