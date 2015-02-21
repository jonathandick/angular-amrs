'use strict';


var flex = angular.module('flex', ['ngResource','ngCookies','openmrsServices','openmrs.auth','localStorageServices']);
								 
flex.factory('OpenmrsFlexSettings',[
  function() {
      var service = {};
      service.init = function() {
	  var tables = ['amrs.patient','expiration','amrs.provider','amrs.location','amrs.encounter','amrs.formentry','amrs.users'];
	  for(var i in tables) {
	      var t = localStorage.getItem(tables[i]);
	      if(!t) localStorage.setItem(tables[i],"{}");
	      //localStorage.setItem(tables[i],"{}");
	  }
      }
      return service;

  }]);



flex.factory('Flex',['localStorage.utils',
  function(local) {
      var flexService = {};

      function getFromServer(service,key,storeOffline,encryptionPassword,callback) {	  
	  service.get(key,function(item){
	      if(storeOffline) {
		  var tableName = "amrs." + service.getName();
		  local.set(tableName,key,item,encryptionPassword);
	      }
	      if(callback) callback(item)
	      else return item;
	  });
      };	    


      function getAllFromServer(service,keyGetter,storeOffline,encryptionPassword,callback) {
	  service.getAll(function(items){
	      if(storeOffline) {
		  var tableName = "amrs." + service.getName();
		  local.setAll(tableName,items,keyGetter,encryptionPassword);
	      }
	      if(callback) callback(items);		  
	  });
      };

      function queryServer(service,searchString,keyGetter,storeOffline,encryptionPassword,callback) {
	  service.query({q:searchString},function(items){
	      if(storeOffline) {
		  var tableName = "amrs." + service.getName();
		  local.setQuerySet(tableName,items,keyGetter,encryptionPassword);
	      }
              if(callback) callback(items);
          });
      }
      
      flexService.init = function() {
	  var tables = ['amrs.patient','expiration','amrs.provider','amrs.location','amrs.encounter'];
	  for(var i in tables) {
	      var t = localStorage.getItem(tables[i]);
	      if(!t) localStorage.setItem(tables[i],"{}");
	  }
      }


      flexService.getFromServer = function(service,key,storeOffline,encryptionPassword,callback) {	  
          getFromServer(service,key,storeOffline,encryptionPassword,callback);
      }


      flexService.getFromLocal = function(service,key,storeOffline,encryptionPassword,callback) {	  
	  var tableName = "amrs." + service.getName();	  
	  var item = local.get(tableName,key,encryptionPassword);
	  callback(item);
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
	  else getAllFromServer(service,keyGetter,storeOffline,encryptionPassword,callback);
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
	  if(callback) callback();	      
      }

      return flexService;

  }]);
