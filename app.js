'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.security',
    'myApp.home',
    'myApp.account',
    'myApp.order',
    'myApp.thankyou',
    'myApp.orderhistory',
    'myApp.aorders',
    'myApp.ausers',
    'myApp.editorder',
    'myApp.bidboard',
    'myApp.bid',
    'myApp.orders',
    'myApp.vprofile',
    'myApp.login',
    'myApp.logout'
  ])

    .config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                redirectTo: '/home'
            }).
            otherwise({
                redirectTo: '/home'
            });
    }])

  .run(['$rootScope', '$firebaseObject', '$location', 'Auth', 'fbutil', function($rootScope, $firebaseObject, $location, Auth, fbutil) {
    // track status of authentication
    Auth.$onAuth(function(user) {
        $rootScope.loggedIn = !!user;

        if ($rootScope.loggedIn) {
            var profile = $firebaseObject(fbutil.ref('users', user.uid));
            profile.$loaded().then(function() {
                $rootScope.profileMode = profile.mode;
                $rootScope.profileName = profile.name;
                $rootScope.profileEmail = profile.email;
                profile.$destroy();
            });
        }

    });

    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $location.path("/login");
        }
    });
  }]);
