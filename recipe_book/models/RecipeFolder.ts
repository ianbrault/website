/*
** recipe_book/models/RecipeFoldere.ts
*/

import { model, Schema } from "npm:mongoose@^6.7";

const recipeFolderSchema = new Schema({
    _id: false,
    uuid: {
        type: String,
        required: true,
    },
    folderId: {
        type: String,
    },
    name: {
        type: String,
    },
    recipes: {
        type: [String],
    },
    subfolders: {
        type: [String],
    },
});

export default model("RecipeFolder", recipeFolderSchema);
