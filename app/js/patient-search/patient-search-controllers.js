'use strict';

/* Controllers */


'use strict';

var mod = angular.module('patientSearch',['openmrsServices']);

mod.controller('PatientSearchCtrl', ['$scope','Patient','ObsService','$http','Obs',
  function($scope,Patient,ObsService,$http,Obs) {
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


