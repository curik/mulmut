(function (angular) {
    "use strict";

    var app = angular.module('myApp.avendors', ['ngRoute']);

    app.controller('avendorsCtrl', ['$scope', '$window','$location', 'fbutil','$firebaseArray', "getUsers", "FBURL",
        function($scope, $window, $location, fbutil, $firebaseArray, getUsers, FBURL) {
        
            var ref = new Firebase(FBURL + "/users");
            var query = ref.orderByChild("mode").equalTo("vendor");     // filter only vendors

            $scope.users = $firebaseArray(query);

        $scope.status = "Retrieving vendors ...";
        
        $scope.users.$loaded().then(function() {
           if (angular.isUndefined($scope.users) || $scope.users.length === 0) {
               alert("No vendors found");
           }
        });

        $scope.removeUser = function (id) {

            var answer = confirm ("Are you sure you want to delete ?");
            if (answer)
                getUsers.removeUser(id);
            
        }

        $scope.goToVendor = function (vendorId) {
            $window.sessionStorage.vendorId = vendorId;
            $location.path("/vprofile/");
        };

        $scope.$on('$destroy', function () {
            $scope.users.$destroy();
        });


    }]);

    

    app.factory("getUsers", [
        "FBURL",
        function(FBURL) {
            var factory = {};
            factory.ref = new Firebase(FBURL + "/users");
            

        factory.removeUser = function(id){
            
            var temp ={};
            factory.userRef = new Firebase(FBURL + "/users/" + id);
            factory.vendorRef = new Firebase(FBURL + "/vendors/" + id);

            var authData = factory.ref.getAuth();

            factory.userRef.once("value",function(snap){    //grabs the user's email for alert purposes
                temp = snap.val().email;
            });
            
            var onComplete = function(error) {  // gives notification if successful
                
            if (error) {
                alert('Error in deleting vendor');
                } else {
                    alert('Vendor '+ temp +' has been deleted!');
                }
            };
                // this is using a different function to delete, but does the same thing as remove({})
                factory.userRef.remove(onComplete);
                // also remove the vendor from vendors table
                factory.vendorRef.remove(onComplete);
            }
           
           return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/avendors', {
            templateUrl: 'avendors/avendors.html',
            controller: 'avendorsCtrl'
        });
    }]);

})(angular);