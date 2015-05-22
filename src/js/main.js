/**
 * MAIN MODULE
 * This will take care of set up the namespace
 * and setup the player class
 */
(function(window, document){
'use strict';

var _app = {};

/******************************************************************************************
 * Module Manager
*******************************************************************************************/
/**
 * Will take care of host all the modules of the app
 * @return {Object}  The module object
 */
_app.module = function(){
    var modules = {};

    return function(name){
        var mod = modules[name];

        if (!mod) {
            mod = modules[name] = {};
        }

        return mod;
    };
}();


/******************************************************************************************
 * START UP
*******************************************************************************************/
if (document.readyState in {"complete":1, "interactive":1}) {
    loadReady();
} else {
    window.addEventListener("load", loadReady, false);
}

/**
 * Remove listeners and deletes module reference
 * so it won't be accessible after setup
 * @return {Void}
 */
function cleanup(){
    window.removeEventListener("load", loadReady, false);
    delete _app.module;
}

/**
 * Sets up the public player class
 * @return {Void}
 */
function finalSetup(){
    _app.Player = _app.module("player").Class;
}

/**
 * Document ready handler
 * Will invoke the SVIDEOReady function when the
 * app has been setup and cleaned
 * @return {void}
 */
function loadReady(){
    finalSetup();
    cleanup();

    if (window.SVIDEOReady) {
        setTimeout(function(){
            window.SVIDEOReady();
        }, 100);
    }
}

// sharing
window.SVIDEO = _app;

}(this, document));