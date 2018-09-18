/*
 * src/components/About.js
 * renders an "about me" page
 */

import m from "mithril";

let About = {
    view: function(vnode) {
        let className = ".content#about--container";
        if (vnode.attrs.active === "about") className += ".container--shown";
        else className += ".container--hidden";

        return m(className);
    }
};

export default About;