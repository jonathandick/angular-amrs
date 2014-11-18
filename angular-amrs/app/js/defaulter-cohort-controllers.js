'use strict';

/* Controllers */


var defaulterCohortControllers = angular.module('defaulterCohortControllers',['defaulterCohortServices','ngRoute']);


defaulterCohortControllers.controller('PatientDashboardCtrl',['$scope','DCPatientService','$stateParams',
							      
  function($scope,DCPatientService,$stateParams) {      
      if($stateParams.uuid) {
	  DCPatientService.get($stateParams.uuid,function(data) {	      
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


