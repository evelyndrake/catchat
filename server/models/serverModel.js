const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, required: false}
});

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;