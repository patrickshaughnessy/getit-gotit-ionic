angular.module('app')

.controller("splashCtrl", function(Auth, currentAuth, $state, $scope, $firebaseObject, $ionicModal, $ionicNavBarDelegate) {
  console.log(currentAuth);
  if (currentAuth){
    $state.go('home');
  }

  $scope.loggingIn = false;

  var usersRef = new Firebase('https://getitgotit.firebaseio.com/users')
  var users = $firebaseObject(usersRef);


  $scope.loginWithFacebook = function(){
    $scope.loggingIn = true;
    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      return $state.go('home');
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData) {
          // User successfully logged in.
          return $state.go('home');
        }).catch(function(error){
          console.log(error);
          $scope.loggingIn = false;
        });
      } else {
        // Another error occurred
        console.log(error);
        $scope.loggingIn = false;
      }
    });

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
      $scope.loggingIn = false;
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
      $scope.loggingIn = false;
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
