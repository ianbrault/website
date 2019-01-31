
/*
 * smtsmts.js
 * callback URL for the "show me the show me the Skaktis" GroupMe bot
 */

const request = require("request");
require("dotenv").config();

const msg_post_url = "https://api.groupme.com/v3/bots/post";

exports = module.exports = function(req, res) {
    if (req.body && req.body.text) {
        let post_body = {
            json: {
                bot_id: "7626d507932caaba9dac3ca604",
                text: "",
            }
        };

        let msg = req.body.text.replace(/^\s+|\s+$/g, "").toLowerCase();
        if (msg === "show me the show me the skaktis") {
            post_body.json.text = "show me the skaktis";
        } else if (msg === "show me the show me the show me the skaktis") {
            post_body.json.text = "stack overflow: too many levels of irony";
        }

        request.post(msg_post_url, post_body, (err, res, body) => {
            if (err)
                console.error(err);
        });
    }

    res.status(200).send("message received");
}
