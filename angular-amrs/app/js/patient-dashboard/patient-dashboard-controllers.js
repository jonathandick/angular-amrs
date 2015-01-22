'use strict';

/* Controllers */


var pd = angular.module('patientDashboard');

pd.controller('PatientDashboardCtrl',['$scope','$stateParams','PatientServiceFlex','$state','$timeout',
  function($scope,$stateParams,PatientServiceFlex,$state,$timeout) {
      $scope.patient = {};
      $scope.p = null;
      PatientServiceFlex.get($stateParams.uuid,function(data) {
	  //Unclear why, but binding not happening when data coming from IDB. 
	  //Using the timeout function seems to wait a digest cycle and fixes this problem.
	  $timeout(function() {
	      $scope.patient = data;
	  });
      });

      

      

  }]);
