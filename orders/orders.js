(function (angular) {
    "use strict";

    var app = angular.module('myApp.orders', ['ngRoute']);

    app.controller('OrdersCtrl', ['$scope', '$routeParams', '$firebaseObject', 'user', 'orderDetail', function($scope, $routeParams, $firebaseObject, user, orderDetail) {
        var orderRef = $routeParams.orderRef;

        $scope.status = "Retrieving data ...";
        $scope.order = $firebaseObject(orderDetail.getOrder(orderRef));
        $scope.order.$loaded().then(function() {
            if (angular.isUndefined($scope.order.orderId)) {
                $scope.status = "Invalid request, data not found.";
            }
            if (angular.isDefined($scope.order.quotes)) {
                $scope.order.quotesSize = Object.keys($scope.order.quotes).length;
            }
        });

        $scope.$on('$destroy', function () {
            $scope.order.$destroy();
        });


    }]);

    app.factory("orderDetail", [
        "FBURL",
        function(FBURL) {
            var factory = {};

            factory.ref = new Firebase(FBURL);
            factory.getOrder = function(orderRef) {
                return factory.ref.child("orders/" + orderRef);
            };

            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/orders/:orderRef', {
            templateUrl: 'orders/orderDetail.html',
            controller: 'OrdersCtrl'
        });
    }]);

})(angular);