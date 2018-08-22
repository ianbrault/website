/*
 * src/index.js
 * main entry point
 */

import m from "mithril";

let component = {
    view: function() {
        return m("div", "hello, world!");
    }
}

m.mount(document.body, component);
