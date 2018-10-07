/*
 * src/components/Websites.js
 * web-dev portfolio
 */

import m from "mithril";

import TitleBar from "./TitleBar";

let Websites = {
    view: function(vnode) {
        let className = ".content#websites--container";
        if (vnode.attrs.active === "websites") className += ".container--shown";
        else className += ".container--hidden";

        return m(className,
            m(TitleBar, {title: "websites"}),
            m("p.coming-soon", "coming soon...")
        );
    }
};

export default Websites;