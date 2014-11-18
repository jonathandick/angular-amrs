'use strict';

/* Controllers */


var encounterFormControllers = angular.module('encounterFormControllers',['ngRoute','openmrsServices','openmrsServicesFlex']);



encounterFormControllers.controller('EncounterFormCtrl', ['$scope','$stateParams','PatientServiceFlex',
  function($scope,$stateParams,PatientServiceFlex) {
      console.log("in EncounterFormCtrl");
      $scope.test = "hello world";
  }]);

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




encounterFormControllers.controller('OutreachFormCtrl', ['$scope','$stateParams','PatientServiceFlex','EncounterServiceFlex',
  function($scope,$stateParams,PatientServiceFlex,EncounterServiceFlex,LocationServiceFlex) {	
      $scope.patient = "";
      $scope.encounterUuid = "";
      $scope.provider = "";
      
      $scope.errors = {};
      $scope.enc = {encounterType:"df5547bc-1350-11df-a1f1-0026b9348838",
		    form:"1eb7938a-8a2a-410c-908a-23f154bf05c0"};
      
      if($stateParams.hash) {
	  $scope.enc = EncounterServiceFlex.getLocal($stateParams.hash);
	  PatientServiceFlex.get($scope.enc.patient,function(patient) { $scope.patient = patient; });
      }
      
      if($stateParams.patientUuid) {
	  PatientServiceFlex.get($stateParams.patientUuid,function(data) {
	      $scope.patient = data;
	      $scope.enc.patient = $scope.patient.getUuid();
	  });
      }

      if($stateParams.encounterUuid) {
	  $scope.encounterUuid = $stateParams.encounterUuid;
	  EncounterServiceFlex.get($stateParams.encounterUuid,function(data) {
	      $scope.enc = data;
	  });
      }
      

      $scope.submit = function() {
	  console.log($scope.enc);
	  EncounterServiceFlex.submit($scope.enc);
      }


      
  }]);
