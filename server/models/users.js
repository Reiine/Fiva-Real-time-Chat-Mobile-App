const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://reiine:testpass@cluster0.u7inkuy.mongodb.net/test")
    .then(() => {
        console.log("Mongodb connected successfully");
    })
    .catch((err) => {
        console.log("Error:", err);
    });

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    fivaId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pfp: {
        type: String
    },
    bio: {
        type: String
    },
    Chats: [
        {
            message: {
                type: String
            },
            withId: {
                type: String
            },
            date: {
                type: Date, // Store date and time in a single field
                default: Date.now // Default to current date and time
            }
        }
    ]
});

const users = mongoose.model("users", userSchema);

module.exports = users;
