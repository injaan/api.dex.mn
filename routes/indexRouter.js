const express = require('express');
const router = express.Router();
const controller = require("../controllers/indexController");
const asyncHandler = require('../middleware/asyncHandler');

router.get('/price/:coin',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getPrice(req, res));
  })
);

router.get('/orderbooks/:pair',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getOrderbook(req, res));
  })
);

router.get('/trades/address/:marketAddress',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getTrade(req, res));
  })
);

router.get('/getTime',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getTime(req, res));
  })
);

router.get('/ido',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.ido(req, res));
  })
);

module.exports = router;