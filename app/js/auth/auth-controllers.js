'use strict';

/* Controllers */


var auth = angular.module('openmrs.auth');
 
auth.controller('LoginCtrl',['$scope','Auth',
  function($scope,Auth) {
      $scope.username = '';
      $scope.password = '';
      $scope.errors = "";

      $scope.authenticate = function() {
	  
	  Auth.authenticate($scope.username,$scope.password,function(isAuthenticated) {
	      if(!isAuthenticated) { $scope.errors = "Username and password do not match. Please try again.";}
	      console.log("errors: " + $scope.errors);
	  });
      };
  }]);
