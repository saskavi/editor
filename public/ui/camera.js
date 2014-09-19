/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({

    componentDidMount: function() {
        console.log(this.refs);
        this.refs.video.getDOMNode().play();
    },

    render: function() {
        var cls = this.props.self ? "self-video" : "";
        var style = {"top":  (100 + this.props.index * 200) + "px"};
        var src = window.URL.createObjectURL(this.props.stream);
        return <video ref="video" src={src} className={cls} style={style} />;
    }

});