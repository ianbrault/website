/*
 * src/components/Navbar.js
 * renders navbar menu
 */

import m from "mithril";

class NavItem {
    view() {
        return m("div", "navbar item");
    }
}

class Navbar {
    view() {
        return m("nav", 
            m(NavItem, {title: "Home"}),
            m(NavItem, {title: "About"}),
            m(NavItem, {title: "Websites"}),
            m(NavItem, {title: "Software"}),
        );
    }
}

export default Navbar;
