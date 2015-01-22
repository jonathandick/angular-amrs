'use strict';

var localServices = angular.module('localServices', ['dexieServices','openmrs.auth']);


localServices.factory('localStorage.utils',['ngDexie','Auth',
  function(ngDexie,Auth) {
      var service = {};
      
      function getTable(name) {
	  return angular.fromJson(localStorage.getItem(name));
      }

      function setTable(name,table) {
	  localStorage.setItem(name,angular.toJson(table));
      }
      

      //expiration : number of days until expiration
      service.setExpirationDate = function(tableName,key,expiration) {
	  var default = 7;
	  var table = getTable("expiration")
	  var expKey = tableName + "##" + key;
	  var expDate = new Date();
	  if(expiration) expDate.setDate(expDate.getDate() + expiration);
	  else expDate.setDate(expDate.getDate() + default);
	  
	  var dateKey = expDate.toISOString().substring(0,10);
	  var group = [expKey];
	  if(dateKey in table) {
	      group = table[dateKey];
	      group.push(expKey);
	  }
	  setTable("expiration",table);
      }

      //dateKey : YYYY-MM-DD
      /* TO DO : Make this a loop such that all dates from a start date (e.g. 2015-01-01) are removed. */
      service.removeExpired = function(dateKey) {
	  var expTable = getTable("expiration");
	  var tables = {};

	  if(!dateKey) {
	      dateKey = (new Date()).toISOString().substring(0,10);
	  }
	  var items = expTable[dateKey];
	  for(var expKey in items) {
	      var parts = expKey.split("##");
	      var tableName = parts[0];
	      var key = parts[1];
	      var t;
	      if(tableName in tables) t = tables[tableName];
	      else {
		  t = getTable(tableName);
		  tables[tableName] = t;
	      }
	      delete t[key];
	  }

	  /*
	    Restore all affected tables in localStorage
	  */
	  for(var t in tables) {
	      setTable(t,tables[t]);
	  }

	  /*
	    Remove this expiration day category from the expiration table
	  */
	  delete expTable[key];
      };	  


      service.getLocal(tableName,key,withEncryption,expiration,callback) {
	  var table = angular.fromJson(localStorage.getItem(tableName));
	  
	  if(key in table) {
	      var item = table[key];
	      if(withEncryption) {
		  item = CryptoJS.Rabbit.decrypt(item,Auth.getPassword()).toString(CryptJS.enc.Utf8);		  
	      }
	      item = angular.fromJson(item);
	      if(callback) callback(item)
	      else return item;
	  }
	  else return null;	  
      }
	  

      service.setLocal = function(tableName,key,item,withEncryption,callback) {
	  var table = getTable(tableName);
	  item = angular.toJson(item);
	  if(withEncryption) {
	      item = CryptoJS.Rabbit.encrypt(item,Auth.getPassword()).toString();
	  }
	  table[key] = item;
	  setTable(tableName,table);
      }

      return service;
  }]);


