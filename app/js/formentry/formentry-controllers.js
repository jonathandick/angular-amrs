'use strict';

/* Controllers */

var formentry = angular.module('openmrs.formentry');

formentry.controller('SavedFormsCtrl', ['$scope','$stateParams','PatientServiceFlex','EncounterServiceFlex',
  function($scope,$stateParams,PatientServiceFlex,EncounterServiceFlex) {
      $scope.savedEncounterForms = EncounterServiceFlex.getLocal();

      $scope.loadPatient = function(hash,patientUuid) {	  
	  PatientServiceFlex.get(patientUuid,function(p) { 	      
	      $scope.savedEncounterForms[hash].p = p; 
	  });	  
      };
      
      $scope.loadList = function() {      
	  for(var hash in $scope.savedEncounterForms) {
	      var patientUuid = $scope.savedEncounterForms[hash].patient;
	      $scope.loadPatient(hash,patientUuid);
	  }
      };

      $scope.submitAllLocal = function() {
	  EncounterServiceFlex.submitAllLocal();
      }


      $scope.loadList();
      
  }]);



formentry.controller('EncounterFormCtrl', ['$scope','$stateParams','PatientServiceFlex','EncounterServiceFlex','FormService','Flex','EncounterService',
  function($scope,$stateParams,PatientServiceFlex,EncounterServiceFlex,FormService,Flex,EncounterService) {	
      $scope.patient = "";
      $scope.encounterUuid = "";
      $scope.provider = "";
      $scope.hash = "";
      $scope.formUuid = $stateParams.formUuid;
      $scope.enc = {}; // used to represent the encounter modified for an html form

      $scope.encounter = {}; //represents the original resource

      $scope.toFormData = function(encounter) {
	  $scope.enc = {uuid:encounter.uuid,
			encounterDatetime:encounter.encounterDatetime,
			encounterType:encounter.encounterType.uuid,
			form:encounter.form.uuid,
			patient:encounter.patient.uuid,
			location:encounter.location.uuid,
			provider:encounter.provider.uuid,
			obs:{},
		       }
	  for(var i in encounter.obs) {
	      var o = encounter.obs[i];	      
	      var value = o.value;
	      if(typeof o.value === "object" && o.value !== null) {
		  value = o.value.uuid;
	      }
	      var concept = o.concept.uuid;
	      if($scope.enc.obs[concept]) {
		  if(typeof $scope.enc.obs[concept] !== "object") {
		      $scope.enc.obs[concept] = [$scope.enc.obs[concept],value];
		  }
		  else {
		      $scope.enc.obs[concept].push(value);
		  }
	      }
	      else {
		  $scope.enc.obs[concept] = value;
	      }
	  }
      };

      var patientUuid = $stateParams.patientUuid; 
      if($stateParams.encounterUuid) {	
	  $scope.encounterUuid = $stateParams.encounterUuid;

	  Flex.get(EncounterService,$stateParams.encounterUuid,true,null,function(data) {	      
	      $scope.encounter = data;
	  });

	  
      }
      else if($stateParams.hash) {
	  $scope.hash = $stateParams.hash;
	  $scope.enc = EncounterServiceFlex.getLocal($stateParams.hash);
	  patientUuid = $scope.enc.patient;
      }
      else {
	  /*
	  $scope.enc = {encounterType: FormService.getEncounterType($scope.formUuid),
			form:$scope.formUuid,
			patient:patientUuid};
	  */
      }

      $scope.errors = {};      

      if(patientUuid) {
	  PatientServiceFlex.get(patientUuid,function(patient) { $scope.patient = patient; });
      }


      $scope.save = function() {
	  
	  EncounterServiceFlex.saveLocal($scope.enc,$scope.hash);
      }


      $scope.submit = function() {

	  EncounterServiceFlex.submit($scope.enc,$scope.encounter,$scope.hash,
	     function(data) {
		 if(data === undefined || data === null || data.error) {
		     alert("There was an error. Your form is being saved to your local storage");		     
		 }
	     });		 
      };

      
      
  }]);
