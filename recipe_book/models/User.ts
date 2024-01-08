/*
** recipe_book/models/User.ts
*/

import { model, Schema } from "npm:mongoose@^6.7";

import Recipe from "./Recipe.ts";
import RecipeFolder from "./RecipeFolder.ts";

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
        type: String,  // UUID
        required: true,
    },
    root: {
        type: String,  // UUID
    },
    recipes: {
        type: [Recipe.schema],
    },
    folders: {
        type: [RecipeFolder.schema],
    },
});

export default model("User", userSchema);
