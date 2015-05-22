module.exports = function(grunt){
    'use strict';

    // load task modules
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /**
         * UGLIFY TASK
         */
        uglify: {
            build: {
                files: {
                    'deploy/js/svideo.min.js':[
                        'src/js/main.js',
                        'src/js/utils.js',
                        'src/js/deviceDetection.js',
                        'src/js/imageLoader.js',
                        'src/js/previewControls.js',
                        'src/js/video.js',
                        'src/js/canvasPlayer.js',
                        'src/js/videoPlayer.js',
                        'src/js/overlay.js',
                        'src/js/player.js'
                    ]
                }
            }
        },

        /**
         * JSHINT TASK
         */
        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            },
            files: {
                src: ['package.json', 'Gruntfile.js', '.jshintrc', 'src/**/*.js', 'specs/**/*.js']
            }
        },

        /**
         * WATCH TASK
         */
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: ['package.json', 'Gruntfile.js', '.jshintrc', 'src/**/*', 'specs/**/*.js'],
                tasks: ['jshint']
            }
        },

        /**
         * PROCESS HTML TASK
         */
        processhtml: {

            // production
            prod: {
                files: {
                   'deploy/index.html': ['src/index.html']
                }
            }
        },

        /**
         * COPY TASK
         */
        copy: {
            media: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/',
                        src: ['**/*.{png,jpg,svg,gif,mp4,webm,m4v}'],
                        dest:'deploy/assets/'
                    }
                ]
            },
            css: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/css/',
                        src: ['**/*.css'],
                        dest:'deploy/css/'
                    }
                ]
            }
        },

        /**
         * CLEAN TASK
         */
        clean: {
            build: {
                src: ["deploy/assets"]
            }
        },

        /**
         * CONNECT TASK
         */
        connect: {
            devServer: {
                options: {
                    keepalive: true,
                    port: 9001,
                    hostname: "0.0.0.0",
                    livereload: true,
                    open: true,
                    base: {
                        path: 'src/',
                        options: {
                            index: 'index.html'
                        }
                    }
                }
            },
            deployServer: {
                options: {
                    keepalive: true,
                    port: 9110,
                    hostname: "0.0.0.0",
                    open: true,
                    base: {
                        path: 'deploy/',
                        options: {
                            index: 'index.html'
                        }
                    }
                }
            }
        }
    });

    // registering all tasks
    grunt.registerTask('serve', 'connect:devServer');
    grunt.registerTask('serveDeploy', 'connect:deployServer');
    grunt.registerTask('default', 'watch');
    grunt.registerTask("deploy", ['uglify', 'clean', 'processhtml', 'copy']);
};