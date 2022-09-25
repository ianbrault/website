/*
** Item.js
*/

import { v4 as uuidv4 } from "uuid";

export class Item {
    constructor(id, text, level) {
        this.id = id;
        this.text = text;
        this.level = level;
    }

    static newItem(text, level) {
        let id = uuidv4();
        return new Item(id, text, level);
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            level: this.level,
        }
    }

    static fromJSON(obj) {
        return new Item(obj.id, obj.text, obj.level);
    }
}

