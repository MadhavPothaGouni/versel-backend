const express = require("express");
const router = express.Router();
const { getSales, addSale } = require("../controllers/salesController");

router.get("/", getSales);
router.post("/", addSale);

module.exports = router;
