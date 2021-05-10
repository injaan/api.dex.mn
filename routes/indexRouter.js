const express = require('express');
const router = express.Router();
const controller = require("../controllers/indexController");
const asyncHandler = require('../middleware/asyncHandler');

router.get('/',
  asyncHandler(async (req, res, next) => {
    res.send("200");
  })
);

router.get('/trades/address/:marketAddress',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getTrade(req, res));
  })
);

module.exports = router;