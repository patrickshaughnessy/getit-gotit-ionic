angular.module('app')
.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
    var ref = new Firebase("https://getitgotit.firebaseio.com/");
    ref.onAuth(function(authData) {
      if (authData) {
        ref.child(`users/${authData.uid}`).once('value', function(snap){
          var isNewUser = !snap.exists();
          if (isNewUser){
            switch(authData.provider){
              case 'password':
                ref.child(`users/${authData.uid}`).set({
                  name: authData.password.email.replace(/@.*/, ''),
                  avatar: 'assets/defaultPic.png',
                  points: 0,
                  helpee: false,
                  helper: false,
                  helping: null,
                  teacher: false
                });
                break;
              case 'facebook':
                ref.child(`users/${authData.uid}`).set({
                  name: authData.facebook.displayName,
                  avatar: authData.facebook.profileImageURL,
                  points: 0,
                  helpee: false,
                  helper: false,
                  helping: null,
                  teacher: false
                });
                break;
            }
          }
        });
      }
    });


    // if (!$scope.users[authData.uid]){
    //   $scope.users[authData.uid] = {
    //     name: authData.password.email.replace(/@.*/, ''),
    //     avatar: 'assets/defaultPic.png',
    //     points: 0,
    //     helpee: false,
    //     helper: false,
    //     helping: null,
    //     teacher: false
    //   }
    // }

    return $firebaseAuth(ref);
  }
]);
