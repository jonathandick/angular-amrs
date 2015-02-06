'use strict';

var formEntry = angular.module('openmrs.formentry',['openmrsServices','openmrsServicesFlex','ui.bootstrap','localStorageServices']);

formEntry.factory('FormEntryService',['Auth','localStorage.utils','Flex','EncounterService','PersonAttribute','ObsService',
  function(Auth,local,Flex,EncounterService,PersonAttribute,ObsService) {
      var FormEntryService = {};
      var localStorageTable = 'amrs.formentry';

      FormEntryService.getName = function() { return 'formentry'; }
      
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


      //If hash provided, return individual form. Otherwrise return all forms.
      FormEntryService.getLocal = function(hash) {
	  if(hash) {
	      var form = local.get(localStorageTable,hash,Auth.getPassword());
	      if(form) return form;
	      else { return undefined; }
	  }
	  else { return local.getAll(localStorageTable,Auth.getPassword()); }
      };


      FormEntryService.saveOffline = function(enc,hash) {
	  if(!hash) { 
	      var s = JSON.stringify(enc);             
	      var hash = getHashCode(s);
	      enc.hash = hash;
	  }
	  local.set(localStorageTable,hash,enc,Auth.getPassword());
      }


      FormEntryService.remove = function(hash) {
	  local.remove(localStorageTable,hash);
      }	  


      FormEntryService.submit = function(enc,obsToVoid,hash) {	  	  	  
	  console.log('FormEntryService.submit() : submitting encounter');
	  var encUuid = enc.uuid; //the encounter service will remove the encUuid
	  EncounterService.submit(enc,function(data) {
	      Flex.remove(EncounterService,encUuid);

	      if(data === undefined || data === null || data.error) {
		  console.log("FormEntryService.submit() : error submitting. Saving to local");
		  FormEntryService.saveLocal(enc,hash);
	      }
	      else if(hash !== undefined && hash !== "") {
		  FormEntryService.removeLocal(hash);
	      }
	      else {
		  console.log('FormEntryService.submit() : checking for obs to void');
		  ObsService.void(obsToVoid,function(data) {			  
		      console.log(data);
		  });		      
	      }	  
	      return data;
	  });
      };


      FormEntryService.submitAllLocal = function() {
	  var forms = FormEntryService.getLocal();
	  var errors = 0;
	  var successes = 0;
	  for(var hash in forms) {
	      var enc = forms[hash];
	      var data = FormEntryService.submit(enc,{},hash);
	      if(data === undefined || data === null || data.error) {	      
		  errors++;
	      }
	      else { successes++;}
	  }
	  alert(successes + " forms submitted successfully. " + errors + " forms with errors, still saved locally.");
      }
	      
      return FormEntryService;
  }]);

