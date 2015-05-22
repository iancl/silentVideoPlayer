(function(window, document, _self, undefined){
"use strict";
// contants
var CONST = {
    // any device outside the deviceFamilies list will be considered a Desktop device
    deviceFamilies: {
        android: "android",
        ipad: "ipad",
        iphone: "iphone",
        ipod: "ipod",
        winPhone: "windows phone",
        "default": "other"
    },
    // strings passed to the user
    deviceTypes: {
        tab: "tablet",
        mob: "mobile",
        default: "other"
    },

    OS: {
        iOS: "iOS",
        android: "android",
        windowsMob: "windowsMobile",
        "default": "other"
    },
    // any screen size below this width, will be considered mobile
    // currently used for android devices only
    tablet_width_breakpoint: 767
};

// local variables
var _scrSize = {},  // w, h
    _model = {},    // this is the model that will hold the device, type and screen dimentions
    _family,        // android, iphone, ipad, desktop
    _type,          // tablet, phone, desktop
    _os;            // ios, android.


/**
 * will broadcast an event when the screen size has changed
 */
var Observer = function(){

    var list = {},
        id = 0;



    function onWindowResize(){
        getWindowSize();
        dispatchEvent();
    }

    function dispatchEvent(e){
        var key;

        for (key in list){
            list[key](e);
        }
    }

    // on window resize
    window.addEventListener("resize", onWindowResize);

    // orientation change
    window.addEventListener("orientationchange", onWindowResize);

    return {
        subscribe: function(fn){
            var ret;

            if (typeof fn !== "undefined") {
                list[++id] = fn;
                ret =  id;
            } else {
                ret = false;
            }

            return ret;
        },
        unsubscribe: function(id){
            list[id] = null;
        },
        release: function(){
            list = {};
        }
    };
}();


/**
 * Will determine if the device is any of the ones specified in the deviceFamilies object
 * and store the family name
 */
function getFamily(){
    var nav = navigator.userAgent.toLowerCase(),
        items = CONST.deviceFamilies,
        deviceName = items.default, // default === desktop
        key;

    for (key in items){
        if(new RegExp(items[key], "g").test(nav)){
            deviceName = items[key];
            break;
        }
    }
    _family = deviceName;
}

/**
 * Will get the window width and height and store it
 */
function getWindowSize () {
    var w, h;

    if (document.body && document.body.offsetWidth) {
        w = document.body.offsetWidth;
        h = document.body.offsetHeight;
    }
    if (String(document.compatMode) === 'CSS1Compat' &&
        document.documentElement &&
        document.documentElement.offsetWidth) {
        w = document.documentElement.offsetWidth;
        h = document.documentElement.offsetHeight;
    }
    if (window.innerWidth && window.innerHeight) {
        w = window.innerWidth;
        h = window.innerHeight;
    }
    _scrSize.w = w;
    _scrSize.h = h;
}

/**
 * Will determine the device type by using the family names and the screen size
 */
function getDeviceData(){
    var type, os;

    switch(_family){
        // ipad => tablet
        case CONST.deviceFamilies.ipad:
            type = CONST.deviceTypes.tab;
            os = CONST.OS.iOS;
        break;
        // iphone => mobile
        case CONST.deviceFamilies.iphone:
            type = CONST.deviceTypes.mob;
            os = CONST.OS.iOS;
        break;
        // android => tablet || mobile
        case CONST.deviceFamilies.android:
            type = (_scrSize.w < CONST.tablet_width_breakpoint) ? CONST.deviceTypes.mob : CONST.deviceTypes.tab;
            os = CONST.OS.android;
        break;
        // windows phone => mobile
        case CONST.deviceFamilies.winPhone:
            type = CONST.deviceTypes.mob;
            os = CONST.OS.windowsMob;
        break;
        // other devices are considered desktop
        default:
            type = CONST.deviceTypes.default;
            os = CONST.OS.default;
        break;
    }

    _type = type;
    _os = os;
}

/**
 *  setup the model that will be passed through the API
 */
function buildModel(){
    _model.family = _family;
    _model.type = _type;
    _model.os = _os;
    _model.screenSize = _scrSize;
}

/**
 * will return the _model object
 */
function getModel(){
    return _model;
}

/**
 * Initializing the module
 * No need to implement an init method as this will run the rest of the methods
 */
getFamily();
getWindowSize();
getDeviceData();
buildModel();
_self.info = getModel();
_self.Observer = Observer;

}(this, document, SVIDEO.module("deviceInfo")));