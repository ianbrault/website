/*
** Item.js
*/

import { v4 as uuidv4 } from "uuid";

export class Item {
    constructor(text, level, isChecked = false, id = undefined) {
        if (!id) {
            this.id = uuidv4();
        } else {
            this.id = id;
        }
        this.text = text;
        this.level = level;
        this.isChecked = isChecked
    }

    toJSON() {
        return {
            id: this.id,
            text: this.text,
            level: this.level,
            isChecked: this.isChecked,
        }
    }

    static fromJSON(obj) {
        return new Item(obj.text, obj.level, obj.isChecked, obj.id);
    }
}

