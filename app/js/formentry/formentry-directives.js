'use strict';

/* Directives */

var formEntry = angular.module('openmrs.formentry');

formEntry.directive('patientDemographics', [function() {
	var static_dir = 'app/';

	return {
	    restrict : "E",
	    scope : {
		patient:'='
	    },
	    link : function(scope,element,attrs) {		
	    },	    
	    templateUrl: static_dir + "js/formentry/views/patient-demographics.html",	    
	}
    }])
    .directive('clinicLocationsDropdown',['LocationService','Flex',function() {
	var static_dir = 'app/';
	return {
	    restrict: "E",
	    scope: {
		model:'=',
		label:'@',
		name:'@',
	    },
 	    controller : function($scope,LocationService,Flex) {
		Flex.getAll(LocationService,
			    function(location) { return location.uuid}, //keygetter
			    true, //store offline
			    null, //no encryption
			    function(locations) {$scope.locations = locations;} // callback
			   );
	    },
	    templateUrl : static_dir + "js/formentry/views/locations.html",
	}
    }])
    .directive('providersDropdown',['ProviderService','Flex',function() {
	var static_dir = 'app/';
	return {
	    restrict: "E",
	    scope: {
		model:'=',
		label:'@',
		name:'@',
	    },
 	    controller : function($scope,ProviderService,Flex) {
		Flex.getAll(ProviderService,
			    function(provider) { return provider.uuid}, //keygetter
			    true, //store offline
			    null, //no encryption
			    function(providers) { // callback
				$scope.providers = providers;
			    } 
			   );
	    },
	    templateUrl : static_dir + "js/formentry/views/providersDropdown.html",
	}
    }])
    .directive('outreachProvidersDropdown',['DefaulterCohort',function(DefaulterCohort) {
	var static_dir = 'app/';
	return {
	    restrict: "E",
	    scope: {
		model:'=',
		label:'@',
		name:'@',
	    },
 	    controller : function($scope,ProviderService,Flex) {
		DefaulterCohort.getOutreachProviders(function(data) {		    
		    //console.log(data);
		    $scope.outreachProviders = data;
		});
	    },
	    templateUrl : static_dir + "js/formentry/views/outreachProvidersDropdown.html",
	}
    }])
    .directive('encounterForm',['$parse','$compile','$state','$timeout','FormEntryService',
       function($parse,$compile,$state,$timeout,FormEntryService) {
	return {
	    restrict: "E",
	    scope:false,
	    controller: function($scope) {
		$scope.id = 0;

		
		this.getId = function() {
		    return $scope.id++;
		}

		this.getObs = function() {
		    return $scope.newEncounter.obs;
		}

		this.getEncounterFormScope = function() {
		    return $scope;
		}		

		this.setObs = function(lineage, value) {
                    var oSetter = $parse(lineage).assign;
		    oSetter($scope,oSetter);
		}		

	    },
	    link: function(scope,element,attrs,ctrl,transclude) {
		
		function getValue(obs) {
		    if(obs.value) {
			var v = obs.value;
			if(Object.prototype.toString.call(v) == "[object Object]") {
			    v = obs.value.uuid;
			}
			return v;
		    } 
		    else return undefined;
		}

		function loadObs(obs,curSchema) {
		    for(var j in obs) {
			var schema, concept = obs[j].concept.uuid, id = ctrl.getId(),value;
			
			if(obs[j].obs) schema = curSchema +  " obs-group[concept-uuid='" + concept + "']";	    
			else {
			    schema = curSchema + " obs[concept-uuid='" + concept + "']";			    			
			    value = getValue(obs[j]);			    
			}
			var matching = $(schema);
			var getter;
			var lineage;
			
			matching.each(function(index) {
			    var c = $(this).find('input[type="checkbox"]');
			    if(c.length === 0 || (c.length > 0 && c.attr('value') === value)) {								
				lineage = $(this).attr('lineage');				
				getter = $parse(lineage);
				if(getter(scope) === undefined) {
				    return false;
				}
			    }
			});
			
			//There is no available node in the DOM. We need to create a cloned dom element and add to the dom.
			if(getter(scope) !== undefined) {
			    var e = angular.element(matching[0].outerHTML);
			    matching.after(e);
			    $compile(e)(scope);
			    getter = $parse(e.attr('lineage'));
			}

			var setter = getter.assign;			    			
			if(obs[j].value) {
			    if(setter) setter(scope,{concept:concept,value:value,uuid:obs[j].uuid});
			} else if(obs[j].obs){
			    setter(scope,{concept:concept,uuid:obs[j].uuid,obs:{}});
			    loadObs(obs[j].obs,schema + ":last");
			}
			
		    }
		}

		/*
		  NOTE: This assumes there are no obsGroups in the obs. 
		*/
		function loadSavedEncounter(savedEncounter) {		    
		    var obs = [];
		    
		    for(var i in savedEncounter.obs) {
			var o = savedEncounter.obs[i];
			var f = {};
			if(o !== null) {
			    f.concept = {uuid:o.concept};
			    f.value = {uuid:o.value};
			    obs.push(f);
			}
		    }

		    savedEncounter.obs = [];
		    scope.personAttributes = savedEncounter.personAttributes;

		    $timeout(function() {
			loadObs(obs,'encounter-form');			
		    });

		}
		    

		function loadExistingEncounter(encounter) {
		    //console.log("loading encounter from server");
		    scope.newEncounter = {};
		    scope.newEncounter.uuid = encounter.uuid;
		    scope.newEncounter.patient = encounter.patient.uuid;
		    scope.newEncounter.encounterDatetime = encounter.encounterDatetime;
		    scope.newEncounter.encounterType = encounter.encounterType.uuid; //encounter.encounterType.uuid;
		    scope.newEncounter.location = encounter.location.uuid;
		    scope.newEncounter.provider = encounter.provider.uuid;
		    scope.newEncounter.form = encounter.form.uuid;
		    scope.newEncounter.oldEncounter = encounter;
		    

		    //need to wait for the DOM to finish loading before we populate with obs
		    $timeout(function() {
			loadObs(encounter.obs,'encounter-form');
		    });
		}

		function loadPersonAttributes(personUuid) {
		    scope.personAttributes = {};
		    var attributes = scope.patient.patientData.person.attributes;
		    for(var i in attributes) {
			var attr = attributes[i];
			scope.personAttributes[attr.attributeType.uuid] = attr.value;
		    }
		    scope.personAttributes.oldPersonAttributes = attributes;
		}
		
		function validate() { 
		    var isValid = $("form").valid();
		    return isValid;
		}
		
		
		scope.saveToDrafts = function() {
		    //console.log('save to drafts');
		    //console.log(scope.newEncounter);
		    FormEntryService.saveToDrafts(scope.newEncounter,scope.personAttributes);
		    //console.log('savedFormId: ' + scope.newEncounter.savedFormId);
		}

		scope.submit = function() {
		    //console.log('scope.submit() ');
		    
		    if(validate()) {		    	
			FormEntryService.submit(scope.newEncounter,scope.personAttributes);
			$state.go("patient",{uuid:scope.newEncounter.patient});
		    }
		};


		scope.$watch('newEncounter',function(newEncounter,oldValue){		    
		    if(newEncounter !== undefined && newEncounter !== null && newEncounter !== "") {			
			//console.log('newEncounter has changed');
			if(newEncounter.savedFormId) {
			    loadSavedEncounter(newEncounter);
			}
			else if(newEncounter.isNewEncounter) {
			    loadPersonAttributes(newEncounter.patient);
			}
		    }
		    
		});

		
		scope.$watch('oldEncounter',function(oldEncounter,oldValue){		    
		    if(oldEncounter !== undefined && oldEncounter !== null && oldEncounter !== "") {
			//console.log('oldEncounter has changed');
			scope.loadingData = true;  //starts a spinner
			loadExistingEncounter(oldEncounter);
			loadPersonAttributes(oldEncounter.patient.uuid);
			scope.loadingData = false; //stops a spinner
		    }
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
	    require:"^encounterForm",
	    link: function(scope,element,attrs,ctrl,transclude) {
		var id = ctrl.getId();

		var conceptUuid = attrs['conceptUuid'];
		var lineage = angular.element(element).parent().attr('lineage');

		if(lineage) lineage += '.obs[' + id + ']';
		else lineage = 'newEncounter.obs[' + id + ']';
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
	    priority: 100000,
	    require:"^encounterForm",
	    link: function(scope,elem,attrs,ctrl,transclude) {		
		var f = {concept:attrs.conceptUuid};	    
		
		function setValue(newValue) {
		    //console.log('setting value: ' + newValue);
		    if (Object.prototype.toString.call(newValue) === "[object Date]") {
			newValue = newValue.toISOString();
		    }
		    if(newValue === undefined) return;

		    var s = lineage.replace('[' + id + ']',"")
		    
		    var encScope = ctrl.getEncounterFormScope();
		    
		    var o = $parse(s)(encScope);
		    var oSetter = $parse(s).assign;

		    if(checkboxValue) {
			if(newValue === true) f.value = checkboxValue;
			else f.value = "";
			o[id] = f;
		    }
		    else if(newValue != "") {
			f.value = newValue;		    			
			o[id] = f;
		    }
		    else { delete o[id]; }
		    oSetter(encScope,o);
		}
		

		var template = elem[0].outerHTML;
		var e = elem.find('select,input');
		
		e.attr('ng-model','selected');

		var checkboxValue;
		if(e.attr('type') === 'checkbox') {
		    checkboxValue = e.attr('value');
		}

		$compile(e)(scope);

		var id = ctrl.getId();			
		var lineage = angular.element(elem).parent().attr('lineage');
		if(lineage) lineage += '.obs[' + id + ']';
		else lineage = 'newEncounter.obs[' + id + ']';
		elem.attr('lineage',lineage);
		
				
		
		scope.$watch('selected',function(newValue,oldValue) {		   
		    setValue(newValue);
		});
		
	
		var encScope = ctrl.getEncounterFormScope();
		encScope.$watch(lineage, function(newValue,oldValue) {		    
		    if(newValue && newValue.value) {
			if(checkboxValue) {
			    elem.find("input").attr("checked",true);
			    scope.selected = true;
			}
			else {
			    scope.selected = newValue.value;
			}
		    }
		});			 

	    }
	}
    }])		

;
