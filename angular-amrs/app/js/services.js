'use strict';

/* Services */

var session = sessionStorage;
var local = localStorage;

var amrsServices = angular.module('amrsServices', ['ngResource','ngCookies','openmrsServices']);


amrsServices.factory('Auth', ['Base64', '$cookieStore', '$http', 
  function (Base64, $cookieStore, $http) {
      // initialize to whatever is in the cookie, if anything
      $http.defaults.headers.common['Authorization'] = 'Basic ' + $cookieStore.get('authdata');
      
      var Auth = {}
      Auth.setCredentials = function (username, password) {
          var encoded = Base64.encode(username + ':' + password);
          $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
          $cookieStore.put('authdata', encoded);
      };
      
      Auth.clearCredentials = function () {
          document.execCommand("ClearAuthenticationCache");
          $cookieStore.remove('authdata');
          $http.defaults.headers.common.Authorization = 'Basic ';
      };

      
      
      return Auth;
  }]);


amrsServices.factory('Amrs',['$http','Auth',
  function($http,Auth,Base64) {
      var Amrs = {};

      return Amrs;
  }]);



amrsServices.factory('AMRSPatient',['$http','$rootScope',				
  function($http,$rootScope) {
      var Patient = {};
      Patient.get = function(patient_uuid,callback) {
	  var patient = session.getItem(patient_uuid);
	  if(patient) {
	      console.log("Patient in session");
	      callback(JSON.parse(patient));
	  }
	  else {
	      console.log("PatientDashboardCtrl : Querying server for patient");
	      $http.get('/outreach/ajax_get_patient?patient_uuid=' + patient_uuid).success(function(data){ 	      
		  session.setItem(patient_uuid,JSON.stringify(data));
		  callback(data);
	      });
	  }
      };

      Patient.search = function(searchString,callback){
	  if(searchString && searchString.length > 3) {
              $http.get('https://testserver1.ampath.or.ke/outreach/ajax_patient_search?search_string=' + searchString).success(function(data) {
                  callback(data);
              });
          }
      };

      return Patient;
      
  }]);
      
amrsServices.factory('DefaulterCohort',['$http',
  function($http) {
      var DefaulterCohort = {};
      DefaulterCohort.get = function(uuid,callback) {
	  var dc = session.getItem(uuid);
	  if(dc) {
	      callback(JSON.parse(dc));
	  }
	  else {
	      $http.get('/outreach/ajax_get_defaulter_cohort?defaulter_cohort_uuid=' + uuid).success(function(data) {		  
		  session.setItem(data.defaulter_cohort.uuid,JSON.stringify(data.defaulter_cohort));
		  if(uuid != data.defaulter_cohort.uuid) {
		      local.removeItem("defaulterCohorts");
		  }
		  callback(data.defaulter_cohort);
	      });
	  }
      };
      
      DefaulterCohort.getDefaulterCohorts = function(callback) {
	  var dcs = local.getItem("defaulterCohorts");
          if(dcs) {
	      console.log("getting defaulter cohorts from local");
              callback(JSON.parse(dcs));
          }
          else {
	      console.log("getting defaulter cohorts from zerver");
              $http.get('/outreach/ajax_get_defaulter_cohorts').success(function(data) {                  
                  local.setItem("defaulterCohorts",JSON.stringify(data));
		  callback(data);
              });
          }
      };

      DefaulterCohort.update = function(uuid,callback) {
	  console.log("updateDefaulterCohort() : updating cohort...");
	  var cohort,numUpdated=0;
	  if(navigator.onLine) {
	      cohort = JSON.parse(session.getItem(uuid));

	      var url = '/outreach/ajax_get_retired_members?defaulter_cohort_uuid=' +uuid;
	      $http.get(url).success(function(retiredPatients) {
		  console.log(retiredPatients);
		  if(retiredPatients.indexOf("*") != -1) {		      
		      session.removeItem(uuid);
		      local.removeItem("defaulterCohorts");
		      DefaulterCohort.get(uuid,callback);		      
		  }
		  else {
		      for(var i=0; i<retiredPatients.length; i++) {
			  var patientUuid = retiredPatients[i];
			  if(patientUuid in cohort.patients) {
			      var p = cohort.patients[patientUuid];
			      if(p.retired == 0) {
				  cohort.patients[patientUuid].retired=1;
				  numUpdated++;
			      }
			  }
		      }
		      session.setItem(uuid,JSON.stringify(cohort));
		  }
              });
	  }
	  callback(numUpdated);
      };

      DefaulterCohort.getNew = function(uuid,callback) {
	  session.removeItem(uuid);
	  var url = '/outreach/ajax_get_new_defaulter_cohort?defaulter_cohort_uuid=' + uuid;
	  $http.get(url).success(function(data) {
	      local.setItem("defaulterCohorts",JSON.stringify(data.defaulter_cohorts));
              session.setItem(data.defaulter_cohort.uuid,JSON.stringify(data.defaulter_cohort));
              callback(data.defaulter_cohort);
	  });
      };


      return DefaulterCohort

  }]);




amrsServices.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
});
