const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  UUID: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;