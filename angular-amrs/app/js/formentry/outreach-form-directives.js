'use strict';

/* 
Directives 
Outreach form validation directives
*/

var static_dir = 'js/angular-amrs/app/';

angular.module('outreachForm.validators',[])
    .directive('validateDateFound', [function() {
	return {
	    restrict : "A",
	    require : "ngModel",
	    link: function(scope, element, attrs,ctrl) {				
		ctrl.$validators.test = function(oldValue,newValue) {
		    return true;
		}
	    }
	}
    }])
    .directive('validatePatientStatus',[function() {
	return {
	    restrict : "A",
	    require : "ngModel",
	    link: function(scope, element, attrs,ctrl) {				
		ctrl.$validators.test = function(oldValue,newValue) {		    
		    var errors = [];

		    switch(newValue) {			
		    case "a89335d6-1350-11df-a1f1-0026b9348838" : //Patient Dead
			if(!scope.enc.obs || !scope.enc.obs['a89df3d6-1350-11df-a1f1-0026b9348838']) {
			    errors.push("Needs death date");
			}
			break;
		    }

		    //If patient any status other than "being traced" or "untraceable", dateFound required
		    if(newValue && newValue != "bea9c288-0650-4b42-a324-1d6d51591c72" && newValue != "07c536bc-19f2-4296-9c4a-edd85f070095") {
			if(!scope.enc.obs || !scope.enc.obs['a89df246-1350-11df-a1f1-0026b9348838']) {
			    scope.errors.dateFound = {errors:"Date Found Required"};
			    errors.push("Needs date found");
			}
		    }

		    if(errors.length > 0) {
			scope.errors.patientStatus = {errors:errors};
			return false;
		    } 
		    else { return true; }
		}
	    },
	}
    }]);
