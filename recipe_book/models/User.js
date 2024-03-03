/*
** recipe_book/models/User.ts
*/

import { model, Schema } from "npm:mongoose@^6.7";

import Recipe from "./Recipe.js";
import RecipeFolder from "./RecipeFolder.js";

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
    recipes: [Recipe.schema],
    folders: [RecipeFolder.schema],
});

export default model("User", userSchema);
