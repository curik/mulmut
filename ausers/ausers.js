(function (angular) {
    "use strict";

    var app = angular.module('myApp.ausers', ['ngRoute']);

    app.controller('AUsersCtrl', ['$scope', '$location', 'fbutil','$firebaseArray', "getUsers", "FBURL",
        function($scope, $location, fbutil, $firebaseArray, getUsers, FBURL) {
          
        var ref = new Firebase(FBURL + "/users");
            var query = ref.orderByChild("mode").equalTo("customer");     // filter only customers

            $scope.users = $firebaseArray(query);

        $scope.status = "Retrieving users ...";
        
        $scope.users.$loaded().then(function() {
           if (angular.isUndefined($scope.users) || $scope.users.length === 0) {
               alert("No users found");
           }
        });

        $scope.removeUser = function (id) {

            var answer = confirm ("Are you sure you want to delete ?");
            if (answer)
                getUsers.removeUser(id);
            
        }

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
            var authData = factory.ref.getAuth();

            if (authData.uid === id){                       // prevent from deleting self
                alert ('You can NOT delete yourself!');
                return;
            }

            factory.userRef.once("value",function(snap){    //grabs the user's email for alert purposes
                temp = snap.val().email;
            });
            
            var onComplete = function(error) {  // gives notification if successful
                
            if (error) {
                alert('Error in deleting user');
                } else {
                    alert('User '+ temp +' has been deleted!');
                }
            };
                // this is using a different function to delete, but does the same thing as remove({})
                factory.userRef.remove(onComplete);
        }
            return factory;

        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/ausers', {
            templateUrl: 'ausers/ausers.html',
            controller: 'AUsersCtrl'
        });
    }]);

})(angular);