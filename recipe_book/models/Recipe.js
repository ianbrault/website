/*
** recipe_book/models/Recipe.js
*/

import { model, Schema } from "npm:mongoose@^6.7";

const recipeSchema = new Schema({
    _id: false,
    uuid: {
        type: String,
        required: true,
    },
    folderId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    ingredients: [String],
    instructions: [String],
});

export default model("Recipe", recipeSchema);
