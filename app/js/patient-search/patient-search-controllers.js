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

      $scope.testObs = function() {
          
	  var groupUuid = "6b46a939-8957-49da-979a-8f15398526d6";

          var obsUuid = "fc7cc3b2-5a33-4e5b-91a6-4129ee8d8cbe";

	  var concept = "a89fca44-1350-11df-a1f1-0026b9348838";

	  var answer = "1000";
	  var person = "2db16c82-a064-4f0f-880e-4ae890e3fdd6";
	  var date = new Date();
	  var encounter = "2a6e2553-6f5e-4a1b-8eef-3f2a80970faa";

	  var members = [{person:person,obsDatetime:date,concept:concept,value:"100"},{person:person,obsDatetime:date,concept:concept,value:"200"}];

	  //ObsService.updateGroupMembers(obsUuid,members);


	  //ObsService.update(obsUuid,"33");
	  
	  ObsService.get(obsUuid,function(obsData) {
	      console.log(obsData);
	      var d = [{groupMembers:{person:person,obsDatetime:date,concept:concept,value:answer}}];
	      obsData.groupMembers.push({person:person,obsDatetime:date,concept:concept,value:answer});
	      
	      
	      obsData.$save(
		  function(data) {console.log(data);},
		  function(error) {console.log(error);}
	      );
	      
	  });

	  var o = {groupMembers:[{person:person,obsDatetime:date,concept:concept,value:answer}]};
	  ObsService.addObs(obsUuid,o,function(data) {console.log(data);});
	  

	  /*
	  var o = new Obs({person:person,obsDatetime:date,concept:concept,value:answer,encounter:encounter);
	  o.$save(function(data) {console.log(data);},
		 function(data) {console.log(data);});
	  */
	  //var o = new Obs({uuid:"355e8b24-7163-4417-ae3d-f0e0c9079b82"});	  
	  //o.$delete();
	  
	  
	  
	  
      };


   }]);


