angular.module('app')
.controller("studentCtrl", function(Auth, currentAuth, $state, $rootScope, $scope, $firebaseObject, $firebaseArray, $timeout, $window) {

  $scope.classID = $state.params.classID;

  var userRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}`);
  var user = $firebaseObject(userRef);
  user.$bindTo($scope, 'user');

  var classroomRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}`);
  var classroom = $firebaseObject(classroomRef);
  classroom.$bindTo($scope, 'classroom');

  // remove student if teacher ends the class;
  var classroomsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms`);
  classroomsRef.on('child_removed', function(removedClassroom){
    if (removedClassroom.key() === $state.params.classID) {
      $scope.user.helpee = false;
      $scope.user.helper = false;
      $scope.user.class = null;
      $state.go('home');
    }
  });

  var studentsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/students`);
  $scope.students = $firebaseArray(studentsRef);

  var chatroomsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/chatrooms`);
  $scope.chatrooms = $firebaseArray(chatroomsRef);

  // display help button
  chatroomsRef.on('value', function(snap){
    if (!snap.val()){
      $scope.displayHelp = false;
    }
    snap.forEach(function(child){
      if (!child.val().helper){
        $scope.displayHelp = true;
        return true;
      }
      $scope.displayHelp = false;
    })
  })


  $scope.needHelp = function(){
    // create new chatroom for user
    if (!$scope.user || !$scope.chatrooms) {
      return;
    }

    $scope.chatrooms.$add({ helpee: currentAuth.uid }).then(function(chat){
      var chatID = chat.key();
      $scope.user.helpee = chatID;

      // update students list in class for viz
      var index = $scope.students.$indexFor($scope.user.class.key);
      $scope.students.$getRecord($scope.user.class.key).helpee = chatID;
      $scope.students.$save(index);

      $state.go('chatroom-helpee', {classID: $state.params.classID, chatID: chatID});
    })
  }

  $scope.helpSomeone = function(){
    // join chatroom of user that needs help
    chatroomsRef.once('value', function(chatrooms){

      chatrooms.forEach(function(chatroom){
        // find any chatroom with no helper
        if (!chatroom.val().helper){
          var index = $scope.chatrooms.$indexFor(chatroom.key())

          $scope.chatrooms[index].helper = currentAuth.uid;
          $scope.chatrooms.$save(index);

          $scope.user.helper = {
            helping: $scope.chatrooms[index].helpee,
            chatID: chatroom.key()
          }

          // update students list in class for viz
          var studentsIndex = $scope.students.$indexFor($scope.user.class.key);
          $scope.students.$getRecord($scope.user.class.key).helper = {
            helping: $scope.chatrooms[index].helpee,
            chatID: chatroom.key()
          }
          $scope.students.$save(studentsIndex);

          $state.go('chatroom-helper', {classID: $state.params.classID, chatID: chatroom.key()});
          return true;
        }
      })
    })
  }

  $scope.leaveClass = function(){
    $scope.students.$remove($scope.students.$getRecord($scope.user.class.key));
    $scope.user.class = null;
    $state.go('home');
  }

  $scope.logout = function(){
    $scope.students.$remove($scope.students.$getRecord($scope.user.class.key));
    $scope.user.class = null;
    $timeout(function(){
      Auth.$unauth();
      $state.go('splash');
    },200)
  }

  $scope.needHelpButton = {}

  function updateSize(){
    var width = $window.innerWidth;
    var height = $window.innerHeight;

    $scope.needHelpButton.width = width > height ? Math.round(height*0.5) + 'px' : Math.round(width*0.7)+ 'px';
    $scope.needHelpButton.margin = width > height ? Math.round(height*0.05) + 'px' : Math.round(width*0.05)+ 'px';
  }
  updateSize();
  // angular.element($window).bind('resize', updateSize);
  angular.element($window).bind('orientationchange', updateSize);

});
