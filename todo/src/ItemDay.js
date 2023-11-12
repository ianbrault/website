/*
** ItemDay.js
*/

import { v4 as uuidv4 } from "uuid";

import { Item } from "./Item.js";

export class ItemDay {
    constructor(date, items, id = undefined) {
        if (!id) {
            this.id = uuidv4();
        } else {
            this.id = id;
        }
        this.date = date;
        this.items = items;
    }

    toJSON() {
        return {
            id: this.id,
            date: this.date.toUTCString(),
            items: this.items.map((item) => item.toJSON()),
        }
    }

    static fromJSON(obj) {
        const date = new Date(Date.parse(obj.date));
        const items = obj.items.map((item) => Item.fromJSON(item));
        return new ItemDay(date, items, obj.id);
    }
}

