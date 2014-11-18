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
    .directive('clinicLocationsDropdown',['LocationServiceFlex',function() {
	return {
	    restrict: "E",
	    scope: {
		model:'=',
		label:'@',
	    },
	    controller : function($scope,LocationServiceFlex) {
		LocationServiceFlex.getAll(function(locations) { 		    
		    $scope.locations = locations;		    		    		    
		});
	    },
	    templateUrl : static_dir + "/directive-templates/locations.html",
	}
    }])
    .directive('providersDropdown',['ProviderService',function() {
	return {
	    restrict: "E",
	    scope: {
		model:'=',
		label:'@',
	    },
	    controller : function($scope,ProviderService) {
		ProviderService.query(function(providers) { 		    
		    $scope.providers = providers;		    		    		    
		});
	    },	    
	    templateUrl : static_dir + "/directive-templates/providersDropdown.html",
	}
    }]);

