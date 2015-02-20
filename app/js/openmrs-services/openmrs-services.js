'use strict';

var openmrsServices = angular.module('openmrsServices', ['ngResource','ngCookies']);

//var OPENMRS_CONTEXT_PATH = "https://amrs.ampath.or.ke:8443/amrs";
var OPENMRS_CONTEXT_PATH = "http://etl1.ampath.or.ke:8080/amrs";



openmrsServices.factory('OpenmrsUtilityService',[
  function() {
      var util = {};
      
      util.getParam = function (uri,name) {
	  var params = uri.substring(uri.indexOf('?')).split('&');	  	  
	  var p = {};
	  for(var i=0; i<params.length; i++) {
	      var pair = params[i];
	      var t = pair.split('=');
	      if(t[0] == name) { return t[1];}
	  }
	  return undefined;
      };

      util.getStartIndex = function(data) {	  
	  var startIndex = undefined;
	  if(data.links) {
	      for(var i in data.links) {
		  var l = data.links[i];
		  if(l.rel == "next") {			      
		      startIndex = this.getParam(l.uri,'startIndex');
		      break;
		  }
	      }
	  }
	  return startIndex;
      };

      
      return util;
}]);


openmrsServices.factory('openmrs',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/:object/:uuid", 
		       { object: '@object',
			 uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);




openmrsServices.factory('interceptor',function($q) {
    return {

	'request': function(config) {
	    //alert(angular.toJson(config,true));
	    return config;
	},

	'requestError': function(rejection) {
	    alert('requestError');
	    alert(rejection);
	},

	'response':function(response) {
	    //alert(angular.toJson(response,true));
	    return response;
	},

	'responseError': function(rejection) {
	    alert('responseError');
	    alert(angular.toJson(rejection,true));
	}



    }
    
});


openmrsServices.config(['$httpProvider',function($httpProvider) {
    //$httpProvider.interceptors.push('interceptor');
}]);


openmrsServices.factory('OpenmrsSession',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/session",{} 		       
		      ); 
  }]);


openmrsServices.factory('OpenmrsSessionService',['OpenmrsSession',
  function(OpenmrsSession) {
      var service = {};
      service.getSession = function(callback) {	  

	  return OpenmrsSession.get({},function(data,status,headers) {
	      //alert(angular.toJson(data,true));
	      callback(data);
	  });
      };

      service.logout = function(callback) {
	  return OpenmrsSession.delete({},function(data,status,headers) {	      
	  });
      }
      return service;
  }]);






openmrsServices.factory('Person',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/person/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Provider',['$resource',   			       
  function($resource) { 
      var v = "custom:(uuid,identifier,person:ref)";
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/provider/:uuid", 
		       { uuid: '@uuid',v:v}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('ProviderService',['Provider',
  function(Provider) {
      var ProviderService = {};

      ProviderService.getName = function() {return 'provider';};
      
      ProviderService.getAll = function(callback) {
	  Provider.query().$promise.then(function(data) {
	      callback(data.results);
	  });
      };

      


      return ProviderService;
  }]);

openmrsServices.factory('Patient',['$resource',   			       
  function($resource) { 
      var v = "custom:(uuid,identifiers:ref,person:(uuid,gender,birthdate,dead,deathDate,preferredName:(givenName,middleName,familyName),"
	  + "attributes:(uuid,value,attributeType:ref)))";

      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/patient/:uuid", 
		       { uuid: '@uuid',v:v},
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);



var Patient = function(patientData) {
    this.patientData = patientData;
};
Patient.prototype.getPatient = function () { return this.patientData; };	  
Patient.prototype.getUuid = function() { return this.patientData.uuid; };
Patient.prototype.getName = function() { 
    return (this.patientData.person.preferredName.givenName || "") + " " 
	+ (this.patientData.person.preferredName.middleName || "") + " " 
	+ this.patientData.person.preferredName.familyName;
}
Patient.prototype.getGivenName = function() { return this.patientData.person.preferredName.givenName; };
Patient.prototype.setGivenName = function(s) { return this.patientData.person.preferredName.givenName = s; };

Patient.prototype.getFamily = function() { return this.patientData.person.preferredName.familyName; };
Patient.prototype.setFamilyName = function(s) { return this.patientData.person.preferredName.familyName = s; };

Patient.prototype.getMiddleName = function() { return this.patientData.person.preferredName.middleName; };
Patient.prototype.setMiddleName = function(s) { return this.patientData.person.preferredName.middleName = s; };

Patient.prototype.getBirthdate = function() { return this.patientData.person.birthdate; };
Patient.prototype.getDead = function() { return this.patientData.person.dead};
Patient.prototype.getDeathDate = function() { return this.patientData.person.deathDate};
Patient.prototype.getGender = function() { return this.patientData.person.gender};

Patient.prototype.getIdentifiers = function(identifierType) {	      
    return this.patientData.identifiers;
};
Patient.prototype.getPhoneNumber = function() {
    for(var i in this.patientData.person.attributes) {
	var attr = this.patientData.person.attributes[i];
	if(attr.attributeType.uuid == "72a759a8-1359-11df-a1f1-0026b9348838") {
	    return attr.value;
	}
    }
}

Patient.prototype.getClinicalHome = function() {
    for(var i in this.patientData.person.attributes) {
	var attr = this.patientData.person.attributes[i];
	if(attr.attributeType.uuid == '8d87236c-c2cc-11de-8d13-0010c6dffd0f') {
	    return attr.value;
	}
    }
    return "";
}    


Patient.prototype.getAttributes = function() {
    return this.patientData.person.attributes;
}
    
//Converts an object in form of {typeUuuid:value} into rest format
Patient.prototype.setAttributes = function(newAttributes) {
    var existingAttrs = this.getAttributes();
   
    for(var attrTypeUuid in newAttributes) {
	if(attrTypeUuid === "oldPersonAttributes") continue;

	var value = newAttributes[attrTypeUuid];
	var restAttr = {attributeType:{uuid:attrTypeUuid},value:value};	
	var attr,found = false; 
	for(var j in existingAttrs) {
	    attr = existingAttrs[j];
	    if(attr.attributeType.uuid === attrTypeUuid) {
		found = true;
		existingAttrs[j] = restAttr;
	    }
	}
	if(!found) {
	    existingAttrs.push(restAttr);
	}
    }
}



openmrsServices.factory('Patient',['$resource',   			       
  function($resource) { 
      var v = "custom:(uuid,identifiers:ref,person:(uuid,gender,birthdate,dead,deathDate,preferredName:(givenName,middleName,familyName),"
	  + "attributes:(uuid,value,attributeType:ref)))";

      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/patient/:uuid", 
		       { uuid: '@uuid',v:v},
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('PatientService',['$http','Patient',
  function($http,PatientRes) {
      var PatientService = {};


      PatientService.Patient = function(patientData) {
	  return new Patient(patientData);
      }

      PatientService.getName = function() {
	  return 'patient';
      }
     
      PatientService.get = function(patientUuid,callback) {	  
	  PatientRes.get({uuid:patientUuid},function(data,status,headers) {	      
	      var p = new Patient(data);	      
	      if(callback) { return callback(p); }
	      else { return p};
	  });
      };

      return PatientService;

  }]);



openmrsServices.factory('Form',['$resource',  			       
  function($resource) { 
      var v = "custom:(uuid,name,encounterType:(uuid,name))";
      return $resource(OPENMRS_CONTEXT_PATH + "/ws/rest/v1/form/:uuid", 
		       { uuid: '@uuid',v:v}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('FormService',['Form',  			       
  function() {
      var FormService = {};
      var formMap = {"1eb7938a-8a2a-410c-908a-23f154bf05c0":
                     {name: 'outreach form',template:'js/formentry/forms/outreach-form2.html',encounterType:"df5547bc-1350-11df-a1f1-0026b9348838"},     
		    }; 
      
      FormService.getTemplate = function(formUuid) {
	  return formMap[formUuid]['template'];
      };

      FormService.getEncounterType = function(formUuid) {
	  return formMap[formUuid]['encounterType'];
      };

      FormService.query = function() {
	  return formMap;
      }
      
      return FormService;
  }]);


openmrsServices.factory('Obs',['$resource',   			       
  function($resource) { 
      var v = "custom:(uuid,concept:(uuid,uuid),value:ref)";          
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/obs/:uuid", 
		       { uuid: '@uuid',v:v}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);



openmrsServices.factory('ObsService',['Obs',
  function(Obs) {
      var ObsService = {};

      ObsService.void = function(obsToVoid,callback) {
	  /*
	  var uuid;
	  for(var i in obsToVoid) {
	      uuid = obsToVoid[i].uuid;
	      Obs.delete({uuid:uuid}).$promise.then(function(data) {
		  if(callback) { callback(data); }
		  else {return data;}
	      });
	  }
	  */
	  for(var i in obsToVoid) {
	      var uuid = obsToVoid[i];
	      Obs.delete({uuid:uuid}).$promise.then(function(data) {
		  if(callback) { callback(data); }
		  else {return data;}
	      });
	  }
      }
      return ObsService;
  }]);



openmrsServices.factory('Encounter',['$resource',   			       
  function($resource) { 
      var v = "custom:(uuid,encounterDatetime,patient:(uuid,uuid),form:(uuid,name),location:ref";
      v += ",encounterType:ref,provider:ref,obs:(uuid,concept:(uuid,uuid),value:ref))";    
      
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/encounter/:uuid", 
		       { uuid: '@uuid',v:v}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('EncounterService',['$http','Encounter',
  function($http,Encounter) {
      var EncounterService = {};

      EncounterService.getName = function() {return "encounter";};
      
      EncounterService.get = function(encounterUuid,callback) {
	  Encounter.get({uuid:encounterUuid},function(data,status,headers) {
	      if(callback) { return callback(data); }
	      else { return data};
	  });
      };
      


      EncounterService.patientQuery = function(params,callback) {
	  Encounter.get(params).$promise.then(function(data) {
	      if(callback) { return callback(data); }
	      else { return data};
	  })
      };


      EncounterService.submit = function(enc,callback) {

	  var url = OPENMRS_CONTEXT_PATH + '/ws/rest/v1/encounter/';
	  if(enc.uuid) {
	      url += enc.uuid; 	      
	  }
	  delete enc.uuid;

	  $http.post(url,enc)
	      .success(function(data, status, headers, config) {
		  callback(data);
		  if(data.error) {
		      console.log('EncounterService.submit() : error in rest response');
		      
		  }
	      })
	      .error(function(data, status, headers, config) {
		  console.log("EncounterService.submit() : error:");
		  callback(data);
		  console.log(data);
		  console.log(status);
	      });

      };
      return EncounterService;

  }]);



openmrsServices.factory('EncounterType',['$resource',   			       
  function($resource) {       
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/encountertype/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('Obs',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/obs/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);

openmrsServices.factory('Location',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/location/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('LocationService',['$http','Location',
  function($http,Location) {
      var LocationService = {};

      LocationService.getName = function() { return "location" };

      LocationService.getAll = function(callback) {
	  Location.get().$promise.then(function(data) {callback(data.results);});
      };

      return LocationService;

  }]);




openmrsServices.factory('Concept',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/concept/:uuid", 
		       { uuid: '@uuid'}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);


openmrsServices.factory('PersonAttribute',['$resource',   			       
  function($resource) { 
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/person/:personUuid/attribute/:uuid", {},		       
		       { query: {method:"GET",isArray:false},		         
		       }
		      ); 
  }]);


openmrsServices.factory('PersonAttributeService',['PersonAttribute','$http',
  function(PersonAttribute,$http) {
      var paService = {};
      

      paService.get = function(personUuid,attributeTypeUuid) {
	 
	  
      };

      paService.save = function(personUuid,attributeTypeUuid,value,callback) {	  
	  var pa = new PersonAttribute({attributeType:attributeTypeUuid,value:value});
	  pa.$save({personUuid:personUuid},
		   function(data,status,headers) {
		       if(callback) { return callback(data); }
		       else { return data};
		   }
		  );
      };
      
      return paService;

  }]);



openmrsServices.factory('OpenmrsUser',['$resource',   			       
  function($resource) { 
      var v = "custom:(uuid,username,systemId,roles:(uuid,name,privileges))";
      return $resource(OPENMRS_CONTEXT_PATH  + "/ws/rest/v1/user/:uuid", 
		       { uuid: '@uuid',v:v}, 
		       { query: {method:"GET",isArray:false}}
		      ); 
  }]);




openmrsServices.factory('OpenmrsUserService',['OpenmrsUser',   			       
  function(OpenmrsUser) {
      var OpenmrsUserService = {};

      OpenmrsUserService.getRoles = function(username,callback) {
	  OpenmrsUser.get({username:username}).$promise.then(function(data) {	     
	      if(callback) {
		  callback(data.results[0].roles); 
	      }
	      else { return data.roles; }
	  });
      }

      //role can be either role uuid or name
      OpenmrsUserService.hasRole = function(username,role,callback) {
	  OpenmrsUser.get({username:username}).$promise.then(function(data) {
	      var hasRole = false;
	      var roles = data.results[0].roles;
	      if(roles) {
		  for(var i in roles) {
		      if(roles[i].uuid === role || roles[i].name.toLowerCase() === role.toLowerCase()) {
			  hasRole = true;
			  break;
		      }
		  }
	      }
	      if(callback) { callback(hasRole);}
	      else {return hasRole;}
	  });
      }

      return OpenmrsUserService;
  }]);





