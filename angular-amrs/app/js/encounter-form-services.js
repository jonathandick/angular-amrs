'use strict';

var encounterFormServices = angular.module('encounterFormServices', ['ngResource','ngCookies','openmrsServices']);

encounterFormServices.factory('EncounterFormService',['Patient',
   function() {		      
       var EncounterFormService = {};
       
       EncounterFormService.getFormData = function(form) {
	   
       }

       EncounterFormService.submit = function() {


       }


       return EncounterFormService;

   }]);
