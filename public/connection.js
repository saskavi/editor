 // Compatibility shim
 navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

 var ICE_SERVERS = {
   'iceServers': [
     {
       url: 'stun:stun.l.google.com:19302'
      } // Pass in optional STUN and TURN server for maximum network compatibility
   ]
 };


 exports.Connection = function(username) {

   // PeerJS object
   var peer = new Peer(username, {
     host: 'p2p.saskavi.com',
     port: 9000,
     key: 'saskavi',
     debug: 3,
     config: ICE_SERVERS

   });

   peer.on('open', function() {
     console.log("peer connection opened");
   });

   // Receiving a call
   peer.on('call', function(call) {
     // Answer the call automatically (instead of prompting user) for demo purposes
     console.log("incoming call", call)
     call.answer(window.localStream);

     call.on('stream', function(remoteStream) {
       $('#remote-video').prop('src', URL.createObjectURL(remoteStream));
     });

   });

   peer.on('error', function(err) {
     alert(err.message);
   });

   return peer;

 }


 // Initiate a call!
 $('call-btn').on('click', function() {
   //callPeer($('#callto-id').val());
   callPeer('test');
 });

 navigator.getUserMedia({
     audio: true,
     video: true
   },
   function(stream) {
     window.localStream = stream;
     $('#local-video').prop('src', URL.createObjectURL(stream));
   },
   function() {}
 );



 window.callPeer = function(userid) {
   var call = peer.call(userid, window.localStream);

   call.on('stream', function(stream) {
     $('#remote-video').prop('src', URL.createObjectURL(stream));
   });

   call.on('close', function() {
     console.log('call closed');
   });

 }
 }