'use strict';

/* Controllers */


var defaulterCohortControllers = angular.module('defaulterCohortControllers',['defaulterCohortServices','ngRoute']);


defaulterCohortControllers.controller('PatientDashboardCtrl',['$scope','DCPatientService','$stateParams',
							      
  function($scope,DCPatientService,$stateParams) {      
      if($stateParams.uuid) {
	  console.log($stateParams.uuid);
	  DCPatientService.get($stateParams.uuid,function(data) {
	      console.log(data);
	      $scope.patient = data;
	  });
      }
  }]);
      


defaulterCohortControllers.controller('DefaulterCohortCtrl', ['$scope','$http','Auth','DefaulterCohort',
  function($scope,$http,Auth,DefaulterCohort) {	
      $scope.defaulterCohorts = "";
      $scope.defaulterCohortUuid = "";
      $scope.defaulterCohort = {};


      $scope.getDefaulterCohort = function() {
	  if($scope.defaulterCohortUuid != "") {	      
	      DefaulterCohort.get($scope.defaulterCohortUuid,function(data) {
		  $scope.defaulterCohort = data;
		  		  
		  if(data.uuid != $scope.defaulterCohortUuid) {
		      console.log("Getting new defaulter cohort set");		      
		      DefaulterCohort.getDefaulterCohorts(function(cohorts) {
			  $scope.defaulterCohorts = cohorts;
			  $scope.defaulterCohortUuid = data.uuid
		      });
		  }
	      });
	  }
      };

      $scope.updateDefaulterCohort = function() {
	  if($scope.defaulterCohortUuid != "") {
              DefaulterCohort.update($scope.defaulterCohortUuid,function(data) {
		  if(typeof data == "number") {
		      alert(data + " patients retired.");		      
		  }
		  else {
		      $scope.defaulterCohort = data;
                  }
              });
          }

      };

      $scope.getNewDefaulterCohort = function() {
	  if($scope.defaulterCohortUuid != "" && confirm('This will retire the current list. Are you sure you want to create a new defaulter list?')) {	      
              DefaulterCohort.getNew($scope.defaulterCohortUuid,function(data) {
                  $scope.defaulterCohort = data;
		  DefaulterCohort.getDefaulterCohorts(function(data) {
		      $scope.defaulterCohorts = data;
		  });
              });
          }

      };



      DefaulterCohort.getDefaulterCohorts(function(data) {
	  $scope.defaulterCohorts = data;
      });
      
  }]);

defaulterCohortControllers.controller('OutreachFormCtrl', ['$scope','$stateParams','DCPatientService','DCEncounterService',
  function($scope,$stateParams,PatientService,EncounterService) {	
      $scope.patient = "";

      $scope.encounterUuid = "";

      $scope.enc = {encounterType:"df5547bc-1350-11df-a1f1-0026b9348838",
		    form:"1eb7938a-8a2a-410c-908a-23f154bf05c0"};

      if($stateParams.patientUuid) {
	  console.log($stateParams.uuid);
	  PatientService.get($stateParams.patientUuid,function(data) {
	      $scope.patient = data;
	      $scope.enc.patient = $scope.patient.uuid;
	  });
      }

      if($stateParams.encounterUuid) {
	  $scope.encounterUuid = $stateParams.encounterUuid;
	  EncounterService.get($stateParams.encounterUuid,function(data) {
	      $scope.enc = data;
	  });
      }
      

      $scope.submit = function() {
	  EncounterService.submit($scope.encounterUuid,$scope.enc);
      }


      
  }]);

