nomsbase
========

> A lean, MEAN, noms recipe lookup machine.

## Ingredients

* [MongoDB](http://www.mongodb.org/) - data storage
* [Express](http://expressjs.com/) - routing
* [AngularJS](https://angularjs.org/) - data-binding magic
* [Node.js](http://nodejs.org/) - your friendly neighborhood server

## Kitchen Gadgets

* [Gulp](http://gulpjs.com/) - I drink your build process. I drink it up.
* [Sass](http://sass-lang.com/) and [Compass](http://compass-style.org/) - because I can't live without them
* [Autoprefixer](https://github.com/postcss/autoprefixer) 
* [Browserify](http://browserify.org/) - modular code is happy code
* [UglifyJs](https://github.com/mishoo/UglifyJS) - Javascript minification (only in production)

## Let's Get Cooking

I promise that this is the last instance of baking-related wordplay in this README.

1. Install dependencies
	```
	sudo npm install
	bower install
	```

2. Compile the site files
	```
	gulp build
	```

	In the production environment, be sure to add the `--minify` argument.

3. Start the server:
	* Local: `gulp serve` (with the optional `--watch` argument to enable [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) during development)
	* Production: `pm2 restart app` (restarts the app on the remote server)
