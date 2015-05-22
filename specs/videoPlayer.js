/**
 * Testing the player's overlay and preview video player
 * Video playback and event bindings are not yet supported in phantomjs
 * so I created stubs for elements, images, and videos where
 * the event binding callbacks are being fired right after binding them
 *
 * To test the mobile player, change the user agent while in chrome
 */
describe('Silent Video Player', function(){

/******************************************************************************************
 * VARS
 *******************************************************************************************/
    var PreviewEvents = {
        onPreviewTap: function(){},
        onVideoReady: function(){},
        onVideoProgress: function(){},
        onVideoEnd: function(){},
        onVideoStart: function(){}
    };

    var OverlayEvents = {
        onShowOverlay: function(){},
        onHideOverlay: function(){},
        onCloseButtonTapped: function(){},
        onVideoReady: function(){},
        onVideoProgress: function(){},
        onVideoEnd: function(){},
        onVideoStart: function(){}
    };

    var $el = document.createElement("div");

    var Video = function(name){
        this.name = name;
        this.currentTime = 0;
        this.duration = 5;
    };

    Video.prototype = {
        addEventListener: function(name, fn){

            setTimeout(function(){
                fn();
            }, 0);
        },
        removeEventListener: function(){},
        style: {
            cssText: ""
        },
        pause: function(){},
        play: function(){},
        webkitExitFullScreen: function(){}
    };

/******************************************************************************************
 * SETTING UP
 *******************************************************************************************/
    beforeEach(function(){
        window.SVIDEOReady = function(){};
    });

    afterEach(function(){
        delete window.SVIDEOReady;
    });

/******************************************************************************************
 * TESTS
 *******************************************************************************************/
    /**
     * SVIDEO.Player will be generated after the page loads
     */
    it('As the SVIDEO.Player class will be undefined at load time', function(){
            expect(SVIDEO.Player).not.toBeDefined();
    });

    /**
     * Once the SVIDEO library is loaded, it should invoke the SVIDEOReady once it is done loading
     * and its ready to be used
     */
    it('SVIDEOReady callback should be invoked at the beginning', function(done){

        spyOn(window, 'SVIDEOReady');

        setTimeout(function(){
            expect(window.SVIDEOReady).toHaveBeenCalled();
            done();
        },150);

    });

    /**
     * SVIDEO will invoke the SVIDEOReady(); function when the library is ready and only if the SVIDEOReady
     * is available.
     * After that the SVIDEO.Player should be available for instantiation
     */
    it('SVIDEO.Player class should be available if used after the api has loaded', function(){
            expect(SVIDEO.Player).toBeDefined();
    });

    /**
     * Create new player instance
     * The video player emits a series of html5 video events
     * and as videos are not supported in phantomJS
     * we can only test if the video instance was created.
     */
    it('creating a new SVIDEO.Player instance', function(done){

        spyOn(OverlayEvents, 'onVideoReady');
        spyOn(OverlayEvents, 'onShowOverlay');
        spyOn(OverlayEvents, 'onHideOverlay');
        spyOn(OverlayEvents, 'onVideoStart');
        spyOn(OverlayEvents, 'onVideoEnd');
        spyOn(OverlayEvents, 'onVideoProgress');


        spyOn(PreviewEvents, 'onVideoReady');
        spyOn(PreviewEvents, 'onVideoStart');
        spyOn(PreviewEvents, 'onVideoEnd');
        spyOn(PreviewEvents, 'onVideoProgress');

        var config = {
            // html element that will contain the player
            // the preview player will expand and fill this element
            selector: $el,

            // this is the muted preview
            preview: {
                // PhantomJS does not support videos
                // passing this so that the modules that use video
                // will emit dummy events
                _testVideo: new Video("preview"),
                video: {
                    // there can be multiple sources
                    sources: [
                        { src: "assets/video/vid_crop.mp4", type: "mp4"}
                    ],
                    // you can add additional attributes
                    // attributes: ['loop', 'value="property"'],

                    // The frames the canvas player will use
                    // images should have a name that ends in a sequencial number
                    // i.e: frame_0.jpg, frame_1.jpg, frame_2.jpg...
                    // First image should start with the number 0
                    frames: {
                        baseName: "assets/video/frames2/frame_",
                        type: "jpg",                                // Image extension
                        count: 2,                                  // Total of frames to animate
                        fps: 8,                                     // speed of the playback
                        showFPS: false                              // render FPS rate
                    },
                },

                // If play button is not needed, you can comment the whole
                // play button key
                playButton: {
                    src: "assets/player/playBtn.png",
                    styles: {
                        "width": "64px",
                        "height": "64px",
                        "top": "50%",
                        "left": "50%",
                        "margin": "-32px 0 0 -32px"
                    }
                },

                // loading image can be commented too if it is not necessary
                loadingImg: {
                    src: "assets/player/spinner.gif",
                    styles: {
                        "width": "36px",
                        "height": "36px",
                        "top": "50%",
                        "left": "50%",
                        "margin": "-18px 0 0 -18px"
                    }
                },

                // Listen to events
                events: PreviewEvents
            },

            // video overlay
            // you can comment the whole overlay object if all you want to use
            // is the video preview
            overlay: {
                // PhantomJS does not support videos
                // passing this so that the modules that use video
                // will emit dummy events
                _testVideo: new Video("overlay"),
                styles: {
                    "background-color": "rgba(255,255,255,0.8)"
                },
                // this is the button that will close the overlay
                closeImage: {
                    src: "assets/player/close.png",
                    styles: {
                        "width": "34px",
                        "height": "33px",
                        "top":"25px",
                        "right": "25px"
                    }
                },

                // the video element inside the overlay
                video: {
                    sources: [
                        { src: "assets/video/vid_crop.mp4", type: "mp4" }
                    ],
                    // attributes: ['loop'],
                    styles: {
                        "width": "640px",
                        "height": "360px",
                        // centering the video below
                        "top": "50%",
                        "left": "50%",
                        "margin": "-180px 0 0 -320px"
                    }
                },
                events: OverlayEvents
            }
        };


        var player = new SVIDEO.Player(config);

        // Player instance must exist
        expect(player).toBeDefined();
        expect(player instanceof SVIDEO.Player).toBe(true);

        // expect player to have the parent container dimentions
        expect(player.conf.preview.video.size.raw.w).toBe("640");
        expect(player.conf.preview.video.size.raw.h).toBe("480");

        // init playback in both video players
        player.playPreview();
        player.showOverlay();

        // Allow a small delay before checking if the callbacks were invoked
        // NOTE: When videos, the events will be fired right away
        //       Canvas player will fire all event appropriately
        setTimeout(function(){

            // OVERLAY EVENTS
            expect(OverlayEvents.onVideoReady).toHaveBeenCalled();
            expect(OverlayEvents.onVideoStart).toHaveBeenCalled();
            expect(OverlayEvents.onVideoEnd).toHaveBeenCalled();
            expect(OverlayEvents.onVideoProgress).toHaveBeenCalled();
            expect(OverlayEvents.onShowOverlay).toHaveBeenCalled();
            expect(OverlayEvents.onHideOverlay).toHaveBeenCalled();


            // VIDEO EVENTS
            expect(PreviewEvents.onVideoReady).toHaveBeenCalled();
            expect(PreviewEvents.onVideoStart).toHaveBeenCalled();
            expect(PreviewEvents.onVideoEnd).toHaveBeenCalled();
            expect(PreviewEvents.onVideoProgress).toHaveBeenCalled();

            done();
        },500);
    });
});





