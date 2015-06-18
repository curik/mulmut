(function (angular) {
    "use strict";

    var app = angular.module('myApp.editorder', ['ngRoute']);

    //Order status: new -> verified -> editOrderding -> closed

    app.controller('editOrderCtrl', ['$scope', '$routeParams', '$firebaseObject', '$filter', 'user', 
        'editOrder', '$location', function($scope, $routeParams, $firebaseObject, $filter, user, editOrder, $location) {
        $scope.admin = {};
    
        var orderRef =  $routeParams.orderRef;
        $scope.request = $firebaseObject(editOrder.ordersRef.child(orderRef));
 
        $scope.$watch('profileEmail', function() {
            $scope.admin.email = $scope.profileEmail;
            $scope.admin.name = $scope.profileName;
            $scope.admin.phone = $scope.profilePhone;

        });
        
        
        $scope.editOrder = function(){
            var answer = confirm ("Are you sure you want to "+ $scope.admin.orderStatus+ " order # " + $scope.request.orderId + " ?");
            if (answer)
                editOrder.editOrder($scope.admin.orderStatus,orderRef,$scope.request.orderId);
        };

        $scope.deleteOrder = function(){
            var answer = confirm ("Are you sure you want to delete order # " + $scope.request.orderId + " ?");
            if (answer)
                editOrder.deleteOrder($scope.request.orderId,orderRef);

        };

        $scope.$on('$destroy', function () {
            $scope.request.$destroy();
            
        });
    }]);

    app.factory("editOrder", [
        "$firebase",
        "$location",
        "$rootScope",
        "FBURL",
        function($firebase, $location, $rootScope, FBURL) {
            var factory = {};
            var tempId = {};
            factory.ref = new Firebase(FBURL);
            factory.ordersRef = factory.ref.child("orders");
            
            factory.editOrder = function(newstatus,orderRef,orderIdRef){
                factory.orderRef = factory.ref.child("orders/" + orderRef);
                // gives notification if successful
                var onComplete = function(error) {
                
                    if (error) {
                        alert('Error in updating status of order ' + orderIdRef);
                    } else {
                        alert('Order # ' + orderIdRef + ' has been ' + newstatus);
                    }
                };
                factory.orderRef.update({status : newstatus}, onComplete);
            };
            
            factory.deleteOrder = function(orderIdRef,orderRef){
                tempId = orderIdRef; //because once order is deleted, we lose the orderId value
                console.log('delete');
                factory.orderRef = factory.ref.child("orders/" + orderRef);
                factory.userorderRef = factory.ref.child("users/orders" + orderRef); // also delete request stored in user
                // gives notification if successful
                var onComplete = function(error) {
                
                    if (error) {
                        alert('Error in deleting order ' + tempId);
                    } else {
                        alert('Order # ' + tempId + ' has been deleted!');
                    }
                };
                factory.userorderRef.remove(onComplete);
                factory.orderRef.remove(onComplete);
            };

            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/editorder/:orderRef', {
            templateUrl: 'editorder/editorder.html',
            controller: 'editOrderCtrl'
        });
    }]);

})(angular);