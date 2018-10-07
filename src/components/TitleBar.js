/*
 * src/components/TitleBar.js
 */

import m from "mithril";

let TitleBar = {
    view: function(vnode) {
        return m(".page--title-container",
            m("p.page--title", vnode.attrs.title)
        )
    }
};

export default TitleBar;