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
	  callback();
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


openmrsServicesFlex.factory('LocationServiceFlex',['$http','LocationService','localStorage.utils',
  function($http,LocationService,local) {
      var lsf = {};
      
      function getFromServer(setOffline,callback) {
	  LocationService.getAll(function(locations){
	      if(setOffline) {
		  setOffline("amrs.location",locations,function(location) {return location.uuid;});
	      }
	      callback(locations);
	  });
      };	    

      lsf.getAll = function(callback) {
	  var locations = local.getAll("amrs.location");
	  if(Object.keys(locations).length > 0 ) {	      
	      callback(locations);
	  }
	  else getFromServer(local.setAll,callback);
      };

      return lsf;
  }]);


openmrsServicesFlex.factory('ProviderServiceFlex',['ProviderService','localStorage.utils',
  function(ProviderService,local) {
      var psf = {};
      

      function getFromServer(setOffline,callback) {
	  ProviderService.query(function(providers){
	      if(setOffline) {
		  setOffline("amrs.provider",providers,function(provider) {return provider.uuid;});
	      }
	      callback(providers);
	  });
      };	    

      psf.query = function(callback) {
	  var providers = local.getAll("amrs.provider");
	  if(Object.keys(providers).length > 0 ) {	      
	      callback(providers);
	  }
	  else getFromServer(local.setAll,callback);
      };
      return psf;
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




openmrsServicesFlex.factory('FormEntryServiceFlex',['$http','Encounter','EncounterService','PersonAttribute','ObsService',
  function($http,Encounter,EncounterService,PersonAttribute,ObsService) {
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
	  console.log(enc);
	  //var r = FormEntryServiceFlex.prepareObs(enc,origEnc);	  	      	      
	  //enc = r[0];
	  
	  EncounterService.submit(enc,function(data) {
	      console.log('Finished submitting');	      

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

      function hasKeyValue(obj,key,value) {	 
	  for(var i in obj) {
	      if(obj[i].concept.uuid === key) {
		  var v = obj[i].value;		  
		  if(typeof v === "object" && v !== null) {
		      v = obj[i].value.uuid;
		  }
		  if(v === value) {
		      return true;
		  }
	      }
	  }
	  return false;
      }

      function deleteKeyValue(obj,key,value) {
	  var v;
	  for(var i in obj) {
	      if(obj[i].concept.uuid == key) {
		  v = obj[i].value;
		  if(typeof v == "object" && v !== null) {
		      v = obj[i].value.uuid;
		  }
		  if(v == value) {
		      delete obj[i];
		      break;		      
		  }
	      }
	  }
	  return obj;
      }

      

      //This puts the object representing obs into the proper format required by OpenMRS RestWS.
      //If a previous encounter exists, it identifies obs which have not been changed and removes them
      //  from the encounter to be submitted. For any obs with a changed value, this function returns
      //  an array of the uuid of the original obs so that it can be voided. 
      FormEntryServiceFlex.prepareObs = function(enc,origEnc) {
	  var origObs = origEnc.obs;

	  if(enc.obs) {	      
	      var t = [];
	      
	      for(var c in enc.obs) {		  
		  if(enc.obs[c] === null || enc.obs[c] === "" || enc.obs[c] === undefined) {		      
		  }
		  else if(Object.prototype.toString.call(enc.obs[c]) !== "[object Array]") {
		      if(hasKeyValue(origObs,c,enc.obs[c])) {
			  origObs = deleteKeyValue(origObs,c,enc.obs[c]);
		      } else {  			  
			  t.push({concept:c,value:enc.obs[c]});		      
		      }
		  }
		  else {  // this is for an obs with multiple answers, e.g. a multi select dropbox
		      for(var i=0; i< enc.obs[c].length; i++) {
			  if(hasKeyValue(origObs,c,enc.obs[c][i])) {
			      origObs = deleteKeyValue(origObs,c,enc.obs[c][i]);
			  }
			  else {
			      t.push({concept:c,value:enc.obs[c][i]});
			  }
		      }
		  }
	      }
	      enc.obs = t;
	  }
	      
	  return [enc,origObs];
      };	  


      return FormEntryServiceFlex;
  }]);




openmrsServicesFlex.factory('EncounterFormServiceFlex',['$http','Encounter','EncounterService','PersonAttribute',
  function($http,Encounter,EncounterService) {
      var efsf = {};
      

      return efsf;      
      
}]);






