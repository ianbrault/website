/*
 * smts.js
 * callback URL for the "show me the Skaktis" GroupMe bot
 */

exports = module.exports = function(req, res) {
    console.log(req.body);
    return res.status(200).send("message received");
}