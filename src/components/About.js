/*
 * src/components/About.js
 * renders an "about me" page
 */

import m from "mithril";

let About = {
    view: function(vnode) {
        return m(".content",
            m(".about--content-wrapper",
                m("div",
                    m("p.about--title", "about me"),
                    m("img.about--image", {src: "/img/me.jpg"}),
                ),
                m("p.about--copy",
                    "Hello! My name is Ian, I'm currently a 4th year student at UCLA studying computer science.", m("br"), m("br"), "I mainly work with C and C++, and have recently been messing around with Rust. I also have experience with full-stack web development, Python, and lately some iOS development with React Native. Check out ", m("a.about--link", {href: ""}, "my resume"), " to see more, or check out some of my past & current projects through the links above.", m("br"), m("br"), "I'm interested primarily in systems-level programming but am also passionate about programming languages, compilers, and UI/UX design.", m("br"), m("br"), "In my free time, you can find me obsessively following the NBA and UCLA basketball, doing outdoors things, or working on personal projects."
                ),
            )
        );
    }
};

export default About;