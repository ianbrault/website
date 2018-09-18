/*
 * src/components/Navbar.js
 * renders navbar menu
 */

import m from "mithril";

let NavItem = {
    view: function(vnode) {
        let className = ".nav-item--"
            + (vnode.attrs.active === vnode.attrs.title ? "active" : "inactive");
        if (vnode.attrs.title === "home")
            className += ".nav-item--home";

        return m(className, {onclick: vnode.attrs.nav}, vnode.attrs.title);
    }
};

let Navbar = {
    view: function(vnode) {
        let props = {active: vnode.attrs.active, nav: vnode.attrs.nav};
        return m("nav",
            m(NavItem, Object.assign({title: "home"}, props)),
            m(".nav--spacer"),
            m(NavItem, Object.assign({title: "about"}, props)),
            m(NavItem, Object.assign({title: "websites"}, props)),
            m(NavItem, Object.assign({title: "software"}, props)),
        );
    }
};

export default Navbar;
