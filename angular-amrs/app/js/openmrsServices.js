'use strict';

var openmrsServices = angular.module('openmrsServices', ['ngResource','ngCookies']);


var OPENMRS_CONTEXT_PATH = "http://10.50.110.67:8080/amrs";


openmrsServices.factory('openmrs',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/:object/:uuid", 
		       { object: '@object',
			 uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('OpenmrsSession',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/session",{} 		       
		      ); 
  }]);



openmrsServices.factory('Person',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/person/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Provider',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/provider/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Patient',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/patient/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Encounter',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/encounter/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('EncounterService',['$http','Encounter',
  function($http,Encounter) {
      var EncounterService = {};

      EncounterService.submit = function(encounterUuid,enc) {
	  if(enc.obs) {
	      var t = [];
	      for(var c in enc.obs) {
		  t.push({concept:c,value:enc.obs[c]});
	      }
	      enc.obs = t;
	  }
	  var url = OPENMRS_CONTEXT_PATH + 'ws/rest/v1/encounter/';
	  if(encounterUuid && encounterUuid != "") { 
	      url += '/' + encounterUuid; 
	  }
	  return $http.post(url,enc);
      };
      
      return EncounterService;

  }]);



openmrsServices.factory('EncounterType',['$resource',   			       
  function($resource) {       
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/encountertype/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Obs',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/obs/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);

openmrsServices.factory('Location',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/location/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Concept',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/concept/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('PersonAttribute',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/person/:personUuid/attribute/:attributeUuid", 
		       { personUuid: '@personUuid',
		         attributeUuid: '@attributeUuid',
		       }, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);










