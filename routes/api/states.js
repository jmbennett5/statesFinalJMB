const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');
const data = {};
data.states = require('../../model/statesData.json')



router.route('/')
    .get((statesController.getAllStates));


router.route('/:state')
    .get((statesController.getState));

router.route('/:state/funfact')
    .get(statesController.getFunFact)
    .post(statesController.postFunFacts)
    .patch(statesController.updateFunFacts)
    .delete(statesController.deleteFunFact);

router.route('/:state/capital')
    .get((statesController.capitalInfo));

router.route('/:state/nickname')
    .get((statesController.nicknameInfo));

router.route('/:state/population')
    .get((statesController.populationInfo));

router.route('/:state/admission')
    .get((statesController.admissionInfo));


module.exports = router; //test