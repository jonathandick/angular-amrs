'use strict';

/* Controllers */

var formEntry = angular.module('openmrs.formentry');

formEntry.controller('SavedFormsCtrl', ['$scope','$stateParams','localStorage.utils','Auth','Flex','PatientService',
  function($scope,$stateParams,local,Auth,Flex,PatientService) {
      $scope.savedEncounterForms = local.getAll('amrs.formentry',Auth.getPassword());

      console.log($scope.savedEncounterForms);

      $scope.loadPatient = function(hash,patientUuid) {	  	  
	  Flex.get(PatientService,patientUuid,true,Auth.getPassword(),function(p) { 	      
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



formEntry.controller('FormEntryCtrl', ['$scope','$stateParams','Auth','Flex','EncounterService','PatientService','FormService','FormEntryService',
  function($scope,$stateParams,Auth,Flex,EncounterService,PatientService,FormService,FormEntryService) {	
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
	  $scope.enc = local.get('amrs.formentry',$stateParams.hash,Auth.getPassword());
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
	  Flex.get(PatientService,patientUuid,true,Auth.getPassword(),function(patient) { 
	      $scope.patient = PatientService.abstractPatient.clone(patient.patientData);	  	      
	  });
      }


      $scope.saveOffline = function() {	  
	  FormEntryService.saveOffline($scope.enc,$scope.hash);
      }


      $scope.submit = function() {	  
	  /*
	    EncounterServiceFlex.submit($scope.enc,$scope.encounter,$scope.hash,
	     function(data) {
		 if(data === undefined || data === null || data.error) {
		     alert("There was an error. Your form is being saved to your local storage");		     
		 }
	     });
	  */
      };

      
      
  }]);
