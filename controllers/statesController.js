const State = require('../model/State');
const statesJson = require('../model/statesData.json');
const res = require('express/lib/response');
const verifyStates = require('../middleware/verifyStates');

const getAllStates = async(req,res) => {
     let retStates = await State.find();
     if (!retStates) return res.status(204).json({'message':'No states found.'});
     let stateJson = statesJson;
     stateJson.map(state =>{
        for (let i = 0; i < retStates.length; i++){
            if(retStates[i].stateCode === state.code && retStates[i].hasOwnProperty('funfacts')){ //does the mongo database have funfacts?
                state.funfacts = retStates[i].funfacts //adds funfacts from mongoDB to the response.
            }
        };
     });
   
     if(req.query.contig === 'true'){
        stateJson = stateJson.filter(state => state.code !== 'AK' && state.code !== 'HI'); // no ak or hawaii in this one
     } else if (req.query.contig === 'false'){
        stateJson = stateJson.filter(state => state.code === 'AK' || state.code === 'HI'); //only ak or hawaii in this one.

    }

    res.json(stateJson);
}

const getState = async (req, res, next) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` });
    }
    const jsonState = statesJson.find(s => s.code == req.params.state.toUpperCase());
    if (state.funfacts && state.funfacts.length > 0) { //are there funfacts?
        const funfacts = state.funfacts;
        jsonState['funfacts'] = funfacts;
    }    
    res.json(jsonState);
}


const getFunFact = async (req, res) => {
 if (!req?.params?.state) return res.status(400).json({'message':'State code required'});
 const state = await State.findOne({stateCode: req.params.state.toUpperCase()}).exec();
 if(!state){
    return res.status(400).json({'message': 'Invalid state abbreviation parameter'});
 }
 const stateName = verifyStates.returnStateName(state.stateCode);
 if(!state.funfacts || state.funfacts.length < 1){ //no funfactws
    return res.json({'message': `No Fun Facts found for ${stateName}`});
 }

 const randomNumber = Math.floor(Math.random() * state.funfacts.length);//pick a random fact.
 res.json({'funfact': state.funfacts[randomNumber]})//respond with the array index of the picked random number

}
const capitalInfo = async (req, res) =>{
    verifyStates.returnMessage(req,res,'capital') //call the message for capital info
}
const nicknameInfo = async (req, res) =>{
    verifyStates.returnMessage(req,res,'nickname')
}
const populationInfo = async (req, res) =>{
    verifyStates.returnMessage(req,res,'population')
}
const admissionInfo = async (req, res) =>{
    verifyStates.returnMessage(req,res,'admission')
}





/* This didn't work the way I wanted it to.
const getInfo = async (req,res) => {
    const { infoType } = req.query;

    let message;

    switch (infoType){
        case 'capital':
            message = 'capital'
            break;
        case 'nickname':
            message = 'nickname'
            break;
        case 'population':
            message = 'population';
            break;
        case 'admission':
            message = 'admission';
            break;
        
    }
    verifyStates.returnMessage(req,res,message);
}
*/
const postFunFacts = async (req, res) => {
    if (!req?.params?.state){
         return res.status(400).json({'message':'State code required'});
        }
    const state = await State.findOne({stateCode: req.params.state.toUpperCase()}).exec();//missed stateCode here before. check for state code.
    if (!state){
        return res.status(400).json({'message': `No state matches code ${req.params.state}`})
    } 
    if (req.body.funfacts){
        if (Array.isArray(req.body.funfacts)){ //is this an array?
            state.funfacts.push(...req.body.funfacts) //allow for multiple funfacts
        }else{
            return res.status(400).json({'message': 'State fun facts value must be an array'});
        }
    } else {
        return res.status(400).json({'message': 'State fun facts value required'});
    }  
  const result = await state.save();

  res.json(result);
}

const updateFunFacts = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({'message': 'State code required.'});
    const state = await State.findOne({stateCode: req.params.state.toUpperCase()}).exec();
    if (!state){
        return res.status(400).json({ "message": `No state matches code ${req.params.state}.` });
    }

    if (!req.body.index){
        return res.status(400).json({ "message": 'State fun fact index value required' });
    }
    if(!req.body.funfact){
        return res.status(400).json({'message':'State fun fact value required'});
    }
    const stateName = verifyStates.returnStateName(state.stateCode);

    if(!state.funfacts || state.funfacts.length < 1){
        return res.status(400).json({'message':`No Fun Facts found for ${stateName}`});
    }

    if (req.body.index < 1 || req.body.index > state.funfacts.length){
      return res.status(400).json({'message':`No Fun Fact found at that index for ${stateName}`});
    }

    const theRightIndex = req.body.index -1;//make sure index is correct(arrays start at 0)
    state.funfacts[theRightIndex] = req.body.funfact //update the given index.
    const result = await state.save();
    res.json(result);
}

const deleteFunFact = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({'message': 'State code required.'});
    const state = await State.findOne({stateCode: req.params.state.toUpperCase()}).exec();
    if (!state){
        return res.status(400).json({ "message": `No state matches code ${req.params.state}.` });
    }
   if(!req.body.index){
    return res.status(400).json({'message':'State fun fact index value required'});
   }

   const stateName = verifyStates.returnStateName(state.stateCode);
   if(!state.funfacts || state.funfacts.length < 1){
     return res.status(400).json({'message':`No Fun Facts found for ${stateName}`});
   }

   if(req.body.index < 1 || req.body.index > state.funfacts.length){
    return res.status(400).json({'message': `No Fun Fact found at that index for ${stateName}`});
   }

   const theRightIndex = req.body.index -1;
   state.funfacts.splice(theRightIndex,1);//remove the requested item.
   const result = await state.save();
   res.json(result);
}

module.exports = {
    getAllStates,
    getState,
    getFunFact,
    capitalInfo,
    postFunFacts,
    updateFunFacts,
    deleteFunFact,
    nicknameInfo,
    populationInfo,
    admissionInfo
}