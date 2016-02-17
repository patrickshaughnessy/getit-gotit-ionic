angular.module('app')

.controller("splashCtrl", function(Auth, currentAuth, $state, $scope, $firebaseObject, $ionicModal, $ionicNavBarDelegate) {

  Auth.$onAuth(function(authData) {
  if (authData === null) {
    console.log('Not logged in yet');
  } else {
    console.log('Logged in as', authData.uid);
  }
  // This will display the user's name in our view
  $scope.authData = authData;
});

  if (currentAuth){
    $state.go('home');
  }

  var usersRef = new Firebase('https://getitgotit.firebaseio.com/users')
  var users = $firebaseObject(usersRef);

  $scope.loginWithFacebook = function(){
    $scope.loggingIn = true;
    Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
      console.log('authData', authData);
      if (!users[authData.uid]){
        users[authData.uid] = {
          name: authData.facebook.displayName,
          avatar: authData.facebook.profileImageURL,
          points: 0,
          helpee: false,
          helper: false,
          helping: null,
          teacher: false
        }
        users.$save();
      }
      return $state.go('home');
    }).catch(function(error) {
      if (error.code === "TRANSPORT_UNAVAILABLE") {
        Auth.$authWithOAuthPopup("facebook").then(function(authData) {
          // User successfully logged in.
          if (!users[authData.uid]){
            users[authData.uid] = {
              name: authData.facebook.displayName,
              avatar: authData.facebook.profileImageURL,
              points: 0,
              helpee: false,
              helper: false,
              helping: null,
              teacher: false
            }
            users.$save();
          }
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
      if (!users[authData.uid]){
        users[authData.uid] = {
          name: authData.password.email.replace(/@.*/, ''),
          avatar: 'assets/defaultPic.png',
          points: 0,
          helpee: false,
          helper: false,
          helping: null,
          teacher: false
        }
        users.$save();
      }
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
