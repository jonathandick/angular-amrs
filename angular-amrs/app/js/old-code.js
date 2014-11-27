//EncounterServiceFlex
      EncounterServiceFlex.prepareObs = function(enc,encounter) {
	  var obsUuids = {};
	  if(encounter && encounter.obs) { 
	      for(var i=0; i < encounter.obs.length; i++) {
		  var o = encounter.obs[i];
		  var concept = o.concept.uuid; 
		  var value = o.value;
		  if(typeof value === "object") {value = value.uuid;}
		  
		  if(o.concept.uuid in obsUuids) {
		      obsUuids[concept].push({value:value,uuid:o.uuid});
		  }
		  else { obsUuids[concept] = [{value:value,uuid:o.uuid}] }; 
	      }
	  }


	  if(enc.obs) {
	      var t = [];
	      for(var c in enc.obs) {		  	  
		  var o = obsUuids[c];		  

		  if(typeof enc.obs[c] == "string") {
		      var answer = {concept:c,value:enc.obs[c]};
		      if(o) { 
			  answer['uuid'] = o[0].uuid; 
		      }
		      t.push(answer);
		  }
		  else if(typeof enc.obs[c] == "object") {  // this is for an obs with multiple answers, e.g. a multi select dropbox
		      for(var i=0; i< enc.obs[c].length; i++) {
			  var answer = {concept:c,value:enc.obs[c][i]};			  			  
			  if(o) {
			      for(var j=0; j<o.length; j++) {
				  if(o[j].value == enc.obs[c][i]) {
				      answer['uuid'] = o.uuid;
				  }
			      }
			  }
			  t.push(answer);
		      }
		  }
	      }
	      enc.obs = t;
	  }
	  return enc;
      };	  
