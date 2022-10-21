const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const controller = require("../controllers/proposalController");
const asyncHandler = require('../middleware/asyncHandler');
const utils = require('../modules/utils');
const errorHandler = require('../middleware/errorHandler');

router.get('/',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.test(req, res));
  })
);

router.post('/',
  [
    check('title').isString(),
    check('body').isString(),
    check('budget').isNumeric(),
    check('date').isString(),
    check('options').isArray()
  ],
  asyncHandler(
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = utils.throwErr('validation_error', 422, false);
        errorHandler(err, res, 422, errors.array());
        return;
      }
      res.send(await controller.newProposal(req, res));
  })
);

module.exports = router;