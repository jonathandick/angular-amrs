'use strict';

/* Controllers */


var amrsControllers = angular.module('amrsControllers',[]);


amrsControllers.controller('ProvidersCtrl', ['$scope','$http',
  function($scope,$http) {
      $scope.providers = [{name:'john'},{name:'jane'}];      
  }]);


amrsControllers.controller('LoginCtrl',['$scope','Auth',
  function($scope,Auth) {
      $scope.username = '';
      $scope.password = '';

      $scope.authenticate = function() {
	  sessionStorage.removeItem("sessionId");
	  Auth.authenticate($scope.username,$scope.password);
      };
  }]);
      

amrsControllers.controller('DjangoCtrl', ['$scope','$http','Amrs','Person','Location','PersonAttribute','openmrs','Auth','$cookies',
  function($scope,$http,Amrs,Person,Location,PersonAttribute,openmrs,Auth,$cookies) {					      
      $scope.v = "";
      $scope.q = "";
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;

      $scope.test = function() {

	  $http.get("https://testserver1.ampath.or.ke/outreach/login")
	      .success(function(data,status,headers,config) { 	      
		  console.log(data);
	      });	  
      };

      $scope.test2 = function() {
	  $http.get("https://testserver1.ampath.or.ke/outreach/ajax_patient_search?search_string=test")
	      .success(function(data) {
		  console.log(data);
	      });

      };
      
  }]);



amrsControllers.controller('AmrsCtrl', ['$scope','$http','Amrs','Person','Location','PersonAttribute','openmrs','Auth',
  function($scope,$http,Amrs,Person,Location,PersonAttribute,openmrs,Auth) {					      
      $scope.v = "";
      $scope.q = "";
      
      $scope.test = function() {
	  var params = {q:$scope.q};
	  if($scope.v != "") { params["v"] = $scope.v };	  
	  
	  Person.query(params).$promise.then(function(data) { 
	      $scope.result = data; 
	      console.log(data);
	  });
      };
      
  }]);



amrsControllers.controller('PatientSearchCtrl', ['$scope','$http','Auth','Patient',
  function($scope,$http,Auth,Patient,Person) {
      $scope.filter = "";
      $scope.patients = [];

      $scope.$watch('searchString',function(value) {
	  var v = "custom:(uuid,";
	  v += "person:(uuid,gender,birthdate,preferredName:(givenName,middleName,familyName),birthdate,attributes:(attributeType:(uuid),uuid)))";

	  if(value && value.length > 3) {
	      Patient.query({q:value,v:v}).$promise.then(function(data) {
		  console.log(data);
		  $scope.patients = data;
	      });
	  }
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
