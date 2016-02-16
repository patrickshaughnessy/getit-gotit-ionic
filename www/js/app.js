'use strict';

angular.module('app', ['ionic', 'firebase', 'naif.base64'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  // $httpProvider.defaults.useXDomain = true;
  //
  // delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('splash', {
      url: "/",
      templateUrl: "./partials/splash.html",
      controller: "splashCtrl",
      resolve: {
        // controller will not be loaded until $waitForAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $waitForAuth returns a promise so the resolve waits for it to complete
          return Auth.$waitForAuth();
        }]
      }
    })
    .state('home', {
      url: "/home",
      templateUrl: "partials/home.html",
      controller: "homeCtrl",
      resolve: {
        // controller will not be loaded until $requireAuth resolves
        // Auth refers to our $firebaseAuth wrapper in the example above
        "currentAuth": ["Auth", function(Auth) {
          // $requireAuth returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          return Auth.$requireAuth();
        }]
      }
    })
    // .state('teacher-classroom', {
    //   url: "/teacher-classroom/:classID",
    //   templateUrl: "partials/teacher-classroom.html",
    //   controller: "teacherCtrl",
    //   resolve: {
    //     "currentAuth": ["Auth", function(Auth) {
    //       return Auth.$requireAuth();
    //     }]
    //   }
    // })
    // .state('student-classroom', {
    //   url: "/student-classroom/:classID",
    //   templateUrl: "partials/student-classroom.html",
    //   controller: "studentCtrl",
    //   params: {
    //     studentKey: null
    //   },
    //   resolve: {
    //     "currentAuth": ["Auth", function(Auth) {
    //       return Auth.$requireAuth();
    //     }]
    //   }
    // })
    // .state('chatroom-helpee', {
    //   url: "/student-classroom/:classID/chatroom-helpee/:chatID",
    //   templateUrl: "partials/chatroom-helpee.html",
    //   controller: "chatroomHelpeeCtrl",
    //   resolve: {
    //     "currentAuth": ["Auth", function(Auth) {
    //       return Auth.$requireAuth();
    //     }]
    //   }
    // })
    // .state('chatroom-helper', {
    //   url: "/student-classroom/:classID/chatroom-helper/:chatID",
    //   templateUrl: "partials/chatroom-helper.html",
    //   controller: "chatroomHelperCtrl",
    //   resolve: {
    //     "currentAuth": ["Auth", function(Auth) {
    //       return Auth.$requireAuth();
    //     }]
    //   }
    // })
    .state('profile', {
      url: "/profile",
      templateUrl: "partials/profile.html",
      controller: "profileCtrl",
      resolve: {
        "currentAuth": ["Auth", function(Auth) {
          return Auth.$requireAuth();
        }]
      }
    })
    // .state('teacher-stats', {
    //   url: "/stats",
    //   templateUrl: "partials/teacher-stats.html",
    //   controller: "statsCtrl",
    //   resolve: {
    //     "currentAuth": ["Auth", function(Auth) {
    //       return Auth.$requireAuth();
    //     }]
    //   }
    // })

})

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("splash");
    }
  });

})
