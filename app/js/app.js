'use strict';

/* App Module */

var amrsApp = angular.module('amrsApp', ['ui.router',
					 'ui.bootstrap',					 
					 'defaulterCohort',
					 'openmrs.auth',
					 'openmrs.formentry',
					 'openmrsServices',
					 'flex',
					 'patientSearch',
					 'patientDashboard',					 
 					]);

amrsApp.config(['$stateProvider', '$urlRouterProvider','$httpProvider',
  function($stateProvider, $urlRouterProvider,$httpProvider) {
      var static_dir = 'app/';            

      $stateProvider
	  .state('login', {
	      url: "/login",
              templateUrl:  static_dir + 'js/auth/views/login.html',
	  })
	  .state('logout',{
	      url: "/logout",
	      templateUrl: static_dir + 'js/auth/views/login.html',
	  })
	  .state('apps', {
	      url: "/apps",
              templateUrl: static_dir + 'partials/apps.html',	      
	      authenticate:true,
	  })
	  .state('patient-search', {
	      url: '/patient-search',
	      templateUrl: static_dir + 'js/patient-search/views/patient-search.html',
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
	  .state('encounter-form',{
	      url:"/encounter-form?formUuid&patientUuid&savedFormId",
	      authenticate:true, 
	      templateProvider: function($stateParams,FormEntryService,$templateFactory) {
		  var template = FormEntryService.getTemplate($stateParams.formUuid);
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
	      templateProvider: function($stateParams,FormEntryService,$templateFactory) {
		  var template = FormEntryService.getTemplate($stateParams.formUuid);
		  var html = $templateFactory.fromUrl(static_dir + template); 		  
		  return html;
	      },	      
	  });            

      $urlRouterProvider.otherwise("/apps");
  }])
    .run(['$rootScope','$state','Auth','OpenmrsFlexSettings','FormEntryService',
	  function ($rootScope, $state, Auth, OpenmrsFlexSettings,FormEntryService) {
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
