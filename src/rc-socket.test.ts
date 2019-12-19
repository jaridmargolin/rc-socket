'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import _ from 'lodash'
import chai from 'chai'
import sinon from 'sinon'
import axios from 'axios'
import waitFor from 'p-wait-for'
import delay from 'delay'

// lib
import RcSocket, { RcSocketReadyState } from '../src/rc-socket'

// Note: sidestep commonjs namedExports configuration
const { times } = _
const { assert } = chai
const { spy } = sinon

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

const WS_URL = 'ws://localhost:9996/'
const API_URL = 'http://localhost:9997/'

const api = axios.create({ baseURL: API_URL })
const unblockServer = () => api.post('/unblock')
const blockServer = () => api.post('/block')

/* -----------------------------------------------------------------------------
 * tests
 * -------------------------------------------------------------------------- */

describe('rc-socket', function() {
  this.timeout(10000)

  it('Should connect to socket', async () => {
    const ws = new RcSocket(WS_URL)

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)
    await ws.close()
  })

  it('Should retry connection until socket is available', async () => {
    await blockServer()

    const ws = new RcSocket(WS_URL)
    const connectingSpy = (ws.onconnecting = spy())

    await delay(500)
    await unblockServer()
    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)

    assert.equal(connectingSpy.callCount, 2)
    assert.isNumber(ws['_ws'] && ws['_ws'].id)

    await ws.close()
  })

  it('Should close and reconnect socket on reboot', async () => {
    const ws = new RcSocket(WS_URL)

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)

    const closeSpy = (ws.onclose = spy())
    const openSpy = (ws.onopen = spy())
    ws.reboot()

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)

    assert.ok(closeSpy.notCalled)
    assert.ok(openSpy.called)
  })

  it('Should queue & send messages upon succesfull connection', async () => {
    await blockServer()

    const ws = new RcSocket(WS_URL)
    const sendSpy = spy(ws, <any>'_sendPayload')
    ws.onmessage = spy()

    times(2, () => ws.send({ msg: 'test' }))

    await delay(500)
    assert.equal(sendSpy.callCount, 0)

    await unblockServer()
    await waitFor(() => sendSpy.callCount === 2)
    await waitFor(() => sendSpy.callCount === 2)

    sendSpy.restore()
  })

  it('Should retry if Websocket close method is called', async () => {
    const ws = new RcSocket(WS_URL)

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)
    ws['_ws'] && ws['_ws'].close()
    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)
  })

  it('Should force close if RcSocket close method is called', async () => {
    const ws = new RcSocket(WS_URL)

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)
    ws.close()
    await waitFor(() => ws.readyState === RcSocketReadyState.CLOSED)
  })

  it('Should silently kill the socket', async () => {
    const ws = new RcSocket(WS_URL)

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)
    ws.kill()

    assert.notOk(ws['_ws'])
  })

  it('Should reset socket to its initial state', async () => {
    const ws = new RcSocket(WS_URL)
    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)
    const rawWs = ws['_ws'] as WebSocket

    ws.reset()

    assert.equal(ws.readyState, RcSocketReadyState.CONNECTING)
    assert.isNull(rawWs.onopen)
    assert.isNull(rawWs.onclose)
    assert.isNull(rawWs.onmessage)
    assert.isNull(rawWs.onerror)
    assert.isNull(ws['_ws'])
    assert.isNull(ws['_connectTimer'])
    assert.isNull(ws['_closeType'])
    assert.equal(ws['_attempts'], 1)
  })

  it('Should support closing and re-opening the socket', async () => {
    const ws = new RcSocket(WS_URL)
    const messageSpy = (ws.onmessage = spy())

    await waitFor(() => ws.readyState === RcSocketReadyState.OPEN)

    ws.close()
    ws.open()
    ws.send({ msg: 'test' })

    await waitFor(() => messageSpy.called)
  })
})
