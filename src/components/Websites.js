/*
 * src/components/Websites.js
 * web-dev portfolio
 */

import m from "mithril";

let Websites = {
    view: function(vnode) {
        let className = ".content#websites--container";
        if (vnode.attrs.active === "websites") className += ".container--shown";
        else className += ".container--hidden";

        return m(className);
    }
};

export default Websites;