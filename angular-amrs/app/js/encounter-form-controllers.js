'use strict';

/* Controllers */


var encounterFormControllers = angular.module('encounterFormControllers',['ngRoute','openmrsServices','openmrsServicesFlex']);

encounterFormControllers.controller('SavedFormsCtrl', ['$scope','$stateParams','PatientServiceFlex','EncounterServiceFlex',
  function($scope,$stateParams,PatientServiceFlex,EncounterServiceFlex) {
      var savedEncounterForms = EncounterServiceFlex.getLocal();
      var keys = Object.keys(savedEncounterForms);
      for(var hash in savedEncounterForms) {	  
	  var patientUuid = savedEncounterForms[hash].patient;
	  PatientServiceFlex.get(patientUuid,function(p) { savedEncounterForms[hash].p = p; });
      }
      $scope.savedEncounterForms = savedEncounterForms;
  }]);



encounterFormControllers.controller('EncounterFormCtrl', ['$scope','$stateParams','PatientServiceFlex','EncounterServiceFlex','FormService',
  function($scope,$stateParams,PatientServiceFlex,EncounterServiceFlex,FormService) {	
      $scope.patient = "";
      $scope.encounterUuid = "";
      $scope.provider = "";
      $scope.hash = "";
      $scope.formUuid = $stateParams.formUuid;
      $scope.enc = {};

      $scope.toFormData = function(encounter) {
	  console.log(encounter);
	  $scope.enc = {uuid:encounter.uuid,
			encounterDatetime:encounter.encounterDatetime,
			encounterType:encounter.encounterType.uuid,
			form:encounter.form.uuid,
			patient:encounter.patient.uuid,
			location:encounter.location.uuid,
			provider:encounter.provider.uuid,
			obs:{},			
		       }
	  for(var i=0; i< encounter.obs.length; i++) {
	      var o = encounter.obs[i];	      
	      console.log(o);
	      var value = o.value;
	      if(typeof o.value === "object") {
		  value = o.value.uuid;
	      }
	      var concept = o.concept.uuid;
	      if($scope.enc.obs[concept]) {
		  if(typeof $scope.enc.obs[concept] === "string") {
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
	  EncounterServiceFlex.get($stateParams.encounterUuid,function(data) {
	      $scope.toFormData(data);
	      console.log($scope.enc);
	  });
      }
      else if($stateParams.hash) {
	  $scope.hash = $stateParams.hash;
	  $scope.enc = EncounterServiceFlex.getLocal($stateParams.hash);
	  patientUuid = $scope.enc.patient;
      }
      else {
	  $scope.enc = {encounterType: FormService.getEncounterType($scope.formUuid),
			form:$scope.formUuid};
      }

      $scope.errors = {};      

      if(patientUuid) {
	  PatientServiceFlex.get(patientUuid,function(patient) { $scope.patient = patient; });
	  //$scope.enc.patient = patientUuid;
      }


      $scope.save = function() {
	  console.log("hash: " + $scope.hash);
	  EncounterServiceFlex.saveLocal($scope.enc,$scope.hash);
      }

      $scope.submit = function() {
	  EncounterServiceFlex.submit($scope.enc);
      }


      
  }]);
