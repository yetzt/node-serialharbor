# Serial Harbor

A small wrapper around [SerialPort](https://www.npmjs.org/package/serialport) which emits events when serial devices are connected or disconnected.

## Install

```
npm install serialharbor
```

## Usage

``` javascript

var serialharbor = require("serialharbor");

var ports = serialharbor("1s");

ports.on("connect", function(port){
	console.log("Connected", port);
});

ports.on("disconnect", function(port){
	console.log("Disconnected", port);
});

```

## Licence

[Public Domain](http://unlicense.org/UNLICENSE)