import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import colors from "colors";
import morgan from "morgan";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import discountRouter from "./routes/discountRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoute from "./routes/paymentRoute.js";
import typeProductRoutes from "./routes/typeProductRoutes.js";
import xlsx from "xlsx";
import { existsSync } from "fs";
import Product from "./models/productModel.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import uploadRoutes from "./routes/uploadRoutes.js";
import User from "./models/userModel.js";
import cors from "cors";
import user from "./models/userModel.js";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
connectDB();

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
app.use(cookieParser());
//login with google and facebook
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://freebiemarket.onrender.com"],
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
  })
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async function (request, accessToken, refreshToken, profile, done) {
      const user = await User.findOne({
        email: profile.emails[0].value,
        provider: "google",
      });
      if (!user) {
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
        });
        await newUser.save();
      }
      return done(null, profile);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_SECRET_ID,
      callbackURL: process.env.FB_CALLBACK_URL,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const userExists = await User.findOne({
        idFacebook: profile.id,
      });
      if (!userExists) {
        const newUser = new User({
          name: profile.displayName,
          provider: profile.provider,
          idFacebook: profile.id,
        });
        await newUser.save();
      }
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
app.use(express.json());
app.use(express.urlencoded({ extends: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// const __dirname = path.resolve();
// const fileName = __dirname + "/backend/excel.xlsx";

///API
app.get("/", (req, res) => {
  res.send("API is on running...");
});

app.use("/api/products", productRoutes);
app.use("/api/typeproducts", typeProductRoutes);
app.use("/api/payment", paymentRoute);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discount", discountRouter);
app.use("/api/upload", uploadRoutes);
app.use("/auth", authRoutes);

app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

app.use("/uploads", uploadRoutes);
app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server is on running in ${process.env.NODE_ENV} on port ${PORT}`.yellow
      .bold
  )
);
