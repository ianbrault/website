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
            let user_name = req.body.name;
            let user_id = req.body.user_id;
            Log.log(`!emphasize command from user ${user_name} (${user_id})`);

            let response_text = `@${user_name} emphasized "${prev_message}"`;
            let res_body = {
                json: {
                    bot_id: "f94e5b0ab0e0b1f1c265aaa60f",
                    text: response_text,
                    attachments: [
                        {
                            type: "mentions",
                            user_ids: [user_id],
                            loci: [
                                [0, 1 + user_name.length]
                            ]
                        }
                    ]
                }
            };

            request.post("https://api.groupme.com/v3/bots/post", res_body, (err, res, body) => {
                if (err)
                    console.error(err);
            });
        } else {
            prev_message = text;
        }
    }

    res.status(200).send("message received");
}
