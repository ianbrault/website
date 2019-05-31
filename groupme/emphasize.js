/*
 * groupme/emphasize.js
 * callback URL for the "Emphasis Bot" bot
 */

const request = require("request");

const Log = require("../log");

let prev_message = undefined;

exports = module.exports = function(req, res) {
    Log.log("POST /groupme/emphasize");

    if (req.body && req.body.text) {
        let text = req.body.text;
        let text_clean = text.replace(/^\s+|\s+$/g, "").toLowerCase();

        if (text_clean === "!emphasize" && prev_message != undefined) {
            let response_text = `@${req.body.name} emphasized "${prev_message}"`;
            let res_body = {
                json: {
                    bot_id: "0941280baccc5b344ee6a88980",
                    text: response_text,
                    attachments: {
                        type: "mentions",
                        user_ids: [req.body.user_id],
                        loci: [0, 1 + req.body.name.length]
                    }
                }
            };

            request.post("https://api.groupme.com/v3/bots/post", res_body, (err, res, body) => {
                if (err)
                    console.error(err);
            });
        } else {
            if (req.body.name !== "iMessage")
                prev_message = text;
        }
    }

    res.status(200).send("message received");
}
