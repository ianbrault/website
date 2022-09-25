/*
** ItemDate.js
*/

export class ItemDate {
    constructor(date, month, year) {
        this.date = date;
        this.month = month;
        this.year = year;
    }

    static today() {
        let date = new Date();
        return new ItemDate(
            date.getDate(), date.getMonth(), date.getFullYear()
        );
    }
}

