'use strict';

/* Controllers */

var formEntry = angular.module('openmrs.formentry');

formEntry.controller('SavedFormsCtrl', ['$scope','$stateParams','FormEntryService','Auth','Flex','PatientService',
  function($scope,$stateParams,FormEntryService,Auth,Flex,PatientService) {


      function loadPatient(patientUuid,obj) {
	  Flex.get(PatientService,patientUuid,true,Auth.getPassword(),function(p) { 	      	     
	      obj.p = PatientService.Patient(p.patientData);	  
	  });	  
      };

      
      $scope.loadDrafts = function() {      
	  var savedDrafts = FormEntryService.getDrafts();
	  for(var i in savedDrafts) {
	      savedDrafts[i].patient = PatientService.Patient(savedDrafts[i].patient.patientData);
	  }
	  $scope.savedDrafts = savedDrafts;
	  
      };


      $scope.loadPendingSubmission = function() {      
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
      Flex.get(PatientService,$stateParams.patientUuid,true,Auth.getPassword(),function(patient) { 
	  $scope.patient = PatientService.Patient(patient.patientData);	  	     	      
      });

      
      if($stateParams.savedFormId) { //loading a saved form
	  var savedForm = FormEntryService.getDrafts($stateParams.savedFormId);
	  if(savedFrom === null) savedForm = FormEntryService.getPendingSubmission($stateParams.savedFormId);
	  $scope.form = form;
      }
      
      else if($stateParams.encounterUuid) { //loading a form for an encounter on the server
	  $scope.encounterUuid = $stateParams.encounterUuid;	  	  
	  Flex.get(EncounterService,$stateParams.encounterUuid,true,Auth.getPassword(),function(data) {	      	      
	      $scope.existingEncounter = data;	      
	  });
	  
      }
      else { //This is loading a new form
	  var d = new Date();
	  $scope.encounter = {patient:$scope.patientUuid,
			      form:$stateParams.formUuid,			   
			      encounterType:FormEntryService.getEncounterType($stateParams.formUuid),
			      isNewEncounter:true,
			      encounterDatetime: d.toISOString()
			     };	  	  
      }





      
  }]);
