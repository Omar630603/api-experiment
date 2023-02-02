const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const options = {
  separator: "_",
  lang: "en",
  truncate: 120,
};
mongoose.set("strictQuery", false);
mongoose.plugin(slug, options);
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than 0"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    slug: {
      type: String,
      slug: "name",
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

module.exports = mongoose.model("Product", productSchema);
