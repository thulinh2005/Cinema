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
// const express = require("express");
// const {
//   getMovie,
//   createMovie,
//   updateMovie,
//   deleteMovie,
//   getByIdMovie,
// } = require("../controllers/movieController");
// module.exports = (upload) => {
//   const router = express.Router();
//   // DANH SÁCH + SEARCH + FILTER + PAGINATION
//   router.get("/", getMovie);
//   // CHI TIẾT (tránh conflict)
//   router.get("/detail/:ma_phim", getByIdMovie);
//   // THÊM
//   router.post("/", upload.single("anh_poster"), createMovie);
//   // SỬA
//   router.put("/:ma_phim", upload.single("anh_poster"), updateMovie);
//   // XÓA
//   router.delete("/:ma_phim", deleteMovie);
//   return router;
// };
