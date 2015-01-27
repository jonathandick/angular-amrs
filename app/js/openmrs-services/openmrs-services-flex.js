'use strict';

var openmrsServicesFlex = angular.module('openmrsServicesFlex', ['ngResource','ngCookies','openmrsServices','dexieServices','openmrs.auth',
								 'localStorageServices']);


openmrsServicesFlex.factory('OpenmrsFlexSettings',[
  function() {
      var service = {};
      service.init = function() {
	  var tables = ['amrs.patient','expiration','amrs.provider','amrs.location','amrs.encounter','amrs.formentry'];
	  for(var i in tables) {
	      var t = localStorage.getItem(tables[i]);
	      if(!t) localStorage.setItem(tables[i],"{}");
	  }
      }
      return service;

  }]);



openmrsServicesFlex.factory('Flex',['localStorage.utils',
  function(local) {
      var flexService = {};

      function getFromServer(service,key,storeOffline,encryptionPassword,callback) {
	  service.get(key,function(item){
	      if(storeOffline) {
		  var tableName = "amrs." + service.getName();
		  local.set(tableName,key,item,encryptionPassword);
	      }
	      callback(item);
	  });
      };	    


      function getAllFromServer(service,keyGetter,storeOffline,encryptionPassword,callback) {
	  service.getAll(function(items){
	      if(storeOffline) {
		  var tableName = "amrs." + service.getName();
		  local.setAll(tableName,items,keyGetter,encryptionPassword);
	      }
	      callback(item);
	  });
      };

      function queryServer(service,searchString,keyGetter,storeOffline,encryptionPassword,callback) {
	  service.query({q:searchString},function(items){
	      if(storeOffline) {
		  var tableName = "amrs." + service.getName();
		  local.setQuerySet(tableName,items,keyGetter,encryptionPassword);
	      }
              callback(items);
          });
      }
      
      flexService.init = function() {
	  var tables = ['amrs.patient','expiration','amrs.provider','amrs.location','amrs.encounter','amrs.formentry'];
	  for(var i in tables) {
	      var t = localStorage.getItem(tables[i]);
	      if(!t) localStorage.setItem(tables[i],"{}");
	  }
      }


      flexService.get = function(service,key,storeOffline,encryptionPassword,callback) {
	  var tableName = "amrs." + service.getName();	  
	  var item = local.get(tableName,key,encryptionPassword);
	  if(item) { callback(item); }
	  else getFromServer(service,key,storeOffline,encryptionPassword,callback);
      }


      flexService.query = function(service,searchString,keyGetter,storeOffline,encryptionPassword,callback) {
	  var tableName = "amrs." + service.getName();	  
	  var item = local.get(tableName,key,encryptionPassword);
	  queryServer(service,searchString,keyGetter,storeOffline,encryptionPassword,callback);
      }

      flexService.getAll = function(service,keyGetter,storeOffline,encryptionPassword,callback) {
	  var tableName = "amrs." + service.getName();	  
	  var items = local.getAll(tableName);
	  if(Object.keys(items).length > 0 ) {	      
	      callback(items);
	  }
	  else getFromServer(service,keyGetter,storeOffline,encryptionPassword,callback);
      };

      flexService.remove = function(service,key,callback) {
	  var tableName = "amrs." + service.getName();	  
	  local.remove(tableName,key);
	  if(callback) callback();
      }


      /*
	Save : only store locally, do not communicate with server. 
	For example, if data collection is complete, and form to completed later.
      */
      flexService.save = function(service,key,item,encryptionPassword,callback) {
	  var tableName = "amrs." + service.getName();
	  local.set(tableName,key,item,encryptionPassword);
	  callback();
      }

      return flexService;

  }]);





openmrsServicesFlex.factory('PatientServiceFlex',['$http','PatientService','ngDexie','Auth','localStorage.utils',
  function($http,PatientService,ngDexie,Auth,local) {
      var PatientServiceFlex = {};

      PatientServiceFlex.clone = function(data) {
	  return PatientService.abstractPatient.clone(data);
      };
      

      function getFromServer(patientUuid,setOffline,callback) {
	  console.log("PatientServiceFlex.getFromServer() : Querying server for patient");
	  PatientService.get(patientUuid, function(p){
	      if(setOffline) {
		  //setOffline("patient",patientUuid,p,Auth.getPassword());
		  setOffline("amrs.patient",patientUuid,p,"12345");
	      }
	      callback(p);
	  });
      };	    

      PatientServiceFlex.get = function(patientUuid,callback) {
	  console.log("PatientServiceFlex.get() : " + patientUuid);
	  //var p = local.get("patient",patientUuid,Auth.getPassword(),7);
	  var p = local.get("amrs.patient",patientUuid,"12345",7);
	  if(p) {
	      console.log('Got patient locally');
	      p = PatientServiceFlex.clone(p.patientData);
	      callback(p);
	  }
	  else getFromServer(patientUuid,local.set,callback);
      };
	  

      PatientServiceFlex.search = function(searchString,callback){
	  if(searchString && searchString.length > 3) {
	      Patient.query({q:searchString}).$promise.then(function(data){
                  callback(data);
              });
          }
      };

      return PatientServiceFlex;
      
  }]);


openmrsServicesFlex.factory('EncounterServiceFlex',['EncounterService','Auth','localStorage.utils',
  function(EncounterService,Auth,local) {
      var EncounterServiceFlex = {};

      function getFromServer(encounterUuid,setOffline,callback) {
	  console.log("EncounterServiceFlex.get() : Querying server for patient");
	  EncounterService.get(encounterUuid, function(e){
	      if(setOffline) {
		  //setOffline("amrs.encounter",encounterUuid,e,Auth.getPassword());
		  setOffline("amrs.encounter",encounterUuid,e,"12345");
	      }
	      callback(e);
	  });

      }

      EncounterServiceFlex.get = function(encounterUuid,callback) {
	  console.log("EncounterServiceFlex.get() : " + encounterUuid);
	  //var e = local.get("amrs.encounter",encounterUuid,Auth.getPassword(),7);
	  var e = local.get("amrs.encounter",encounterUuid,"12345",7);
	  if(e) {
	      console.log('Got encounter locally');
	      callback(e);
	  }
	  else getFromServer(encounterUuid,local.set,callback);
      };



      EncounterServiceFlex.patientQuery = function(params,callback) {
	  EncounterService.patientQuery(params,callback);
      };								  	 

      return EncounterServiceFlex;
           
  }]);




openmrsServicesFlex.factory('FormEntryServiceFlex',['EncounterService','PersonAttribute','ObsService','Flex',
  function(EncounterService,PersonAttribute,ObsService,Flex) {
      var FormEntryServiceFlex = {};
      
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

      FormEntryServiceFlex.removeLocal = function(hash) {
	  var forms = local.getItem('savedEncounterForms');
	  if(forms) { 
	      forms = JSON.parse(forms);
	      delete forms[hash];
	      local.setItem("savedEncounterForms",JSON.stringify(forms));
	  }
      }


      FormEntryServiceFlex.submitAllLocal = function() {
	  var forms = FormEntryServiceFlex.getLocal();
	  var errors = 0;
	  var successes = 0;
	  for(var hash in forms) {
	      var enc = forms[hash];
	      var data = FormEntryServiceFlex.submit(enc,{},hash);
	      if(data === undefined || data === null || data.error) {	      
		  errors++;
	      }
	      else { successes++;}
	  }
	  alert(successes + " forms submitted successfully. " + errors + " forms with errors, still saved locally.");
      }
	      
	  

      FormEntryServiceFlex.saveLocal = function(enc,hash) {
	  if(!hash) { 
	      var s = JSON.stringify(enc);             
	      var hash = getHashCode(s);
	  }
	  var forms = local.getItem('savedEncounterForms');

	  if(forms) { forms = JSON.parse(forms); }
	  else { forms = {}; }

	  forms[hash] = enc;
	  local.setItem("savedEncounterForms",JSON.stringify(forms));
      }


      FormEntryServiceFlex.submit = function(enc,obsToVoid,hash) {	  	  	  
	  console.log('FormEntryServiceFlex.submit() : submitting encounter');
	  var encUuid = enc.uuid; //the encounter service will remove the encUuid
	  EncounterService.submit(enc,function(data) {
	      Flex.remove(EncounterService,encUuid);

	      if(data === undefined || data === null || data.error) {
		  console.log("FormEntryServiceFlex.submit() : error submitting. Saving to local");
		  FormEntryServiceFlex.saveLocal(enc,hash);
	      }
	      else if(hash !== undefined && hash !== "") {
		  FormEntryServiceFlex.removeLocal(hash);
	      }
	      else {
		  console.log('FormEntryServiceFlex.submit() : checking for obs to void');
		  ObsService.void(obsToVoid,function(data) {			  
		      console.log(data);
		  });		      
	      }	  
	      return data;
	  });
      };


      //If hash provided, return individual form. Otherwrise return all forms.
      FormEntryServiceFlex.getLocal = function(hash) {
	  var forms = JSON.parse(local.getItem("savedEncounterForms"));	  
	  if(hash) {
	      if(hash in forms) { return forms[hash]; }
	      else { return undefined; }
	  }
	  else { return forms; }
      };



      return FormEntryServiceFlex;
  }]);





