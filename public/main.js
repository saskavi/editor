var uuid = require('uuid');
var Vue = require('vue');
var $ = require('jquery');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


function getIceServers(cb) {
  $.post("https://api.xirsys.com/getIceServers", {
      ident: "hansent",
      secret: "4c914424-c8e5-410c-87db-c62af2de9604",
      domain: "saskavi.com",
      application: "default",
      room: "default",
      secure: 1
    },
    function(data, status) {
      cb(null, data.d);
      console.log("Data: " + data + "nnStatus: " + status);
    });
}



window.APP = new Vue({
  el: "#app",
  data: {
    userid: window.location.search.substr(1),
    channel: "channel",
    connections: {},
    userMediaConfig: {
      audio: true,
      video: true
    },
    rtcConfig: {}
  },

  ready: function() {
    //this.initEditor();
    this.initUserMedia();

    $("input").focus();

    var self = this;
    getIceServers(function(err, rtcConfig) {
      self.rtcConfig = rtcConfig;
      self.initConnection();
    });
  },

  methods: {

    initEditor: function() {
      this.editor = CodeMirror(this.$el, {
        value: "console.log('hello world');}\n",
        mode: "javascript",
        theme: "base16-dark"
      });
    },

    initUserMedia: function(cb) {
      // navigator.getUserMedia(this.userMediaConfig,
      //   function(stream) {
      //     this.localStream = stream;
      //     $('.local-video').prop('src', URL.createObjectURL(stream));
      //     if (cb)
      //       cb(stream);
      //   },
      //   function(err) {
      //     console.log("Error", err);
      //   }
      // );

      navigator.getUserMedia({
        video: true,
        audio: true
      }, function(localMediaStream) {
        var video = document.querySelector('.local-video');
        video.src = window.URL.createObjectURL(localMediaStream);

        // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
        // See crbug.com/110938.
        video.onloadedmetadata = function(e) {
          // Ready to go. Do some stuff.
        };
      }, function(err) {
        console.log(err);
      });


    },

    initConnection: function() {

      var self = this;

      console.log(this.uid, this.rtcConfig);
      this.peer = new Peer(this.userid, {
        host: 'p2p.saskavi.com',
        port: 9000,
        key: 'saskavi',
        debug: 3,
        config: this.rtcConfig
      });

      console.log("PEER:", this.peer);

      this.peer.on('open', function() {
        console.log("peer connection opened");
      });

      this.peer.on('call', function(call) {
        console.log("incoming call", call);
        call.answer(self.localStream);
        call.on('stream', function(remoteStream) {
          $('.remote-video').prop('src', URL.createObjectURL(remoteStream));
        });
      });

      this.peer.on('error', function(err) {
        alert(err.message);
      });
    },


    startCall: function() {
      var self = this;
      var targetid = this.channel;

      self.call = self.peer.call(targetid, self.localStream);
      console.log("CALL", self.call);
      self.call.on('stream', function(stream) {
        $(self.$el).find('.remote-video').prop('src', URL.createObjectURL(stream));
      });
      self.call.on('close', function() {
        console.log('call closed');
      });

      ;


    }

  }

})