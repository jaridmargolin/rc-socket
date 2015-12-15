/*!
 * test/launch.js
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// Core
var spawn = require('child_process').spawn,
    path  = require('path');

/* -----------------------------------------------------------------------------
 * setup
 * ---------------------------------------------------------------------------*/

var webdriver = require('selenium-webdriver');
var Q = require('q');

/* -----------------------------------------------------------------------------
 * reusable
 * ---------------------------------------------------------------------------*/

var buildDriver = function () {
    if (process.env.SAUCE_USERNAME !== undefined) {
        driver = new webdriver.Builder()
            .usingServer('http://' +
                process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY +
                '@ondemand.saucelabs.com:80/wd/hub'
            )
            .withCapabilities({
                'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
                build: process.env.TRAVIS_BUILD_NUMBER,
                username: process.env.SAUCE_USERNAME,
                accessKey: process.env.SAUCE_ACCESS_KEY,
                browserName: 'firefox'
            }).build();
    } else {
        driver = new webdriver.Builder()
            .withCapabilities({
                browserName: 'firefox'
                //browserName: suite.options.browserArgument
            })
            .build();
    }

    return driver.getWindowHandle();
};

var refreshWindow = function () {
    return driver.navigate().refresh()
        .then(function () {
            return driver.executeScript('document.body.style.background = "red";');
        });
};

var closeWindow = function () {
    return driver.close();
};

var getAllHandles = function () {
    return driver.getAllWindowHandles();
};

var getParentHandle = function () {
    return getAllHandles()
        .then(function (handles) {
            return handles[0];
        });
};

var getChildHandle = function () {
    return getAllHandles()
        .then(function (handles) {
            //return the last handle
            return handles.slice(-1)[0];
        });
};

var getParentWindow = function () {
    return getParentHandle()
        .then(function (handle) {
            return driver.switchTo().window(handle);
        });
};

var getChildWindow = function () {
    return getChildHandle()
        .then(function (handle) {
            return driver.switchTo().window(handle);
        });
};

var loadClient = function() {
    return driver.get('http://0.0.0.0:9999/test/cross-browser/reference.html');
};

var loadAndStartClient = function() {
    return driver.get('http://0.0.0.0:9999/test/cross-browser/reference.html?immediate');
};

var directBrowserAway = function() {
    return driver.get('http://0.0.0.0:9999/');
};

var createRcSocket = function() {
    return driver.executeScript('return window.createRcSocket();');
};

var dumpClientLogger = function() {
    return driver.sleep(200).then(function(){
        return getChildWindow()
            .then(function() {
                return driver.executeScript('return window.clientLogger.buffer;');
            })
            .then(function(z) {
                console.log(z);
            })
            .then(getParentWindow);
    });
};

var socketProcess;
var startServerSocket = function() {
    var filePath = path.join(__dirname, '../api/web-socket.js');

    socketProcess = spawn('node', [filePath]);

    return socketProcess;
};

var startServerSocketPromise = function() {
    return Q.fcall(startServerSocket);
};

var stopServerSocket = function() {
    return socketProcess.kill('SIGINT');
};

var stopServerSocketPromise = function() {
    return Q.fcall(stopServerSocket);
};


var waitASecond = function(){
    return driver.sleep(1000);
};

/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('RcSocketIntegration', function () {

    this.timeout(10000);

    beforeEach(function () {
        startServerSocket();

        return buildDriver();
    });

    afterEach(function () {
        stopServerSocket();

        return driver.quit();
    });

    it('Logs events when launching new window and creating the RcSocket.', function () {
        return loadClient()
            .then(createRcSocket)
            .then(dumpClientLogger);
    });

    it('Logs events when reconnecting the WebSocket on refresh.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(refreshWindow)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

    it('Logs events when the WebSocket is dropped after a redirect.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(directBrowserAway)
            .then(dumpClientLogger);
    });

    it('Logs events when the window is closed.', function () {
        return loadAndStartClient()
            .then(refreshWindow)
            .then(closeWindow)
            .then(dumpClientLogger);
    });

    it('Logs events when server is initially down and a new WebSocket is being opened.', function () {
        return stopServerSocketPromise()
            .then(loadAndStartClient)
            .then(waitASecond)
            .then(startServerSocketPromise)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

    it('Logs events when the window is closed.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(stopServerSocketPromise)
            .then(waitASecond)
            .then(startServerSocketPromise)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

});