(function (angular) {
    "use strict";

    var app = angular.module('myApp.verify', ['ngRoute']);

    //Order status: new -> verified -> verifyding -> closed

    app.controller('VerifyCtrl', ['$scope', '$routeParams', '$firebaseObject', '$filter', 'user', 'verify', function($scope, $routeParams, $firebaseObject, $filter, user, verify) {
        $scope.admin = {};
        var temp; //to store temp value of request.status 
        var orderRef =  $routeParams.orderRef;
        $scope.request = $firebaseObject(verify.ordersRef.child(orderRef));

        //must wait until firebase finish loading
        $scope.request.$loaded().then(function() {
            $scope.checkStatus = $scope.request.status;
        });
    
        $scope.$watch('profileEmail', function() {
            $scope.admin.email = $scope.profileEmail;
            $scope.admin.name = $scope.profileName;
            $scope.admin.phone = $scope.profilePhone;

        });
        
        
        $scope.verifyOrder = function(){
            verify.verifyOrder($scope.admin.orderStatus,orderRef);
        };
        
        

        $scope.checkStatus = function(){
            verify.checkStatus(temp);
            
        };

        $scope.$on('$destroy', function () {
            $scope.request.$destroy();
            //$scope.vendor.$destroy();
            //$scope.balance.$destroy();
        });
    }]);

    app.factory("verify", [
        "$firebase",
        "$location",
        "$rootScope",
        "FBURL",
        function($firebase, $location, $rootScope, FBURL) {
            var factory = {};

            factory.ref = new Firebase(FBURL);
            factory.ordersRef = factory.ref.child("orders");
            
            factory.verifyOrder = function(newstatus,orderRef){
                alert("Order " + newstatus);
                factory.orderRef = factory.ref.child("orders/" + orderRef);
                factory.orderRef.update({status : newstatus});
            };
            
            factory.checkStatus = function(status){
                if (status === "Approved"){
                    return true;
                } else {
                    return false;
                }     
            };
            
            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/verify/:orderRef', {
            templateUrl: 'verify/verify.html',
            controller: 'VerifyCtrl'
        });
    }]);

})(angular);