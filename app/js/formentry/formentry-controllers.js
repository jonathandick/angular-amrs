'use strict';

/* Controllers */

var formEntry = angular.module('openmrs.formentry');

formEntry.controller('SavedFormsCtrl', ['$scope','$stateParams','FormEntryService','Auth','Flex','PatientService',
  function($scope,$stateParams,FormEntryService,Auth,Flex,PatientService) {


      $scope.loadPatient = function(patientUuid,obj) {
	  Flex.get(PatientService,patientUuid,true,Auth.getPassword(),function(p) { 	      	     
	      obj.p = PatientService.Patient(p.patientData);	  
	  });	  
      };

      
      $scope.loadDrafts = function() {      
	  $scope.savedDrafts = FormEntryService.getDrafts();
	  for(var i in $scope.savedDrafts) {
	      var patientUuid = $scope.savedDrafts[i].patient;
	      $scope.loadPatient(patientUuid,$scope.savedDrafts[i]);
	  }
      };


      $scope.loadPendingSubmission = function() {      
	  /*
	  FormEntryService.getPendingSubmission(undefined,function(forms) {
	      for(var i in forms) {
		  var patientUuid = forms[i].patient;
		  $scope.loadPatient(patientUuid,forms[i]);
	      }
	      $scope.pendingSubmission = forms;
	  });
	  */

	  var forms = FormEntryService.getPendingSubmission();
          for(var i in forms) {
              var patientUuid = forms[i].patient;
              $scope.loadPatient(patientUuid,forms[i]);
          }
          $scope.pendingSubmission = forms;
	  
      };


      $scope.submitPendingSubmission = function() {
	  FormEntryService.submitPendingSubmission();
      }

      $scope.loadDrafts();
      $scope.loadPendingSubmission();
      
  }]);



formEntry.controller('FormEntryCtrl', ['$scope','$stateParams','Auth','Flex','EncounterService','PatientService','FormEntryService','spinnerService',
  function($scope,$stateParams,Auth,Flex,EncounterService,PatientService,FormEntryService,spinner) {	
      $scope.patientUuid = $stateParams.patientUuid;       
      
      if($stateParams.savedFormId) { //loading a saved form
	  var savedEncounter = FormEntryService.getDrafts($stateParams.savedFormId);
	  if(savedEncounter === null) savedEncounter = FormEntryService.getPendingSubmission($stateParams.savedFormId);
	  $scope.newEncounter = savedEncounter;
      }
      
      else if($stateParams.encounterUuid) { //loading a form for an encounter on the server
	  $scope.encounterUuid = $stateParams.encounterUuid;	  	  
	  Flex.get(EncounterService,$stateParams.encounterUuid,true,Auth.getPassword(),function(data) {	      	      
	      $scope.existingEncounter = data;	      
	  });
	  
      }
      else { //This is loading a new form
	  var d = new Date();
	  $scope.newEncounter = {patient:$scope.patientUuid,
				 form:$stateParams.formUuid,
				 obs:[],
				 encounterType:FormEntryService.getEncounterType($stateParams.formUuid),
				 isNewEncounter:true,
				 encounterDatetime: d.toISOString()
				};	  
	  $scope.personAttributes = {};
      }





      
  }]);
