'use strict';

var serverTests = angular.module('serverTests',[]);
       
serverTests.controller('DjangoCtrl', ['$scope','$http','Amrs','Person','Location','PersonAttribute','openmrs','Auth','$cookies',
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


serverTests.controller('AmrsCtrl', ['$scope','$http','Amrs','Person','Location','PersonAttribute','openmrs','Auth','Obs',
  function($scope,$http,Amrs,Person,Location,PersonAttribute,openmrs,Auth,Obs) {					      
      $scope.v = "";
      $scope.q = "";
      $scope.templates = {};

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


      /*
      var encounter = {obs:[
	  {concept:"t",value:"i"},
	  {concept:"t",value:"2"},
	  {concept:"z",obs:[{concept:"y",value:"b"},
			    {concept:"x",value:"c"},
			    {concept:"w",obs:[{concept:"v",value:"e"}]},
			    {concept:"w",obs:[{concept:"v",value:"2"}]},
			   ]
	  }]
		      };      
      */

      var model = {"1":{concept:"z",obs:{"2":{concept:"w",obs:{}}}}};

      //loadData(encounter.obs,model);
      //$scope.encounter = encounter;

  }]);
