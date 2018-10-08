/*
 * src/components/Software.js
 * software portfolio
 */

import m from "mithril";

import TitleBar from "./TitleBar";

let Software = {
    oncreate: function(vnode) {
        setTimeout(() => this.fadeIn(vnode), 200);
    },

    fadeIn: function(vnode) {
        vnode.dom.classList.add("fade-in");
        vnode.dom.classList.remove("prefade");
    },

    view: function(vnode) {
        return m("#software--container.content.prefade",
            m(TitleBar, {title: "software"}),
            m("p.coming-soon", "coming soon...")
        );
    }
};

export default Software;