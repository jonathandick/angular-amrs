'use strict';

var encounterFormControllers = angular.module('encounterFormControllers', ['ngResource','ngCookies','openmrsServices']);

encounterFormControllers.factory('EncounterFormCtrl',['$scope','Patient',
  function($scope,Patient) {						      
      
      $scope.getData = function(data) {
	  console.log(data);
      }
  }]);
      
