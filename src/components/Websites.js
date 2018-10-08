/*
 * src/components/Websites.js
 * web-dev portfolio
 */

import m from "mithril";

import TitleBar from "./TitleBar";

let Websites = {
    oncreate: function(vnode) {
        setTimeout(() => this.fadeIn(vnode), 200);
    },

    fadeIn: function(vnode) {
        vnode.dom.classList.add("fade-in");
        vnode.dom.classList.remove("prefade");
    },

    view: function(vnode) {
        return m("#websites--container.content.prefade",
            m(TitleBar, {title: "websites"}),
            m("p.coming-soon", "coming soon...")
        );
    }
};

export default Websites;