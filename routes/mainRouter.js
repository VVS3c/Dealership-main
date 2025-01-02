const express = require("express");
const passport = require("passport");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const registerAccount = require("../util/user/registerAccount");

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

router.get("/", async (req, res) => {
  if (req.user) {
    return res.redirect("/inventory");
  }
  res.render("pages/index");
});

router.get("/register", (req, res) => {
  res.render("pages/register");
});

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
      req.flash(
        "error",
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
      return res.redirect("/register");
    }

    const { username, password } = req.body;

    try {
      await registerAccount(username, password);
      req.flash("success", "Registration successful! Please log in.");
      res.redirect("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      req.flash("error", error.message);
      res.redirect("/register");
    }
  }
);

router.get("/login", (req, res) => {
  res.render("pages/login");
});

router.post(
  "/login",
  [
    check("username").not().isEmpty().withMessage("Username is required"),
    check("password").not().isEmpty().withMessage("Password is required"),
  ],
  passport.authenticate("local", {
    successRedirect: "/inventory",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out.");
    res.redirect("/");
  });
});

router.get("/inventory", isAuthenticated, (req, res) => {
  res.render("pages/inventory");
});

router.get("/saved-cars", isAuthenticated, (req, res) => {
  res.render("pages/saved-cars");
});

router.get("/financing", isAuthenticated, (req, res) => {
  res.render("pages/financing");
});

router.post("/financing/apply", isAuthenticated, (req, res) => {
  const { name, email, income } = req.body;

  
  req.flash("success", "Financing application submitted successfully!");
  res.redirect("/financing");
});

module.exports = router;
