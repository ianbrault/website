/*
 * src/views/Layout.js
 * renders nav bar above the page content
 */

import m from "mithril";

import Home from "../components/Home";
import Navbar from "../components/Navbar";

let Layout = {
    oninit: function(vnode) {
        vnode.state.active = "home";
    },

    nav: function(vnode, event) {
        vnode.state.active = event.target.innerHTML;
    },

    view: function(vnode) {
        return m("main.layout", [
            m(Navbar, {
                active: vnode.state.active,
                nav: this.nav.bind(this, vnode)
            }),
            m(Home),
        ]);
    }
};

export default Layout;
