/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
    componentDidMount: function() {
        console.log(this.refs);
        this.refs.video.getDOMNode().play();
    },

    render: function() {
        return <video className={this.props.self ? "self-video" : ""} ref="video" style={{top: (this.props.index * 200) + "px" }} src={this.props.stream}/>;
    }
});
