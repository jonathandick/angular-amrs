'use strict';

var formEntry = angular.module('openmrs.formentry',['openmrsServices','openmrsServicesFlex','ui.bootstrap','localStorageServices']);

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
	  console.log('FormEntryService.getDrafts()');
	  if(savedFormId) {
	      var form = local.get(draftsTable,savedFormId,Auth.getPassword());
	      console.log(form);
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
	  console.log(newEncounter);
	  return;
	  var restData = getRestData(newEncounter),obsToVoid;
	  if(newEncounter.oldEncounter) obsToVoid = getObsToVoid(newEncounter.oldEncounter.obs,restData.obs);
	  
	  
	  EncounterService.submit(restData,function(data) {	 	      
	      
	      if(newEncounter.savedFormId) FormEntryService.removeFromDrafts(newEncounter.savedFormId);
	      
	      //FormEntryService.saveToPendingSubmission(newEncounter);
	      
	      if(data === undefined || data === null || data.error) {
		  console.log("FormEntryService.submit() : error submitting. Saving to local");		  
		  newEncounter.restObs = restData.obs;
		  if(newEncounter.oldEncounter) newEncounter.obsToVoid = obsToVoid;		      
		  FormEntryService.saveToPendingSubmission(newEncounter,personAttributes);
	      }
	      else {
		  Flex.remove(EncounterService,newEncounter.uuid);

		  if(newEncounter.savedFormId !== undefined) {
		      FormEntryService.removeFromPendingSubmission(newEncounter.savedFormId);
		  }
		  console.log('FormEntryService.submit() : checking for obs to void');
		  if(newEncounter.oldEncounter) {
		      ObsService.void(obsToVoid,function(data) {			  
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


      function getNewRestObs(obs,restObs) {
	  for(var i in obs) {
	      var o = obs[i];
	      if('value' in o) {
		  if(o.value && o.value.toString().trim() !== "") {
		      //No empty values will be saved
		      restObs.push(o);
		  }
	      }
	      else {
		  var obsSet = {concept:o.concept,obs:[]};
		  getNewObs(o.obs,obsSet.obs);
		  restObs.push(obsSet);
	      }
	  }
      }
      
      function compare(a,b) {
 	  if(a.concept.uuid) {
	      if(a.concept.uuid < b.concept.uuid) return -1;
	      if(a.concept.uuid > b.concept.uuid) return 1;
	      if(a.concept.uuid === b.concept.uuid) {
		  var aValue = getValue(a);
		  var bValue = getValue(b);
		  if(aValue < bValue) return -1;
		  if(aValue > bValue) return 1;
		  return 0;
			}
	  }
	  else {
	      if(a.concept < b.concept) return -1;
	      if(a.concept > b.concept) return 1;
	      return 0;
	  }
      }						


      //assumes obs1 is a restws object and obs2 is a payload object. 
      function isIdentical(obs1,obs2) {
	  if(obs1.value) {
	      if(Object.prototype.toString.call(obs1.value) == "[object Object]") {
		  return obs1.value.uuid === obs2.value;
	      }
			else return obs1.value === obs2.value;
	      
	  }
	  else if(obs2.obs === undefined) return false;
	  else if(obs1.obs.length != obs2.obs.length) return false;
	  else {			
	      obs1.obs.sort(compare);
	      obs2.obs.sort(compare);			
	      for(var i in obs1.obs) {
		  if(!isIdentical(obs1.obs[i],obs2.obs[i])) {
		      return false;
		  }
	      }
	  }
	  return true;
      }

      
      function getObsToVoid(originalObs,obs) {
	  var obsToVoid = [];
	  for(var i in originalObs) {
	      var found = false;
	      for(var j in obs) {
		  if(originalObs[i].concept.uuid === obs[j].concept) {
		      if(isIdentical(originalObs[i],obs[j])) {
			  obs.splice(j,1); //don't resubmit
			  found = true;
			  break;
		      }
		  }
	      }
	      if(!found) {
		  obsToVoid.push(originalObs[i].uuid); //void as key=value is not the same
	      }
	  }
	  return obsToVoid;
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
	  var restObs = [];
	  getNewRestObs(newEncounter.obs,restObs);	 

	  var data = {uuid:newEncounter.uuid,
		      patient: newEncounter.patient,
		      encounterDatetime:newEncounter.encounterDatetime,
		      encounterType:newEncounter.encounterType,
		      location:newEncounter.location,
		      provider:newEncounter.provider,
		      form:newEncounter.form,
	      	      obs: restObs,
		      //breaksubmit: true
		     }
	  return data;
      }
      
      
      return FormEntryService;
  }]);

