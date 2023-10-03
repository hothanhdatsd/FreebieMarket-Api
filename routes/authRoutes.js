import express from "express";
import passport from "passport";
const router = express.Router();
import { authGG, authFB } from "../controller/authController.js";

//google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/successgg",
    // successRedirect: "https://freebiemarket.onrender.com/successgg",
    failureRedirect: "https://freebiemarket.onrender.com/#/auth/fail",
    failureRedirect: "http://localhost:3000/auth/fail",
  })
);
//return login GG
router.get("/successgg", authGG);
router.get("/fail", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

//facebook
router.get("/facebook", passport.authenticate("facebook"));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "http://localhost:3000/successFB",
    failureRedirect: "http://localhost:3000/auth/fail",
  })
);
//return login FB
router.get("/successFB", authFB);
export default router;
