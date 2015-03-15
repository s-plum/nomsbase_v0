var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RecipeSchema = new Schema({
	recipeid: { type: Number, required: true, index: { unique: true } },
    name: { type: String, required: true },
    instructions: { type: String, required: true },
    bakingTemp: Number,
    tags: [String],
    ingredientGroups: Schema.Types.Mixed
});

module.exports = mongoose.model('Recipe', RecipeSchema);