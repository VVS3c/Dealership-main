const express = require("express");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const registerAccount = require("../util/user/registerAccount");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

router.post(
  "/register",
  [
    check("username").not().isEmpty().withMessage("Username is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    check("confirmPassword")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords must match"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
      });
    }

    const { username, password } = req.body;

    try {
      await registerAccount(username, password);
      res.status(201).json({ message: "Registration successful! Please log in." });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/login",
  [
    check("username").not().isEmpty().withMessage("Username is required"),
    check("password").not().isEmpty().withMessage("Password is required"),
  ],
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.status(200).json({ message: "Login successful", user: req.user });
  }
);

router.post("/logout", isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.status(200).json({ message: "Logout successful" });
  });
});

router.get("/inventory", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "Here is the car inventory." });
});

router.get("/saved-cars", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "Here are your saved cars." });
});

module.exports = router;

