'use strict';

/* Controllers */


var amrsControllers = angular.module('amrsControllers',[]);


amrsControllers.controller('LoginCtrl',['$scope','Auth',

  function($scope,Auth) {					
      $scope.username = "";
      $scope.password = "";
      
      


amrsControllers.controller('ProvidersCtrl', ['$scope','$http',
  function($scope,$http) {
      $scope.providers = [{name:'john'},{name:'jane'}];      
  }]);


amrsControllers.controller('AmrsCtrl', ['$scope','$http','Amrs','Person','Location','PersonAttribute','openmrs',
  function($scope,$http,Amrs,Person,Location,PersonAttribute,openmrs) {					      
      $scope.locations = {};                  
      
      Person.query({q:"Jonathan"}).$promise.then(function(data) { console.log(data) });
      Location.query({q:"unknown"}).$promise.then(function(data) { console.log(data) });
      
      openmrs.query({object:"person",uuid:"3d54351f-9fb4-40c1-a5c1-bc665fecbcd6"}).$promise.then(function(data) {console.log(data)});
      /*
      Person.save({names:{givenName:"Jane",familyName:"Doe"},
		   gender:"F"
		  });
      */
      /*
      Person.query(['Jonathan']).then(function(data) {
	  console.log(data);
      });
      */

      
  }]);



amrsControllers.controller('PatientSearchCtrl', ['$scope','$http','Auth','Patient',
  function($scope,$http,Auth,Patient) {
      $scope.filter = "";
      $scope.patients = [];

      $scope.$watch('searchString',function(value) {
	  Patient.search(value,function(data) {
	      $scope.patients = data;
	  });
      });

   }]);


amrsControllers.controller('PatientDashboardCtrl',['$scope','Patient','$routeParams',
  function($scope,Patient,$routeParams) {
      Patient.get($routeParams.patient_uuid,function(data) {
	  $scope.patient = data;
      });
  }]);
      

amrsControllers.controller('DefaulterCohortCtrl', ['$scope','$http','Auth','DefaulterCohort',
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
