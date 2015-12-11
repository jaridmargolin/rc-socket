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
var By = webdriver.By;
var logging = webdriver.logging;
var until = webdriver.until;
var promise = webdriver.promise;

var SauceTunnel = require('sauce-tunnel');
var Q = require('q');

// hack required to set should on Driver derived promises
Object.defineProperty(webdriver.promise.Promise.prototype, 'should', {
    get: Object.prototype.__lookupGetter__('should')
});

/* -----------------------------------------------------------------------------
 * reusable
 * ---------------------------------------------------------------------------*/
var tunnel;

var setupTunnel = function() {
    if (process.env.SAUCE_USERNAME !== undefined) {
        tunnel = new SauceTunnel(
            process.env.SAUCE_USERNAME,
            process.env.SAUCE_ACCESS_KEY,
            'tunnel',
            true,
            ['-B', '-all', '--verbose']
        );

        return Q.fcall(tunnel.start(function(status){
            //var deferred = Q.defer();

            if (status === false){
                throw new Error('Something went wrong with the tunnel');
            }

            return tunnel;
        }));
    }
};

var teardownTunnel = function() {
    if (tunnel) {
        tunnel.stop();
    }
};

var buildDriver = function () {
    //var prefs = new logging.Preferences();
    //prefs.setLevel(logging.Type.BROWSER, logging.Level.INFO);

    if (process.env.SAUCE_USERNAME !== undefined) {
        driver = new webdriver.Builder()
            .usingServer('http://' +
                process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY +
                '@ondemand.saucelabs.com:80/wd/hub'
            )
            .withCapabilities({
                'tunnel-identifier': 'tunnel',
                //process.env.TRAVIS_JOB_NUMBER,
                //build: process.env.TRAVIS_BUILD_NUMBER,
                username: process.env.SAUCE_USERNAME,
                accessKey: process.env.SAUCE_ACCESS_KEY,
                browserName: 'firefox'
            }).build();
    } else {
        driver = new webdriver.Builder()
            .withCapabilities({
                //browserName: 'chrome'
                browserName: 'firefox'
            })
            //.setLoggingPrefs(prefs)
            .build();
    }
    //.withCapabilities(webdriver.Capabilities.chrome())
    //.withCapabilities(webdriver.Capabilities.firefox())

    return driver.getWindowHandle();
};

var wait = function (duration, timeout) {
    var wait = true;
    setTimeout(function () { wait = false; }, duration);

    return driver.wait(function () {
        return !wait;
    }, timeout || 10000);
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

var launchWindow = function () {
    return driver.findElement(By.id('launch'))
        .then(function (button) {
            return button.click();
        });
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
            return handles[1];
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


// TODO: pull these functions out as exports from api.js
var socketProcess;
var startServerSocket = function() {
    var filePath = path.join(__dirname, '../api/web-socket.js');
    console.log(filePath);

    socketProcess = spawn('node', [filePath]);

    return socketProcess;
};

var stopServerSocket = function() {
    return socketProcess.kill('SIGINT');
};

var waitAndLog = function(z){
    return driver.sleep(100).then(function() {

        //return driver.manage().logs().get(logging.Type.BROWSER)
        //    .then(function(entries) {
        //        console.log(entries);
        //        //entries.forEach(function(entry) {
        //        //    console.log('[%s] %s', entry.level.name, entry.message);
        //        //});
        //    });

        //(new webdriver.WebDriver.Logs(driver))
        //    .get('browser')
        //    .then(function (v) {
        //        v && v.length && console.log(v);
        //    });

        console.log(z);

    });

    // when you want logs
};

var waitASecond = function(){
    return driver.sleep(1000);
};

/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

function sharedTestcases() {
    it('Should launch new window and create the RcSocket.', function () {
        return loadClient()
            .then(createRcSocket)
            .then(dumpClientLogger);
    });

    it('Should reconnect the WebSocket on refresh.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(refreshWindow)
            .then(waitASecond)
            .then(dumpClientLogger);
    });

    it('Should drop the WebSocket onto redirect.', function () {
        return loadAndStartClient()
            .then(waitASecond)
            .then(directBrowserAway)
            .then(dumpClientLogger);
    });

    it('Should execute onClose handler after closing the window.', function () {
        return loadAndStartClient()
            .then(refreshWindow)
            //.then(getParentWindow)
            .then(closeWindow)
            .then(dumpClientLogger);
    });
}

describe('ServerRunning', function () {

    this.timeout(10000);

    beforeEach(function () {
        startServerSocket();
        //setupTunnel().then(

        return buildDriver();
    });

    afterEach(function () {
        stopServerSocket();
        //teardownTunnel();

        return driver.quit();
    });

    sharedTestcases();

});

/*
describe('ServerNotRunning', function () {

    this.timeout(10000);

    beforeEach(function () {
        return buildDriver();
    });

    afterEach(function () {
        return driver.quit();
    });

    sharedTestcases();

});
*/