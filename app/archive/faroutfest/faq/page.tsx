/*
** app/archive/faroutfest/faq/page.tsx
*/

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import "../styles/faroutfest_faq.css";

export default function Faq() {
    return (
        <>
            <Link href="/archive/faroutfest">
                <img id="logo" src="/images/archive/faroutfest/logo_new.png" alt="Far Out Fest"/>
            </Link>
            <svg width="100%">
                <text id="title" x="50%" dy="1em">frequently asked questions</text>
            </svg>
            <div className="content-wrapper">
                <div className="row">
                    <p className="q">Q: Where and when is Far Out Fest?</p>
                    <p className="a">Far Out Fest is on May 4th from 2pm until 12am on Broxton Avenue.</p>
                </div>
                <div className="row">
                    <p className="q">Q: Is Far Out Fest free?</p>
                    <p className="a">Yes!</p>
                </div>
                <div className="row">
                    <p className="q">Q: Is Far Out Fest kid-friendly?</p>
                    <p className="a">Yes!</p>
                </div>
                <div className="row">
                    <p className="q">Q: How do I reach you?</p>
                    <p className="a">
                        Email us!  <a href="mailto:team@faroutpresents.com">team@faroutpresents.com</a>
                    </p>
                </div>
            </div>
            <Link id="back-link" href="/archive/faroutfest">
                <p id="back">go back</p>
            </Link>
        </>
    );
}
