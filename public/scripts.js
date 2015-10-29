console.log('sanity check: client-side js loaded');

var socket = null;
// var socket = io();

$(document).ready(function() {
  $('a#connect').on('click', function(e){
    e.preventDefault();
    socket = socket || io();
    // logging the socket id, but with a delay to give the connection time
    setTimeout(function(){ console.log(socket.id); }, 500);

    // set up socket to listen for chat messages    
    socket.on('chat message', function(msg){
      $('#messages').prepend($('<li>').text(msg));
    });

  });


  $('form#chat').submit(function(e){
    console.log("submitted");
    e.preventDefault();
    // grab the input field data
    var newMessage = $('input#message').val();
    if (socket){
      // send the chat message as data - socket.io allows json or strings
      console.log('emitting new chat message');
      socket.emit('new chat message', newMessage);
      // clear the input field
      $('input#message').val('');
    } else {
      alert('cannot send - click Connect to establish chat connection')
    }
    // another way to prevent default behavior (left here because it's in socket.io docs -- not needed!) @TODO check
    return false;
  });


  // $('#signup-form').on('submit', function(e) {
  //   e.preventDefault();

  //   // select the form and serialize its data
  //   var signupData = $("#signup-form").serialize();
  //   console.log(signupData);
  //   // send POST request to /users with the form data
  //   $.post('/users', signupData, function(response) {
  //     console.log(response);
  //   });
  // });

  // $('#login-form').on('submit', function(e) {
  //   e.preventDefault();

  //   // select the form and serialize its data
  //   // note: this is the form because the event handler
  //   //   was triggered from the form
  //   var loginData = $(this).serialize();
  //   // send POST request to /login with the form data
  //   $.post('/login', loginData, function(response) {
  //     console.log(response);
  //   });
  // });

});
