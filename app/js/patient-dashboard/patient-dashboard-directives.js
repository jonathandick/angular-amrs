'use strict';

/* Directives */


angular.module('patientDashboard',['openmrsServices','flex','utility.widgets','infinite-scroll'])
    .directive('encountersPane',['$state','EncounterService','OpenmrsUtilityService',
      function($state,EncounterService,OpenmrsUtilityService) {
	  var static_dir = "app/js/patient-dashboard/";
	  return {
	    restrict: "E",
	    scope: {
		patientUuid : "@",
	    },
	    controller : function($scope,$state) {		
		$scope.encounters = [];
		$scope.busy = false;
		$scope.nextStartIndex = -1;		

		$scope.showEncounter = function(encUuid,formUuid) {		    		    
		    for(var i in $scope.encounters) {
			if($scope.encounters[i].uuid === encUuid) { formUuid = $scope.encounters[i].form.uuid;}
		    }

		    $state.go('formentry',{encounterUuid:encUuid,patientUuid:$scope.patientUuid,formUuid:formUuid});
		};

	    },

	    link: function(scope, element, attrs) {		
		attrs.$observe('patientUuid',function(newVal,oldVal) {
		    if(newVal && newVal != "") {
			scope.busy = false;
			scope.allDataLoaded = false;
			scope.nextStartIndex = 0;
			scope.encounters = [];
			scope.loadMore();			
		    }		    
		});

		scope.loadMore = function() {	
		    if(scope.busy === true) return; 		    
		    scope.busy = true;

		    var params = {startIndex:scope.nextStartIndex, patient:scope.patientUuid,limit:10};
		    console.log(params);
		    EncounterService.patientQuery(params,function(data) {		
			//alert('querying server');
			//console.log('querying server');
			scope.nextStartIndex = OpenmrsUtilityService.getStartIndex(data);
			//console.log('nextStartIndex: ' + scope.nextStartIndex);
			for(var e in data.results) {
			    scope.encounters.push(data.results[e]); 
			}			
			if(scope.nextStartIndex !== undefined){ scope.busy = false;}
			else scope.allDataLoaded = true;
		    });
		};

	    },
	    templateUrl : static_dir + "views/encountersPane.html",
	}
    }])
    .directive('formsPane',['FormEntryService',function(FormEntryService) {
	var static_dir = "app/js/patient-dashboard/";
	return {
	    restrict: "E",
	    scope: {patientUuid:"@",},
	    controller : function($scope) {	
		$scope.forms = FormEntryService.getForms();		
	    },
	    link: function(scope, element, attrs) {				

		/*
		attrs.$observe('patientUuid',function(newVal,oldVal) {
		    if(newVal && newVal != "") {
			scope.patientUuid = newVal;			
		    }		    
		});
		*/
	    },
	    templateUrl : static_dir + "views/formsPane.html",
	}
    }])
;
