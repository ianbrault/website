/*
** todoTextParser.js
*/

import { v4 as uuidv4 } from "uuid";

const SpacePerIndent = 4;

// TODO: ADD ERROR HANDLING
export function parse(text) {
    let items = [];

    text.split(/\r?\n/).forEach((line) => {
        let i = 0;
        // skip leading whitespace
        while (line[i] === " ") {
            i++;
        }
        let level = i / SpacePerIndent;
        // check if the item is checked
        let indicator = line.slice(i, i + 3);
        let isChecked = indicator === "[x]";
        // grab the text
        let text = line.slice(i + 4);

        items.push({id: uuidv4(), level: level, isChecked: isChecked, text: text});
    });

    return items;
}

export function dump(items) {
    let itemTexts = [];

    items.forEach((item) => {
        let pad = " ".repeat(item.level);
        let indicator = item.isChecked ? "[x]" : "[ ]";
        itemTexts.push(`${pad}${indicator} ${item.text}`);
    });

    return itemTexts.join("\n");
}

