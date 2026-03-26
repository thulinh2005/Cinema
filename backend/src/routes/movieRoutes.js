const express = require("express");

const {
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getByIdMovie,
} = require("../controllers/movieController");

module.exports = (upload) => {
  const router = express.Router();

  // DANH SÁCH + SEARCH + FILTER + PAGINATION
  router.get("/", getMovie);

  // CHI TIẾT (tránh conflict)
  router.get("/detail/:id", getByIdMovie);

  // THÊM
  router.post("/", upload.single("anh_poster"), createMovie);

  // SỬA
  router.put("/:id", upload.single("anh_poster"), updateMovie);

  // XÓA
  router.delete("/:id", deleteMovie);

  return router;
};
