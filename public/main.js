/** @jsx React.DOM */

var request = require('superagent');
var React = require('react');
var CodeMirror = require('code-mirror/mode/htmlmixed');

var Camera = require('./Camera');

var makePeer = function() {
    var peer = window.peer = new Peer({
        host: 'p2p.saskavi.com',
        port: 9000,
        key: 'saskavi',
        debug: 3,
        config: customConfig
    });

    return peer;
};

function getMediaStream(callback) {
  navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
  if (navigator.getUserMedia) {
    navigator.getUserMedia({
        video: true,
        audio: true
      },
      function(localMediaStream) {
        callback(null, window.URL.createObjectURL(localMediaStream));

      },
      function(err) {
        console.log("The following error occured: " + err);
      }
    );
  } else {
    console.log("getUserMedia not supported");
  }
}



var Editor = React.createClass({
  getInitialState: function() {
    return {
      'value': 'print(hello world)',
    }
  },

  componentDidMount: function() {
      var self = this;

      this.cm = CodeMirror(this.refs.editor.getDOMNode(), {
          value: this.state.value
      });
      this.cm.on("change", function(cm) {
          self.setState({'value': cm.getValue()});
      });
  },

  render: function() {
      return <div ref="editor" class="editor"></div> ;
  }
});


var Workspace = React.createClass({
    getInitialState: function() {
        return {
            'streams': [],
            'peer': null,
            'conns': []
        };
    },

    componentDidMount: function() {
        var self = this;
        getMediaStream(function(err, stream) {
            var peer = makePeer();
            window.peer = peer;
            self.setState({streams: self.state.streams.concat([stream]), 'peer': peer});

            peer.on('call', function(call) {
                call.answer(localstream);
                call.on('stream', function(stream) {
                    console.log("got stream");
                    self.setState({streams: self.state.streams.concat([stream])});
                });
            });
        });
    },

  render: function() {
      if (this.state.streams.length === 0) {
          return <h1>Initializing ...</h1> ;
      }

      var cameras = this.state.streams.map(function(s, i) {
          return <Camera stream={s} offset={i} /> ;
      });

      return <div>
          <Editor/>
          { cameras }
      </div> ;
  }
});



React.renderComponent(<Workspace></Workspace>, document.body);



var $ = require('jquery');



// Call XirSys ICE servers
$.ajax({
  type: "POST",
  dataType: "json",
  url: "https://api.xirsys.com/getIceServers",
  data: {
    ident: "hansent",
    secret: "5ce59fc8-8f88-4af0-96d9-64c263aecdbf",
    domain: "saskavi.com",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function(data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});


window.peer = new Peer({
  host: 'p2p.saskavi.com',
  port: 9000,
  key: 'saskavi',
  debug: 3,
  config: customConfig
});

peer.on('connection', function(conn) {
  conn.on('data', function(data) {
    console.log("RCV", data);
  });
});
