const process = require("process");
const jsonServer = require("json-server");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8000;

require("dotenv").config();
const password = process.env.PASS;

// password をハッシュ化して cookie の値として用いる。
const crypto = require("crypto");

const sha256 = (message) => {
  const hash = crypto.createHash("sha256");
  hash.update(message);
  return hash.digest("hex");
};
const hash = sha256(password);

// cors ミドルウェアの追加
server.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://snippet.hopto.org/"],
  })
);
server.use(cookieParser());
server.use(express.json());

server.post("/auth/signin", (req, res) => {
  if (!(req.body["password"] === password)) {
    return res.status(401).json({
      message: "Username or password are incorrect",
    });
  }

  res.cookie("token", hash, {
    maxAge: 3600 * 1000,
    httpOnly: true,
  });
  res.status(200).json({
    message: "Sign in successfully",
  });
});

server.post("/auth/confirm", (req, res) => {
  if (!(req.cookies["token"] === hash)) {
    return res.status(401).json({
      message: "サインインしてください。",
    });
  }

  res.status(200).json({
    message: "confirmed",
  });
});

server.post("/auth/signout", (req, res) => {
  res.cookie("token", "", {
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    message: "Sign out successfully",
  });
});

server.use(middlewares);
server.use(router);
server.listen(port, (err) => {
  if (err) {
    console.error(err);
    process.exit();
    return;
  }
  console.log("Start listening...");
  console.log("http://localhost:" + port);
});
