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
    .directive('providersDropdown',['ProviderServiceFlex',function() {
	return {
	    restrict: "E",
	    scope: {
		model:'=',
		label:'@',
	    },
	    controller : function($scope,ProviderServiceFlex) {
		ProviderServiceFlex.query(function(providers) {
		    $scope.providers = providers;		    
		});
	    },
	    templateUrl : static_dir + "/directive-templates/providersDropdown.html",
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
    .directive('encounterForm',['$parse','$compile',function($parse,$compile) {
	return {
	    restrict: "E",
	    scope:false,
	    link: function(scope,element,attrs,ctrl,transclude) {

		function loadData(obs,curSchema) {
		    for(var j in obs) {			
			var schema, concept = obs[j].concept, id = scope.getId();
			if(obs[j].value) schema = curSchema + " > obs[concept-uuid='" + concept + "']";	    
			else schema = curSchema +  " > obs-group[concept-uuid='" + concept + "']";	    
			    
			var matching = $(schema + ":last");
			var lineage = matching.attr('lineage');
			var getter = $parse(lineage);			

			//The node in the DOM is occupied by a prior obs/obsSet. We need to create a cloned dom element and add to the dom.
			if(getter(scope) !== undefined) {
			    var e = angular.element(matching[0].outerHTML);
			    matching.after(e);
			    $compile(e)(scope);
			    getter = $parse(e.attr('lineage'));
			}
			var setter = getter.assign;				    
			if(obs[j].value) setter(scope,{concept:concept,value:obs[j].value});
			else if(obs[j].obs){
			    setter(scope,{concept:concept,obs:{}});
			    loadData(obs[j].obs,schema + ":last");
			}	
		    }
		}
		scope.$watch('encounter',function(newValue,oldValue){
		    loadData(newValue.obs,'encounter-form');		    
		});
	    }
	}
    }])

    .directive('obsGroup',['$parse','$compile',function($parse,$compile) {
	return {
	    restrict: "E",
	    scope: {},
	    transclude:true,
	    replace:true,	   
	    link: function(scope,element,attrs,ctrl,transclude) {

		function getId() {
		    var getIdGetter = $parse('getId');
		    var getId = getIdGetter(scope.$parent);		
		    var parent = scope.$parent;
		    while(getId === undefined) {
			parent = parent.$parent;
			getId = getIdGetter(parent);		
		    }
		    var id = getId();
		    return id + "";
		}
		var id = getId();

		var conceptUuid = attrs['conceptUuid'];
		var lineage = angular.element(element).parent().attr('lineage');
		//setObs(lineage,id,conceptUuid);

		if(lineage) lineage += '.obs[' + id + ']';
		else lineage = 'enc.obs[' + id + ']';
		element.attr('lineage',lineage);
	
		transclude(scope,function(clone,scope){		    		    
		    if(element[0].attributes['repeat']) {			
			var b = angular.element("<button ng-click='getClone()'>Repeat</button><br/>");
			$compile(b)(scope);
			element.before(b);
		    }
		    element.append(clone);
		}); 

		if(element[0].attributes['repeat']) {			
		    var e = element.clone();
		    e.removeAttr('lineage class repeat');
		    e.find('*').removeAttr('lineage class');
		    e.find('select').attr('obs',""); 
		    scope.template = e[0].outerHTML;
		    scope.$parent.templates[lineage] = e[0].outerHTML;
		}

		scope.getClone = function() {
		    
		    var node = $compile(scope.template)(scope);
		    element.append('<br/>');
		    element.after(node);
		};		
				
	    },
	}
    }])

    .directive('obs', ['$parse', '$compile', function($parse, $compile) {	
	return {
	    restrict: "E",
	    scope: true,
	    priority: 1000,	    
	    link: function(scope,elem,attrs,ctrl,transclude) {
		function getId() {
		    var getIdGetter = $parse('getId');
		    var getId = getIdGetter(scope.$parent);		
		    var parent = scope.$parent;
		    while(getId === undefined) {			
			parent = parent.$parent;
			getId = getIdGetter(parent);		
		    }
		    var id = getId();
		    return id;
		}	


		var f = {concept:attrs.conceptUuid};	    

		function setValue(newValue) {
		    
		    if(newValue === undefined) return;

		    var obsGetter = $parse('enc.obs');
		    var parent = scope.$parent;
		    var obs = obsGetter(parent);		
		    while(obs === undefined) {
			parent = parent.$parent;
			obs = obsGetter(parent);
		    }

		    var s = lineage.replace('[' + id + ']',"")
		    var o = $parse(s)(parent);
		    var oSetter = $parse(s).assign;

		    if(newValue != "") {
			f.value = newValue;		    			
			o[id] = f;
		    }
		    else { delete o[id]; }
		    oSetter(parent,o);		
		}
		

		var template = elem[0].outerHTML;
		var e = elem.find('select');
		e.attr('ng-model','selected');
		$compile(e)(scope);

		var id = getId();			
		var lineage = angular.element(elem).parent().attr('lineage');
		if(lineage) lineage += '.obs[' + id + ']';
		else lineage = 'enc.obs[' + id + ']';
		elem.attr('lineage',lineage);
		

		scope.$watch('selected',function(newValue,oldValue) {
		    setValue(newValue);
		});
		
		var obsGetter = $parse('enc.obs');
		var parent = scope.$parent;
		var obs = obsGetter(parent);		
		while(obs === undefined) {
		    parent = parent.$parent;
		    obs = obsGetter(parent);
		}
		
		parent.$watch(lineage, function(newValue,oldValue) {
		    if(newValue && newValue.value) {
			scope.selected = newValue.value;
		    }
		});			 

	    }
	}
    }])		

;

