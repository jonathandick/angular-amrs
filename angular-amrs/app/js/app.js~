'use strict';

/* App Module */

var amrsApp = angular.module('amrsApp', [
    'ngRoute',
    'amrsControllers',
    'amrsServices',
    'openmrs.widget.login',
]);

var static_dir = 'js/angular-amrs/app/';

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
