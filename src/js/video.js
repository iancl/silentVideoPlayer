/**
 * VIDEO MODULE
 *
 * This will hold a video element and will provide an
 * interface to control the video playback and will
 * emit a set of events.
 */
(function(window, document, _app, _self, undefined){
"use strict";

var
/******************************************************************************************
 * Modules
*******************************************************************************************/
Utils = _app.module("utils");

/******************************************************************************************
 * Set up
*******************************************************************************************/
/**
 * Buils the Instance
 * args should contain a video element, a callbacks object and a reference
 * to the parent instance
 */
function Build(args){
    var video;

    this.parent = args.parent;

    // as video elements are not supported in phantomjs
    // I had to create a video stub that needs to be instantiated here
    // If there is _testVideo class provided, it will store
    // the provided video element passed by the parent
    if(args.parent.conf._testVideo){
        video = args.parent.conf._testVideo;
    } else {
        video = args.video;
    }

    this.el = video;
    this.callbacks = args.events || {};
    this.percentageComplete = 0;
    this.totalTime = 0;
    bind(this);
    setListeners(this);
}

/**
 * All funtion context bindings should be defined here
 * @param  {Video} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.canplay = onCanPlay.bind(self);
    self.binded.ended = onEnded.bind(self);
    self.binded.timeupdate = onTimeUpdate.bind(self);
}

/**
 * Bind all listeners here
 * Added a delay so it won't fail while in test mode
 * @param {Video} self current video instance
 * @return {Void}
 */
function setListeners(self){
    self.el.addEventListener("canplay", self.binded.canplay, false);
    self.el.addEventListener("timeupdate", self.binded.timeupdate, false);
    self.el.addEventListener("ended", self.binded.ended, false);
}

/**
 * Looks for a key in the callbacks objects
 * if found, it will invoke it.
 * @param  {Video}  self current video instance
 * @param  {String} name name of the callback
 * @return {Void}
 */
function fireCallback(self, name){
    if(self.callbacks[name]){
        self.callbacks[name]();
    }
}

/**
 * Handler of the canplay event
 * onReady callback is fired and video duration is captured
 * @return {Void}
 */
function onCanPlay(){
    /*jshint validthis:true */
    this.totalTime = this.el.duration;
    fireCallback(this, "onReady");
    this.el.removeEventListener("canplay", this.binded.canplay, false);
}

/**
 * Handler of the canplay event
 * onEnded callback is fired
 * fires the onTimeUpdate event once more just to
 * show the 100% progress completion
 * @return {Void}
 */
function onEnded(){
    /*jshint validthis:true */
    onTimeUpdate.call(this);
    fireCallback(this, "onEnded");
}

/**
 * Handler of the canplay event
 * onProgress callback is fired and video completion
 * percentage is calculated
 * @return {Void}
 */
function onTimeUpdate(){
    /*jshint validthis:true */
    fireCallback(this, "onProgress");
    this.percentageComplete = Math.round((this.el.currentTime / this.totalTime) * 100);
}

/******************************************************************************************
 * Video Class
 * Methods are self explanatory
*******************************************************************************************/
var Video = function(){
    Build.apply(this, arguments);
};

Video.prototype = {
    constructor: Video,
    play: function(){
        this.el.play();
    },
    pause: function(){
        this.el.pause();
    },
    isPaused: function(){
        return this.el.paused;
    },
    currentTime: function(){
        return this.el.currentTime.toFixed(2);
    },
    seek: function(percentage){
        this.el.currentTime = (percentage / 100) * this.totalTime;
    },
    closeIphonePlayer: function(){
        this.el.webkitExitFullScreen();
    },
    destroy: function(){
        // setting src attribute to "" to avoid chrome issues
        this.el.src = "";
        this.el.setAttribute("src", "");
        this.el.removeEventListener("ended", this.binded.ended, false);
        this.el.removeEventListener("timeupdate", this.binded.timeupdate, false);
        Utils.removeElement(this.el);
        this.binded = null;
        this.callbacks = null;
        this.parent = null;
        this.el = null;
    }
};

_self.Class = Video;

}(this, document, SVIDEO, SVIDEO.module('video')));