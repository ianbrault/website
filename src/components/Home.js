/*
 * src/components/Home.js
 * renders landing page
 */

import m from "mithril";

let Home = {
    oninit: function(vnode) {
        vnode.state.hovered = -1;
    },

    hover: function(vnode, i) {
        vnode.state.hovered = i;
    },

    view: function(vnode) {
        return m(".content#home--container",
            m(".home--image-wrapper",
                m(".home--back-border"),
                m("img.home--image", {src: "/img/home.jpg"}),
                m(".home--front-border"),
            ),
            m("div",
                m("p.home--title", "ian brault"),
                m("p.home--subtitle", "junior developer"),
                m("p.home--subtitle", "UCLA student"),
                m(".home--icon-container",
                    m("a.home--icon-wrapper", {
                        href: "https://github.com/ianbrault",
                        target: "_blank",
                        onmouseenter: () => this.hover(vnode, 0),
                        onmouseleave: () => this.hover(vnode, -1),
                    }, m("img.home--icon", {
                        src: `/img/github_${vnode.state.hovered === 0 ? "dark" : "light"}.svg`
                    })),
                    m("a.home--icon-wrapper", {
                        href: "https://www.linkedin.com/in/ianbrault/",
                        target: "_blank",
                        onmouseenter: () => this.hover(vnode, 1),
                        onmouseleave: () => this.hover(vnode, -1),
                    }, m("img.home--icon", {
                        src: `/img/linkedin_${vnode.state.hovered === 1 ? "dark" : "light"}.svg`
                    })),
                    m("a.home--icon-wrapper", {
                        href: "https://twitter.com/ianbrault",
                        target: "_blank",
                        onmouseenter: () => this.hover(vnode, 2),
                        onmouseleave: () => this.hover(vnode, -1),
                    }, m("img.home--icon", {
                        src: `/img/twitter_${vnode.state.hovered === 2 ? "dark" : "light"}.svg`
                    })),
                ),
            ),
        );
    }
};

export default Home;
