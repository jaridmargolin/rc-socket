/*!
 * test/launch.js
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// Core
var http = require('http');

/* -----------------------------------------------------------------------------
 * setup
 * ---------------------------------------------------------------------------*/

var webdriver = require('selenium-webdriver');
var Q = require('q');

/* -----------------------------------------------------------------------------
 * logger
 * ---------------------------------------------------------------------------*/

var logger = [];

var clearLogger = function() {
    return Q.fcall(function() {
        logger = [];
    });
};

var logMessage = function(msg) {
    // driver.executeScript('return Date.now();').then(function(d) {
    return Q.fcall(function() {
        var z = {
            ts: Date.now(),
            message: msg
        };

        return logger.push(z);
    });
};

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
                //platform: 'Windows 7',
                //browserName: 'firefox',
                //version: '',
                platform: 'OS X 10.11',
                browserName: 'safari',
                version: '9.0',
                //version: '11',
                //browserName: 'internet explorer'
            }).build();
    } else {
        driver = new webdriver.Builder()
            .withCapabilities({
                //browserName: 'chrome'
                browserName: 'safari'
                //browserName: suite.options.browserArgument
            })
            .build();
    }

    return driver.getWindowHandle();
};

var refreshWindow = function () {
    logMessage('Runner refresh');

    return driver.navigate().refresh()
        .then(function () {
            return driver.executeScript('document.body.style.background = "red";');
        });
};

var closeWindow = function () {
    logMessage('Runner close');

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
    logMessage('Runner loadClient');

    return driver.get('http://0.0.0.0:9999/test/cross-browser/reference.html');
};

var loadAndStartClient = function() {
    logMessage('Runner loadAndStart');

    return driver.get('http://0.0.0.0:9999/test/cross-browser/reference.html?immediate');
};

var directBrowserAway = function() {
    logMessage('Runner redirect');

    return driver.get('http://0.0.0.0:9999/');
};

var createRcSocket = function() {
    logMessage('Runner startClient');

    return driver.executeScript('return window.createRcSocket();');
};

var clearClientLogger = function() {
    var correctWindow = driver;
    var hasChildWindow = getAllHandles().size > 1;

    if (hasChildWindow) {
        correctWindow = getChildWindow();
    }

    return correctWindow
        .executeScript('return window.clientLogger.clear();')
        .then(function() {
            if (hasChildWindow) {
                return getParentWindow();
            }
        });
};

var dumpClientLogger = function() {
    var correctWindow = driver;
    var hasChildWindow = getAllHandles().length > 1;

    if (hasChildWindow) {
        correctWindow = getChildWindow();
    }

    return correctWindow
        .executeScript('return window.clientLogger.dump();')
        .then(function(z) {
            var allLogs = logger.concat(z);
            allLogs.sort(function(a, b) {
                return a.ts - b.ts;
            });

            allLogs.map(function(log) {
                var d = '[' + new Date(log.ts).toISOString() + ']';
                var m = log.message.split(' ');

                var service = String('    ' + m[0]).slice(-9);
                m.shift();

                console.log(d + service + ': ' + m.join(' '));
            });
        })
        .then(function() {
            if (hasChildWindow) {
                return getParentWindow();
            }
        });
};

var waitASecond = function(){
    return driver.sleep(1000);
};

/* -----------------------------------------------------------------------------
 * api
 * ---------------------------------------------------------------------------*/

var apiUrl = 'localhost',
    apiPort = '9997';

var command = function (endpoint) {
    var postReq = http.request({
        host: apiUrl,
        port: apiPort,
        path: '/' + endpoint,
        method: 'POST'
    }, function (res) { });

    // post the data
    postReq.end();
};

var startServerSocket = function() {
    logMessage('Runner startSocketServer');

    return Q.fcall(command, 'socket/start');
};

var stopServerSocket = function() {
    logMessage('Runner stopSocketServer');

    return Q.fcall(command, 'socket/stop');
};

var lostNetworkLink = function() {
    logMessage('Runner lostLink');

    return Q.fcall(command, 'link/down');
};

/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('RcSocketIntegration', function () {

    this.timeout(10000 * 3);

    beforeEach(function () {
        return startServerSocket()
            .then(buildDriver)
            .then(clearClientLogger);
    });

    afterEach(function () {
        clearLogger();
        return stopServerSocket()
            .then(function() {
                driver.quit();
            });
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

    it('Logs events when the browser is directed away.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(directBrowserAway)
            .then(dumpClientLogger);
    });

    it('Logs events when the window is closed.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(closeWindow)
            .then(dumpClientLogger);
    });

    it('Logs events when server is initially down and a new WebSocket is being opened.', function () {
        return stopServerSocket()
            .then(loadAndStartClient)
            .then(waitASecond)
            .then(startServerSocket)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

    it('Logs events when server is cycled on an active connection.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(stopServerSocket)
            .then(waitASecond)
            .then(startServerSocket)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

    it('Logs events when the network link fails.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(lostNetworkLink)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

});
