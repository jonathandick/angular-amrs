'use strict';

/* Directives */


angular.module('openmrs.widgets',[])
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
    }]);
	       
