/*
 * smts.js
 * callback URL for the "show me the Skaktis" GroupMe bot
 */

const request = require("request");
require("dotenv").config();

const msg_post_url = "https://api.groupme.com/v3/bots/post";

const images = [
    "https://i.groupme.com/568x771.png.d702f41e96c14a4bb84651e42f825ec4",
    "https://i.groupme.com/540x960.png.3e7f3e5cf81d448a8552fccca6e33b0a",
    "https://i.groupme.com/540x960.png.2f757f0a4aa24ec6b71880dcf8db6dac",
    "https://i.groupme.com/515x521.png.ded1c63a596d416bb217adbd60deee61",
];

const getRandom = (max) => Math.floor(Math.random() * Math.floor(max));

exports = module.exports = function(req, res) {
    if (req.body && req.body.text) {
        let msg = req.body.text.replace(/^\s+|\s+$/g, "").toLowerCase();
        if (msg === "show me the skaktis") {
            let image = images[getRandom(4)];
            let post_body = {
                json: {
                    bot_id: "ab74d9f6558f3956564dd04106",
                    "attachments" : [{
                        "type": "image",
                        "url": image,
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
