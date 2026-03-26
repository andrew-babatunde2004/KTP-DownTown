
require("dotenv").config();
const express = require("express");
// handling the request from the website
const app = express();
app.use(express.json());
// figure out what api line we're posting to
app.post("/api/alert", async (req,res) => {
    const {message } = req.body;
// ?


try{
    await sendMessage(message);
    res.send("Sent!");
}catch (err) {
    res.status(500).send("Error sending message");
    }
});

app.listen(3000, () => console.log("Server running on port 3000"))