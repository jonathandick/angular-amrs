'use strict';

/* Controllers */


'use strict';

var mod = angular.module('patientSearch',['openmrsServices']);

mod.controller('PatientSearchCtrl', ['$scope','Patient',
  function($scope,Patient,lsf) {
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


