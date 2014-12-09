'use strict';

/* Directives */

var static_dir = 'js/angular-amrs/app/';

angular.module('patientDashboard',['openmrsServices','openmrsServicesFlex'])
    .directive('encountersPane',['EncounterServiceFlex','OpenmrsUtilityService','$state',
      function(EncounterServiceFlex,OpenmrsUtilityService,$state) {
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

		    $state.go('encounter',{encounterUuid:encUuid,patientUuid:$scope.patientUuid,formUuid:formUuid});
		};

		$scope.loadMore = function() {		    
		    if($scope.busy === true) return; 
		    $scope.busy = true;

		    //NOTE: $scope.busy does not seem to be persisting, 
		    //so the use of startIndexes as a set is meant to overcome this.
		    if($scope.nextStartIndex !== undefined && !$scope.startIndexes.has($scope.nextStartIndex)) {
			$scope.startIndexes.add($scope.nextStartIndex);
			
			var params = {startIndex:$scope.nextStartIndex, patient:$scope.patientUuid,limit:10};
			EncounterServiceFlex.patientQuery(params,function(data) {		
			    $scope.nextStartIndex = OpenmrsUtilityService.getStartIndex(data);
			    for(var e in data.results) {
				$scope.encounters.push(data.results[e]); 
			    }			
			});
		    }

		    if($scope.nextStartIndex !== undefined){ $scope.busy = false;}
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
		console.log('static dir: ' + static_dir);
	    },
	    templateUrl : static_dir + "js/patient-dashboard/views/encountersPane.html",
	}
    }])
    .directive('formsPane',['FormService',function(FormService) {
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
	    templateUrl : static_dir + "js/patient-dashboard/views/formsPane.html",
	}
    }])
;
