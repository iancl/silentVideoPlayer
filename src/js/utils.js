/**
 * Utils MODULE
 */
(function(window, document, _self, undefined){
'use strict';

/**
 * Creates an HTML tag.
 * @param  {String} type Valide Element tag name.
 * @param  {String} id   This will be set as the element's id.
 * @param  {String} cls  This will be set as the element's class.
 * @return {HTML}   Generated Html element.
 */
_self.tag = function(type, id, cls){
    var tag = document.createElement(type);

    if (id){
        tag.id = id;
    }

    if (cls){
        tag.className = cls;
    }

    return tag;
};

/**
 * Applies css properties and values to an html element
 * @param  {HTML} el       Styles will be applied to this object
 * @param  {Object} styles Object containing styles
 * example: { property: value }, for example { "background-color": "red" }
 * @return {HTML}          The html element with the applied styles
 */
_self.applyStyles = function(el, styles){
    var key, value, css = "";

    for (key in styles){
        value = key+":"+styles[key]+";";
        css += value;
    }

    el.style.cssText += css;
};

/**
 * Merges the keys and values of one object to another.
 * Values can be overridden
 * @param  {Object}  source    Object that contains keys and values that
 *                             will get applied to the target element.
 *
 * @param  {Object}  target    Keys and values from the source object will
 *                             get applied to this element.
 *
 * @param  {Boolean} override  Defines if the values should be overriden.
 *                             Default value is true.
 *
 * @return {Object}            Object that contains the merged styles
 */
_self.mergeObject = function(source, target, override){
    var key;

    override = override || true;

    for(key in source){
        if (override === true) {
            target[key] = source[key];
        } else {
            if (!target[key]) {
                target[key] = source[key];
            }
        }
    }

    return target;
};

/**
 * Generates a string containing html text
 * @param  {Array} attributes  a collection of html valid video attributes
 * @param  {Array} sources     A collection of objects that contain the
 *                             path of a video and the type of video
 *                             An example would be:
 * [ { src: "assets/video/video.mp4", type: "mp4" }, { src: "assets/video/video.m4v", type: "m4v" }]
 *
 * @return {String}            A html string containing the video and sources tags.
 */
_self.generateVideoString = function(attributes, sources) {
    var i,
        video = "<video ",
        src = "";

    for(i=0; i<attributes.length; i++){
        video += attributes[i]+" ";
    }

    video = video.substring(0, video.length - 1) + ">";

    for(i=0; i<sources.length; i++){
        src += '\n<source src="'+ sources[i].src +'" type="video/'+sources[i].type+'" />';
    }

    video += (src + "\n</video>");

    return video;
};


/**
 * Removes an element from the DOM
 * @param  {HTML}   el the html node to remove
 * @return {Void}
 */
_self.removeElement = function(el){
    el.parentNode.removeChild(el);
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
        window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {

        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());


}(this, document, SVIDEO.module("utils")));