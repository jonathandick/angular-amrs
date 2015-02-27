'use strict';

/* Directives */


angular.module('spinner',[])
    .directive('spinner',[
	function() {
	    return {
		restrict: "E",
		controller : function($scope) {                    
		},
		link: function(scope, element, attrs) {
		},
		templateUrl : "app/js/spinner/views/spinner.html",
            }
	}
    ]);
