'use strict';

/* Directives */

var static_dir = 'js/angular-amrs/app/';

angular.module('openmrs.formentry',['openmrsServices','openmrsServicesFlex','ui.bootstrap'])
    .directive('patientDemographics', [function() {
	return {
	    restrict : "E",
	    scope : {
		patient:'='
	    },
	    link : function($scope,element,attrs) {		
	    },	    
	    templateUrl: static_dir + "js/formentry/views/patient-demographics.html",	    
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
    .directive('encounterForm',['$parse','$compile','EncounterServiceFlex',function($parse,$compile,EncounterServiceFlex) {
	return {
	    restrict: "E",
	    scope:false,
	    controller: function($scope) {
		$scope.id = 0;
		this.getId = function() {
		    return $scope.id++;
		}

		this.getObs = function() {
		    return $scope.enc.obs;
		}

		this.getEncounterFormScope = function() {
		    return $scope;
		}		

		this.setObs = function(lineage, value) {
		    var obj = $scope.enc;

		    if (typeof prop === "string")
			prop = prop.split(".");
		    
		    if (prop.length > 1) {
			var e = prop.shift();
			assign(obj[e] =
			       Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {},
			       prop,
			       value);
		    } else
			obj[prop[0]] = value;
		}

	    },
	    link: function(scope,element,attrs,ctrl,transclude) {

		scope.enc = {obs:{}};


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

		function loadData(obs,curSchema) {
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
			    if(setter) setter(scope,{concept:concept,value:value});
			} else if(obs[j].obs){
			    setter(scope,{concept:concept,obs:{}});
			    loadData(obs[j].obs,schema + ":last");
			}
			
		    }
		}

		function prepareObs(obs,restObs) {
		    for(var i in obs) {
			var o = obs[i];
			if(o.value) {
			    restObs.push(o);
			}
			else {
			    var obsSet = {concept:o.concept,obs:[]};
			    prepareObs(o.obs,obsSet.obs);
			    restObs.push(obsSet);
			}
		    }
		}

		function compare(a,b) {
 		    if(a.concept.uuid) {
			if(a.concept.uuid < b.concept.uuid) return -1;
			if(a.concept.uuid > b.concept.uuid) return 1;
			if(a.concept.uuid === b.concept.uuid) {
			    var aValue = getValue(a);
			    var bValue = getValue(b);
			    if(aValue < bValue) return -1;
			    if(aValue > bValue) return 1;
			    return 0;
			}
		    }
		    else {
			if(a.concept < b.concept) return -1;
			if(a.concept > b.concept) return 1;
			return 0;
		    }
		}						


		//assumes obs1 is a restws object and obs2 is a payload object. 
		function isIdentical(obs1,obs2) {
		    if(obs1.value) {
			if(Object.prototype.toString.call(obs1.value) == "[object Object]") {
			    return obs1.value.uuid === obs2.value;
			}
			else return obs1.value === obs2.value;

		    }
		    else if(obs2.obs === undefined) return false;
		    else if(obs1.obs.length != obs2.obs.length) return false;
		    else {			
			obs1.obs.sort(compare);
			obs2.obs.sort(compare);			
			for(var i in obs1.obs) {
			    if(!isIdentical(obs1.obs[i],obs2.obs[i])) {
				return false;
			    }
			}
		    }
		    return true;
		}

		function getObsToVoid(originalObs,obs) {
		    var obsToVoid = [];
		    for(var i in originalObs) {
			var found = false;
			for(var j in obs) {
			    if(originalObs[i].concept.uuid === obs[j].concept) {
				if(isIdentical(originalObs[i],obs[j])) {
				    obs.splice(j,1); //don't resubmit
				    found = true;
				    break;
				}
			    }
			}
			if(!found) {
			    obsToVoid.push(originalObs[i].uuid); //void as key=value is not the same
			}
		    }
		    return obsToVoid;
		}


		scope.submit = function() {
		    var obs = [];
		    prepareObs(scope.enc.obs,obs);
		    
		    scope.enc.obs = obs;		    
		    var obsToVoid = getObsToVoid(scope.encounter.obs,obs);		    		    
		    console.log('obs: ' + JSON.stringify(scope.enc.obs));
		    console.log('obs to void: ' + JSON.stringify(obsToVoid));
		    //EncounterServiceFlex.submit(enc);
		    //EncounterServiceFlex.voidObs(obsToVoid);
		};

		/*
		var encounterUuid = "b68c9c0f-2423-4956-acaf-b6087f7bd7ec";
		EncounterServiceFlex.get(encounterUuid,function(data) {		    
		    scope.encounter = data;
		});
		*/

		scope.$watch('encounter',function(newValue,oldValue){
		    if(newValue !== undefined && newValue !== null && newValue !== "")
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
	    require:"^encouterForm",
	    link: function(scope,element,attrs,ctrl,transclude) {
		var id = ctrl.getId();

		var conceptUuid = attrs['conceptUuid'];
		var lineage = angular.element(element).parent().attr('lineage');

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
	    priority: 100000,
	    require:"^encounterForm",
	    link: function(scope,elem,attrs,ctrl,transclude) {

		var f = {concept:attrs.conceptUuid};	    

		
		function setValue(newValue) {
		    //console.log('setting value: ' + newValue);
		    if(newValue === undefined) return;

		    var s = lineage.replace('[' + id + ']',"")
		    var encScope = ctrl.getEncounterFormScope();

		    var o = $parse(s)(encScope);
		    var oSetter = $parse(s).assign;

		    if(checkboxValue) {
			if(newValue === true) f.value = checkboxValue;
			else f.value=checkboxValue;			
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
		else lineage = 'enc.obs[' + id + ']';
		elem.attr('lineage',lineage);
				
		
		scope.$watch('selected',function(newValue,oldValue) {		    
		    setValue(newValue);
		});
		
	
		var encScope = ctrl.getEncounterFormScope();
		encScope.$watch(lineage, function(newValue,oldValue) {		    
		    if(newValue && newValue.value) {
			scope.selected = newValue.value;
			if(checkboxValue) {
			    elem.find("input").attr("checked",true);
			}
		    }
		});			 

	    }
	}
    }])		

;
