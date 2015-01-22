'use strict';

var dexieServices = angular.module('dexieServices', []);

dexieServices.factory("ngDexie", [
    function() {

	var dex = {};

	dex.db = null;
	
	dex.init = function(name,stores,debug) {
	    var db = new Dexie(name);	    
	    if(debug) db.delete();

		
	    db.version(1).stores(stores);
	    db.open();
	    db.on('error', function (err) {
                // Catch all uncatched DB-related errors and exceptions
                //$log.error("db error", err);
		console.log("dexie error: " + err);
		alert("dexie error: " + err);
            });
	    this.db = db;	   
	};
	    	    
	dex.getDb = function() {
	    return this.db;
	};
	    

	
	dex.testGet = function() {
	    
	    var db = this.getDb();
	    db.provider.where("uuid").equals("1").each(function(provider) {		
		console.log(provider); 
	    })
		.catch(function (error) {
		    console.error(error);
		});		
	};


	dex.test = function() {
	    
	    var self = this;
	    var stores = {
		provider:'++id,uuid,givenName,familyName,providerId,dateCreated',
		/*
		location:'++id,uuid,name,dateCreated',
		encounter: '++id,uuid,patientUuid,encounterDatetime,encounterType,providerUuid,formUuid',
		savedEncounter: '++id,uuid,patientUuid,encounterDatetime,encounterType,providerUuid,formUuid',
		patient:'++id,uuid,givenName,familyName,phoneNumber',
		*/
	    };
 	    this.init('openmrs-database',stores,true);
	    
	    var db = this.getDb();	    	    

	    db.provider.put({uuid:'1',givenName:'Jonathan',familyName:'Doe',dateCreated:new Date(),foo:'hello world'})
		.then(function() { self.testGet() })
		.catch(function(error) {
		    console.log('error writing code' + error);
		});
	};
	    


	return dex;

    }]);
