/*
** recipe_book/models/RecipeFolder.js
*/

import { model, Schema, Types } from "npm:mongoose@^6.7";

const RecipeFolderSchema = new Schema({
    userId: Types.ObjectId,
    uuid: {
        type: String,
        required: true,
    },
    folderId: String,
    name: String,
    recipes: [String],
    subfolders: [String],
});

export default model("RecipeFolder", RecipeFolderSchema);
