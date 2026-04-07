const express = require("express");
const movieController = require("../controllers/movieController");

module.exports = (upload) => {
  const router = express.Router();

  router.get("/", movieController.getMovie);
  router.get("/detail/:ma_phim", movieController.getByIdMovie);
  router.post("/", upload.single("anh_poster"), movieController.createMovie);
  router.put("/:ma_phim", upload.single("anh_poster"), movieController.updateMovie);
  router.delete("/:ma_phim", movieController.deleteMovie);

  return router;
};
