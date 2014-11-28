'use strict';

/* Controllers */


var amrsControllers = angular.module('amrsControllers',[]);

amrsControllers.controller('LoginCtrl',['$scope','Auth',
  function($scope,Auth) {
      $scope.username = '';
      $scope.password = '';
      $scope.errors = "";

      $scope.authenticate = function() {
	  sessionStorage.removeItem("sessionId");
	  Auth.authenticate($scope.username,$scope.password,function(isAuthenticated) {
	      if(!isAuthenticated) { $scope.errors = "Username and password do not match. Please try again.";}
	      console.log("errors: " + $scope.errors);
	  });	  
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
		  $scope.data = data;
		  console.log(config);
	      })
	      .error(function(data, status, headers, config) {
		  $scope.error = "Error 1: " + data + " ; " + status + " headers: " + headers + " config: " + config;
		  $scope.error = config;
		  console.log(data);
		  console.log(status);
		  console.log(config);
	      });	  
      };

      $scope.test2 = function() {
	  $http.get("https://testserver1.ampath.or.ke/outreach/ajax_patient_search?search_string=test")
	      .success(function(data) {
		  $scope.data = data;
		  console.log(data);
	      })
	      .error(function(data, status, headers, config) {
		  $scope.error = "Error 2: " + data + " ; " + status + " headers: " + headers;
	      });
      };
      
  }]);



amrsControllers.controller('AmrsCtrl', ['$scope','$http','Amrs','Person','Location','PersonAttribute','openmrs','Auth','Obs',
  function($scope,$http,Amrs,Person,Location,PersonAttribute,openmrs,Auth,Obs) {					      
      $scope.v = "";
      $scope.q = "";
      $scope.enc = {obs:[{concept:'a',obsGroupId:'1',value:"2"},
			 {concept:'b',obsGroupId:'2',value:"2"},
			]};

      $scope.test = function() {
	  var params = {q:$scope.q};
	  if($scope.v != "") { params["v"] = $scope.v };	  
	  
	  Person.query(params).$promise.then(function(data) { 
	      $scope.result = data; 
	      console.log(data);
	  });
      };
      
      $scope.getRoles = function() {
	  Auth.getRoles(function(data) {
	      $scope.result = data;
	  });
	  Auth.hasRole("system developer",function(data) { console.log(data); });
      };

      $scope.voidObs = function() {
	  Obs.delete({uuid:'c2892a31-11ab-4c7e-bf09-ef7f2d395c83'}).$promise.then(function(data) {
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
		  $scope.patients = data.results;
	      });
	  }
      });

   }]);


amrsControllers.controller('PatientDashboardCtrl',['$scope','$stateParams','PatientServiceFlex','$state',
  function($scope,$stateParams,PatientServiceFlex,$state) {
      $scope.patient = {};
      PatientServiceFlex.get($stateParams.uuid,function(data) {
	  $scope.patient = data;
      });

  }]);
