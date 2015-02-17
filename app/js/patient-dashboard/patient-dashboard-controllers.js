'use strict';

/* Controllers */


var pd = angular.module('patientDashboard');

pd.controller('PatientDashboardCtrl',['$scope','$stateParams','Auth','Flex','PatientService','$timeout',
  function($scope,$stateParams,Auth,Flex,PatientService,$timeout) {
      $scope.patient = {};
      $scope.p = null;      

      $timeout(function() {
	  Flex.get(PatientService,$stateParams.uuid,true,Auth.getPassword(),function(data) {
	      var p = PatientService.Patient(data.patientData);
	      $scope.patient = p;
	  });
      });


  }]);
