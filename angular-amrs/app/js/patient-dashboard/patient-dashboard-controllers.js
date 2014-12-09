'use strict';

/* Controllers */


var pd = angular.module('patientDashboard');

pd.controller('PatientDashboardCtrl',['$scope','$stateParams','PatientServiceFlex','$state',
  function($scope,$stateParams,PatientServiceFlex,$state) {
      $scope.patient = {};
      PatientServiceFlex.get($stateParams.uuid,function(data) {
	  $scope.patient = data;
      });

  }]);
