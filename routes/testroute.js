var express = require("express");
var router = express.Router();

/*
 *GET all products /
 */
router.get("/", function(req, res) {
  res.send("test route working");
});

//Exports
module.exports = router;
