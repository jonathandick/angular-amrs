'use strict';

/* App Module */

var amrsApp = angular.module('amrsApp', ['ui.router','amrsServices','defaulterCohortControllers',
					 'ui.bootstrap','openmrs.widgets','outreachForm.validators',
					 'encounterFormControllers','checklist-model']);

var static_dir = 'js/angular-amrs/app/';


amrsApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
      $stateProvider
	  .state('login', {
	      url: "/login",
              templateUrl: static_dir + 'partials/login.html',
	  })
	  .state('apps', {
	      url: "/apps",
              templateUrl: static_dir + 'partials/apps.html',	      
	      authenticate:true,
	  })
	  .state('patient-search', {
	      url: '/patient-search',
	      templateUrl: static_dir + 'partials/patient-search.html',
	      controller: 'PatientSearchCtrl',
	      authenticate:true,
	  })
	  .state('patient', {
	      url: '/patient/:uuid',
	      templateUrl: static_dir + 'partials/patient-dashboard.html',
	      controller: 'PatientDashboardCtrl',
	      authenticate:true,
	  })

	  .state('defaulter-cohort',{
	      url: "/defaulter-cohort",
	      templateUrl: static_dir + 'partials/defaulter-cohort.html',	      
	      controller: 'DefaulterCohortCtrl',
	      authenticate:true,	      
	  })	  
	  .state('amrs',{
	      url: "/amrs",
	      templateUrl: static_dir + 'partials/test-amrs.html',	      
	      controller: 'AmrsCtrl',
	      authenticate:true,
	  })
	  .state('encounter-form',{
	      url:"/encounter-form/:formUuid/:patientUuid",
	      authenticate:true,
	      onEnter : function($state) {		  
		  var formUuid = $state.params.formUuid;
		  var transitions = {"1eb7938a-8a2a-410c-908a-23f154bf05c0":'outreach-form'};
		  if(transitions[formUuid]) {		      
		      $state.transitionTo(transitions[formUuid],$state.params);
		  }
		  else {$state.transitionTo('apps');}
	      },
	  })      
	  .state('encounter-forms-saved',{
	      url:"/encounter-forms-saved",
	      templateUrl: static_dir + 'partials/encounter-forms-saved.html',
	      authenticate:true,
	  })
	  .state('encounter-form-saved',{
	      url:"/encounter-form-saved?hash&formUuid",
	      authenticate:true,
	      onEnter : function($state,$stateParams) {		
		  var formUuid = $stateParams.formUuid;		  
		  var transitions = {"1eb7938a-8a2a-410c-908a-23f154bf05c0":'outreach-form'};
		  if(transitions[formUuid]) {		   
		      var state = transitions[formUuid];
		      $state.transitionTo('outreach-form',{hash:$stateParams.hash});
		  }
		  else {$state.transitionTo('apps');}
	      },

	  })
	  .state('outreach-form',{
	      url:"/outreach-form?patientUuid&encounterUuid&hash",
	      templateUrl: static_dir + 'partials/outreach-form.html',
	      authenticate:true,
	  })
	  .state('django',{
	      url: "/django",
	      templateUrl: static_dir + 'partials/test-django.html',
	      authenticate: true,	      
	  })
	  .state('logout',{
	      url: "/logout",
	      templateUrl: static_dir + 'partials/login.html',
	  });

      $urlRouterProvider.otherwise("/apps");
  }])
    .run(['$rootScope','$state','Auth',
	  function ($rootScope, $state, Auth) {
	      $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
		  if (toState.authenticate && !Auth.isAuthenticated()){
		      $state.transitionTo("login");
		      event.preventDefault(); 
		  }
		  if (toState.url == "/logout") {		      
		      Auth.logout();
		  } 
	      });	      
	  }]);
