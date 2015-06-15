(function(angular) {
  "use strict";

  var app = angular.module('myApp.home', ['ngRoute']);

  app.controller('HomeCtrl', ['$scope', 'user', function ($scope, user) {
    $scope.user = user;
  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl',
      resolve: {
        user: ['Auth', function (Auth) {
          return Auth.$waitForAuth();
        }]
      }
    });
  }]);


})(angular);

