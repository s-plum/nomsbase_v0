module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compass: {
			dist: {
				options: {
					basePath: 'public',
					sassDir: 'css/src',
					cssDir: 'css',
					imagesDir: 'img',
					outputStyle: 'compressed',
					relativeAssets: true,
					watch: true
				}
			}
		},
		shell: {
			mongo: {
				command: 'mongod',
				options: {
					async: true
				}
			}
		},
		nodemon: {
		  dev: {
		    options: {
		      file: 'app.js',
		      env: {
		        PORT: '3000'
		      }
		    }
		  }
		},
		concurrent: {
		    tasks: ['shell:mongo','nodemon','compass'],
		    options: {
		      logConcurrentOutput: true
		    }
		}
	});
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-shell-spawn');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.registerTask('default', ['concurrent:tasks']);
};