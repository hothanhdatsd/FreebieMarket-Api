import passport from "passport";
import generate from "../utils/generateToken.js";
import User from "../models/userModel.js";

const authGG = async (req, res) => {
  const email = req?.user?.emails[0].value;
  const user = await User.findOne({
    email,
  });
  if (user && req.user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generate(user._id),
      provide: user.provide,
    });
  } else {
    res.status(401);
    throw new Error("invalid email or password");
  }
};
const authFB = async (req, res) => {
  const idFacebook = req.user.id;
  const user = await User.findOne({
    idFacebook,
  });
  if (user && req.user) {
    res.json({
      _id: user._id,
      name: user.name,
      // email: user.email,
      isAdmin: user.isAdmin,
      token: generate(user._id),
      provide: user.provide,
    });
  } else {
    res.status(401);
    throw new Error("invalid email or password");
  }
};
export { authGG, authFB };
