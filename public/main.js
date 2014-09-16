/** @jsx React.DOM */

var request = require('superagent');
var React = require('react');
var CodeMirror = require('code-mirror/mode/htmlmixed');

var RB = require('react-bootstrap');

var Camera = require('./Camera');

var Button = RB.Button,
    Input = RB.Input,
    Grid = RB.Grid,
    Row = RB.Row,
    Col = RB.Col;


var makePeer = function(name) {
    var peer = window.peer = new Peer(name, {
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
            'localStream': null,
            'streams': [],
            'peer': null,
            'conns': [],
            'name': ''
        };
    },

    componentDidMount: function() {
        var self = this;
        getMediaStream(function(err, stream) {
            var peer = makePeer(self.state.name);
            window.peer = peer;
            self.setState({localStream: stream, 'peer': peer});

            peer.on('call', function(call) {
                call.answer(localstream);
                call.on('stream', function(stream) {
                    console.log("got stream");
                    self.setState({streams: self.state.streams.concat([stream])});
                });
            });
        });
    },

    onKey: function(e) {
        var k = e.keyCode || e.which;
        if (k === 13) {
            this.setState({name: this.refs.name.getValue()});
        }
    },

  render: function() {
      if (this.state.localStream === 0) {
          return ( <h1>Initializing...</h1> );
      }

      if (this.state.name.length === 0) {
          return (
              <Grid>
                  <Row>
                      <Col xs={6} xsOffset={3}>
                          <Input type="text"
                              ref="name"
                              style={{marginTop: "50px", textAlign: 'center'}}
                              onKeyPress={this.onKey}
                              placeholder="what's your name?" className="form-control" autoFocus />
                      </Col>
                  </Row>
              </Grid>
          );
      }

      var cameras = this.state.streams.map(function(s, i) {
          return <Camera stream={s} offset={i} /> ;
      });

      return <div>
          <Editor/>
          { cameras }
          <Camera stream={this.state.localStream} self={true} />
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
