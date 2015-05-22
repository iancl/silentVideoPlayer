//stub out body styling:
document.defaultView.getComputedStyle = function(args) {
    var styles = {
        width: "640px",
        height: "480px"
    };

    return {
        getPropertyValue: function(name){
            return styles[name];
        }
    };
};

// PhantomJS doesn't support bind yet
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// dispatching onload right away for all images
window.Image.prototype.addEventListener = function(name, fn){
    if (name === 'load'){
        fn();
    }
};