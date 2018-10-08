/*
 * src/views/Layout.js
 * renders nav bar above the page content
 */

import m from "mithril";

import About from "../components/About";
import Home from "../components/Home";
import Navbar from "../components/Navbar";
import Software from "../components/Software";
import Websites from "../components/Websites";

let Layout = {
    oninit: function(vnode) {
        vnode.state.active = "home";
    },

    nav: function(vnode, event) {
        vnode.state.active = event.target.innerHTML;
    },

    view: function(vnode) {
        let page = null;
        if (vnode.state.active === "home") page = m(Home);
        else if (vnode.state.active === "about") page = m(About);
        else if (vnode.state.active === "websites") page = m(Websites);
        else if (vnode.state.active === "software") page = m(Software);

        return m("main.layout", [
            m(Navbar, {
                active: vnode.state.active,
                nav: this.nav.bind(this, vnode)
            }),
            page
        ]);
    }
};

export default Layout;
