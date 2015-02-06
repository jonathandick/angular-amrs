'use strict';

/* Controllers */


var pd = angular.module('patientDashboard');

pd.controller('PatientDashboardCtrl',['$scope','$stateParams','Auth','Flex','PatientService',
  function($scope,$stateParams,Auth,Flex,PatientService) {
      $scope.patient = {};
      $scope.p = null;
      
      Flex.get(PatientService,$stateParams.uuid,true,Auth.getPassword(),function(data) {
	  var p = PatientService.abstractPatient.clone(data.patientData);	  
	  $scope.patient = p;
      });


  }]);
