/**
 * IMAGE LOADER MODULE
 */
(function(window, document, _app, _self, undefined){
"use strict";


/******************************************************************************************
 * Set up
*******************************************************************************************/
function Build(args){
    this.parent = args.parent;
    this.imageUrls = args.urls;
    this.timeout = args.timeout || 3000;
    this.minNumberOfImagesToLoad = this.imageUrls.length;
    this.onReady = args.onComplete;
    this.onError = args.onError;
    this.loadedImages = 0;
    this.alreadyCompleted = false;
    this.timer = 0;
    this.items = [];
    bind(this);
    loadImages(this);
}

/**
 * All funtion context bindings should be defined here
 * @param  {ImageLoader} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.onload = onImageLoaded.bind(self);
    self.binded.onError = onImageError.bind(self);
}

/**
 * Creates an image for each url provided
 * attaches listeners to eack image
 * and starts the timeone just in case the browser
 * stopps firing the load or error events or
 * in case the images take too much to load
 * @param  {ImageLoader} self current instance
 * @return {Void}
 */
function loadImages(self){
    var i,
        image;

    for(i=0; i<self.imageUrls.length; i++){
        image = new Image();
        image.src = self.imageUrls[i];
        self.items.push(image);
        image.addEventListener("error", self.binded.onError, false);
        image.addEventListener("load", self.binded.onload, false);
        image = null;
    }

    self.timer = setTimeout(function(){
        onLoadingComplete(self);
    },self.timeout);
}

/**
 * Invoked when each image has loaded
 * removes all event listeners for that image and
 * increases the image loaded counter.
 * @return {Void}
 */
function onImageLoaded(){
    /*jshint validthis:true */
    this.items[this.loadedImages].removeEventListener("load", this.binded.onload, false);
    this.items[this.loadedImages].removeEventListener("error", this.binded.onError, false);

    this.loadedImages++;

    if (this.loadedImages === this.minNumberOfImagesToLoad) {
        onLoadingComplete(this);
    }
}

/**
 * Invoked when whether all the images have
 * been loaded or the timeout ended
 * @param  {ImageLoader} self current instance
 * @return {Void}
 */
function onLoadingComplete(self){
    if (self.alreadyCompleted === false) {
        self.alreadyCompleted = true;
        self.onReady();
    }
}

/**
 * Invoked when there was an error loading an image
 * Invokes the onError callback
 * @param  {event} e Event object passed by the browser
 * @return {Void}
 */
function onImageError(e){
    /*jshint validthis:true */
    clearTimeout(this.timer);
    this.onError(e);
}

/******************************************************************************************
 * Loader Class
 * Will invoke the onComplete callback right away if there
 * are no images to load.
*******************************************************************************************/
var Loader = function(args){
    if (args.urls.length === 0) {
        args.onComplete();
    } else {
        Build.apply(this, arguments);
    }
};

Loader.prototype = {
    constructor: Loader,
    destroy: function(){
        this.parent = null;
        this.items = null;
        this.onReady = null;
        this.onError = null;
        this.binded = null;
        this.timer = null;
    }
};

// sharing
_self.Class = Loader;

}(this, document, SVIDEO, SVIDEO.module('ImageLoader')));