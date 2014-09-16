/** @jsx React.DOM */

var request = require('superagent');
var React = require('react');
var CodeMirror = require('code-mirror/mode/htmlmixed');

var Camera = require('./Camera');

var Editor = React.createClass({
  getInitialState: function() {
    return {
      'value': 'print(hello world)'
    }
  },

  componentDidMount: function() {
    this.cm = CodeMirror(this.refs.editor.getDOMNode(), {
      value: this.state.value
    });
    this.cm.on("change", function() {
      console.log(arguments)
    });
  },

  render: function() {
    return <div ref="editor" class="editor"></div>;
  }
});



var Workspace = React.createClass({
  render: function() {
    return <div><Editor/><Camera/></div>
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