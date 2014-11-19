'use strict';

var openmrsServicesFlex = angular.module('openmrsServicesFlex', ['ngResource','ngCookies','openmrsServices']);

var session = sessionStorage;
var local = localStorage;

openmrsServicesFlex.factory('PatientServiceFlex',['$http','PatientService',
  function($http,PatientService) {
      var PatientServiceFlex = {};
      PatientServiceFlex.get = function(patientUuid,callback) {
	  console.log("PatientServiceFlex.get() : " + patientUuid);
	  var patient = session.getItem(patientUuid);
	  if(patient) {
	      console.log("PatientServiceFlex.get() : Patient in session");
	      callback(JSON.parse(patient));
	  }
	  else {
	      console.log("PatientServiceFlex.get() : Querying server for patient");
	      PatientService.get(patientUuid, function(p){
		  //session.setItem(patientUuid,JSON.stringify(p.getPatient()));
		  callback(p);
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


openmrsServicesFlex.factory('EncounterServiceFlex',['$http','Encounter','EncounterService',
  function($http,Encounter,EncounterService) {
      var EncounterServiceFlex = {};
      EncounterServiceFlex.get = function(encounterUuid,callback) {
	  console.log("EncounterServiceFlex.get() : " + encounterUuid);
	  var enc = session.getItem(encounterUuid);
	  if(enc) {
	      console.log("EncounterServiceFlex.get() : Encounter in session");
	      callback(JSON.parse(enc));
	  }
	  else {
	      Encounter.get(encounterUuid).$promise.then(function(data){ 	      
		  session.setItem(encounterUuid,JSON.stringify(data));
		  callback(data);
	      });
	  }
      };


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


      EncounterServiceFlex.submit = function(enc) {	  
	  console.log(enc);
	  this.saveLocal(enc);
      }


      return EncounterServiceFlex;
           
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
