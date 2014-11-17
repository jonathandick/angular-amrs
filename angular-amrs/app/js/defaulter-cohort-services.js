'use strict';

/* Services */

var session = sessionStorage;
var local = localStorage;
var DEFAULTER_COHORT_CONTEXT  = "https://testserver1.ampath.or.ke";

var defaulterCohortServices = angular.module('defaulterCohortServices', ['ngResource','ngCookies','openmrsServices']);


defaulterCohortServices.factory('DCPatientService',['$http','PatientService',
  function($http,PatientService) {
      var DCPatientService = {};
      DCPatientService.get = function(patientUuid,callback) {
	  console.log("DCPatientService.get() : " + patientUuid);
	  var patient = session.getItem(patientUuid);
	  if(patient) {
	      console.log("DCPatientService.get() : Patient in session");
	      callback(JSON.parse(patient));
	  }
	  else {
	      console.log("DCPatientService.get() : Querying server for patient");
	      PatientService.get(patientUuid, function(p){
		  //session.setItem(patientUuid,JSON.stringify(p.getPatient()));
		  callback(p);
	      });
	  }
      };

      DCPatientService.search = function(searchString,callback){
	  if(searchString && searchString.length > 3) {	      
	      Patient.query({q:searchString}).$promise.then(function(data){
                  callback(data);
              });
          }
      };

      return DCPatientService;
      
  }]);



defaulterCohortServices.factory('DCEncounterService',['$http','Encounter','EncounterService',
  function($http,Encounter,EncounterService) {
      var DCEncounterService = {};
      DCEncounterService.get = function(encounterUuid,callback) {
	  console.log("EncounterService.get() : " + encounterUuid);
	  var enc = session.getItem(encounterUuid);
	  if(enc) {
	      console.log("Encounter in session");
	      callback(JSON.parse(enc));
	  }
	  else {
	      Encounter.get(encounterUuid).$promise.then(function(data){ 	      
		  session.setItem(encounterUuid,JSON.stringify(data));
		  callback(data);
	      });
	  }
      };


      DCEncounterService.submit = function(encounterUuid,enc) {
	  console.log(enc);
	  /*
	  EncounterService.submit(encounterUuid,enc).$promise.then(function(data) {
	      console.log(data);
	  });
	  */
      };


      return DCEncounterService;
           
  }]);


      


defaulterCohortServices.factory('DefaulterCohort',['$http',
  function($http) {
      var DefaulterCohort = {};
      DefaulterCohort.get = function(uuid,callback) {
	  var dc = session.getItem(uuid);
	  if(dc) {
	      callback(JSON.parse(dc));
	  }
	  else {
	      $http.get(DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohort?defaulter_cohort_uuid=' + uuid).success(function(data) {
		  session.setItem(data.defaulter_cohort.uuid,JSON.stringify(data.defaulter_cohort));
		  for(var i=0; i<data.defaulter_cohort.patients.length; i++) {
		      var p = data.defaulter_cohort.patients[i];		      
		      session.setItem(p.uuid,JSON.stringify(p));
		  }
		  

		  if(uuid != data.defaulter_cohort.uuid) {
		      local.removeItem("defaulterCohorts");
		  }
		  callback(data.defaulter_cohort);
	      });
	  }
      };
      
      DefaulterCohort.getDefaulterCohorts = function(callback) {
	  var dcs = local.getItem("defaulterCohorts");
          if(dcs) {
	      console.log("getting defaulter cohorts from local");
              callback(JSON.parse(dcs));
          }
          else {
	      console.log("getting defaulter cohorts from zerver");
              $http.get(DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohorts').success(function(data) {                  
                  local.setItem("defaulterCohorts",JSON.stringify(data));
		  callback(data);
              });
          }
      };

      DefaulterCohort.update = function(uuid,callback) {
	  console.log("updateDefaulterCohort() : updating cohort...");
	  var cohort,numUpdated=0;
	  if(navigator.onLine) {
	      cohort = JSON.parse(session.getItem(uuid));

	      var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_retired_members?defaulter_cohort_uuid=' +uuid;
	      $http.get(url).success(function(retiredPatients) {
		  console.log(retiredPatients);
		  if(retiredPatients.indexOf("*") != -1) {		      
		      session.removeItem(uuid);
		      local.removeItem("defaulterCohorts");
		      DefaulterCohort.get(uuid,callback);		      
		  }
		  else {
		      for(var i=0; i<retiredPatients.length; i++) {
			  var patientUuid = retiredPatients[i];
			  if(patientUuid in cohort.patients) {
			      var p = cohort.patients[patientUuid];
			      if(p.retired == 0) {
				  cohort.patients[patientUuid].retired=1;
				  numUpdated++;
			      }
			  }
		      }
		      session.setItem(uuid,JSON.stringify(cohort));
		  }
              });
	  }
	  callback(numUpdated);
      };

      DefaulterCohort.getNew = function(uuid,callback) {
	  session.removeItem(uuid);
	  var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_new_defaulter_cohort?defaulter_cohort_uuid=' + uuid;
	  $http.get(url).success(function(data) {
	      local.setItem("defaulterCohorts",JSON.stringify(data.defaulter_cohorts));
              session.setItem(data.defaulter_cohort.uuid,JSON.stringify(data.defaulter_cohort));
              callback(data.defaulter_cohort);
	  });
      };


      return DefaulterCohort

  }]);

