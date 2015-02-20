/*
1. Should be binding form data to a relevant model. E.g. encounter fields should map to encounter.fieldName
2. Each model must have a function which converts the model to the format required by the REST resource. If the bound model is identical, no function is necessary
*/


var toRestDataFunctions = {
    obs: convertObsDataToRest,
};



var schemas = {encounter: ["encounterDatetime",
			   "encounterType",
			   "patient",
			   "provider",
			   "location",
			   "obs",
			   "obsGroup",
			  ],
	       obs: ["concept","value","obsGroup"],
	       obsGroup: ["concept","obs"]
	      };



getRestObject("encounter",formData);

function getRestObject(restElement,formData) {    
    var restObject = {};    
    var restSchema = schemas[restElement];

    for(var key in restSchema) {
	var data = formData[restElement.key];	
	if(key in toRestDataFunctions) {
	    data = toRestDataFunctions[key](data);            
	}
	restObject.key = data;
    }
    return restObject;
}





function convertObsDataToRest(obs) {
    var restObs = [];
    getRestObs(obs,restObs);
}

function getRestObs(obs,restObs) {
    for(var i in obs) {
	var o = obs[i];
	if('value' in o) {
	    if(o.value && o.value.toString().trim() !== "") {
		//No empty values will be saved
		restObs.push(o);
	    }
	}
	else {
	    var obsSet = {concept:o.concept,obs:[]};
	    getNewObs(o.obs,obsSet.obs);
	    restObs.push(obsSet);
	}
    }
}



