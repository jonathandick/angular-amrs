'use strict';

/* Controllers */


var auth = angular.module('openmrs.auth');
 
auth.controller('LoginCtrl',['$scope','Auth','DefaulterCohort',
  function($scope,Auth,DC) {
      $scope.username = '';
      $scope.password = '';
      $scope.errors = "";

      //This call to DC is here to force a certificate accept request when the user logs in. 
      //It is necessary because we are currently using untrusted certificates. For some reason,
      //the request is not triggered on the initial access to the webapp, it never gets called
      //and the browser rejects any future cors requests. 
      DC.ping();
      

      $scope.authenticate = function() {
	  
	  Auth.authenticate($scope.username,$scope.password,function(isAuthenticated) {
	      if(!isAuthenticated) { $scope.errors = "Username and password do not match. Please try again.";}
	      console.log("errors: " + $scope.errors);
	  });
      };
  }]);
