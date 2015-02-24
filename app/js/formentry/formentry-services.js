'use strict';

var formEntry = angular.module('openmrs.formentry',['openmrsServices','flex','ui.bootstrap','localStorageServices']);

formEntry.factory('FormEntryService',['Auth','localStorage.utils','Flex','EncounterService','PersonAttributeService','ObsService','PatientService',
  function(Auth,local,Flex,EncounterService,PersonAttributeService,ObsService,PatientService) {
      var FormEntryService = {};
      var pendingSubmissionTable = 'amrs.formentry.pending-submission';
      var draftsTable = 'amrs.formentry.drafts';


      FormEntryService.init = function() {
	  var t = localStorage.getItem(pendingSubmissionTable);
	  if(t === null) {localStorage.setItem(pendingSubmissionTable,"{}")};
	  
	  t = localStorage.getItem(draftsTable);
	  if(t === null) {localStorage.setItem(draftsTable,"{}")};
      };
	  	  
      
      function getHashCode(s) {
	  var hash = 0, i, chr, len;
	  if (s.length == 0) return hash;
	  for (i = 0, len = s.length; i < len; i++) {
	      chr   = s.charCodeAt(i);
	      hash  = ((hash << 5) - hash) + chr;
	      hash |= 0; // Convert to 32bit integer
	  }
	  return hash;
      }



      var formMap = {"1eb7938a-8a2a-410c-908a-23f154bf05c0":
                     {name: 'Outreach Follow-up Form',
		      template:'js/formentry/forms/outreach-form2.html',
		      encounterType:"df5547bc-1350-11df-a1f1-0026b9348838"},    
		    }; 
      
      FormEntryService.getTemplate = function(formUuid) {
	  return formMap[formUuid]['template'];
      };

      FormEntryService.getEncounterType = function(formUuid) {
	  return formMap[formUuid]['encounterType'];
      };

      FormEntryService.getForms = function() {
	  return formMap;
      };



      //If savedFormId provided, return individual form. Otherwrise return all forms.
      FormEntryService.getDrafts = function(savedFormId) {
	  if(savedFormId) {
	      var form = local.get(draftsTable,savedFormId,Auth.getPassword());
	      
	      if(form) return form;
	      else { return null; }
	  }
	  else { return local.getAll(draftsTable,Auth.getPassword()); }
      };



      FormEntryService.removeFromDrafts = function(savedFormId) {
	  local.remove(draftsTable,savedFormId);
      }



      
      FormEntryService.saveToDrafts = function(newEncounter,personAttributes) {
	  if(newEncounter.savedFormId === undefined) { 
	      var s = JSON.stringify(newEncounter);
	      newEncounter.savedFormId = getHashCode(s);
	  }
	  else {
	      FormEntryService.removeFromPendingSubmission(newEncounter.savedFormId);
	  }
	  newEncounter.personAttributes = personAttributes;

	  local.set(draftsTable,newEncounter.savedFormId,newEncounter,Auth.getPassword());	  
      }

      

      FormEntryService.getPendingSubmission = function(savedFormId,callback) {
	  if(savedFormId) {
	      var form = local.get(pendingSubmissionTable,savedFormId,Auth.getPassword());	      
	      if(callback) callback(form);
	      else return form;
	  }
	  else { 
	      var forms = local.getAll(pendingSubmissionTable,Auth.getPassword());
	      if(callback) callback(forms);
	      else return forms;
	  }
		  
      }


      FormEntryService.removeFromPendingSubmission = function(savedFormId) {
	  local.remove(pendingSubmissionTable,savedFormId);
      }	  


      FormEntryService.saveToPendingSubmission = function(newEncounter,personAttributes) {
	  console.log('saveToPendingSubmission()...');
	  console.log(newEncounter);
	  if(!newEncounter.savedFormId) { 
	      var s = JSON.stringify(newEncounter);             
	      newEncounter.savedFormId = getHashCode(s);
	  }	  
	  newEncounter.personAttributes = personAttributes;

	  local.set(pendingSubmissionTable,newEncounter.savedFormId,newEncounter,Auth.getPassword());	  
      }



      FormEntryService.submit = function(newEncounter,personAttributes) {	  	  	  
	  console.log('FormEntryService.submit() : submitting encounter');

	  var restData = getRestData(newEncounter);

	  var obsToUpdate = restData.obsToUpdate;
	  delete restData.obsToUpdate;
	  
	  //return;
	  

	  ///if(newEncounter.oldEncounter) obsToVoid = getObsToVoid(newEncounter.oldEncounter.obs,restData.obs);

	  EncounterService.submit(restData,function(data) {	 	      
	      
	      if(newEncounter.savedFormId) FormEntryService.removeFromDrafts(newEncounter.savedFormId);
	      
	      //FormEntryService.saveToPendingSubmission(newEncounter);
	      
	      if(data === undefined || data === null || data.error) {
		  console.log("FormEntryService.submit() : error submitting. Saving to local");		  
		  newEncounter.restObs = restData.obs;
		  newEncounter.obsToUpdate = obsToUpdate;
		  FormEntryService.saveToPendingSubmission(newEncounter,personAttributes);
	      }
	      else {
		  Flex.remove(EncounterService,newEncounter.uuid);

		  if(newEncounter.savedFormId !== undefined) {
		      FormEntryService.removeFromPendingSubmission(newEncounter.savedFormId);
		  }
		  console.log('FormEntryService.submit() : checking for obs to void');

		  if(obsToUpdate.length > 0) {
		      ObsService.updateObsSet(obsToUpdate,function(data) {			  
			  console.log(data);
		      });		      
		  }
		      
		  submitPersonAttributes(newEncounter.patient,personAttributes);
		  //Flex.getFromServer(PatientService,newEncounter.patient,true,Auth.getPassword());		  
	      }
	      return data;
	  });
      };


      FormEntryService.submitPendingSubmission = function() {
	  var forms = FormEntryService.getPendingSubmission();
	  var errors = 0;
	  var successes = 0;
	  for(var i in forms) {
	      var enc = forms[i];
	      var obsToVoid = enc.obsToVoid;
	      delete enc.obsToVoid;

	      var data = FormEntryService.submit(enc,{},obsToVoid);
	      if(data === undefined || data === null || data.error) {	      
		  errors++;
	      }
	      else { successes++;}
	  }
	  alert(successes + " forms submitted successfully. " + errors + " forms with errors, still saved locally.");
      }



      function getRestObs(obs,newRestObs,obsToUpdate) {
	  var hasChanged = false,o;
	  for(var i in obs) {
	      o = obs[i];
	      if(o === null) continue;
	      if ('obs' in o) {
		  
		  var obsGroup = {concept:o.concept,groupMembers:[]};
		  var groupHasChanged = getRestObs(o.obs,obsGroup.groupMembers,null);
		  
		  //this is an obsgroup which has no existing values and therfore changed from empty to with values
		  
		  
		  //Because of the way REST WS works (requires each group member to have a person and obsDatetime), 
		  //  we will treat a group that has changed as a new group. 
		  if(groupHasChanged) {
		      //only add the group if it has members
		      if(obsGroup.groupMembers.length >0) newRestObs.push(obsGroup);

		      //this will cause the existing obs group to be voided
		      if(o.uuid) obsToUpdate.push({uuid:o.uuid});
		  }
		  
	      }

	      //if obsToUpdate is null, it means we are in an obsGroup. The entire obsGroup will be reposted indedpendent of whether the values
	      // have changed. This is done because of issues with the REST WS and updating obsGroups.
	      else if(obsToUpdate !== null && o.existingValue) {
		  if(o.value != o.existingValue) {
		      obsToUpdate.push({concept:o.concept,value:o.value,uuid:o.uuid});
		  }
	      }
	      else if(o.value !== null && o.value !== undefined) {
		  //if(obsToUpdate === null) console.log(o);

		  if(o.existingValue && o.existingValue != o.value) hasChanged = true;
		  else if (o.existingValue === undefined && o.value.toString().trim() !== "") hasChanged = true;

		  //No empty values will be saved for new obs
		  if(o.value.toString().trim() !== "") newRestObs.push({concept:o.concept,value:o.value});		  		  
	      }	      
	  }
	  return hasChanged;
      }


     
      function submitPersonAttributes(personUuid,personAttributes) {

	  var oldAttrs = personAttributes.oldPersonAttributes || [];
	  var newAttrs = personAttributes;
	  var restAttrs = [];
	  
	  var shouldPush;
	  for(var attrTypeUuid in newAttrs) {	      
	      if(attrTypeUuid === "oldPersonAttributes") continue;
	      shouldPush = true;
	      for(var i in oldAttrs) {
		  var type = oldAttrs[i].attributeType.uuid;
		  if(attrTypeUuid === type) {
		      //if the value has not changed, do not resubmit it
		      if(newAttrs[attrTypeUuid] === oldAttrs[i].value) {
			  shouldPush = false;			  
		      }
		      break;
		  }
	      }
	      if(shouldPush) restAttrs.push({attributeType:attrTypeUuid,value:newAttrs[attrTypeUuid]});
	  }

	  for(var i in restAttrs) {
	      console.log('attr type: ' + attrTypeUuid + ' value: '  + newAttrs[attrTypeUuid]);

	      PersonAttributeService.save(personUuid,restAttrs[i].attributeType,restAttrs[i].value,
					  function(data) {
					      console.log(data);
					  });
	  }	  


	  //Update local version of patient to reflect new personAttributes
	  Flex.getFromLocal(PatientService,personUuid,true,Auth.getPassword(),function(data) {
	      var p = PatientService.Patient(data.patientData);
	      p.setAttributes(personAttributes);
	      Flex.save(PatientService,personUuid,p,Auth.getPassword());
	  });
			    
      }

	  
      function getRestData(newEncounter) {
	  var restObs1 = [],restObs=[],obsToUpdate=[];
	  //getNewRestObs(newEncounter.obs,restObs);

	  getRestObs(newEncounter.obs,restObs,obsToUpdate);
	  console.log('restObs');
	  console.log(restObs);
	  console.log('obsToUpdate');
	  console.log(obsToUpdate);

	  var data = {uuid:newEncounter.uuid,
		      patient: newEncounter.patient,
		      encounterDatetime:newEncounter.encounterDatetime,
		      encounterType:newEncounter.encounterType,
		      location:newEncounter.location,
		      provider:newEncounter.provider,
		      form:newEncounter.form,
	      	      obs: restObs,
		      obsToUpdate: obsToUpdate
		      //breaksubmit: true
		     }
	  return data;
      }
      
      
      return FormEntryService;
  }]);

