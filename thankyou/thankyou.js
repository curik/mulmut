(function (angular) {
  "use strict";

  var app = angular.module('myApp.thankyou', ['ngRoute']);

  app.controller('ThankYouCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
      $scope.orderId = $routeParams.orderId;
    }]);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/thankyou/:orderId', {
      templateUrl: 'thankyou/thankyou.html',
      controller: 'ThankYouCtrl'
    });
  }]);

})(angular);