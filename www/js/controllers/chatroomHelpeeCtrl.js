angular.module('app')
.controller("chatroomHelpeeCtrl", function(Auth, currentAuth, $state, $scope, $firebaseObject, $firebaseArray, $location, $anchorScroll) {

  // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/redcircle.ico");

  var usersRef = new Firebase(`https://getitgotit.firebaseio.com/users`);
  var users = $firebaseObject(usersRef);
  users.$bindTo($scope, 'users');

  var studentsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/students`);
  $scope.students = $firebaseArray(studentsRef);

  var userRef = new Firebase(`https://getitgotit.firebaseio.com/users/${currentAuth.uid}`);
  var user = $firebaseObject(userRef);
  user.$bindTo($scope, 'user');

  var chatroomRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/chatrooms/${$state.params.chatID}`);
  var chatroom = $firebaseObject(chatroomRef);
  chatroom.$bindTo($scope, 'chatroom');

  var messagesRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/chatrooms/${$state.params.chatID}/messages`);
  $scope.messages = $firebaseArray(messagesRef);


  $scope.checkEnter = function(e){
    if (e.which === 13){
      $scope.addMessage()
    }
  }

  $scope.displayMessage = function(message){

    if (message.sender == 'admin'){
      return `${message.text}`;
    } else {
      return `${message.sender === user.$id ? 'Me' : 'User ' + message.sender.slice(-10)}: ${message.text}`
    }

  }

  $scope.addMessage = function() {
    $scope.loading = true;
    if (!$scope.newMessageText) return;
    $scope.messages.$add({
      text: $scope.newMessageText,
      sender: $scope.user.$id
    });
    $scope.newMessageText = '';
    $scope.loading = false;
  };

  // remove student if teacher ends the class;
  var classroomsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms`);
  classroomsRef.on('child_removed', function(removedClassroom){
    if (removedClassroom.key() === $state.params.classID) {
      $scope.user.helpee = false;
      $scope.user.helper = false;
      $scope.user.class = null;

      // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");

      $state.go('home');
    }
  });

  $scope.backToClass = function(){
    $scope.loading = true;

    // update students list in class for viz
    var index = $scope.students.$indexFor($scope.user.class.key);
    $scope.students.$getRecord($scope.user.class.key).helpee = false;
    $scope.user.helpee = false;

    // add points to helpee if helper present;
    if ($scope.chatroom.helper){
      $scope.user.points = $scope.user.points + 1;
      $scope.students.$getRecord($scope.user.class.key).points = $scope.students.$getRecord($scope.user.class.key).points + 1;
    };
    $scope.students.$save(index);

    chatroom.$remove();

    // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");

    $state.go('student-classroom', {classID: $state.params.classID})
  }

});
