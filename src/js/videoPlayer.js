/**
 * VIDEO PLAYER MODULE
 * This will be the preview player that will be used
 * if the app is loaded in a desktop or laptop computer
 */
(function(window, document, _app, _self, undefined){
'use strict';
var
/******************************************************************************************
 * Modules
*******************************************************************************************/
Utils = _app.module("utils"),
Controls = _app.module("previewControls").Class,
Video = _app.module("video").Class;


/******************************************************************************************
 * Set up
*******************************************************************************************/
function Build(conf, parent){
    this.conf = conf;
    this.callbacks = conf.events;
    this.parent = parent;
    this.el = Utils.tag("div", "s_previewContainer");
    this.video = undefined;
    bind(this);
    setupElement(this);
    setupControlsLayer(this);
    setupVideo(this);
}

/**
 * All funtion context bindings should be defined here
 * @param  {VideoPlayer} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.onReady = onVideoReady.bind(self);
    self.binded.onEnded = onVideoEnd.bind(self);
    self.binded.onProgress = onVideoProgress.bind(self);
    self.binded.onControlLayerTap = onControlLayerTap.bind(self);
}

/**
 * Creates an instance of the Preview Controls class
 * @param  {VideoPlayer} self
 * @return {Void}
 */
function setupControlsLayer(self){
    self.controls = new Controls({
        parent: self,
        model: self.conf,
        events: {
            onTap: self.binded.onControlLayerTap
        }
    });
}

/**
 * Styles and appends the instance element
 * @param  {VideoPlayer} self
 * @return {Void}
 */
function setupElement(self){
    Utils.applyStyles(self.el, {
        "position": "absolute",
        "width": "100%",
        "height": "100%",
        "top": "0",
        "left": "0"
    });

    self.parent.el.appendChild(self.el);
}

/**
 * Creates the videoContainer element, an instance of
 *  the Video class and styles them
 * @param  {VideoPlayer} self
 * @return {Void}
 */
function setupVideo(self){

    var video,
        attributes = self.conf.video.attributes || [];

    self.videoContainer = Utils.tag("div", false, "s_previewVideoContainer");

    Utils.applyStyles(self.videoContainer, {
        "position": "relative",
        "width":"100%",
        "height": "100%",
        "top": "50%",
        "left": "50%"
    });

    self.el.appendChild(self.videoContainer);

    video = Utils.generateVideoString(
        attributes.concat([
            'preload="auto"',
            'muted="muted"'
        ]),
        self.conf.video.sources
    );

    self.videoContainer.innerHTML = video;

    self.video = new Video({
        parent: self,
        video: self.el.querySelector("video"),
        events: {
            onReady: self.binded.onReady,
            onEnded: self.binded.onEnded,
            onProgress: self.binded.onProgress
        }
    });

    Utils.applyStyles(self.video.el, {
        "position": "absolute",
        "right": "auto",
        "bottom": "auto",
        "left": "0",
        "top": "0",
        "width": "auto",
        "height": "auto",
        "min-width": '100%',
        "min-height": "100%",
        "background-size": "cover",
        "-webkit-transform": "translateX(-50%) translateY(-50%)",
        "-moz-transform": "translateX(-50%) translateY(-50%)",
        "-o-transform": "translateX(-50%) translateY(-50%)",
        "-ms-transform": "translateX(-50%) translateY(-50%)",
        "transform": "translateX(-50%) translateY(-50%)"
    });

    video = null;
}

/**
 * Looks for a key in the callbacks objects
 * if found, it will invoke it.
 * @param  {VideoPlayer} self  current instance
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
 * invoked when the user taps over the controls layer
 * @return {Void}
 */
function onControlLayerTap(){
    /*jshint validthis:true */
    fireCallback(this, "onPreviewTap");
}

/**
 * invoked when the video is ready to play
 * @return {Void}
 */
function onVideoReady(){
    /*jshint validthis:true */
    this.controls.hideLoading();
    fireCallback(this, "onVideoReady");
}

/**
 * invoked when the video has ended
 * @return {Void}
 */
function onVideoEnd(){
    /*jshint validthis:true */
    fireCallback(this, "onVideoEnd");
}

/**
 * invoked when the video has progressed
 * @return {Void}
 */
function onVideoProgress(){
    /*jshint validthis:true */

    fireCallback(this, "onVideoProgress", {
        percentageComplete: this.video.percentageComplete,
        currentTime: this.video.currentTime()
    });
}

/******************************************************************************************
 * Video Player Class
 * Methods are self explanatory
*******************************************************************************************/
var VideoPlayer = function(){
    Build.apply(this, arguments);
};

VideoPlayer.prototype = {
    constructor: VideoPlayer,
    toggle: function(){
        if (this.video.isPaused()) {
            this.play();
        } else {
            this.pause();
        }
    },
    play: function(){
        this.video.play();
        fireCallback(this, "onVideoStart");
    },
    pause: function(){
        this.video.pause();
    },
    restart: function(){
        this.seek(0);
        this.play();
    },
    seek: function(percentage){
        this.pause();
        this.video.seek(percentage);
        this.play();
    },
    hide: function(){
        Utils.applyStyles(this.el, {
            "opacity": "0"
        });
    },
    show: function(){
        Utils.applyStyles(this.el, {
            "opacity": "1"
        });
    },
    getVideo: function(){
        return {
            type: "video",
            video: this.video.el
        };
    },
    destroy: function(){
        this.video.destroy();
        this.controls.destroy();
        Utils.removeElement(this.el);
        this.binded = null;
        this.conf = null;
        this.parent = null;
        this.el = null;
        this.video = null;
        this.controls = null;
    }
};

_self.Class = VideoPlayer;

}(this, document, SVIDEO, SVIDEO.module("videoPlayer")));