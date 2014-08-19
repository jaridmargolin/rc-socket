rc-socket [![Build Status](https://travis-ci.org/firstopinion/rc-socket.js.png)](https://travis-ci.org/firstopinion/rc-socket.js)
============

A more robust WebSocket interface.

* Automatically handles reconnection using exponential backoff algorithm.
* Queues messages sent while socket is closed.
* Configurable logging.



## Usage

Identical API to websockets with a few extra bells and whistles.

**Example:**

```
var ws = new RcSocket(ws://host);

ws.debug    = false;
ws.timeout  = 2500;
ws.maxRetry = 1000;
ws.logger   = console.debug;
  
ws.onopen = function () {};
ws.onclose = function () {};
ws.onerror = function () {};
ws.onconnecting = function () {};
```



## TESTS

**Install Dependencies**

```
npm install
```

**Run/View**

```
npm test
```



## License

The MIT License (MIT) Copyright (c) 2014 First Opinion

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.