angular.module('app')

.controller("splashCtrl", function($cordovaOauth, Auth, currentAuth, $state, $scope, $firebaseObject, $ionicModal, $ionicNavBarDelegate) {

  if (currentAuth){
    $state.go('home');
  }

  var usersRef = new Firebase('https://getitgotit.firebaseio.com/users')
  var users = $firebaseObject(usersRef);


  $scope.loginWithFacebook = function(){
    console.log('loggin in facebook');

    $cordovaOauth.facebook('1554219404895973', ["email"]).then(function(result) {
      Auth.$authWithOAuthToken("facebook", result.access_token).then(function(authData) {
        return $state.go('home');
      }, function(error) {
        console.error("ERROR: " + error);
      });
    }, function(error) {
    console.log("ERROR: " + error);
  });

    //
    // Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
    //   console.log('logged in facebook', authData);
    //   return $state.go('home');
    // }).catch(function(error) {
    //   console.log(error);
    //   if (error.code === "TRANSPORT_UNAVAILABLE") {
    //     Auth.$authWithOAuthPopup("facebook").then(function(authData) {
  //       // User successfully logged in.
    //       return $state.go('home');
    //     }).catch(function(error){
    //       console.log(error);
    //     });
    //   } else {
    //     // Another error occurred
    //     console.log(error);
    //   }
    // });

  }

  $scope.loginWithEmail = function(user){
    $scope.loggingIn = true;
    Auth.$authWithPassword(user).then(function(authData) {
      $scope.closeModal();
      return $state.go('home');
    }).catch(function(error) {
      if (error == 'Error: The specified user does not exist.'){
        // user does not exist - create a new user
        signUpWithEmail(user);
        return;
      }
      console.log(error);
    });
  }


  var signUpWithEmail = function(user){
    Auth.$createUser(user).then(function(userData) {
      return Auth.$authWithPassword(user);
    }).then(function(authData) {
      $scope.closeModal();
      return $state.go('home');
    }).catch(function(error) {
      console.log(error);
    });
  }

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

});
