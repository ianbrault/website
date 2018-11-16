/*
 * smts.js
 * callback URL for the "show me the Skaktis" GroupMe bot
 */

const request = require("request");
require("dotenv").config();

const msg_post_url = "https://api.groupme.com/v3/bots/post";

exports = module.exports = function(req, res) {
    console.log(req.body);
    if (req.body && req.body.text) {
        console.log("skaktis message received");
        let msg = req.body.text.replace(/^\s+|\s+$/g, "").toLowerCase();
        console.log(msg);
        if (msg === "show me the skaktis") {
            let post_body = {
                bot_id: process.env.BOT_ID,
                text: "SKAKTIS",
            };
            console.log(post_body);

            request.post(msg_post_url, post_body, (err) => {
                if (err)
                    console.error(err);
            });
        }
    }

    return res.status(200).send("message received");
}