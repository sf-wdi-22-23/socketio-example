console.log('sanity check: client-side js loaded');

var socket = io();
// logging the socket id, but with a delay to give the connection time
setTimeout(function(){ console.log(socket.id); }, 500);

$(document).ready(function(){


  // set up socket to listen for chat messages    
  // in document.ready because we're selecting messages id
  socket.on('chat message', function(msg){
    // add message to fron of message list
    $('#messages').prepend($('<li>').text(msg));
  });


  $('form#chat').submit(function(e){
    console.log("submitted");
    e.preventDefault();
    // grab the input field data
    var newMessage = $('input#message').val();
    // send the chat message as data - socket.io allows json or strings
    console.log('emitting new chat message');
    socket.emit('new chat message', newMessage);
    // clear the input field
    $('input#message').val('');
    // another way to prevent default behavior (left here because it's in socket.io docs -- not needed!)
    return false;
  });

});
