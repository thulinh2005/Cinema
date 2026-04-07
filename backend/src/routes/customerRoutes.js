const express = require("express");
const router = express.Router();

const {
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getByIdCustomer,
} = require("../controllers/customerController");

router.get("/", getCustomer);
router.get("/detail/:id", getByIdCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;