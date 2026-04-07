const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true },
    category:    { type: String, required: true },
    images:      { type: [String], default: [] },  // array of URLs or local paths
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);