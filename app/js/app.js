'use strict';

/* App Module */

var amrsApp = angular.module('amrsApp', ['ui.router',
					 'ui.bootstrap',					 
					 'defaulterCohort',
					 'openmrs.auth',
					 'openmrs.formentry',
					 'openmrsServices',
					 'openmrsServicesFlex',
					 'patientDashboard',
					 'amrsControllers',
					 'dexieServices',
 					]);

amrsApp.config(['$stateProvider', '$urlRouterProvider','$httpProvider',
  function($stateProvider, $urlRouterProvider,$httpProvider) {
      var static_dir = 'app/';            

      $stateProvider
	  .state('login', {
	      url: "/login",
              templateUrl:  static_dir + 'js/auth/views/login.html',
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
	      templateUrl: static_dir + 'js/patient-dashboard/views/patient-dashboard.html',
	      controller: 'PatientDashboardCtrl',
	      authenticate:true,
	  })

	  .state('defaulter-cohort',{
	      url: "/defaulter-cohort",
	      templateUrl: static_dir + 'js/defaulter-cohort/views/defaulter-cohort.html',	      
	      controller: 'DefaulterCohortCtrl',
	      authenticate:true,	      
	  })	  
	  .state('amrs',{
	      url: "/amrs",
	      templateUrl: static_dir + 'js/formentry/forms/outreach-form2.html',	      
	      controller: 'AmrsCtrl',
	      authenticate:true,
	  })
	  .state('encounter-form',{
	      url:"/encounter-form?formUuid&patientUuid&savedFormId",
	      authenticate:true, 
	      templateProvider: function($stateParams,FormService,$templateFactory) {
		  var template = FormService.getTemplate($stateParams.formUuid);
		  var html = $templateFactory.fromUrl(static_dir + template); 
		  return html;
	      },
	      
	  })      
	  .state('encounter-forms-saved',{
	      url:"/encounter-forms-saved",
	      templateUrl: static_dir + 'js/formentry/views/encounter-forms-saved.html',
	      authenticate:true,
	  })
	  .state('formentry',{
	      url:"/formentry?encounterUuid&formUuid&patientUuid",
	      authenticate:true, 
	      templateProvider: function($stateParams,FormService,$templateFactory) {
		  var template = FormService.getTemplate($stateParams.formUuid);
		  var html = $templateFactory.fromUrl(static_dir + template); 
		  
		  return html;
	      },	      
	  })            
	  .state('django',{
	      url: "/django",
	      templateUrl: static_dir + 'partials/test-django.html',
	      authenticate: true,	      
	  })
	  .state('logout',{
	      url: "/logout",
	      templateUrl: static_dir + 'js/auth/views/login.html',
	  });

      $urlRouterProvider.otherwise("/apps");
  }])
    .run(['$rootScope','$state','Auth','ngDexie','OpenmrsFlexSettings','FormEntryService',
	  function ($rootScope, $state, Auth,ngDexie,OpenmrsFlexSettings,FormEntryService) {
	      $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
		  if (toState.authenticate && !Auth.isAuthenticated()){
		      $state.transitionTo("login");
		      event.preventDefault(); 
		  }
		  if (toState.url == "/logout") {		      
		      Auth.logout();
		  } 
	      });


	      OpenmrsFlexSettings.init();
	      FormEntryService.init();

	      
	  }]);
