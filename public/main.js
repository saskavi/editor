/** @jsx React.DOM */

var React = require('react');
var RB = require('react-bootstrap');

var Camera = require('./ui/camera');
var Editor = require('./ui/editor');

var Button = RB.Button,
  Input = RB.Input,
  Grid = RB.Grid,
  Row = RB.Row,
  Col = RB.Col;

// Call XirSys ICE servers
var $ = require('jquery');

var getNetConfig = function(cb) {
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
      cb(null, data.d);
    },
    async: false
  });
};



var makePeer = function(name, config) {
  var peer = window.peer = new Peer(name, {
    host: 'p2p.saskavi.com',
    port: 9000,
    key: 'saskavi',
    path: "/",
    debug: 3,
    config: config
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
        callback(null, localMediaStream);
      },
      function(err) {
        console.log("The following error occured: " + err);
      }
    );
  } else {
    console.log("getUserMedia not supported");
  }
}



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
    getNetConfig(function(err, config) {
      getMediaStream(function(err, stream) {
        var peer = makePeer(self.state.name, config);
        window.peer = peer;
        self.setState({
          localStream: stream,
          'peer': peer
        });

        peer.on('open', function(id) {
          console.log(id);
        });

        peer.on('call', function(call) {
          console.log("GOT CALL", call);
          console.log("STREAM", stream);
          call.answer(stream);
          call.on('stream', function(s) {
            console.log("GOT RESPONSE STREAM", s);
            self.addStream(s);
          });
        });
      });
    });
  },

  addStream: function(s) {
    this.setState({
      streams: this.state.streams.concat([s])
    });
  },

  onKey: function(e) {
    var k = e.keyCode || e.which;
    if (k === 13) {
      this.setState({
        name: this.refs.name.getValue()
      });
    }
  },

  onKeyWho: function(e) {
    var k = e.keyCode || e.which;
    var self = this;

    if (k === 13) {
      var name = this.refs.name.getValue();
      var call = this.state.peer.call(name, this.state.localStream);

      call.on('stream', function(s) {
        self.addStream(s);
      });
    }
  },


  render: function() {
    if (this.state.localStream === 0) {
      return (<h1>Initializing...</h1>);
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
      return <Camera stream={s} offset={i} />;
    });

    return <div>
          <Editor/>
          { cameras }
          <div className="call-who">
              <Input type="text"
                  ref="name"
                  style={{marginTop: "10px", textAlign: 'center'}}
                  onKeyPress={this.onKeyWho}
                  placeholder="call who?" className="form-control" autoFocus />
          </div>

          <Camera stream={this.state.localStream} self={true} />
      </div>;
  }
});

React.renderComponent(<Workspace></Workspace>, document.body);