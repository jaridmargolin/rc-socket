/*!
 * test/rc-socket.js
 * 
 * Copyright (c) 2014
 */

define([
  'jquery',
  'async',
  'proclaim',
  'rc-socket'
], function ($, async, assert, RcSocket) {


/* -----------------------------------------------------------------------------
 * reusable
 * ---------------------------------------------------------------------------*/

// Env vars
var socketUrl = 'ws://localhost:9998/',
    apiUrl    = 'http://localhost:9997/';

// My socket yo!
var ws;


/* -----------------------------------------------------------------------------
 * helpers
 * ---------------------------------------------------------------------------*/

// Helper method around ajax to make compatible with
// node style err success callbacks
var command = function (endpoint, done) {
  $.ajax(apiUrl + endpoint, {
    type: 'POST'
  }).done(function (data, textStatus, jqXHR) {
    done(data);
  }).fail(function (jqXHR, testStatus, err) {
    done(err);
  });
};

// Start socket
var startSocket = function (done) {
  command('socket/start', done);
};

// Start socket
var cleanUp = function (done) {
  ws.close();
  command('socket/stop', done);
};

// Connect to socket
var connectToSocket = function (done) {
  ws = new RcSocket(socketUrl);
  done();
};

// Assert connected
var assertConnected = function (done) {
  // DUCK PUNCH!....DUCK PUNCH!....DUCK PUNCH DUCK PUNCH DUCK PUNCH
  var onopen = ws.onopen;
  ws.onopen = function () {
    if (onopen) { onopen.apply(ws, arguments); }
    ws.onopen = onopen;
    done();

  };
};

// Assert closed
var assertClosed = function (done) {
  assert.equal(ws.readyState, WebSocket['CLOSED']);
  done();
};

// Little helper method that returns a function to use with
// async library. The returned fn will pause async flow for a specified time.
var wait = function (time) {
  return function (done) {
    setTimeout(done, time);
  };
};


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('RcSocket', function () {

  this.timeout(10000);

  it('Should connect to socket.', function (done) {
    // Run
    async.series([
      startSocket,
      connectToSocket,
      assertConnected,
      cleanUp
    ], done);
  });

  it('Should retry connection until socket is available.', function (done) {
    // Populate with triggered events
    var count = 0;

    // Set event handlers to toggle triggers object
    var addCountSpy = function (done) {
      ws.onconnecting = function () { count++; };
      done();
    };

    // Very events were all called
    var verifyCount = function (done) {
      assert.equal(count, 2);
      done();
    };

    // verify id was added to raw socket
    var verifyId = function (done) {
      assert.isNumber(ws.ws.id);
      done();
    };

    // Run
    async.series([
      connectToSocket,
      addCountSpy,
      wait(500),
      startSocket,
      assertConnected,
      verifyCount,
      verifyId,
      cleanUp
    ], done);
  });

  it('Should close and reconnect socket on refresh.', function (done) {
    var triggers = {};

    // Call refresh method of socket
    var refreshSocket = function (done) {
      ws.refresh();
      done();
    };

    // Toggle when events are called.
    var addExecutionSpies = function (done) {
      ws.onclose = function () {
        triggers.onclose = true;
      };
      ws.onopen = function () {
        triggers.onopen = true;
      };
      done();
    };

    // Verify close and open were called.
    var verifyExecution = function (done) {
      assert.ok(triggers.onclose);
      assert.ok(triggers.onopen);
      done();
    };

    // Run
    async.series([
      startSocket,
      connectToSocket,
      assertConnected,
      addExecutionSpies,
      refreshSocket,
      assertConnected,
      verifyExecution,
      cleanUp
    ], done);
  });

  it('Should queue & send messages upon succesfull connection.', function (done) {
    // Populate with triggered events
    var count = 0;

    // Very events were all called
    var sendMessages = function (done) {
      ws.send('test');
      ws.send('test');
      done();
    };

    // Make sure we get 2 messages back after sent from queue
    var assertReciepts = function (done) {
      ws.onmessage = function () {
        count ++;
        if (count = 2) {
          done();
        }
      };
    };

    // Run
    async.series([
      connectToSocket,
      sendMessages,
      wait(500),
      startSocket,
      assertConnected,
      assertReciepts,
      cleanUp
    ], done);
  });

  it('Should retry if WebSocket close method is called.', function (done) {
    // Trigger ws close event
    var triggerClose = function (done) {
      ws.ws.close();
      done();
    };

    // Run
    async.series([
      startSocket,
      connectToSocket,
      assertConnected,
      triggerClose,
      assertConnected,
      cleanUp
    ], done);
  });

  it('Should force close if RcSocket close method is called.', function (done) {
    var closeSocket = function (done) {
      ws.close();
      ws.onclose = function (evt) {
        assert.isTrue(evt.forced);
        done();
      };
    };

    // Run
    async.series([
      startSocket,
      connectToSocket,
      assertConnected,
      closeSocket,
      assertClosed,
      cleanUp
    ], done);
  });

  it('Should call close if forced is true and WebSocket onopen handler is called.', function (done) {
    var setForced = function (done) {
      ws.wasForced = true;
      done();
    };

    var callOnopen = function (done) {
      ws.ws.onopen();
      done();
    };

    var assertClosed = function (done) {
      ws.onclose = function () {
        assert.equal(ws.readyState, WebSocket['CLOSED']);
        done();
      };
    };

    // Run
    async.series([
      startSocket,
      connectToSocket,
      assertConnected,
      setForced,
      callOnopen,
      assertClosed,
      cleanUp
    ], done);
  });

});


});