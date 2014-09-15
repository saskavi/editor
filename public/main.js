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

    $("input").focus();

    this.initEditor();

    getIceServers(function(err, rtcConfig) {
      this.rtcConfig = rtcConfig;
      this.initConnection();

    }.bind(this));


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

      navigator.getUserMedia(this.userMediaConfig,
        function(stream) {
          this.localStream = stream;
          $(this.$el).find('.local-video').prop('src', URL.createObjectURL(stream));
          cb(stream);
        },
        function(err) {
          console.log("Error", err);
        }
      );
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
          $(self.$el).find('.remote-video').prop('src', URL.createObjectURL(remoteStream));
        });
      });

      this.peer.on('error', function(err) {
        alert(err.message);
      });
    },


    startCall: function() {
      var self = this;
      var targetid = this.channel;

      self.initUserMedia(function(localStream) {

        self.call = self.peer.call(targetid, localStream);
        console.log("CALL", self.call);
        self.call.on('stream', function(stream) {
          $(self.$el).find('.remote-video').prop('src', URL.createObjectURL(stream));
        });
        self.call.on('close', function() {
          console.log('call closed');
        });

      });


    }

  }

})