(function (angular) {
    "use strict";

    var app = angular.module('myApp.aorders', ['ngRoute']);

    app.controller('AOrdersCtrl', ['$scope', '$location', '$firebaseArray', 'user', 'orders', function($scope, $location, $firebaseArray, user, orders) {
        $scope.requests = $firebaseArray(orders.ordersRef);
        $scope.status = "Retrieving requests ...";

        $scope.requests.$loaded().then(function() {
           if (angular.isUndefined($scope.requests) || $scope.requests.length === 0) {
               $scope.status = "No request found";
           }
        });

        $scope.goToOrder = function (orderRef) {
            $location.path("/editorder/" + orderRef);
        };

        $scope.$on('$destroy', function () {
            $scope.requests.$destroy();
        });


    }]);

    app.filter("getNumQuotes", function(){
        return function(quotesObj, scope){
            var count = 0;
            var match = 0;

            angular.forEach(quotesObj, function(value, key) {
                count = count + 1;
                if (value.email === scope.profileEmail) {
                    match = match + 1;
                }
            });

            if (match >= 1) {
                return count + " ✓";
            } else {
                return count;
            }
            /*
            if (angular.isDefined(quotesObj)) {
                return (Object.keys(quotesObj).length);
            } else {
                return 0;
            }
            */
        }
    });

    app.factory("orders", [
        "FBURL",
        function(FBURL) {
            var factory = {};

            factory.ref = new Firebase(FBURL);
            factory.ordersRef = factory.ref.child("orders");

            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/aorders', {
            templateUrl: 'aorders/aorders.html',
            controller: 'AOrdersCtrl'
        });
    }]);

})(angular);