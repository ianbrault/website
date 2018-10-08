/*
 * src/components/Websites.js
 * web-dev portfolio
 */

import m from "mithril";

import TitleBar from "./TitleBar";

let Websites = {
    view: function(vnode) {
        return m(".content",
            m(TitleBar, {title: "websites"}),
            m("p.coming-soon", "coming soon...")
        );
    }
};

export default Websites;