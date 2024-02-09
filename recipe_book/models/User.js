/*
** recipe_book/models/User.ts
*/

import { model, Schema } from "npm:mongoose@^6.7";

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,  // base64-encoded
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    root: String,
});

export default model("User", userSchema);
