/**
 * PREVIEW VIDEO CONTROLS  MODULE
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
 * Play button and loading spinner are optional
 * so if they are not defined in the configuration
 * they won't be created
*******************************************************************************************/
function Build(args){
    this.parent = args.parent;
    this.model = args.model;
    this.callbacks = args.events || {};

    bind(this);
    setupEl(this);

    if (this.model.playButton) {
        setupPlayButton(this);
    }

    if (this.model.loadingImg) {
        setupSpinner(this);
    }

    this.showLoading();
}

/**
 * All funtion context bindings should be defined here
 * @param  {Controls} self current instance
 * @return {Void}
 */
function bind(self){
    self.binded = {};
    self.binded.ontap = onTap.bind(self);
}

/**
 * Creates, styles and appends the controls
 * container to the parent el
 * @param  {Controls} self current instance
 * @return {Void}
 */
function setupEl(self){
    self.el = Utils.tag("div", false,"s_controls");

    Utils.applyStyles(self.el, {
        "position": "absolute",
        "width": "100%",
        "height": "100%",
        "left": 0,
        "top": 0,
        "text-align": "center",
        "cursor": "pointer",
        "-webkit-tap-highlight-color": "rgba(0,0,0,0.0)",
        "-webkit-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "user-select": "none",
        "z-index": "1"
    });

    self.el.addEventListener("click", self.binded.ontap, false);
    self.parent.el.appendChild(self.el);
}

/**
 * Creates the play button, styles it and appends it
 * @param  {Controls} self current instance
 * @return {Void}
 */
function setupPlayButton(self){
    var model = self.model.playButton;

    self.playBtn = Utils.tag("img", false, "s_playBtn");
    self.playBtn.src = model.src;

    Utils.applyStyles(
        self.playBtn,
        Utils.mergeObject(model.styles, {
            "position": "absolute",
            "opacity": "0"
        })
    );

    self.el.appendChild(self.playBtn);
}

/**
 * Creates the loading image, styles it and appends it
 * @param  {Controls} self current instance
 * @return {Void}
 */
function setupSpinner(self){
    var model = self.model.loadingImg;

    self.spinner = Utils.tag("img", false, "s_spinner");
    self.spinner.src = model.src;
    Utils.applyStyles(
        self.spinner,
        Utils.mergeObject(model.styles, {
            "position": "absolute",
            "opacity": "0"
        })
    );
    self.el.appendChild(self.spinner);
}

/**
 * Looks for a key in the callbacks objects
 * if found, it will invoke it.
 * @param  {Controls}  self current video instance
 * @param  {String} name name of the callback
 * @return {Void}
 */
function fireCallback(self, name){
    if(self.callbacks[name]){
        self.callbacks[name]();
    }
}

/**
 * Handler of the ontap event
 * Fires onTap callback
 * @return {Void}
 */
function onTap(){
    /*jshint validthis:true */
    fireCallback(this, "onTap");
}

/******************************************************************************************
 * Controls Class
 * Methods are self explanatory
*******************************************************************************************/
var Controls = function(){
    Build.apply(this, arguments);
};

Controls.prototype = {
    constructor: Controls,
    // hides play button
    // shows spinner
    showLoading: function(){

        if (this.spinner) {
            Utils.applyStyles(this.spinner, {
                "opacity": "1"
            });
        }

        if (this.playBtn) {
            Utils.applyStyles(this.playBtn, {
                "opacity": "0"
            });
        }
    },
    // shows play button
    // hides spinner
    hideLoading: function(){

        if (this.spinner) {
            Utils.applyStyles(this.spinner, {
                "opacity": "0"
            });
        }


        if (this.playBtn) {
            Utils.applyStyles(this.playBtn, {
                "opacity": "1"
            });
        }
    },
    destroy: function(){
        this.el.removeEventListener("click", this.binded.onTap, false);

        if (this.playBtn) {
            Utils.removeElement(this.playBtn);
        }

        if (this.spinner) {
            Utils.removeElement(this.spinner);
        }

        Utils.removeElement(this.el);
        this.parent = null;
        this.model = null;
        this.callbacks = null;
        this.binded = null;
        this.el = null;
    }
};


_self.Class = Controls;

}(this, document, SVIDEO, SVIDEO.module('previewControls')));