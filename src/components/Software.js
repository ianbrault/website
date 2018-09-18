/*
 * src/components/Software.js
 * software portfolio
 */

import m from "mithril";

let Software = {
    view: function(vnode) {
        let className = ".content#software--container";
        if (vnode.attrs.active === "software") className += ".container--shown";
        else className += ".container--hidden";

        return m(className);
    }
};

export default Software;