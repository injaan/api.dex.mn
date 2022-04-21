const express = require('express');
const router = express.Router();
const controller = require("../controllers/stakeController");
const asyncHandler = require('../middleware/asyncHandler');

router.get('/test',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.test(req, res));
  })
);

router.get('/getRoutes',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getRoutes(req, res));
  })
);

module.exports = router;