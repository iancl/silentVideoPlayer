/**
 * Player MODULE
 *
 * showOverlay()
 * hideOverlay()
 * playOverlay()
 * pauseOverlay()
 * seekOverlay(percentage:int)
 * getOverlayVideo()
 * playPreview()
 * pausePreview()
 * seekPreview(percentage:int)
 * restartPreview()
 * getPreviewVideo()
 * hidePreviewVideo()
 * showPreviewVideo()
 * destroy()
 */
(function(window, document, _app, _self, undefined){
'use strict';
var
/******************************************************************************************
 * Modules
*******************************************************************************************/

// Modules
Device = _app.module("deviceInfo"),
VideoPlayer = _app.module("videoPlayer").Class,
Overlay = _app.module("overlay").Class,
ImageLoader = _app.module("ImageLoader").Class,
CanvasPlayer = _app.module("canvasPlayer").Class,
Utils = _app.module("utils");

/******************************************************************************************
 * Setup
*******************************************************************************************/
function Build(conf){
    this.conf = conf;

    // creates binded object and binds contexts
    bind(this);

    // this will just load the images
    // no need to pass the image object as
    // it will be already loaded in memory
    // when onComplete callback is invoked
    loadImages(this);

    // Listen to window size changes
    Device.Observer.subscribe(this.binded.viewportResize);
}

/**
 * All funtion context bindings should be defined here
 * @param  {Player} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.viewportResize = onViewportResize.bind(self);
    self.binded.onEssentialImagesLoaded = onEssentialImagesLoaded.bind(self);
    self.binded.onLoadingImagesError = onLoadingImagesError.bind(self);
}

/**
 * Will create an instance of the ImageLoader so it
 * can load all the essential images like spinnner, etc
 * @param  @param  {Player} self current instance
 * @return {Void}
 */
function loadImages(self){

    var urls = [];

    if (self.conf.preview.playButton) {
        urls.push(self.conf.preview.playButton.src);
    }
    if (self.conf.preview.loadingImg) {
        urls.push(self.conf.preview.loadingImg.src);
    }

    self.essentialImages = new ImageLoader({
        parent: self,
        urls: urls,
        timeout: 500,
        onComplete: self.binded.onEssentialImagesLoaded,
        onError: self.binded.onLoadingImagesError
    });
}

/**
 * Invoked when the window size changes
 * @return {Void}
 */
function onViewportResize(){
    /*jshint validthis:true */
    getContainerStyles(this);
}

/**
 * Initializes the components of the player
 * @param  {Player} self current instance
 * @return {Void}
 */
function initPlayer(self){
    self.el = self.conf.selector;
    getContainerStyles(self);
    self.previewPlayer = setupPreviewPlayer(self);

    if (self.conf.overlay) {
        self.overlay = new Overlay(self, self.conf.overlay);
    }

}

/**
 * invoked when the images are loaded
 * @return {Void}
 */
function onEssentialImagesLoaded(){
    /*jshint validthis:true */
    initPlayer(this);
}

/**
 * invoked if there is an error loading the images
 * @param  {Event} e Event passed by the Image Loader Instance
 * @return {Void}
 */

function onLoadingImagesError(e){
    throw e;
}

/**
 * Stores the styles of the player container
 * @param  {Player} self current instance
 * @return {Void}
 */
function getContainerStyles(self){
    var parentStyles = window.getComputedStyle(self.el);

    self.conf.preview.video.size = {
        w: parentStyles.getPropertyValue("width"),
        h: parentStyles.getPropertyValue("height"),
        raw: {
            w: parentStyles.getPropertyValue("width").replace("px", ""),
            h: parentStyles.getPropertyValue("height").replace("px", "")
        }
    };
}

/**
 * Determines if the current device is mobile or tablet or not
 * if it is mobile or tablet, it will create a new instance
 * of the canvas player, else, it will create a video player
 * @param  {Player} self              current instance
 * @return {CanvasPlayer||VideoPlayer} new instance
 */
function setupPreviewPlayer(self){
    var PlayerClass;

    if (Device.info.type === "tablet" || Device.info.type === "mobile"){
        PlayerClass = CanvasPlayer;
    } else { // desktop or unsuported device
        PlayerClass = VideoPlayer;
    }

    return new PlayerClass(self.conf.preview, self);
}

/******************************************************************************************
 * Player Class
 * Methods are self explanatory
*******************************************************************************************/
var Player = function(){
    Build.apply(this, arguments);
};

Player.prototype = {
    // OVERLAY
    showOverlay: function(){
        if (this.conf.overlay) {
            this.overlay.show();
        }
    },
    hideOverlay: function(){
        if (this.conf.overlay) {
            this.overlay.hide();
        }
    },
    playOverlay: function(){
        if (this.conf.overlay) {
            this.overlay.play();
        }
    },
    pauseOverlay: function(){
        if (this.conf.overlay) {
            this.overlay.pause();
        }
    },
    seekOverlay: function(percentage){
        if (this.conf.overlay) {
            this.overlay.seek(percentage);
        }
    },
    getOverlayVideo: function(){
        if (this.conf.overlay) {
            return this.overlay.getVideo();
        }
    },

    // PREVIEW
    playPreview: function(){
        this.previewPlayer.play();
    },
    pausePreview: function(){
        this.previewPlayer.pause();
    },
    seekPreview: function(pos){
        this.previewPlayer.seek(pos);
    },
    restartPreview: function(){
        this.previewPlayer.restart();
    },
    getPreviewVideo: function(){
        return this.previewPlayer.getVideo();
    },
    hidePreviewVideo: function(){
        this.previewPlayer.hide();
    },
    showPreviewVideo: function(){
        this.previewPlayer.show();
    },
    destroy: function(){
        Device.Observer.release();
        this.essentialImages.destroy();

        this.previewPlayer.destroy();

        if (this.conf.overlay) {
            this.overlay.destroy();
        }

        Utils.removeElement(this.el);
        this.binded = null;
        this.essentialImages = null;
        this.previewPlayer = null;
        this.overlay = null;
        this.el = null;

    }
};

// sharing
_self.Class = Player;

}(this, document, SVIDEO, SVIDEO.module('player')));