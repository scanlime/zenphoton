// Fake Web Workers, for debugging.
// From: https://code.google.com/p/fakeworker-js/

;
var fakeworker = (function(global){
    function extend(dest, src){
        for (var i in src) {
            dest[i] = src[i];
        }
    }
    // >>>>>>>>>> this part is copied and modified from jQuery 1.2.6 (Copyright
    // (c) 2008 John Resig (jquery.com))
    var userAgent = navigator.userAgent.toLowerCase();
    // Figure out what browser is being used
    var browser = {
        version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        safari: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
        mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
    };
    // Determines if an XMLHttpRequest was successful or not
    function httpSuccess(xhr){
        try {
            // IE error sometimes returns 1223 when it should be 204 so treat it
            // as success, see #1450
            return !xhr.status && location.protocol == "file:" ||
            (xhr.status >= 200 && xhr.status < 300) ||
            xhr.status == 304 ||
            xhr.status == 1223 ||
            browser.safari && xhr.status == undefined;
        } 
        catch (e) {
        }
        return false;
    };
    // <<<<<<<<<<<<<<<<<<<<
    
    function __syncXhrGet(url, fn){
        var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
        // sync request
        xhr.open("GET", url, false);
        /*
         xhr.onreadystatechange = function(){
         if (xhr.readyState == 4) {
         if (httpSuccess(xhr)) {
         try {
         fn(xhr);
         }
         catch (e) {
         throw e;
         }
         }
         else {
         throw new Error("Could not load resource(" + url + ") result=" + xhr.status + ":" + xhr.statusText);
         }
         }
         };
         */
        xhr.send("");
        if (httpSuccess(xhr)) {
            fn(xhr);
        }
        else {
            throw new Error("Could not load resource(" + url + ") result=" + xhr.status + ":" + xhr.statusText);
        }
    }
    
    // >>>>>>>>>> this part is copied from parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License
    
    function parseUri(str){
        var o = parseUri.options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {}, i = 14;
        
        while (i--) 
            uri[o.key[i]] = m[i] || "";
        
        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function($0, $1, $2){
            if ($1) 
                uri[o.q.name][$1] = $2;
        });
        
        return uri;
    };
    
    parseUri.options = {
        strictMode: false,
        key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
    // <<<<<<<<<<<<<<<<<<<<
    
    // >>>>>>>>>> this part is copied from http://d.hatena.ne.jp/brazil/20070103/1167788352
    function absolutePath(path){
        var e = document.createElement('span');
        e.innerHTML = '<a href="' + path + '" />';
        return e.firstChild.href;
    }
    // <<<<<<<<<<<<<<<<<<<<
    
    function FakeMessageEvent(worker){
        extend(this, Event);
        Event.constructor.call(this);
        this.currentTarget = worker;
        this.srcElement = worker;
        this.target = worker;
        this.timestamp = new Date().getTime();
    }
    FakeMessageEvent.prototype = {
        initMessageEvent: function(type, canBubble, cancelable, data, origin, lastEventId, source, ports){
            this.initMessageEventNS("", type, canBubble, cancelable, data, origin, lastEventId, source, ports);
        },
        initMessageEventNS: function(namespaceURI, type, canBubble, cancelable, data, origin, lastEventId, source, ports){
            this.namespaceURI = namespaceURI;
            this.type = type;
            this.canBubble = canBubble;
            this.cancelable = cancelable;
            this.data = data;
            this.origin = origin;
            this.lastEventId = lastEventId;
            this.source = source;
            this.ports = ports;
        }
    };
    function FakeErrorEvent(worker){
        extend(this, Event);
        Event.constructor.call(this);
        this.currentTarget = worker;
        this.srcElement = worker;
        this.target = worker;
        this.timestamp = new Date().getTime();
    }
    FakeErrorEvent.prototype = {
        initErrorEvent: function(type, canBubble, cancelable, message, filename, lineno){
            this.initErrorEventNS("", type, canBubble, cancelable, message, filename, lineno);
        },
        initErrorEventNS: function(namespaceURI, type, canBubble, cancelable, message, filename, lineno){
            this.namespaceURI = namespaceURI;
            this.type = type;
            this.canBubble = canBubble;
            this.cancelable = cancelable;
            this.message = message;
            this.filename = filename;
            this.lineno = lineno;
        }
    };
    
    var nativeWorker = global["Worker"];
    var FakeWorker = function(url){
        var self = this;
        this._listenerNamespaces = {}; // event listeners
        this._eventQueues = {};
        
        __syncXhrGet(url, function(xhr){
            try {
                self._workerContext = new FakeWorkerContext(url, xhr.responseText, self);
            } 
            catch (e) {
                throw e;
            }
        });
    };
    FakeWorker.prototype = {
        isFake: true,
        addEventListener: function(type, listener, useCapture){
            this.addEventListenerNS("", type, listener, useCapture);
        },
        addEventListenerNS: function(namespaceURI, type, listener, useCapture){
            var namespace = this._listenerNamespaces[namespaceURI];
            if (!namespace) {
                this._listenerNamespaces[namespaceURI] = namespace = {};
            }
            var listeners = namespace[type];
            if (!listeners) {
                namespace[type] = listeners = [];
            }
            listeners.push(listener);
        },
        removeEventListener: function(type, listener, useCapture){
            this.removeEventListener("", type, listener, useCapture);
        },
        removeEventListenerNS: function(namespaceURI, eventName, fn, useCapture){
            var namespace = this._listenerNamespaces[namespaceURI];
            if (namespace) {
                var listeners = namespace[type];
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        if (listeners[i] === listener) {
                            delete listeners[i];
                        }
                    }
                }
            }
        },
        dispatchEvent: function(event){
            if (typeof this["on" + event.type] == "function") {
                this["on" + event.type].call(this, event);
            }
            var namespace = this._listenerNamespaces[event.namespaceURI];
            if (namespace) {
                var listeners = namespace[event.type];
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i].call(this, event);
                    }
                }
            }
            return true;
        },
        postMessage: function(msg){
            var self = this;
            var workerContext = this._workerContext;
            if (typeof workerContext.onmessage == "function") {
                // for testability, we don't do the "structual clone".
                var event = new FakeMessageEvent(self);
                event.initMessageEvent("message", false, false, msg, "", "", null, null);
                setTimeout(function(){
                    try {
                        workerContext.onmessage.call(workerContext, event);
                    } 
                    catch (e) {
                        var errorEvent = new FakeErrorEvent(self);
                        var lineno = e.line || e.lineNumber;
                        errorEvent.initErrorEvent("error", false, false, e.message, workerContext.location.filename, lineno);
                        self.dispatchEvent(errorEvent);
                        throw e;
                    }
                }, 0);
            }
        },
        terminate: function(){
            this._workerContext.close();
        }
    };
    
    function FakeWorkerLocation(url){
        var absolute = absolutePath(url);
        var parsed = parseUri(absolute);
        this.href = absolute;
        this.protocol = parsed.protocol + ":";
        this.host = parsed.port ? parsed.host + ":" + parsed.port : parsed.host;
        this.hostname = parsed.host;
        this.port = parsed.port;
        this.pathname = parsed.path;
        this.search = parsed.query ? "?" + parsed.query : "";
        this.hash = parsed.anchor ? "#" + parsed.anchor : "";
        this.filename = parsed.file;
    }
    FakeWorkerLocation.prototype = {
        toString: function(){
            return this.href;
        }
    };
    
    function FakeWorkerContext(url, source, worker){
        var postMessage = this.postMessage = function(msg){
            var event = new FakeMessageEvent(worker);
            event.initMessageEvent("message", false, false, msg, "", "", null, null);
            setTimeout(function(){
                worker.dispatchEvent(event);
            }, 0);
        };
        var setTimeout = this.setTimeout = global.setTimeout;
        var clearTimeout = this.clearTimeout = global.clearTimeout;
        var setInterval = this.setInterval = global.setInterval;
        var clearInterval = this.clearInterval = global.clearInterval;
        var XMLHttpRequest = this.XMLHttpRequest = global.XMLHttpRequest;
        var openDatabase = this.openDatabase = global.openDatabase;
        var openDatabaseSync = this.openDatabaseSync = global.openDatabaseSync;
        var WebSocket = this.WebSocket = global.WebSocket;
        var EventSource = this.EventSource = global.EventSource;
        var MessageChannel = this.MessageChannel = global.MessageChannel;
        var Worker = this.Worker = FakeWorker;
        //var SharedWorker = this.SharedWorker = SharedWorker;
        
        var location = this.location = new FakeWorkerLocation(url);
        var close = this.close = function(){
            this.closing = true
            // not yet implemented
        };
        var navigator = this.navigator = global.navigator;
        var self = this.self = this;
        var importScripts = this.importScripts = function(){
            /*
            for (var i = 0; i < arguments.length; i++) {
                __syncXhrGet(arguments[i], function(xhr){
                    with (global) eval(xhr.responseText);
                });
            }
            */
           throw new Error("importScripts is not supported.");
        }
        //var __importScriptsSource = "(function(__global){" + __syncXhrGet.toString() + ";importScripts=" + __importScripts.toString() + "})(this);";
        //eval(__importScriptsSource + source);
        // execute worker
        eval(source);
        
        // pick up the onmessage global handler in eval context to this context
        try {
            if (typeof onmessage == "function") {
                this.onmessage = onmessage;
            }
        } 
        catch (e) {
        }
    }
    var ret = {
        nativeWorker: nativeWorker,
        install: function(){
            global["Worker"] = FakeWorker;
        },
        uninstall: function(){
            global["Worker"] = nativeWorker;
        }
    };
    // auto install
    ret.install();
    return ret;
})(this);
