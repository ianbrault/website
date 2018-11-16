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
                    bot_id: "0776e81e17083d03af04351603",
                    "attachments" : [{
                        "type": "image",
                        "url": "https://i.groupme.com/568x771.png.84c4f1dd3f634ef5a44841951137f8a2",
                    }],
                }
            };

            request.post(msg_post_url, post_body, (err, res, body) => {
                if (err)
                    console.error(err);
            });
        }
    }

    res.status(200).send("message received");
}