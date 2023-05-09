const stateJson = require('../model/statesData.json');

const verifyState = (req) => {//check for the statecode, allow for mixed captials.
   if(!req.params?.state) return res.status(400).json({'message': 'State code required.'});
   const stateCode = stateJson.map(state => state.code);
   const upperCase = req.params.state.toUpperCase();
   return (stateCode.includes(upperCase));


}

const returnMessage = (req,res,stateInfo='none') =>{
    if(verifyState(req)) { //use verify state to check if the code exists.
        const jsonState = stateJson.find(s => s.code == req.params.state.toUpperCase()); //find the code
        const message  = {'state': jsonState.state };
        switch (stateInfo) {
            case 'admission': message['admitted'] = jsonState.admission_date; break; //adds admission date to returned json response. same for each one.
            case 'capital': message['capital'] = jsonState.capital_city; break;
            case 'nickname': message['nickname'] = jsonState.nickname; break;
            case 'population': message['population'] = jsonState.population.toLocaleString("en-US");; break; //en-us for correct csv.
            
        }
        return res.json(message);
    } else { 
        return res.status(400).json({"message": `Invalid state abbreviation parameter`});
    }
 


}
const returnStateName = (stateCode) =>{
    const stateInfo = stateJson.filter(state => state.code == stateCode)[0]; //pretty much find the state name for the code provided,from the array
    return stateInfo.state;
}

module.exports = {
    verifyState,
    returnMessage,
    returnStateName
}