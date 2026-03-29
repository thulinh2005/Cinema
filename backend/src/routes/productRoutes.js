const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Upload middleware from productController
const upload = productController.uploadImage;

router.get("/", productController.getAll);
router.get("/single", productController.getSingles); // Để load option combo
router.get("/:id", productController.getById);
router.post("/", upload, productController.create);
router.put("/:id", upload, productController.update);
router.delete("/:id", productController.delete);

module.exports = router;
