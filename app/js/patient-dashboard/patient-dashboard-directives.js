'use strict';

/* Directives */


angular.module('patientDashboard',['openmrsServices','openmrsServicesFlex','utility.widgets'])
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
		$scope.startIndexes = new Set([]);

		$scope.showEncounter = function(encUuid,formUuid) {		    
		    console.log('formUuid: ' + formUuid);		    
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
			scope.nextStartIndex = 0;
			scope.encounters = [];
			scope.loadMore();			
		    }		    
		});

		scope.loadMore = function() {	
		    console.log("busy: " + scope.busy);
		    if(scope.busy === true) return; 
		    scope.busy = true;

		    var params = {startIndex:scope.nextStartIndex, patient:scope.patientUuid,limit:10};
		    EncounterService.patientQuery(params,function(data) {		
			console.log('querying server');
			scope.nextStartIndex = OpenmrsUtilityService.getStartIndex(data);
			console.log('nextStartIndex: ' + scope.nextStartIndex);
			for(var e in data.results) {
			    scope.encounters.push(data.results[e]); 
			}			
			if(scope.nextStartIndex !== undefined){ scope.busy = false;}

		    });
		};

	    },
	    templateUrl : static_dir + "views/encountersPane.html",
	}
    }])
    .directive('formsPane',['FormService',function(FormService) {
	var static_dir = "app/js/patient-dashboard/";
	return {
	    restrict: "E",
	    scope: {patientUuid:"@",},
	    controller : function($scope) {	
		$scope.forms = FormService.query();		
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
