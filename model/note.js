const mongoose = require("mongoose")

const Note = mongoose.model("note", {
    user_id: {
        type: String,
        required: true,
    },
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
})

module.exports = Note
