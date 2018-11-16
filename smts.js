/*
 * smts.js
 * callback URL for the "show me the Skaktis" GroupMe bot
 */

const request = require("request");
require("dotenv").config();

const msg_post_url = "https://api.groupme.com/v3/bots/post";

exports = module.exports = function(req, res) {
    if (req.body && req.body.text) {
        let msg = req.body.text.replace(/^\s+|\s+$/g, "").toLowerCase();
        if (msg === "show me the skaktis") {
            let post_body = {
                json: {
                    bot_id: process.env.BOT_ID,
                    text: "I am Skaktis",
                }
            };
            console.log(post_body);

            request.post(msg_post_url, post_body, (err, res, body) => {
                if (err)
                    console.error(err);
                console.log(body);
            });
        }
    }

    res.status(200).send("message received");
}