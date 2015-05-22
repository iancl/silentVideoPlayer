/**
 * CANVAS PLAYER MODULE
 * A class that implements a canvas frame player
 * that renders a set of frames in the specifed
 * frame rate
 */
(function(window, document, _app, _self, undefined){
'use strict';
var
/******************************************************************************************
 * Modules
*******************************************************************************************/
Utils = _app.module("utils"),
Controls = _app.module("previewControls").Class,
ImageLoader = _app.module("ImageLoader").Class,
Device = _app.module("deviceInfo");

/******************************************************************************************
 * Set up
*******************************************************************************************/
function Build(conf, parent){
    this.parent = parent;
    this.conf = conf;
    this.callbacks = conf.events;
    this.areImagesLoaded = false;
    this.shouldPlayOnImagesLoaded = false;
    this.isPlaying = false;
    this.isReady = false;
    bind(this);
    setupElement(this);
    setupCanvas(this);
    setupControlsLayer(this);

    // FPS panel will only be created if necessary
    if (this.conf.video.frames.showFPS){
        setupFPSPanel(this);
    }

    Device.Observer.subscribe(this.binded.onResize);

    // load all images
    loadImages(this);
}

/**
 * All funtion context bindings should be defined here
 * @param  {CanvasPlayer} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.onResize = resizeCanvas.bind(self);
    self.binded.onImagesLoaded = onImagesLoaded.bind(self);
    self.binded.onImageLoadingError = onImageLoadingError.bind(self);
}

/**
 * Creting instance of previewPlayerControls
 * @param  {CanvasPlayer} self current instance
 * @return {Void}
 */
function setupControlsLayer(self){
    self.controls = new Controls({
        parent: self,
        model: self.conf,
        events: {
            onTap: onTap.bind(self)
        }
    });
}

/**
 * will create a div that will show the current FPS rate
 * @param  {CanvasPlayer} self current instance
 * @return {Void}
 */
function setupFPSPanel(self){
    self.fpsPanel = Utils.tag("div", false, "fpsPanel");
    Utils.applyStyles(self.fpsPanel, {
        "position": "absolute",
        "width": "50px",
        "height": "20px",
        "top":"0",
        "left": "0",
        "background-color": "green",
        "color": "white",
        "text-align": "center"
    });

    self.el.appendChild(self.fpsPanel);
}

/**
 * Creates and styles the canvas container
 * @param  {CanvasPlayer} self current instance
 * @return {Void}
 */
function setupElement(self){
    self.el = Utils.tag("div", "s_previewVideoContainer");
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
 * Generates the urls of the image frames to load
 * and creates a new instance of the ImageLoader to
 * load them
 * @param  {CanvasPlayer} self current instance
 * @return {Void}
 */
function loadImages(self){
    var model = self.conf.video.frames,
        urls = [],
        i;

    for(i=0; i<model.count; i++){
        urls.push(model.baseName + i + "."+model.type);
    }

    self.images = new ImageLoader({
        parent: self,
        urls: urls,
        timeout: 3000,
        onComplete: self.binded.onImagesLoaded,
        onError: self.binded.onImageLoadingError
    });
}

/**
 * Resizes the canvas if the window size changes
 * @return {Void}
 */
function resizeCanvas(){
    /*jshint validthis:true */
    var size = this.conf.video.size;
    this.canvas.el.width = size.raw.w;
    this.canvas.el.height = size.raw.h;
}

/**
 * Sets up canvas model and element
 * Canvas will get resized to fit the size of the container
 * @param  {CanvasPlayer} self current instance
 * @return {Void}
 */
function setupCanvas(self){
    self.canvas = {
        el: undefined,
        context: undefined,
        totalFrames: self.conf.video.frames.count,
        currentFrame: -1,
        percentComplete: 0,
        fps: {
            interval: 1000 / self.conf.video.frames.fps,
            delta:0,
            now: 0,
            counter:0,
            first:0,
            then: 0,
            timer: 0
        }
    };

    self.canvas.el = Utils.tag("canvas", false, "canvasPlayer");
    Utils.applyStyles(self.canvas.el, {
        "position": "relative",
        "z-index":"0"
    });

    self.canvas.context = self.canvas.el.getContext("2d");
    self.el.appendChild(self.canvas.el);
    resizeCanvas.call(self);
}

/**
 * Looks for a key in the callbacks objects
 * if found, it will invoke it.
 * @param  {CanvasPlayer} self  current instance
 * @param  {String}       name  name of the event
 * @param  {Event}        event Event dispatched by the browser
 * @return {Void}
 */
function fireCallback(self, name, event){
    if(self.callbacks && self.callbacks[name]){
        self.callbacks[name](event);
    }
}

/**
 * Invoked when the images are loaded
 * Also fires the onVideoReady callback
 * @return {Void}
 */
function onImagesLoaded(){
    /*jshint validthis:true */
    this.areImagesLoaded = true;
    this.isReady = true;

    if (this.shouldPlayOnImagesLoaded === true) {
        this.play();
    }

    this.controls.hideLoading();
    fireCallback(this, "onVideoReady");
}

/**
 * Invoked if there was an error while loading the images
 * it will throw an exception
 * @return {Void}
 */
function onImageLoadingError(){
    throw new Error("[SilentPlayer]: Images cannot be found.");
}

/**
 * Invoked when the video progress changes
 * Fires the onVideoProgress event
 * @param  {CanvasPlayer} self  current instance
 * @return {Void}
 */
function onVideoProgress(self){
    fireCallback(self, "onVideoProgress", {
        percentageComplete: self.canvas.percentComplete,
        currentFrame: self.canvas.currentFrame
    });
}

/**
 * Invoked when the video progress changes
 * Fires the onVideoEnd event
 * Pauses the animations and reset canvas model
 * @param  {CanvasPlayer} self  current instance
 * @return {Void}
 */
function onVideoEnd(self){
    self.pause();
    resetCanvasData(self);
    fireCallback(self, "onVideoEnd");
}

/**
 * Invoked when the user taps on the control layer
 * Fires the onVideoProgress event
 * @return {Void}
 */
function onTap(){
    /*jshint validthis:true */
    fireCallback(this, "onPreviewTap");
}

/******************************************************************************************
 * Player Core
*******************************************************************************************/
/**
 * The main method that will get invoked every 60fps approx
 * I will control the FPS so the frame rate will be slower.
 * FPS can be set in the configuration
 * Will invoke the onVideoProgress and onVideoEnd functions
 * @return {Void}
 */
function runLoop(){
    /*jshint validthis:true */
    var conf = this.canvas;

    conf.fps.timer = requestAnimationFrame(runLoop.bind(this));
    conf.fps.now = new Date().getTime();
    conf.fps.delta = conf.fps.now - conf.fps.then;

    if (conf.fps.delta > conf.fps.interval) {
        conf.percentComplete = Math.floor(((conf.currentFrame+1) * 100) / conf.totalFrames);
        conf.fps.then = conf.fps.now - (conf.fps.delta % conf.fps.interval);
        onVideoProgress(this);

        if (conf.percentComplete === 100) {
            onVideoEnd(this);
        } else {
            step(this);
        }

        if (this.fpsPanel) {
            drawFPS(this);
        }
    }
}

/**
 * Draws the FPS rate if necessary
 * @param  {CanvasPlayer} self  current instance
 * @return {Void}
 */
function drawFPS(self){
    var conf = self.canvas,
        passedTime;

    conf.fps.counter++;
    passedTime = (conf.fps.then - conf.fps.first) / 1000;
    self.fpsPanel.innerText = Math.round(conf.fps.counter / passedTime) + " fps";
}

/**
 * Everytime the canvas needs to be re-rendered
 * based on the fps speed
 * Gets the next frame and calls method that draws
 * the screen
 * @param  {CanvasPlayer} self  current instance
 * @return {Void}
 */
function step(self){

    nextFrameIndex(self, self.canvas);

    draw(
        self.images.items[self.canvas.currentFrame],
        self.conf.video.size,
        self.canvas.context
    );
}

/**
 * This will draw a frame in the canvas
 * @param  {Image} img    frame to be rendered
 * @param  {Object} size  contains the size of the player container
 * @param  {CanvasContext} ctx   canvas context
 * @return {Void}
 */
function draw(img, size, ctx){
    // there is no need to clear the canvas
    // this will make this process lighter
    // for the mobile browser
    ctx.drawImage(img, 0, 0, size.raw.w, size.raw.h);
}

/**
 * Fins the next frame to be rendered
 * @param  {CanvasPlayer} self  current instance
 * @param  {Object} model Canvas Model
 * @return {Void}
 */
function nextFrameIndex(self, model){
    var index = model.currentFrame+1;

    if (index > model.totalFrames - 1) {
        index = 0;
    }

    self.canvas.currentFrame = index;
}

/**
 * Goes to a point in the playback based
 * on the percentage specified (0-100)
 * @param  {CanvasPlayer} self  current instance
 * @param  {Number} percentage number from 0 to 100
 * @return {Void}
 */
function seek(self, percentage){
    self.canvas.currentFrame = (percentage/100) * self.canvas.totalFrames;
}

/**
 * Resets the canvas' model values
 * @param  {CanvasPlayer} self  current instance
 * @return {Void}
 */
function resetFPSData(self){
    var conf = self.canvas;

    conf.fps.now = 0;
    conf.fps.then = 0;
    conf.fps.delta = 0;
    self.fpsPanel.innerText = "0";
    conf.fps.counter = 0;
    conf.fps.first = 0;
}

function resetCanvasData(self){
    var conf = self.canvas;

    conf.currentFrame = -1;
    conf.percentComplete = 0;

    if (self.fpsPanel){
        resetFPSData(self);
    }
}

/******************************************************************************************
 * Canvas Player Class
 * Methods are self explanatory
*******************************************************************************************/
var CanvasPlayer = function(){
    Build.apply(this, arguments);
};

CanvasPlayer.prototype = {
    constructor: CanvasPlayer,
    toggle: function(){
        if (this.isPlaying === true) {
            this.pause();
        } else {
            this.play();
        }
    },
    play: function(){

        if (this.areImagesLoaded === true && this.isReady === true) {
            if (this.isPlaying === false) {
                this.isPlaying = true;
                this.canvas.fps.then = new Date().getTime();
                this.canvas.fps.first = this.canvas.fps.then;
                fireCallback(this, "onVideoStart");
                runLoop.call(this);
            }
        } else {
            this.shouldPlayOnImagesLoaded = true;
        }
    },
    pause: function(){
        if (this.isPlaying === true){
            this.isPlaying = false;
            cancelAnimationFrame(this.canvas.fps.timer);
            if (this.fpsPanel){
                resetFPSData(this);
            }
        }
    },
    restart: function(){
        this.pause();
        resetCanvasData(this);
        this.play();
    },
    seek: function(percentage){
        this.pause();
        seek(this, percentage);
        this.play();
    },
    getVideo:function(){
        return {
            type: "canvas",
            canvas: this.canvas
        };
    },
    destroy: function(){
        this.pause();
        this.images.destroy();
        this.controls.destroy();
        this.canvas.context = null;
        Utils.removeElement(this.canvas.el);
        Utils.removeElement(this.el);
        this.parent = null;
        this.conf = null;
        this.binded = null;
        this.isPlaying = false;
        this.images = null;
        this.controls = null;
        this.canvas.el = null;
        this.canvas = null;
        this.el = null;
    }
};


_self.Class = CanvasPlayer;

}(this, document, SVIDEO, SVIDEO.module("canvasPlayer")));