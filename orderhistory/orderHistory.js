(function (angular) {
    "use strict";

    var app = angular.module('myApp.orderhistory', ['ngRoute']);

    app.controller('OrderHistoryCtrl', ['$scope', 'FBURL', '$location', '$firebaseArray', 'user', 'history', function($scope, FBURL, $location, $firebaseArray, user, history) {
    
        $scope.requests = $firebaseArray(history.updateRef());

        $scope.status = "Retrieving previous requests ...";
        $scope.requests.$loaded().then(function() {
           if ($scope.requests.length === 0) {
               $scope.status = "No previous request found";
           }
        });

        $scope.getOrder = function (orderRef) {
            $location.path("/orders/" + orderRef);
        };

        $scope.$on('$destroy', function () {
            $scope.requests.$destroy();

        });

    }]);
    
    app.factory("history", ["FBURL", function(FBURL) {
        var factory = {};

        factory.ref = new Firebase(FBURL);
            
        var authData = factory.ref.getAuth();

        factory.orderHistoryRef = factory.ref.child("users/" + authData.uid + "/orders");

        // to solve getAuth from not getting refreshed 
        factory.updateRef = function() {
            var authData = factory.ref.getAuth();
            factory.orderHistoryRef = factory.ref.child("users/" + authData.uid + "/orders");
            return factory.orderHistoryRef;

        };

        return factory;
        }   
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/orderhistory', {
            templateUrl: 'orderhistory/orderHistory.html',
            controller: 'OrderHistoryCtrl'
        });
    }]);

})(angular);