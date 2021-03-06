module.exports = function(RED) {
    var utils = require("../lib/utils");

    function halEvent(config) {
        RED.nodes.createNode(this,config);
        this.item = config.item;
        this.operator = config.operator;
        this.change = config.change;
        this.compareValue = config.compareValue;
        this.compareType = config.compareType;
        this.outputValue = config.outputValue;
        this.outputType = config.outputType;
        var node = this;

        node.events = RED.nodes.getNode(config.config);

        //Convert types
        var convertedCompareValue = utils.convertTo[node.compareType](node.compareValue);

        node.listener = function(event) {
            if (node.change === 'true' && event.state === event.oldState) { return; }
            if (utils.compare[node.operator](event.state,convertedCompareValue,event.oldState)){
                var msg = {};
                msg._msgid = RED.util.generateId();
                msg.topic = event.topic ? event.topic : undefined;
                msg.name = event.name;
                if (node.outputType == 'state') {
                    msg.payload = event.state;
                } else {
                    msg.payload  = RED.util.evaluateNodeProperty(node.outputValue,node.outputType,node,event);
                }
                node.send(msg);
            }
        }
            
        node.events.addListener(node.item, node.listener);
        node.on("close",function() { 
            if (node.listener) {
                node.events.removeListener(node.item, node.listener);
            }
        });
    }
    RED.nodes.registerType("event",halEvent);
}