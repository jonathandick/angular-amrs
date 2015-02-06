'use strict';

var openmrsServicesFlex = angular.module('openmrsServicesFlex', ['ngResource','ngCookies','openmrsServices','dexieServices','openmrs.auth',
								 'localStorageServices']);


openmrsServicesFlex.factory('OpenmrsFlexSettings',[
  function() {
      var service = {};
      service.init = function() {
	  var tables = ['amrs.patient','expiration','amrs.provider','amrs.location','amrs.encounter','amrs.formentry','amrs.users'];
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

      var openmrsServices

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
	For example, if data collection is incomplete, and form to completed later.
      */
      flexService.save = function(service,key,item,encryptionPassword,callback) {
	  var tableName = "amrs." + service.getName();
	  local.set(tableName,key,item,encryptionPassword);
	  callback();
      }

      return flexService;

  }]);
