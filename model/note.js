const mongoose = require("mongoose");

const Note = mongoose.model("note", {
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
});

module.exports = Note;
