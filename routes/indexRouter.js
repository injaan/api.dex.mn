const express = require('express');
const router = express.Router();
const controller = require("../controllers/indexController");
const asyncHandler = require('../middleware/asyncHandler');
const { check, checkSchema, validationResult } = require('express-validator');

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

router.get('/idotest',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.idoTest(req, res));
  })
);

router.post('/contactForm',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.contactForm(req, res));
  })
);


router.post('/log',
  [
    check('wallet').isString(),
    check('txn').isString()
  ],
  asyncHandler(
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = utils.throwErr(req, 'validation_error', 422, false);
        errorHandler(err, req,res, 422, errors.array());
        return;
      }
      res.send(await controller.swapLog(req, res));
  })
);

module.exports = router;