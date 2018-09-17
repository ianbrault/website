/*
 * src/components/Navbar.js
 * renders navbar menu
 */

import m from "mithril";

class NavItem {
    view(vnode) {
        let [active, title] = [vnode.attrs.active, vnode.attrs.title];
        let className = `.nav-item--${active === title ? "active" : "inactive"}`;

        return m(className, {onclick: () => vnode.attrs.nav(title)}, title);
    }
}

class Navbar {
    view(vnode) {
        return m("nav",
            m(NavItem, {title: "home", active: vnode.attrs.active, nav: vnode.attrs.nav}),
            m(".nav--spacer"),
            m(NavItem, {title: "about", active: vnode.attrs.active, nav: vnode.attrs.nav}),
            m(NavItem, {title: "websites", active: vnode.attrs.active, nav: vnode.attrs.nav}),
            m(NavItem, {title: "software", active: vnode.attrs.active, nav: vnode.attrs.nav}),
        );
    }
}

export default Navbar;
