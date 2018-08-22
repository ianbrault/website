/*
 * src/views/Layout.js
 * renders nav bar above the page content
 */

import m from "mithril";

import Home   from "../components/Home";
import Navbar from "../components/Navbar";

let Layout = {
    view: function() {
        return m("main.layout", [
            m(Navbar),
            m(Home),
        ]);
    }
};

export default Layout;
