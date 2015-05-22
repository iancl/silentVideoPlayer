// Karma configuration
// Generated on Fri Apr 24 2015 12:17:29 GMT-0400 (EDT)

module.exports = function(config) {
    'use strict';
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'specs/stubs.js'},
        {pattern: 'src/js/main.js'},
        {pattern: 'src/js/utils.js'},
        {pattern: 'src/js/deviceDetection.js'},
        {pattern: 'src/js/imageLoader.js'},
        {pattern: 'src/js/previewControls.js'},
        {pattern: 'src/js/video.js'},
        {pattern: 'src/js/canvasPlayer.js'},
        {pattern: 'src/js/videoPlayer.js'},
        {pattern: 'src/js/overlay.js'},
        {pattern: 'src/js/player.js'},
        {pattern: 'specs/**/*.js'}
    ],


    // list of files to exclude
    exclude: [
    ],

    proxies:  {
        '/assets': 'http://localhost:9001/assets/'
    },


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS', 'Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
