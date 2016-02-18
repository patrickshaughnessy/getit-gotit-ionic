angular.module('app')

.controller("splashCtrl", function($cordovaOauth, Auth, currentAuth, $state, $scope, $firebaseObject, $ionicModal, $ionicNavBarDelegate, $ionicLoading, $ionicPopup) {

  if (currentAuth){
    $state.go('home');
  }

  var usersRef = new Firebase('https://getitgotit.firebaseio.com/users')
  var users = $firebaseObject(usersRef);


  $scope.loginWithFacebook = function(){
    $ionicLoading.show({template: 'Logging in...'})
    // $cordovaOauth.facebook('1554219404895973', ["email"]).then(function(result) {
    //   return Auth.$authWithOAuthToken("facebook", result.access_token).then(function(authData) {
    //     $ionicLoading.hide();
    //     return $state.go('home');
    //   }, function(error) {
    //     console.error("ERROR: " + error);
    //     $ionicLoading.hide();
    //   });
    // }, function(error) {
    //   console.log("ERROR: " + error);
    //   $ionicLoading.hide();
    // });


    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      $ionicLoading.hide();
      return $state.go('home');
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData) {
        // User successfully logged in.
          $ionicLoading.hide()
          return $state.go('home');
        }).catch(function(error){
          $ionicLoading.hide();
          $scope.showAlert(error);
        });
      } else {
        // Another error occurred
        $ionicLoading.hide();
        $scope.showAlert(error);
      }
    });

  }

  $scope.loginWithEmail = function(user){
    $ionicLoading.show({template: 'Logging in...'})
    Auth.$authWithPassword(user).then(function(authData) {
      $scope.closeModal();
      $ionicLoading.hide();
      return $state.go('home');
    }).catch(function(error) {
      if (error == 'Error: The specified user does not exist.'){
        // user does not exist - create a new user
        signUpWithEmail(user);
        return;
      }
      $ionicLoading.hide();
      $scope.showAlert(error);
    });
  }


  var signUpWithEmail = function(user){
    Auth.$createUser(user).then(function(userData) {
      return Auth.$authWithPassword(user);
    }).then(function(authData) {
      $scope.closeModal();
      $ionicLoading.hide();
      return $state.go('home');
    }).catch(function(error) {
      $ionicLoading.hide();
      $scope.showAlert(error);
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


  $scope.showAlert = function(error) {
    var alertPopup = $ionicPopup.alert({
      title: 'Oops!',
      template: error.message
    });

    alertPopup.then(function(res) {
      // res = true; popup closed
    });
  };

});
