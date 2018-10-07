/*
 * src/components/Software.js
 * software portfolio
 */

import m from "mithril";

import TitleBar from "./TitleBar";

let Software = {
    view: function(vnode) {
        let className = ".content#software--container";
        if (vnode.attrs.active === "software") className += ".container--shown";
        else className += ".container--hidden";

        return m(className,
            m(TitleBar, {title: "software"}),
            m("p.coming-soon", "coming soon...")
        );
    }
};

export default Software;