'use strict';

/* App Module */

var amrsApp = angular.module('amrsApp', [
    'ui.router',
    'amrsControllers',
    'amrsServices',
    'openmrs.widget.login',
]);

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
	      url: '/patient/:patient',
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

	  .state('django',{
	      url: "/django",
	      templateUrl: static_dir + 'partials/test-django.html',	      
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



/*
amrsApp.config(['$routeProvider',
  function($routeProvider) {
      $routeProvider.
	  when('/apps', {
              templateUrl: static_dir + 'partials/apps.html',
	  }).
	  when('/login', {
              templateUrl: static_dir + 'partials/login.html',
	  }).
	  when('/patient-search', {
	      templateUrl: static_dir + 'partials/patient-search.html',
	      controller: 'PatientSearchCtrl'
	  }).
	  when('/patient/:patient_uuid', {
	      templateUrl: static_dir + 'partials/patient-dashboard.html',
	      controller: 'PatientDashboardCtrl'
	  }).

	  when('/defaulter-cohort',{
	      templateUrl: static_dir + 'partials/defaulter-cohort.html',	      
	      controller: 'DefaulterCohortCtrl'
	  }).	  

	  when('/amrs',{
	      templateUrl: static_dir + 'partials/test-amrs.html',	      
	      controller: 'AmrsCtrl'
	  }).	  
	  otherwise({
              redirectTo: '/apps'
	  });
  }]);
*/
