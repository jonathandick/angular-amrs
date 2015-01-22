'use strict';

var localStorageServices = angular.module('localStorageServices', []);


localStorageServices.factory('localStorage.utils',[
  function() {
      var service = {};
      
      function getTable(name) {
	  console.log('getting table: ' + name);
	  return angular.fromJson(localStorage.getItem(name));
      }

      function setTable(name,table) {
	  localStorage.setItem(name,angular.toJson(table));
      }


      //expects message to be a string
      function encrypt(message,password) {
	  return CryptoJS.Rabbit.encrypt(message,password).toString();		  
      }

      function decrypt(message,password) {
	  return CryptoJS.Rabbit.decrypt(message,password).toString(CryptoJS.enc.Utf8);		  
      }
      
      

      //expiration : number of days until expiration
      service.setExpirationDate = function(tableName,key,expiration) {
	  var defaultDays = 7;
	  var table = getTable("expiration")
	  var expKey = tableName + "##" + key;
	  var expDate = new Date();

	  if(expiration) expDate.setDate(expDate.getDate() + expiration);
	  else expDate.setDate(expDate.getDate() + defaultDays);
	  
	  var dateKey = expDate.toISOString().substring(0,10);
	  var group = [expKey];
	  if(dateKey in table) {
	      group = table[dateKey];
	      group.push(expKey);
	  }
	  else table[dateKey] = group;
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


      /*
	Returns null if key not in table
      */
      service.get = function(tableName,key,encryptionPassword) {
	  console.log('LocalStorageServices.get() : table: ' + tableName + " key: " + key);
	  var table = getTable(tableName);	  
	  if(key in table) {
	      var item = table[key];
	      if(encryptionPassword) {
		  item = encrypt(item,encryptionPassword);
	      }
	      item = angular.fromJson(item);
	      return item;
	  }
	  else return null;	  
      };
	  

      service.getAll = function(tableName,encryptionPassword) {
	  var table = getTable(tableName);
	  var resultSet = table;
	  if(encryptionPassword) {
	      resultSet = {};
	      for(var key in table) {
		  var item = table[key];
		  item = decrypt(item,encryptionPassword);
		  resultSet[key] = item;
	      }
	  }
	  return resultSet;
      }	      

      service.set = function(tableName,key,item,encryptionPassword,callback) {
	  var table = getTable(tableName);
	  item = angular.toJson(item);
	  if(encryptionPassword) {
	      item = encrypt(item,encryptionPassword);
	  }
	  table[key] = item;
	  setTable(tableName,table);
	  service.setExpirationDate(tableName,key);
      }

      service.setAll = function(tableName,items,encryptionPassword) {
	  var table = {};
	  for(var key in items) {
	      var item = angular.toJson(table[key]);
	      if(encryptionPassword) {
		  item = encrypt(item,encryptionPassword);
	      }
	      table[key] = item;
	  }
	  localStorage.setItem(tableName,angular.toJson(table));
      }

      return service;
  }]);


