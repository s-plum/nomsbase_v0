nomsbase
========

> A lean, MEAN, noms recipe lookup machine. Not quite fully baked and out of the oven just yet.

##Ingredients

* [MongoDB](http://www.mongodb.org/) - data storage
* [Express](http://expressjs.com/) - routing
* [AngularJS](https://angularjs.org/) - data-binding magic
* [Node.js](http://nodejs.org/) - your friendly neighborhood server

##Kitchen Gadgets

* [Gulp](http://gulpjs.com/) - I drink your build process. I drink it up.
* [Sass](http://sass-lang.com/) - because I can't live without it
* [Browserify](http://browserify.org/) - modular code is happy code

##Accessing Nomsbase
Nomsbase is a single-page Angular application, with a tiny API for querying the actual recipe data on the side. The MongoDB instance has yet to be migrated from my local machine (I know, I know, I'm getting there). In order to run the application locally, you must have a local copy of the nomsbase MongoDB instance set up.

The local environment uses Gulp to compile, concatenate, and clean up all site resources. After moving files from the "src" (raw) to "dist" (compiled) directory, Gulp connects to the local database and launches the Node application.

You can view the application once it has launched by visiting //localhost:3000 in your favorite browser.


##Environment Flavors

###Development

`gulp` or `gulp --env dev`

* Continuous compilation of CSS (via [Compass](http://compass-style.org/)) and Javascript (via Browserify) as files are changed
* [Autoprefixer](https://github.com/postcss/autoprefixer) 
* Livereload as files change (must have the [Livereload browser extension](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-) installed and enabled on the page)
* Ability to add and edit recipes (only available in dev)
	* Add new recipes at //localhost:3000/new
	* Edit existing recipes at //localhost:3000/edit/[recipe id]/[recipe name]

###Production

`gulp --env prod`

* Javascript minification (courtesy of [UglifyJs](https://github.com/mishoo/UglifyJS))
* Autoprefixer
