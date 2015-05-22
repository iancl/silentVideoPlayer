/**
 * OVERLAY MODULE
 * Controls the overlay and the video inside of it
 */
(function(window, document, _app, _self, undefined){
'use strict';
var
/******************************************************************************************
 * Modules
*******************************************************************************************/
Utils = _app.module("utils"),
Device = _app.module("deviceInfo").info,
Video = _app.module("video").Class;


/******************************************************************************************
 * FN
*******************************************************************************************/
function Build(parent, conf){
    this.parent = parent;
    this.conf = conf;
    this.callbacks = conf.events;
    bind(this);
    setupOverlay(this);
    setupVideo(this);
    setupCloseButton(this);
}

/**
 * All funtion context bindings should be defined here
 * @param  {Overlay} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.onReady = onVideoReady.bind(self);
    self.binded.onEnded = onVideoEnd.bind(self);
    self.binded.onProgress = onVideoProgress.bind(self);
    self.binded.clickClose = onCloseTap.bind(self);
}

/**
 * Creates a Video instance and styles it.
 * @param  {Overlay} self current instance
 * @return {Void}
 */
function setupVideo(self){
    var model = self.conf.video,
        sources = model.sources,
        attributes = self.conf.video.attributes || [],
        video;

    video = Utils.generateVideoString(
        attributes.concat([
            'preload="auto"',
            'controls="controls"'
        ]),
        sources
    );

    self.el.innerHTML = video;

    self.video = new Video({
        parent: self,
        video: self.el.querySelector("video"),
        events: {
            onReady: self.binded.onReady,
            onEnded: self.binded.onEnded,
            onProgress: self.binded.onProgress
        }
    });

    // style video only if device is not iphone
    // as it uses its own fullscreen player
    if (Device.family !== "iphone"){
        Utils.applyStyles(
            self.video.el,
            Utils.mergeObject(model.styles, {
                "position": "absolute",
                "z-index": 0
            })
        );
    }

    video = null;
}

/**
 * Creates overlay element. It will be
 * the instance's element
 * @param  {Overlay} self current instance
 * @return {Void}
 */
function setupOverlay(self){
    var body = document.querySelector("body");
    self.el = Utils.tag("div", false, "s_overlay");

    Utils.applyStyles(
        self.el,
        Utils.mergeObject(self.conf.styles, {
            "position": "absolute",
            "width": "100%",
            "height": "100%",
            "top": "0",
            "left": "0",
            "text-align": "center",
            "z-index": 99,
            "-webkit-transform": "translate(0,-10000px)",
            "-moz-transform": "translate(0,-10000px)",
            "-o-transform": "translate(0,-10000px)",
            "-ms-transform": "translate(0,-10000px)",
            "transform": "translate(0,-10000px)"
        })
    );

    body.appendChild(self.el);
    body = null;
}

/**
 * Creates and appends close button
 * Attaches necessary listeners
 * @param  {Overlay} self current instance
 * @return {Void}
 */
function setupCloseButton(self){
    var model;

    if (Device.family === "iphone") {
        self.video.el.addEventListener('webkitendfullscreen', self.binded.clickClose, false);
    } else {
        model = self.conf.closeImage;
        self.close = Utils.tag("div", false, "closeBtn");

        Utils.applyStyles(
            self.close,
            Utils.mergeObject(model.styles, {
                "display": "block",
                "position": "absolute",
                "background-image": "url(" + model.src + ")",
                "background-size": "100% 100%",
                "cursor": "pointer",
                "z-index": 999
            })
        );

        self.close.addEventListener("click", self.binded.clickClose, false);
        self.el.appendChild(self.close);
    }
}

/**
 * Looks for a key in the callbacks objects
 * if found, it will invoke it.
 * @param  {Overlay} self  current instance
 * @param  {String}      name  name of the event
 * @param  {Event}       event Event dispatched by the browser
 * @return {Void}
 */
function fireCallback(self, name, event){
    if(self.callbacks && self.callbacks[name]){
        self.callbacks[name](event);
    }
}

/**
 * invoked when the user taps on the close button
 * or closes the iphone fullscreen player
 * fires the onCloseButtonTapped callback
 * @return {Void}
 */
function onCloseTap(){
    /*jshint validthis:true */
    fireCallback(this, "onCloseButtonTapped");
    this.hide({ videoEnded: false});
}

/**
 * invoked when video playback changes
 * fires the onVideoProgress callback
 * @return {Void}
 */
function onVideoProgress(){
    /*jshint validthis:true */
    // console.log("progress", this.video.percentageComplete);
    fireCallback(this, "onVideoProgress", {
        percentageComplete: this.video.percentageComplete,
        currentTime: this.video.currentTime()
    });
}

/**
 * invoked when video is ready to play
 * fires the onVideoReady callback
 * @return {Void}
 */
function onVideoReady(){
    /*jshint validthis:true */
    fireCallback(this, "onVideoReady");
}

/**
 * invoked when video ended
 * fires the onVideoEnd callback
 * and hides the overlay
 * @return {Void}
 */
function onVideoEnd(){
    /*jshint validthis:true */
    this.seek(0);
    this.hide({videoEnded: true});
    fireCallback(this, "onVideoEnd");
}

/******************************************************************************************
 * Overlay Class
 * Most methods are self explanatory
*******************************************************************************************/

var Overlay = function(){
    Build.apply(this, arguments);
};

Overlay.prototype = {
    constructor: Overlay,

    // fires the onShowOverlay callback
    show: function(){
        this.play();

        if (Device.family !== "iphone"){
            Utils.applyStyles(this.el, {
                "-webkit-transform": "translate(0,0)",
                "-moz-transform": "translate(0,-0)",
                "-o-transform": "translate(0,0)",
                "-ms-transform": "translate(0,0)",
                "transform": "translate(0,0)"
            });
        }
        fireCallback(this, "onShowOverlay");
    },

    // fires the onHideOverlay callback and passes an arguments that
    // can be used to know if the video playback has ended or not
    hide: function(args){
        if (Device.family === "iphone") {
            this.video.closeIphonePlayer();
        } else {
            this.video.pause();
            Utils.applyStyles(this.el, {
                "-webkit-transform": "translate(0,-10000px)",
                "-moz-transform": "translate(0,-10000px)",
                "-o-transform": "translate(0,-10000px)",
                "-ms-transform": "translate(0,-10000px)",
                "transform": "translate(0,-10000px)"
            });
        }
        fireCallback(this, "onHideOverlay", args);
    },
    seek: function(percentage){
        this.video.seek(percentage);
    },
    play: function(){
        this.video.play();
        fireCallback(this, "onVideoStart");
    },
    pause: function(){
        this.video.pause();
    },
    getVideo: function(){
        return {
            type: "video",
            video: this.video.el
        };
    },
    destroy: function(){
        if (Device.family === "iphone") {
            this.video.addEventListener('webkitendfullscreen', this.binded.clickClose, false);
        } else {
            this.close.removeEventListener("click", this.binded.clickClose, false);
        }

        this.video.destroy();

        Utils.removeElement(this.close);
        Utils.removeElement(this.el);
        this.parent = null;
        this.conf = null;
        this.binded = null;
        this.video = null;
        this.controls = null;

    }
};


_self.Class = Overlay;

}(this, document, SVIDEO, SVIDEO.module("overlay")));