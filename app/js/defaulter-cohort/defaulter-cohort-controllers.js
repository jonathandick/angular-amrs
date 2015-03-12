'use strict';

/* Controllers */


var dc = angular.module('defaulterCohort');
      
dc.controller('DefaulterCohortCtrl', ['$scope','$http','Auth','DefaulterCohort',
  function($scope,$http,Auth,DefaulterCohort) {	
      $scope.defaulterCohorts = "";
      $scope.defaulterCohortUuid = "";
      $scope.defaulterCohort = {};
      $scope.numRetired = 0;
      $scope.riskCategories = {0:'Being Traced',1:'High',2:'Medium',3:'Low',4:'LTFU',5:'no_rtc_date',6:'Untraceable'};

      $scope.outreachProviders = DefaulterCohort.getOutreachProviders();
      //Get defaulter cohort if one exists in session
      
      function setNumRetired() {
	  var numRetired = 0;
	  for(var i in $scope.defaulterCohort.patients) {
	      if($scope.defaulterCohort.patients[i].retired) { 
		  numRetired++;		  
	      }
	  }
	  $scope.numRetired = numRetired;
      }
	  

	  
      $scope.getDefaulterCohort = function() {
	  var prevCohortUuid = sessionStorage.getItem('curDefaulterCohortUuid');	  
	  if($scope.defaulterCohortUuid === undefined || $scope.defaulterCohortUuid === null || $scope.defaulterCohortUuid === "") { 
	      if(prevCohortUuid) $scope.defaulterCohortUuid = prevCohortUuid;
	      else return;
	  }

	  console.log("Getting defaulter cohort...");

	  DefaulterCohort.get($scope.defaulterCohortUuid,function(data) {
	      $scope.defaulterCohort = data;
	      
	      if(data.uuid != $scope.defaulterCohortUuid) {
		  console.log("Getting new defaulter cohort set");		      
		  DefaulterCohort.getDefaulterCohorts(function(cohorts) {
		      $scope.defaulterCohorts = cohorts;
		      $scope.defaulterCohortUuid = data.uuid
		  });
	      }
	      setNumRetired();
	  });
      };

      $scope.getDefaulterCohort();

      

      $scope.updateDefaulterCohort = function() {
	  if($scope.defaulterCohortUuid != "") {
              DefaulterCohort.update($scope.defaulterCohortUuid,function(data) {
		  if(typeof data == "number") {
		      alert(data + " patients retired.");
		      setNumRetired();
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
		  setNumRetired();
		  DefaulterCohort.getDefaulterCohorts(function(data) {
		      $scope.defaulterCohorts = data;
		  });
              });
          }

      };

      //Load defaulter cohorts
      DefaulterCohort.getDefaulterCohorts(function(data) {
	  //alert(angular.toJson(data));
	  $scope.defaulterCohorts = data;
      });
      
  }]);


