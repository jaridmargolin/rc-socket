/*!
 * test/launch.js
 */

/* -----------------------------------------------------------------------------
 * dependencies
 * ---------------------------------------------------------------------------*/

// Core
var spawn = require('child_process').spawn,
    path  = require('path');

//var chai = require('chai');
//var chaiAsPromised = require('chai-as-promised');
//var chromedriver = require('chromedriver');
var webdriver = require('selenium-webdriver');


/* -----------------------------------------------------------------------------
 * setup
 * ---------------------------------------------------------------------------*/

//var expect = chai.expect;
var By = webdriver.By;
var until = webdriver.until;
var promise = webdriver.promise;

//chai.should();
//chai.use(chaiAsPromised);

// hack required to set should on Driver derived promises
Object.defineProperty(webdriver.promise.Promise.prototype, 'should', {
    get: Object.prototype.__lookupGetter__('should')
});

// add chrome driver to path for run
//process.env.PATH += ';' + path.join(chromedriver.path);


/* -----------------------------------------------------------------------------
 * reusable
 * ---------------------------------------------------------------------------*/

var buildDriver = function () {
    driver = new webdriver.Builder()
        .withCapabilities({
            browserName: "chrome"
        })
     //.withCapabilities(webdriver.Capabilities.chrome())
     //.withCapabilities(webdriver.Capabilities.firefox())
        .build();


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

    // return driver;
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

var hasChildReference = function () {
    var script = "return !!window.launchJS.instances['child'];";

    return wait(1000).then(function () {
        return driver.executeScript(script)
    });
};

var hasExecutedCallback = function () {
    var script = "return !!window['launchjs-session-closed'];";

    return wait(1000).then(function () {
        return driver.executeScript(script);
    });
};

var getScriptIds = function () {
    return driver.findElements(By.tagName('script'))
        .then(getIds);
};

var getIds = function (elems) {
    return promise.map(elems, function (elem) {
        return elem.getAttribute('id');
    });
};

var createRcSocket = function() {
    //return driver.executeScript('rc = new window.RcSocket("ws://localhost:9998/", null, console.log);');
    //return driver.executeScript('rc = new window.RcSocket("ws://localhost:9998/", null, log.warn);');
    return driver.executeScript('return window.createRcSocket();');
};

var dumpClientLogger = function() {
    return driver.executeScript('return window.clientLogger.buffer;');
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

/* -----------------------------------------------------------------------------
 * test
 * ---------------------------------------------------------------------------*/

describe('parent.js', function () {

    this.timeout(10000);

    beforeEach(function () {
        return buildDriver().then(function () {
            return driver.get('http://0.0.0.0:9999/test/integration/reference-client.html');
        });
    });

    afterEach(function () {
        return driver.quit();
    });

    it('Should launch new window.', function () {
        startServerSocket();

        return createRcSocket()
            .then(function (z){
                driver.sleep(1000);
                console.log(z);
            })
            //.then(function() {
            //    driver.get('http://0.0.0.0:9999/')
            //})
            .then(dumpClientLogger)
            .then(function (z){
                driver.sleep(200);
                console.log(z);
            })
            .then(function() {
                return stopServerSocket();
            });

    });

    /*
    it('Should store reference to child on parent window.', function () {
        return launchWindow()
            .then(hasChildReference).should.eventually.be.true;
    });

    it('Should only attach inject one script tag on the child window.', function () {
        return launchWindow()
            .then(getChildWindow)
            .then(getScriptIds)
            .then(function (ids) {
                return ids.length;
            }).should.eventually.equal(2);
    });

    it('Should store reference to child on parent refresh.', function () {
        return launchWindow()
            .then(refreshWindow)
            .then(hasChildReference).should.eventually.be.true;
    });

    it('Should keep reference to child on child refresh.', function () {
        return launchWindow()
            .then(getChildWindow)
            .then(refreshWindow)
            .then(getParentWindow)
            .then(hasChildReference).should.eventually.be.true;
    });

    it('Should store reference to child on child refresh and then parent refresh.', function () {
        return launchWindow()
            .then(getChildWindow)
            .then(refreshWindow)
            .then(getParentWindow)
            .then(refreshWindow)
            .then(hasChildReference).should.eventually.be.true;
    });

    it('Should execute onClose handler set after launch.open call.', function () {
        return launchWindow()
            .then(getChildWindow)
            .then(closeWindow)
            .then(getParentWindow)
            .then(hasExecutedCallback).should.eventually.be.true;
    });

    it('Should execute onClose handler set after launch.get call.', function () {
        return launchWindow()
            .then(refreshWindow)
            .then(getChildWindow)
            .then(closeWindow)
            .then(getParentWindow)
            .then(hasExecutedCallback).should.eventually.be.true;
    });
    */

});