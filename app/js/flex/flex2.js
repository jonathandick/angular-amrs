'use strict';

var flex = angular.module('flex2', []);
								 
flex.factory('Flex',[settings.offlineStorageService
  function(local) {
      var flexService = {};

      function getFromServer(resourceService,key,shouldEncrypt,callback) {	  
	  resourceService.get(key,function(item){
	      var tableName = resourceService.getResourceName();
	      local.set(tableName,key,item,shouldEncrypt);
	      if(callback) callback(item);
	      else return item;
	  });
      };	    


      function getAllFromServer(resourceService,keyGetter,shouldEncrypt,callback) {
	  resourceService.getAll(function(items){
	      if(storeOffline) {
		  var tableName = resourceService.getResourceName();
		  local.setAll(tableName,items,keyGetter,shouldEncrypt);
	      }
	      if(callback) callback(items);		  
	  });
      };

      function queryServer(resourceService,searchString,keyGetter,shouldEncrypt,callback) {
	  resourceService.query({q:searchString},function(items){
	      if(storeOffline) {
		  var tableName = resourceService.getResourceName();
		  local.setQuerySet(tableName,items,keyGetter,shouldEncrypt);
	      }
              if(callback) callback(items);
          });
      }
      

      flexResourceService.getFromServer = function(resourceService,key,shouldEncrypt,callback) {	  
          getFromServer(resourceService,key,shouldEncrypt,callback);
      }


      flexResourceService.getFromLocal = function(resourceService,key,shouldEncrypt,callback) {	  
	  var tableName = resourceService.getResourceName();	  
	  local.get(tableName,key,shouldEncrypt,callback);	  
      }
      

      flexResourceService.get = function(resourceService,key,shouldEncrypt,callback) {
	  var tableName = resourceService.getResourceName();
	  local.get(tableName,key,shouldEncrypt,function(item){ 
	      if(item) callback(item) 
	      else getFromServer(resourceService,key,shouldEncrypt,callback);
	  }

      flexResourceService.query = function(resourceService,searchString,keyGetter,shouldEncrypt,callback) {
	  queryServer(resourceService,searchString,keyGetter,shouldEncrypt,callback);
      }



      flexResourceService.getAll = function(resourceService,keyGetter,shouldEncrypt,callback) {
	  var tableName = resourceService.getResourceName();	  
	  var items = local.getAll(tableName);
	  if(Object.keys(items).length > 0 ) {	      
	      callback(items);
	  }
	  else getAllFromServer(resourceService,keyGetter,shouldEncrypt,callback);
      };


      flexResourceService.remove = function(resourceService,key,callback) {
	  var tableName = resourceService.getResourceName();	  
	  local.remove(tableName,key,callback);
      }


      /*
	Save : only store locally, do not communicate with server. 
	For example, if data collection is incomplete, and form to completed later.
      */
      flexResourceService.save = function(resourceService,key,item,shouldEncrypt,callback) {
	  var tableName = resourceService.getResourceName();
	  local.set(tableName,key,item,shouldEncrypt,callback);
      }

      return flexService;

  }]);
