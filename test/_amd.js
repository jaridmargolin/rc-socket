/*!
 * test/_umd.js
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

describe('umd - rc-socket.js', function () {

  it('Should create a new instance.', function () {
    var connectStub = sinon.stub(RcSocket.prototype, '_connect');

    var socket = new RcSocket();
    assert.isInstanceOf(socket, RcSocket);
  });

});


});