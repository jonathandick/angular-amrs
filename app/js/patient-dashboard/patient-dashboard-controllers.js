'use strict';

/* Controllers */


var pd = angular.module('patientDashboard');

pd.controller('PatientDashboardCtrl',['$scope','$stateParams','PatientServiceFlex','$state','$timeout','Flex','PatientService',
  function($scope,$stateParams,PatientServiceFlex,$state,$timeout,Flex,PatientService) {
      $scope.patient = {};
      $scope.p = null;

      
      Flex.get(PatientService,$stateParams.uuid,true,'12345',function(data) {
	  var p = PatientService.abstractPatient.clone(data.patientData);	  
	  $scope.patient = p;
      });

      /*
      PatientServiceFlex.get($stateParams.uuid,function(data) {
	  //Unclear why, but binding not happening when data coming from IDB. 
	  //Using the timeout function seems to wait a digest cycle and fixes this problem.
	  $timeout(function() {
	      $scope.patient = data;
	  });
      });
      */

      

      

  }]);
