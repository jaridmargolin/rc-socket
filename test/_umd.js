/*!
 * test/_amd.js
 * 
 * Copyright (c) 2014
 */

define([
  'proclaim',
  'sinon',
  'rc-socket/rc-socket'
], function (assert, sinon, RcSocket) {


/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('amd - rc-socket.js', function () {

  it('Should create a new instance.', function () {
    var connectStub = sinon.stub(RcSocket.prototype, 'connect');

    var socket = new RcSocket();
    assert.isInstanceOf(socket, RcSocket);
  });

});


});