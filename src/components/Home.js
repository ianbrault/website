/*
 * src/components/Home.js
 * renders landing page
 */

import m from "mithril";

let Home = {
    view: function() {
        return m(".content.home--container",
            m(".home--image-wrapper",
                m(".home--back-border"),
                m("img.home--image", {src: "/img/home.jpg"}),
                m(".home--front-border"),
            ),
            m("div",
                m("p.home--title", "ian brault"),
                m("p.home--subtitle", "junior developer"),
                m("p.home--subtitle", "UCLA student"),
            ),
        );
    }
};

export default Home;
