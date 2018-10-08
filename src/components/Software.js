/*
 * src/components/Software.js
 * software portfolio
 */

import m from "mithril";

import TitleBar from "./TitleBar";

let Software = {
    view: function(vnode) {
        return m(".content",
            m(TitleBar, {title: "software"}),
            m("p.coming-soon", "coming soon...")
        );
    }
};

export default Software;