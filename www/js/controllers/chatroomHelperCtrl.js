angular.module('app')
.controller("chatroomHelperCtrl", function(Auth, currentAuth, $state, $scope, $firebaseObject, $firebaseArray) {

  // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/bluecircle.ico");

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
  $scope.messages.$loaded().then(function(){
    $scope.messages.$add({
      text: `** User ${$scope.user.$id.slice(-10)} has joined the chat **`,
      sender: 'admin',
      time: Date.now()
    })
  })


  $scope.displayMessage = function(message){
    if (message.sender == 'admin'){
      return `--- Begin Chat --- `;
    } else {
      return `${message.sender === user.$id ? 'Me' : 'User ' + message.sender.slice(-10)}: ${message.text}`
    }
  }

  $scope.checkEnter = function(e){
    if (e.which === 13){
      $scope.addMessage()
    }
  }

  $scope.newMessage = {};
  $scope.addMessage = function() {
    if (!$scope.newMessage.text || !$scope.user) return;
    $scope.messages.$add({
      text: $scope.newMessage.text,
      sender: $scope.user.$id,
      time: Date.now()
    });
    $scope.newMessage.text = '';
  };


  var classroomsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms`);

  // if helpee closes the chat, send to home
  var chatroomsRef = new Firebase(`https://getitgotit.firebaseio.com/classrooms/${$state.params.classID}/chatrooms`);
  chatroomsRef.on('child_removed', function(chatroom){
    // if teacher ends the class - special case of child_removed, send student to home;
    classroomsRef.once('value', function(classrooms){
      // case 1) classroom still exists && the removed chatroom is current chatroom
      if (classrooms.hasChild($state.params.classID) && (chatroom.key() === $state.params.chatID)){
        $scope.loading = true;
        // update students list in class for viz
        var index = $scope.students.$indexFor($scope.user.class.key);
        $scope.user.helper = false;
        // helper successfully helped - added 5 points;
        $scope.user.points = $scope.user.points + 5;
        $scope.students.$getRecord($scope.user.class.key).points = $scope.students.$getRecord($scope.user.class.key).points  + 5
        $scope.students.$getRecord($scope.user.class.key).helper = false;

        $scope.students.$save(index);

        // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");

        $state.go('student-classroom', {classID: $state.params.classID})

      } else if (!classrooms.hasChild($state.params.classID)) {   // case 2) classroom has been removed
        $scope.loading = true;
        $scope.user.helpee = false;
        $scope.user.helper = false;
        $scope.user.class = null;

        // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");

        $state.go('home');
      }
    });
  });

  $scope.backToClass = function(){
    $scope.loading = true;

    $scope.messages.$add({
      text: `** User ${$scope.user.$id.slice(-10)} has left the chat **`,
      sender: 'admin',
      time: Date.now()
    }).then(function(ref){
      $scope.chatroom.helper = null;
      $scope.user.helper = false;

      // update students list in class for viz
      var index = $scope.students.$indexFor($scope.user.class.key);
      $scope.students.$getRecord($scope.user.class.key).helper = false;
      $scope.students.$save(index);

      // document.querySelectorAll("link[rel*='icon'")[0].setAttribute('href', "assets/greencircle.ico");

      $state.go('student-classroom', {classID: $state.params.classID})
    })

  }

});
