/*
** todoTextParser.js
*/

import { v4 as uuidv4 } from "uuid";

const ItemRegex = /^\s*\[( |x)\]/;
const SpacePerIndent = 4;

function parseItem(line) {
    let i = 0;
    // skip leading whitespace
    while (line[i] === " " && i < line.length) {
        i++;
    }
    const level = i / SpacePerIndent;
    // check if the item is checked
    const indicator = line.slice(i, i + 3);
    const isChecked = indicator === "[x]";
    // grab the text
    const text = line.slice(i + 4);

    return {
        id: uuidv4(),
        level: level,
        isChecked: isChecked,
        text: text,
    };
}

export function parse(text) {
    const items = [];

    const lines = text.split(/\r?\n/);
    let currentDate = undefined;
    let dateItems = [];
    for (const [i, line] of lines.entries()) {
        // skip empty lines
        if (!line) {
            continue;
        }
        // check if this is a date line
        if (line.startsWith("DATE: ")) {
            // if this terminates a previous date, store to the array
            if (currentDate !== undefined) {
                items.push({date: currentDate, items: dateItems});
                dateItems = [];
            }
            // date is stored in UTC form, just grab the string
            currentDate = line.slice(5);
        }
        // otherwise check if this is a to-do item line
        else if (ItemRegex.test(line)) {
            // ensure that a date has already been parsed
            if (currentDate === undefined) {
                // TODO: add more complex error handling
                console.error(`line ${i}: parsed a to-do item before a date`);
                return [];
            }
            const item = parseItem(line);
            dateItems.push(item);
        }
        // otherwise raise an error
        else {
            // TODO: add more complex error handling
            console.error(`failed to parse line ${i}: ${line}`);
            return [];
        }
    }
    // terminate the final date
    items.push({date: currentDate, items: dateItems});

    return items;
}

function dumpItem(item) {
    const pad = " ".repeat(item.level * SpacePerIndent);
    const indicator = item.isChecked ? "[x]" : "[ ]";
    return `${pad}${indicator} ${item.text}`;
}

export function dump(contents) {
    const lines = [];

    for (const entry of contents) {
        const { date, items } = entry;
        lines.push(`DATE: ${date.toUTCString()}`);
        for (const item of items) {
            lines.push(dumpItem(item));
        }
    }

    return lines.join("\n");
}

