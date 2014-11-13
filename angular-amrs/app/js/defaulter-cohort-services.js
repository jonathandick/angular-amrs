'use strict';

/* Services */

var session = sessionStorage;
var local = localStorage;
var DEFAULTER_COHORT_CONTEXT  = "https://testserver1.ampath.or.ke";

var defaulterCohortServices = angular.module('defaulterCohortServices', ['ngResource','ngCookies','openmrsServices']);


defaulterCohortServices.factory('PatientService',['$http','Patient',
  function($http,Patient) {
      var PatientService = {};
      PatientService.get = function(patient_uuid,callback) {
	  var patient = session.getItem(patient_uuid);
	  if(patient) {
	      console.log("Patient in session");
	      callback(JSON.parse(patient));
	  }
	  else {
	      console.log("PatientDashboardCtrl : Querying server for patient");
	      Patient.get(patient_uuid).$promise.then(function(data){ 	      
		  session.setItem(patient_uuid,JSON.stringify(data));
		  callback(data);
	      });
	  }
      };

      Patient.search = function(searchString,callback){
	  if(searchString && searchString.length > 3) {
	      Patient.get({q:searchString})).$promise.then(function(data){
                  callback(data);
              });
          }
      };

      return Patient;
      
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

