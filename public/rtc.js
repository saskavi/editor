var CONNECTION_QUEUE = new Firebase('https://saskavi.firebaseio.com/rtc-offers');

var ICE_SERVERS = {
  iceServers: [{
    url: 'stun:stun.l.google.com:19302'
    }]
};



exports.RTCPeerConnection = new webkitRTCPeerConnection(ICE_SERVERS);

peerConnection.onsignalingstatechange = function(state) {
  console.info('signaling state change:', state);
}
peerConnection.oniceconnectionstatechange = function(state) {
  console.info('ice connection state change:', state);
}
peerConnection.onicegatheringstatechange = function(state) {
  console.info('ice gathering state change:', state);
}


//init data channel
var dataChannel = peerConnection.createDataChannel('test');
dataChannel.onopen = function() {
  console.log("dataChannel onopened", arguments);
}

dataChannel.onmessage = function(event) {
  var data = event.data;
  console.log('RECEIVED ', data);
};

dataChannel.onclose = function() {
  console.log("data channel closed", arguments);
};


peerConnection.createOffer(function(offerSDP) {
  peerConnection.setLocalDescription(offerSDP);

  //generate a uuid answerKey refference where the other end
  //will put its answerSDP for us to find
  var signalingSessionKey = generateUUID();


  //use firebase to exchange ice candidates
  var rtcIceCandidateRef = new Firebase('https://saskavi.firebaseio.com/rtc-ice-candidates');
  var sessionIceCandidatesRef = rtcIceCandidateRef.child(signalingSessionKey);
  var clientCandidatesRef = sessionIceCandidatesRef.child("client");
  var serviceCandidatesRef = sessionIceCandidatesRef.child("service");
  peerConnection.onicecandidate = function(data) {
    if (data.candidate === null) return;
    //console.log("pushing from client candidate", data.candidate.candidate);
    clientCandidatesRef.push(data.candidate);
  }
  serviceCandidatesRef.on('child_added', function(snapshot) {
    //console.log("adding from service candidate", snapshot.val());
    var candidate = new RTCIceCandidate(snapshot.val());
    peerConnection.addIceCandidate(candidate);
  });

  // when the other end sees our offer, they will create an answer, which we get here
  var rtcAnswersRef = new Firebase('https://saskavi.firebaseio.com/rtc-answers');
  var answerRef = rtcAnswersRef.child(signalingSessionKey);
  answerRef.on('value', function(snapshot) {
    var answer = snapshot.val();
    if (answer === null) return;

    var remoteInfo = new RTCSessionDescription(answer)
    peerConnection.setRemoteDescription(remoteInfo);

  });

  // put it on the connection queue so the other side can initiate connection to us
  CONNECTION_QUEUE.push({
    signalingSessionKey: signalingSessionKey,
    offer: offerSDP
  });

}, onError);


function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};

function onError() {
  console.log("ERROR:", arguments);
}