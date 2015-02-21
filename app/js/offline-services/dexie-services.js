'use strict';

var dexieServices = angular.module('dexieServices', []);


localStorageServices.factory('dexie.utils',[
    function() {
	var service;
	
	function setLocalDexie(table,key,item,encryptionPassword) {	  
	    if(encryptionPassword) {
		item = CryptoJS.Rabbit.encrypt(angular.toJson(item),encryptionPassword).toString();		      
	    }
	    
	    var db = ngDexie.getDb();	  
	    db[table].put({uuid:key,item:item})
		.catch(function(e) { alert("db error: " + e); });
	    if(callback) { callback(p); }
	    else { return p;}
	};
    
    
	function getLocalDexie(patientUuid,fallback,callback) {	  
	    var db = ngDexie.getDb();	  
	    db.patient.get(patientUuid).then(function(patient) {
		if(patient) {
		    var decrypted = CryptoJS.Rabbit.decrypt(patient.patient,Auth.getPassword()).toString(CryptoJS.enc.Utf8);
		    patient = angular.fromJson(decrypted);
		    patient = PatientService.abstractPatient.clone(patient);
		    if(callback) { callback(patient); }
		    else { return patient;}
		}
		else {
		    fallback(patientUuid,callback);
	      }
	    })
		.catch(function(e) {
		    alert('db failure: couldnt find patient');
		    fallback(patientUuid,callback);
		});
	}
	return service;
	
}]);

    
