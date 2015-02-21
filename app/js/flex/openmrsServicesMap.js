'use strict';

var serviceMap = angular.module('openmrs.servicesMap', ['openmrsServices']);

serviceMap.factory('serviceMap',['PatientService','EncounterService','ObsService','SessionService',
				 'LocationService','ProviderService','UserService',
  function(PatientService,EncounterService,ObsService,SessionService,LocationService,ProviderService,UserService) {
      var service = {};

      
