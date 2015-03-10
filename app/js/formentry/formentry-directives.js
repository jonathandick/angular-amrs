'use strict';

/* Directives */

var formEntry = angular.module('openmrs.formentry');

formEntry    
    .directive('htmlForm', ['$parse','$compile','$state','FormEntryService',
	function($parse,$compile,$state,FormEntryService) {
	    return {
		restrict: "E",
		scope:false,
		controller: function($scope) {
		    $scope.id = 0;
                    $scope.obsCount = 0;
		    $scope.form = {patient:$scope.patient};
		    
                    this.getId = function() {
			return $scope.id++;
                    }
		    
                    this.getObs = function() {
			return $scope.form.obs;
                    }
		    
                    this.getFormScope = function() {
			return $scope;
                    }
		    
                    this.setObs = function(lineage, value) {
			var oSetter = $parse(lineage).assign;
			oSetter($scope,oSetter);
                    }
		    
                    this.addToModel = function(parentLineage,id,item) {
		    
			var getter = $parse(parentLineage)($scope);
			if(getter === undefined) {
                            $scope.obs = [];
                            getter = $scope.obs;
			}
			//if the model already exists (e.g. the data is from a saved form), don't recreate it.
			else if(getter[id]) return;
			getter[id] = item;
                    }
		    
		},

		link : function(scope,element,attrs) {		

		    function validate() { 
			var isValid = $("form").valid();
			return isValid;
		    }
		    
		    scope.saveToDrafts = function() {
			alert('This feature is currently unavailable.');
			//FormEntryService.saveToDrafts(scope.form);
		    }
		    
		    scope.submit = function() {
			if(validate()) {		    	
			    FormEntryService.submit(scope.form);			    
			    $state.go("patient",{uuid:scope.patient.getUuid()});
			}
		    };
		}
	    }
	}])
    .directive('patientDemographics', [function() {
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
	    restrict: "EA",
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

    .directive('encounter',['$parse','$compile',
       function($parse,$compile,$state) {
	return {
	    restrict: "E",
	    scope:false,
	    require:"^htmlForm",
	    link: function(scope,element,attrs,ctrl,transclude) {

		/*
		  The obs are saved from the previous encounter. This means that if new dom elements
		  were created, they will not be represented on the current dom. Adding dom elements
		  based on the model still needs to be implemented.
		*/
		function loadSavedEncounter(savedEncounter) {		    
		    scope.form.encounter = savedEncounter;
		}
		    
		
		function loadExistingEncounter(restEncounter) {
		    //console.log("loading encounter from server");
		    scope.form.encounter = {uuid:restEncounter.uuid,
					    patient:restEncounter.patient.uuid,
					    encounterDatetime:restEncounter.encounterDatetime,
					    encounterType:restEncounter.encounterType.uuid, 
					    location:restEncounter.location.uuid,
					    provider:restEncounter.provider.uuid,
					    form:restEncounter.form.uuid
					   }		    		    
		}

		
		scope.$watch('encounter',function(encounter,oldValue){		    
		    if(encounter !== undefined && encounter !== null && encounter !== "") {
			if(encounter.savedFormId) {
			    loadSavedEncounter(encounter);
			}
			else if(encounter.isNewEncounter) {
			    scope.form.encounter = encounter;			    
			}
		    }
		    
		});

		
		scope.$watch('existingEncounter',function(existingEncounter,oldValue){		    
		    if(existingEncounter !== undefined && existingEncounter !== null && existingEncounter !== "") {
			loadExistingEncounter(existingEncounter);			
		    }
		});

	    }
	}
    }])

    .directive('obsGroup',['$parse','$compile',
       function($parse,$compile) {
	   return {
	       restrict: "E",
	       scope: {},
	       transclude:true,
	       replace:true,
	       require:"^htmlForm",
	       link: function(scope,elem,attrs,ctrl,transclude) {
		   var id = ctrl.getId();
		   var formScope = ctrl.getFormScope();		
		   
		   var conceptUuid = attrs['conceptUuid'];
		   var parentLineage = angular.element(elem).parent().attr('lineage');
		   if(parentLineage === undefined || parentLineage === null) parentLineage = "form.obs";
		   else parentLineage += '.obs';
		   
		   if($parse(parentLineage)(formScope) === undefined) formScope.form.obs = [];
		   
		   var lineage = parentLineage + '[' + id + ']';
		   
		   elem.attr('lineage',lineage);
		   ctrl.addToModel(parentLineage,id,{concept:conceptUuid,obs:[]});
 		   
		   transclude(scope,function(clone,scope){		    		    
		       if(elem[0].attributes['repeat']) {			
			   var b = angular.element("<button ng-click='getClone()'>Repeat</button><br/>");
			   $compile(b)(scope);
			   elem.before(b);
		       }
		       elem.append(clone);
		   }); 
		   
		   if(elem[0].attributes['repeat']) {			
		       var e = elem.clone();
		       e.removeAttr('lineage class repeat');
		       e.find('*').removeAttr('lineage class');
		       e.find('select').attr('obs',""); 
		       scope.template = e[0].outerHTML;
		       scope.$parent.templates[lineage] = e[0].outerHTML;
		   }
		   
		   scope.getClone = function() {
		       
		       var node = $compile(scope.template)(scope);
		       elem.append('<br/>');
		       elem.after(node);
		   };		
				
		   function loadData(obsGroup,domElements) {
		       var o,m;
		       domElements.each(function() {
			   if(this === undefined) return false;
			   var conceptUuid = this.attributes['concept-uuid'].value;			    
			   var lineage,model,setter,value,existingValue,members;
			   for(var j in obsGroup) {			    
			       o = obsGroup[j];
			       if(o.concept.uuid !== conceptUuid) continue;
			       if(o.isLoaded) continue;
			       
			       lineage = this.attributes['lineage'].value;
			       model = $parse(lineage)(formScope);
			       setter = $parse(lineage).assign;
			       
			       if(model.value || model.obs) {
				   scope.getClone();
				   break;
			       }
			       
			       o.isLoaded = true;
			       if(o.value) {
				   value = getValue(o);				
				   existingValue = o.exitingValue || o.value;
				   setter(formScope, {concept:conceptUuid,value:value,uuid:o.uuid,existingValue:existingValue});				
			    } else if(o.groupMembers){	//Come back to this, needs to be moved to obsgroup, only obsgroups can have obs/obsgroups	
				members = $(elem).find('obs, obsGroup');
				setter(formScope, {concept:conceptUuid,uuid:o.uuid,obs:[]});				
				loadData(o.groupMembers,members);
			    }
			       break;
			   }
		       });
		   }
		   
		   var parentLineage = elem.parent().attr('lineage');
		   
		   if(parentLineage === undefined) {
		       formScope.$watch('existingEncounter', function(existingEncounter,oldValue) {		    
			   if(existingEncounter) {
			       loadData(existingEncounter.obs,elem);
			   }
		       });			 
		       
		   }
	       },
	   }
       }])

    .directive('obs', ['$parse', '$compile', 
        function($parse, $compile) {	
	    return {
		restrict: "E",
		scope: true,
		priority: 100000,
		require:"^htmlForm",
		link: function(scope,elem,attrs,ctrl,transclude) {		
		    
		    var obs = {concept:attrs.conceptUuid};	    
		    var formScope = ctrl.getFormScope();		
		    var lineage,checkboxValue;
		    
		    function init() {
			var template = elem[0].outerHTML;
			var e = elem.find('select,input');
			e.attr('ng-model','selected');
			if(e.attr('type') === 'checkbox') checkboxValue = e.attr('value');
			$compile(e)(scope);
			
			var id = ctrl.getId();			
			var parentLineage = angular.element(elem).parent().attr('lineage');
			if(parentLineage === undefined || parentLineage === null) parentLineage = "form.obs";
			else parentLineage += '.obs';
			
			if($parse(parentLineage)(formScope) === undefined) formScope.form.obs = [];
			lineage = parentLineage + '[' + id + ']';
			elem.attr('lineage',lineage);
			
			//Create the "space" in encounter.obs
			ctrl.addToModel(parentLineage,id,obs);		    
		    }
		    
		    init();
		
		    
		    function setValue(newValue) {
			if(newValue === undefined) return;
			
			var o = $parse(lineage)(formScope);
			var setter = $parse(lineage);
			
			if(checkboxValue) {
			    if(newValue === true) o.value = checkboxValue;
			    else o.value = "";
			}
			else o.value = newValue;
			setter(formScope,o);
		    }
		    
                    function getValue(obs) {
			var trueConceptUuid = 'a899b35c-1350-11df-a1f1-0026b9348838';
			var falseConceptUuid = 'a899b42e-1350-11df-a1f1-0026b9348838';
			
			if(obs.value) {
                            var v = obs.value;
                            if(Object.prototype.toString.call(v) == "[object Object]") {
				v = obs.value.uuid;
                            }
                            /*
                              if(v === trueConceptUuid) v = "true";
                              else if(v === falseConceptUuid) v = "false";
                            */

                            return v;
			}
			else return undefined;
                    }
		    
		    function loadData(obsGroup,domElements) {
			var o,m,conceptUuid,lineage,model,setter,e,value,existingValue,f;
			domElements.each(function() {
			    if(this === undefined) return false;
			    conceptUuid = this.attributes['concept-uuid'].value;			    
			    for(var j in obsGroup) {			    
				o = obsGroup[j];
				value = getValue(o);

				if(o.concept.uuid !== conceptUuid) continue;
				if(checkboxValue && elem.find("input").attr("value") !== value) continue;
				if(o.isLoaded) continue;

				lineage = this.attributes['lineage'].value;			    
				model = $parse(lineage)(formScope);
				setter = $parse(lineage).assign;
				
				//If this dom element has data, then we need to clone this element and insert it into the dome.
				//By compiling it, it will call it's own method to load its data. 
				if(model.value) {
				    e = angular.element(elem.outerHTML);
				    elem.after(e);
				    $compile(e)(scope);
				    break;
				}
				
				o.isLoaded = true;
				if(value) {				
				    existingValue = o.existingValue || value;
				    setter(formScope, {concept:conceptUuid,value:value,uuid:o.uuid,existingValue:existingValue});			
				    
				    if(checkboxValue) {
					elem.find("input").attr("checked",true);
					scope.selected = true;
				    }
				    else scope.selected = value;
				}
				break;
			    }
			});
		    }
		    
		    //This converts an angular formentry represetnation of obs to the openmrs rest ws version. 
		    //The loadObs() function requires the obs to be in the same format as the openmrs rest object.
		    function toRESTStyleObs(obs,obsToLoad) {
			var o, f = {};
			for(var i in obs) {
			    o = obs[i];
			    
			    if(o === null || o.value === null || o.value === undefined) continue;
			    //console.log(o);
			    f = {concept:{uuid:o.concept}};
			    if(o.uuid) f.uuid = o.uuid;
			    if(o.existingValue) f.existingValue = o.existingValue;
			    
			    //if(o.obs) console.log('found obs');
			    //if(o.value) console.log('found value');
			    if(o.value) f.value = o.value;
			    else if(o.obs) {
				f.groupMembers = [];
				loadSavedObs(o.obs,f.groupMembers);
			    }
			    obsToLoad.push(f);
			}
		    }
		    
		    scope.$watch('selected',function(newValue,oldValue) {		   

			if (Object.prototype.toString.call(newValue) === "[object Date]") {
			    newValue = newValue.toISOString();			    
			    scope.selected = newValue;
			}				
			setValue(newValue);
		    });
		    
		    
		    //Only watch for first level obs/obsgroups. Any obsgroups will be filled when the parent obs is loaded. 
		    var parentLineage = elem.parent().attr('lineage');
		    if(parentLineage === undefined) {
			formScope.$watch('existingEncounter', function(restEncounter,oldValue) {		    
			    if(restEncounter) loadData(restEncounter.obs,elem);
			});			 
		    }
		}
	    }
	}])	

    .directive('personAttribute', ['$parse', '$compile', 
        function($parse, $compile) {	
	    return {
		restrict: "E",
		scope: true,
		priority: 100000,
		require:"^htmlForm",
		link: function(scope,elem,attrs,ctrl,transclude) {		
		    
		    var formScope = ctrl.getFormScope();
		    var uuid = attrs['uuid'];
		    var checkboxValue;
		    
		    function init() {
			var e = elem.find('select,input');
			e.attr('ng-model','selected');
			if(e.attr('type') === 'checkbox') checkboxValue = e.attr('value');
			$compile(e)(scope);		    
			if(formScope.form.personAttributes === undefined) formScope.form.personAttributes = {};
			ctrl.addToModel('personAttributes',uuid,"");		    
		    }
		    init();
		    
		    
		    function setValue(newValue) {
			if(newValue === undefined) return; 
			if (Object.prototype.toString.call(newValue) === "[object Date]") {
			    newValue = newValue.toISOString();
			}	
			formScope.form.personAttributes[uuid] = newValue;
		    }
		    
		    
		    scope.$watch('selected',function(newValue,oldValue) {		   
			setValue(newValue);
		    });
		    
		    formScope.$watch('form.personAttributes["' + uuid + '"]',function(value) {
			if(checkboxValue) {
			    elem.find("input").attr("checked",true);
			    scope.selected = true;
			}
			else scope.selected = value;
		    });
		    
		    formScope.$watch('patient', function(value) {
			var attributes = scope.patient.patientData.person.attributes;
			var attr;
			for(var i in attributes) {
			    attr = attributes[i];
			    if(uuid === attr.attributeType.uuid) {
				scope.selected = attr.value;
				break;
			    }
			}
		    });
		    
		}
	    }
	}])
;
