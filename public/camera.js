/** @jsx React.DOM */

var React = require('react');

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


module.exports = React.createClass({

  getInitialState: function() {
    return {
      "mediaStream": null
    };
  },

  componentDidMount: function() {
    var self = this;
    getMediaStream(function(err, stream) {
      self.setState({
          "mediaStream": stream
        },
        function() {
          self.refs.video.getDOMNode().play();
        });

    });
  },

  render: function() {
    return <video ref="video" src={this.state.mediaStream}/>;
  }
});