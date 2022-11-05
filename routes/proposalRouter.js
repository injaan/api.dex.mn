const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const controller = require("../controllers/proposalController");
const asyncHandler = require('../middleware/asyncHandler');
const utils = require('../modules/utils');
const errorHandler = require('../middleware/errorHandler');


router.get('/configs',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getProposalConfigs(req, res));
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

router.get('/vote/:proposalId',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getVotes(req, res));
  })
);

router.post('/vote',
  [
    check('signature').isString()
  ],
  asyncHandler(
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = utils.throwErr('validation_error', 422, false);
        errorHandler(err, res, 422, errors.array());
        return;
      }
      res.send(await controller.saveVote(req, res));
  })
);

router.post('/updateSignature',
  [
    check('proposal').isString(),
    check('signature').isString()
  ],
  asyncHandler(
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = utils.throwErr('validation_error', 422, false);
        errorHandler(err, res, 422, errors.array());
        return;
      }
      res.send(await controller.updateSignature(req, res));
  })
);

router.get('/',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getProposalList(req, res));
  })
);

router.get('/:id',
  asyncHandler(async (req, res, next) => {
    res.send(await controller.getProposal(req, res));
  })
);

module.exports = router;