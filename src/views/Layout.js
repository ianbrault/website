/*
 * src/views/Layout.js
 * renders nav bar above the page content
 */

import m from "mithril";

import Home   from "../components/Home";
import Navbar from "../components/Navbar";

class Layout {
    constructor(vnode) {
        this.active = "home";
    }

    nav(newPage) {
        this.active = newPage;
    }

    view() {
        return m("main.layout", [
            m(Navbar, {active: this.active, nav: this.nav}),
            m(Home),
        ]);
    }
}

export default Layout;
