module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            sass: {
                files: ['src/sass/*.scss', 'src/sass/modules/*.scss'],
                tasks: 'sass'
            },
            imageoptim: {
                files: ['public/media', 'public/img'],
                tasks: 'imageoptim'                
            },
            coffeelint: {
                files: ['src/coffeescripts/*.coffee'],
                tasks: 'coffeelint'
            },
            coffee: {
                files: ['src/coffeescripts/*.coffee'],
                tasks: 'coffee'
            },
            concat: {
                files: ['<%= concat.dist.src %>', '<%= concat.dist.dest %>'],
                tasks: 'concat'
            },
            uglify: {
                files: ['<%= uglify.build.src %>', '<%= uglify.build.dest %>'],
                tasks: 'uglify'
            },
            jade: {
                files: ['src/partials/*.jade', 'src/views/*.jade'],
                tasks: 'jade'
            },
            js: {
                files: ['public/js/**', 'src/js/*.js'],
                tasks: ['jshint']
            }
        },
        sass: {
            dist: {
                files: {
                    'public/css/master.css': 'src/sass/master.scss'
                }
            }
        },
        imageoptim: {
              myTask: {
                  src: ['public/media', 'public/img']
              }
        },
        jade: {
            compile: {
                options: {
                    pretty: true,
                    data: {
                        debug: false
                    }
                },
                files: {
                    "index.html": "src/views/front.jade"
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'public/js/master.js',
                dest: 'public/js/master.min.js'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/js/main.js', 'src/js/table-svg.js'],
                dest: 'public/js/master.js'
            }
        },
        coffee: {
            compile: {
                files: {
                    'src/js/table-svg.js': 'src/coffeescripts/table-svg.coffee'
                }
            }
        },
        jshint: {
            all: ['gruntfile.js', 'src/js/main.js']
        },
        coffeelint: {
            files: ['src/coffeescripts/*.coffee'],
            options: {
              'no_trailing_whitespace': {
                  'level': 'error'
              },
              'max_line_length': {
                  'level': 'ignore'
              }
          }
        }
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-imageoptim');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);
    
    // Optimize images.
    grunt.registerTask('img', ['imageoptim']);
    
    // Default task(s).
    grunt.registerTask('default', ['sass', 'jade', 'coffeelint', 'coffee', 'concat', 'uglify', 'jshint', 'watch']);

};