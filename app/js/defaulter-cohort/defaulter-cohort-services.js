'use strict';

/* Services */

var session = sessionStorage;
var local = localStorage;
var DEFAULTER_COHORT_CONTEXT  = "https://testserver1.ampath.or.ke";

var dc = angular.module('defaulterCohort', ['ngResource','ngCookies','openmrsServices']);


dc.factory('DefaulterCohort',['$http','spinnerService',
  function($http,spinner) {
      var DefaulterCohort = {};


      DefaulterCohort.ping = function() {
	  $http.get(DEFAULTER_COHORT_CONTEXT).success(function(data) {console.log(data);});
      }

      DefaulterCohort.init = function() {	  
	  DefaulterCohort.getOutreachProviders();
      };

      DefaulterCohort.get = function(uuid,callback) {
	  spinner.show('waiting');
	  if(uuid === undefined || uuid === "") {
	      uuid = session.getItem("curDefaulterCohortUuid");
	  }
	  else { session.setItem("curDefaulterCohortUuid",uuid); }

	  var dc = session.getItem(uuid);
	  console.log('dc: ' + dc + ' uuid: ' + uuid);
	  if(dc) {
	      callback(JSON.parse(dc));
	      spinner.hide('waiting');
	  }
	  else if (uuid !== undefined && uuid !== "") {
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
		  spinner.hide('waiting');
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
	      console.log("getting defaulter cohorts from server");
	      
              $http.get(DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_defaulter_cohorts').success(function(data) {
		  //alert('success getting data from dc server');		  
                  local.setItem("defaulterCohorts",JSON.stringify(data));
		  callback(data);
              }).error(function(error,status) {
		  alert('error');
		  alert(error);		  
		  alert(status);
	      });
          }
      };

      DefaulterCohort.update = function(uuid,callback) {
	  console.log("updateDefaulterCohort() : updating cohort...");
	  var cohort,numUpdated=0;
	  if(navigator.onLine) {
	      cohort = JSON.parse(session.getItem(uuid));
	      console.log('uuid to be update: ' + uuid);
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


      DefaulterCohort.getOutreachProviders = function(callback) {	  
	  var url = DEFAULTER_COHORT_CONTEXT + '/outreach/ajax_get_outreach_providers';
	  var providers = local.getItem('outreach-providers');

	  if(providers === undefined || providers === null) {
	      console.log('Getting outreach providers from server');
              $http.get(url).success(function(data) {
		  console.log('got outreach providers');
		  local.setItem("outreach-providers",JSON.stringify(data));
		  providers = data;
		  if(callback) callback(providers);		  
              }).error(function(error) { console.log(error); });
	  }
	  else providers = angular.fromJson(providers);


	  if(callback) callback(providers);
	  else return providers;
      }


      return DefaulterCohort;

  }]);

