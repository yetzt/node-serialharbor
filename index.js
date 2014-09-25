#!/usr/bin/env node

var serialport = require("serialport");
var events = require("events");
var util = require("util");
var dur = require("dur");
var fs = require("fs");

function serialharbor(duration){
	
	if (!(this instanceof serialharbor)) return (new serialharbor());

	var self = this;
	
	this.devices = {};
	
	this.timer = setInterval(function(){
		self._refresh.call(self);
	}, dur(duration, 1000));
	this._refresh();
		
	return this;
	
};

util.inherits(serialharbor, events.EventEmitter);

// stop watching 
serialharbor.prototype.stop = function(){
	clearInterval(this.timer);
	return this;
};

// djb2-based hashing function
serialharbor.prototype.hash = function(str) {
	var hash = 5381;
	var i = str.length;
	while(i) hash = (hash * 33) ^ str.charCodeAt(--i);
	return (hash >>> 0).toString(26);
};

// refresh
serialharbor.prototype._refresh = function(){
	var self = this;
	serialport.list(function(err, ports){
		if (err) return; // ignore errors
		var checked = 0;
		var devices = {};
		ports.forEach(function(port){
			// ignore faux devices
			if (port.vendorId === '' || port.productId === '' || port.locationId === '') return (++checked === ports.length) ? self._handle(devices) : self;
			fs.stat(port.comName, function(err, stat){
				if (err) return (++checked === ports.length) ? self._handle(devices) : self;
				devices[self.hash([port.comName, port.vendorId, port.productId, port.locationId, stat.rdev, stat.ino].join("\t"))] = port;
				return (++checked === ports.length) ? self._handle(devices) : self;
			});
		});
	});
	return this;
};

// handle the device list
serialharbor.prototype._handle = function(devices) {
	var self = this;
	/* check for disconnected devices */
	for (id in self.devices) if (self.devices.hasOwnProperty(id) && !devices.hasOwnProperty(id)) {
		self.emit("disconnect", self.devices[id]);
		delete self.devices[id];
	};
	/* check for connected devices */
	for (id in devices) if (devices.hasOwnProperty(id) && !self.devices.hasOwnProperty(id)) {
		self.emit("connect", devices[id]);
		self.devices[id] = devices[id];
	};
	return this;
};

module.exports = serialharbor;
