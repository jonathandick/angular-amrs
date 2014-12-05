'use strict';

/* Directives */

var static_dir = 'js/angular-amrs/app/';

angular.module('openmrs.widgets',['openmrsServices','openmrsServicesFlex'])
    .directive('openmrsLogin', [ function() {
	return {
	    restrict : "E",
	    link : function($scope,element,attrs) {
		
	    },
	    template: '<div><h3>Please log in:</h3> '
		+ '<label for="username">Username:</label><input type="text" name="username" id="username"/><br/>'
		+ '<label for="password">Password:</label><input type="password" name="password"/><br/>'
		+ '<input type="button" id="login" value="Login"/>'
		+ '</div>',
	    controller : function($scope) {
		$scope.username;		
		$scope.password;
		
	    }
	}
    }])
    .directive('dictExpand', ['ConceptService',function(Concept) {			       
	return {
	    restrict : "E",
	    scope : {
		header:'@',
		conceptUuid:'@',
		c: {uuid:"uuid",values:[{name:'a',value:'a'},{name:'b',value:'b'}]},
	    },
	    link : function($scope,element,attrs) {
		Concept.get(c.uuid).$promise.then(function(data) {
		    $scope.concept = data;
		})},
	    template : '<pre><select ng-model="enc.obs[/"{{conceptUuid}}/"]">',
	    }	    	    
    }])
    .directive('backButton', [function() {
	return {
	    restrict: 'A',
	    
	    link: function(scope, element, attrs) {
		element.bind('click', goBack);
		
		function goBack() {
		    history.back();
		    scope.$apply();
		}
	    }
	}
    }])
    .directive('patientDemographics', [function() {
	return {
	    restrict : "E",
	    scope : {
		patient:'='
	    },
	    link : function($scope,element,attrs) {		
	    },	    
	    templateUrl: static_dir + "directive-templates/patient-demographics.html",
	    
	}
    }])
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
	    },
	    templateUrl : static_dir + "/directive-templates/encountersPane.html",
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
	    templateUrl : static_dir + "directive-templates/formsPane.html",
	}
    }])
    .directive('infinitePane',[function() {
	return {
	    restrict: "E",

	    scope: {
		uuid : "@",
	    },
	    controller : function($scope) {
		$scope.numbers = [1,2,3,4,5,6,7,8,9,10];
		$scope.loadMore = function() {
		    console.log('loading more');
		    var last = $scope.numbers.length;
		    for(var i=1; i<=10; i++) {
			$scope.numbers.push(last + i);
		    }
		};		
	    },
	    link: function(scope, element, attrs) {		
		
	    },
	    templateUrl : static_dir + "directive-templates/infinitePane.html",
	}
    }])
;
