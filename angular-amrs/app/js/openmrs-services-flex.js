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


openmrsServicesFlex.factory('EncounterServiceFlex',['$http','Encounter','EncounterService','PersonAttribute',
  function($http,Encounter,EncounterService) {
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

      //This puts the object representing obs into the proper format required by OpenMRS RestWS
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

      EncounterServiceFlex.submit = function(enc,encounter,hash) {	  	  
	  if(encounter && encounter.length > 0) {
	      alert('Currently existing forms can not be edited');
	  }
	  else {
	      enc = EncounterServiceFlex.prepareObs(enc,encounter);	  
	      EncounterService.submit(enc,function(data) {
		  if(data === undefined || data === null || data.error) {
		      EncounterServiceFlex.saveLocal(enc,hash);
		  }
		  else if(hash !== undefined) {
		      EncounterServiceFlex.removeLocal(hash);
		  }
		  return data;
	      });
	  }
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
