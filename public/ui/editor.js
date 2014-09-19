/** @jsx React.DOM */

var React = require('react');
var CodeMirror = require('code-mirror/mode/htmlmixed');

module.exports = React.createClass({

  getInitialState: function() {
    return { 'value': '' };
  },

  componentDidMount: function() {
    var self = this;
    var node = this.refs.editor.getDOMNode();
    this.cm = CodeMirror(node, {value: this.state.value});
    this.cm.on("change", function(cm) {
      self.setState({'value': cm.getValue()});
    });
  },

  render: function() {
    return <div ref="editor" class="editor"></div>;
  }

});