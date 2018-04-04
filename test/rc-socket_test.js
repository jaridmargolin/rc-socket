/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { times } from 'lodash'
import { assert } from 'chai'
import { spy } from 'sinon'
import axios from 'axios'

// lib
import RcSocket from '../src'

/* -----------------------------------------------------------------------------
 * utils
 * -------------------------------------------------------------------------- */

const delay = time => __ => new Promise(resolve => setTimeout(resolve, time))
const pollFor = condition => new Promise((resolve) => {
  const check = __ => setTimeout(__ => condition() ? resolve() : check(), 10)
  check()
})

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

let ws

const WS_URL = 'ws://localhost:9996/'
const API_URL = 'http://localhost:9997/'

const api = axios.create({ baseURL: API_URL })
const startServer = __ => api.post('/start')
const stopServer = __ => api.post('/stop')

const createClient = __ => Promise.resolve(ws = ws || new RcSocket(WS_URL))
const destroyClient = __ => Promise.resolve(ws && !ws.close() && (ws = null))
const closeClient = __ => Promise.resolve(ws.close())
const rebootClient = __ => Promise.resolve(ws.reboot())
const killClient = __ => Promise.resolve(ws.killSocket())
const resetClient = __ => Promise.resolve(ws.reset())

const waitUntilOpen = __ => pollFor(__ => ws && ws.readyState === 1)
const waitUntilClosed = __ => pollFor(__ => ws && ws.readyState === 3)

describe('rc-socket.js', function () {
  this.timeout(10000)

  afterEach(function () {
    return destroyClient()
      .then(stopServer)
  })

  it('Should connect to socket', function () {
    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
  })

  it('Should retry connection until socket is available', function () {
    let count = 0
    const addCountSpy = __ => (ws.onconnecting = __ => (count++))
    const verifyCount = __ => assert.equal(count, 2)
    const verifyId = __ => assert.isNumber(ws.ws.id)

    return createClient()
      .then(addCountSpy)
      .then(delay(500))
      .then(startServer)
      .then(waitUntilOpen)
      .then(verifyCount)
      .then(verifyId)
  })

  it('Should close and reconnect socket on reboot', function () {
    const events = {}
    const addCloseSpy = __ => (ws.onclose = __ => (events['onclose'] = true))
    const addOpenSpy = __ => (ws.onopen = __ => (events['onopen'] = true))
    const verifyClose = __ => assert.notOk(events.onclose)
    const verifyOpen = __ => assert.ok(events.onopen)

    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
      .then(addCloseSpy)
      .then(addOpenSpy)
      .then(rebootClient)
      .then(waitUntilOpen)
      .then(verifyClose)
      .then(verifyOpen)
  })

  it('Should queue & send messages upon succesfull connection', function () {
    const addSendSpy = __ => spy(ws, '_sendPayload')
    const addReceiveSpy = __ => (ws.onmessage = spy())
    const sendMessages = count => __ => times(count, __ => ws.send({ msg: 'test' }))
    const waitUntilSent = __ => pollFor(__ => ws._sendPayload.called)
    const assertCalled = count => __ => assert.equal(ws._sendPayload.callCount, count)
    const delayByQueueSendDelay = __ => delay(ws.queueSendDelay)()
    const waitUntilReceived = __ => pollFor(__ => ws.onmessage.callCount === 2)
    const removSendSpy = __ => ws._sendPayload.restore()

    return createClient()
      .then(addSendSpy)
      .then(addReceiveSpy)
      .then(sendMessages(2))
      .then(delay(500))
      .then(startServer)
      .then(waitUntilSent)
      .then(assertCalled(1))
      .then(delayByQueueSendDelay)
      .then(assertCalled(2))
      .then(waitUntilReceived)
      .then(removSendSpy)
  })

  it('Should retry if Websocket close method is called', function () {
    const triggerClose = __ => ws.ws.close()

    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
      .then(triggerClose)
      .then(waitUntilOpen)
  })

  it('Should force close if RcSocket close method is called', function () {
    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
      .then(closeClient)
      .then(waitUntilClosed)
  })

  it('Should close if wasForced true when onopen handler called', function () {
    const setWasForced = __ => (ws.wasForced = true)
    const callOnopen = __ => ws.ws.onopen()

    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
      .then(setWasForced)
      .then(callOnopen)
      .then(waitUntilClosed)
  })

  it('Should silently kill the socket', function () {
    const assertKilled = __ => assert.notOk(ws.ws)

    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
      .then(killClient)
      .then(assertKilled)
  })

  it('Should reset socket to its initial state', function () {
    const assertReset = (__) => {
      assert.notOk(ws.connectTimer)
      assert.isFalse(ws.hasUnloaded)
      assert.isFalse(ws.hasOpened)
      assert.isFalse(ws.wasForced)
      assert.isFalse(ws.isRetrying)
      assert.equal(ws.attempts, 1)
    }

    return startServer()
      .then(createClient)
      .then(waitUntilOpen)
      .then(resetClient)
      .then(assertReset)
  })
})
