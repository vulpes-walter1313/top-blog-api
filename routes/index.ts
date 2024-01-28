import express from 'express';
import authController from '../controllers/authController';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Welcome the the express app with typescript!")});

router.post("/signup", authController.signup_POST);

router.post("/login", authController.login_POST);

export default router;
