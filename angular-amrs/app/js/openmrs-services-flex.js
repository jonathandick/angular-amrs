'use strict';

var openmrsServicesFlex = angular.module('openmrsServicesFlex', ['ngResource','ngCookies','openmrsServices']);

var session = sessionStorage;
var local = localStorage;

openmrsServicesFlex.factory('PatientServiceFlex',['$http','PatientService',
  function($http,PatientService) {
      var PatientServiceFlex = {};

      PatientServiceFlex.clone = function(data) {
	  return PatientService.abstractPatient.clone(data);
      };


      PatientServiceFlex.get = function(patientUuid,callback) {
	  console.log("PatientServiceFlex.get() : " + patientUuid);
	  var patient = angular.fromJson(session.getItem(patientUuid));

	  //patient.patientData temporary. DefaulterCohort returns inappropriately formatted patient. Needs to be changed. 
	  if(patient && patient.patientData) {
	      patient = PatientService.abstractPatient.clone(patient);	      
	      console.log("PatientServiceFlex.get() : Patient in session");
	      //patient = PatientService.abstractPatient.clone(JSON.parse(patient));	      
	      callback(patient);
	  }
	  else {
	      console.log("PatientServiceFlex.get() : Querying server for patient");
	      PatientService.get(patientUuid, function(p){
		  session.setItem(patientUuid,JSON.stringify(p.getPatient()));
		  if(callback) { callback(p); }
		  else { return p;}
		      
	      });
	  }
      };

	  

      PatientServiceFlex.search = function(searchString,callback){
	  if(searchString && searchString.length > 3) {	      
	      Patient.query({q:searchString}).$promise.then(function(data){
                  callback(data);
              });
          }
      };

      return PatientServiceFlex;
      
  }]);


function getHashCode(s) {
    var hash = 0, i, chr, len;
    if (s.length == 0) return hash;
    for (i = 0, len = s.length; i < len; i++) {
	chr   = s.charCodeAt(i);
	hash  = ((hash << 5) - hash) + chr;
	hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


openmrsServicesFlex.factory('EncounterServiceFlex',['$http','Encounter','EncounterService','PersonAttribute','ObsService',
  function($http,Encounter,EncounterService,PersonAttribute,ObsService) {
      var EncounterServiceFlex = {};
      EncounterServiceFlex.get = function(encounterUuid,callback) {
	  console.log("EncounterServiceFlex.get() : " + encounterUuid);
	  var enc = session.getItem(encounterUuid);
	  var enc = undefined;
	  if(enc) {
	      console.log("EncounterServiceFlex.get() : Encounter in session");
	      callback(JSON.parse(enc));
	  }
	  else {
	      console.log("Querying server for encounter data...");
	      Encounter.get({uuid:encounterUuid}).$promise.then(function(data){ 	      
		  console.log('Encounter.get()');
		  session.setItem(encounterUuid,JSON.stringify(data));
		  callback(data);
	      });
	  }
      };


      EncounterServiceFlex.removeLocal = function(hash) {
	  var forms = local.getItem('savedEncounterForms');
	  if(forms) { 
	      forms = JSON.parse(forms);
	      delete forms[hash];
	      local.setItem("savedEncounterForms",JSON.stringify(forms));
	  }
      }

      EncounterServiceFlex.submitAllLocal = function() {
	  var forms = EncounterServiceFlex.getLocal();
	  var errors = 0;
	  var successes = 0;
	  for(var hash in forms) {
	      var enc = forms[hash];
	      var data = EncounterServiceFlex.submit(enc,{},hash);
	      if(data === undefined || data === null || data.error) {	      
		  errors++;
	      }
	      else { successes++;}
	  }
	  alert(successes + " forms submitted successfully. " + errors + " forms with errors, still saved locally.");
      }
	      
	  

      EncounterServiceFlex.saveLocal = function(enc,hash) {
	  if(!hash) { 
	      var s = JSON.stringify(enc);             
	      var hash = getHashCode(s);
	  }
	  var forms = local.getItem('savedEncounterForms');

	  if(forms) { forms = JSON.parse(forms); }
	  else { forms = {}; }

	  forms[hash] = enc;
	  local.setItem("savedEncounterForms",JSON.stringify(forms));
      }

      //If hash provided, return individual form. Otherwrise return all forms.
      EncounterServiceFlex.getLocal = function(hash) {
	  var forms = JSON.parse(local.getItem("savedEncounterForms"));	  
	  if(hash) {
	      if(hash in forms) { return forms[hash]; }
	      else { return undefined; }
	  }
	  else { return forms; }
      };

      function hasKeyValue(obj,key,value) {	 
	  for(var i in obj) {
	      if(obj[i].concept.uuid === key) {
		  var v = obj[i].value;		  
		  if(typeof v === "object" && v !== null) {
		      v = obj[i].value.uuid;
		  }
		  if(v === value) {
		      return true;
		  }
	      }
	  }
	  return false;
      }

      function deleteKeyValue(obj,key,value) {
	  var v;
	  for(var i in obj) {
	      if(obj[i].concept.uuid == key) {
		  v = obj[i].value;
		  if(typeof v == "object" && v !== null) {
		      v = obj[i].value.uuid;
		  }
		  if(v == value) {
		      delete obj[i];
		      break;		      
		  }
	      }
	  }
	  return obj;
      }

      

      //This puts the object representing obs into the proper format required by OpenMRS RestWS.
      //If a previous encounter exists, it identifies obs which have not been changed and removes them
      //  from the encounter to be submitted. For any obs with a changed value, this function returns
      //  an array of the uuid of the original obs so that it can be voided. 
      EncounterServiceFlex.prepareObs = function(enc,origEnc) {
	  var origObs = origEnc.obs;

	  if(enc.obs) {	      
	      var t = [];
	      
	      for(var c in enc.obs) {		  
		  console.log(c + ' = ' + enc.obs[c]);
		  console.log(enc.obs[c]);
		  console.log(typeof enc.obs[c]);
		  console.log(Object.prototype.toString.call(enc.obs[c]));
		  if(enc.obs[c] === null || enc.obs[c] === "" || enc.obs[c] === undefined) {		      
		  }
		  else if(Object.prototype.toString.call(enc.obs[c]) !== "[object Array]") {
		      if(hasKeyValue(origObs,c,enc.obs[c])) {
			  origObs = deleteKeyValue(origObs,c,enc.obs[c]);
		      } else {  			  
			  t.push({concept:c,value:enc.obs[c]});		      
		      }
		  }
		  else {  // this is for an obs with multiple answers, e.g. a multi select dropbox
		      for(var i=0; i< enc.obs[c].length; i++) {
			  if(hasKeyValue(origObs,c,enc.obs[c][i])) {
			      origObs = deleteKeyValue(origObs,c,enc.obs[c][i]);
			  }
			  else {
			      t.push({concept:c,value:enc.obs[c][i]});
			  }
		      }
		  }
	      }
	      enc.obs = t;
	  }
	      
	  return [enc,origObs];
      };	  


      EncounterServiceFlex.submit = function(enc,origEnc,hash) {	  	  	  

	  console.log(enc);
	  var r = EncounterServiceFlex.prepareObs(enc,origEnc);	  	      	      
	  enc = r[0];
	  
	  EncounterService.submit(enc,function(data) {
	      console.log('Finished submitting');	      

	      if(data === undefined || data === null || data.error) {
		  console.log("EncounterServiceFlex.submit() : error submitting. Saving to local");
		  EncounterServiceFlex.saveLocal(enc,hash);
	      }
	      else if(hash !== undefined && hash !== "") {
		  EncounterServiceFlex.removeLocal(hash);
	      }
	      else {
		  console.log('checking for obs to void');
		  if(origEnc && origEnc.uuid) {
		      var obsToVoid = r[1];	      		      
		      ObsService.void(obsToVoid,function(data) {
			  
		      });		      
		  }	
	      }	  
	      return data;
	  });
      };


      EncounterServiceFlex.patientQuery = function(params,callback) {
	  EncounterService.patientQuery(params,callback);
      };								  	 

      return EncounterServiceFlex;
           
  }]);


openmrsServicesFlex.factory('EncounterFormServiceFlex',['$http','Encounter','EncounterService','PersonAttribute',
  function($http,Encounter,EncounterService) {
      var efsf = {};
      

      return efsf;      
      
}]);




openmrsServicesFlex.factory('LocationServiceFlex',['$http','LocationService',
  function($http,LocationService) {
      var lsf = {};
      
      lsf.getAll = function(callback) {
	  var locations = local.getItem('openmrsLocations');
	  if(locations) {
	      locations = JSON.parse(locations);
	      if(callback) { return callback(locations) }		  
	      else { return locations; }
	  }
	  else {		  
	      LocationService.getAll(function(locations) {
		  local.setItem('openmrsLocations',JSON.stringify(locations));
		  if(callback) { return callback(locations); }		  
		  else { return locations; }
	      });
	  }
      };

      return lsf;
  }]);


openmrsServicesFlex.factory('ProviderServiceFlex',['$http','ProviderService',
  function($http,ProviderService) {
      var psf = {};
      
      psf.query = function(callback) {
	  var providers = local.getItem('openmrsProviders');
	  if(providers) {
	      providers = JSON.parse(providers);
	      if(callback) { return callback(providers) }		  
	      else { return providers; }
	  }
	  else {		  
	      ProviderService.query(function(providers) {
		  local.setItem('openmrsProviders',JSON.stringify(providers));
		  if(callback) { return callback(providers); }		  
		  else { return providers; }
	      });
	  }
      };

      return psf;
  }]);
