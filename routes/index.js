const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
  res.send("Welcome the the express app with typescript!");
});

router.post("/signup", authController.signup_POST);

router.post("/login", authController.login_POST);

router.get("/logout", authController.logout_GET);

module.exports = router;
