var mongoose = require('mongoose'),	notFoundError = { error: 'Not found.'},	User = require('../models/user'),	fs = require('fs'),	multiparty = require('multiparty'),	db = mongoose.connection;var saveRecipeImage = function(file, recipe, cb) {	fs.readFile(file.path, function(err, data) {		if (err) {			cb(recipe);		}		else {			var filepath = '/img/recipe-img/' + file.originalFilename;			fs.writeFile('./dist' + filepath, data, function(err) {				if (!err) {					recipe.imageUrl = filepath;				}				else {					console.log(err);				}				cb(recipe);			});		}	});};var createRecipe = function(res, recipe) {	db.collection('counters').findAndModify({"_id": "recipeid"}, [], {$inc: {"seq": 1}}, {}, function(err, doc) {		if (!doc) {			recipe['recipeid'] = new Date().getTime();		}		else {			recipe['recipeid'] = doc.seq;		}		db.collection('recipes').insert(recipe, function(err, doc) {			if (err || doc.length === 0) {				res.send(err);			}			else {				res.send(doc[0]);			}		});	});		};var updateRecipe = function(res, recipe) {	if (typeof recipe._id == 'string') {		recipe._id = mongoose.Types.ObjectId(recipe._id);	}	db.collection('recipes').save(recipe, function(err, type, response) {		if (err) {			res.send(err);		}		else {			res.send(response);		}	});};exports.update = function() {	return function(req, res) {		var form = new multiparty.Form();	    form.parse(req, function(err, fields, files) {	    	if (err) {				res.send(err);			}			else {				var recipe = JSON.parse(fields.recipe[0]);				var callback = recipe._id ? updateRecipe : createRecipe;				//save image file, if one is available				if (files && files.file0 && files.file0.length === 1) {					saveRecipeImage(files.file0[0], recipe, function() {						callback(res, recipe);					});				}				else {					callback(res, recipe);				}			}	    });	}};exports.get = function(db) {	return function(req, res) {		var collection = db.collection('recipes');		collection.find({recipeid: parseInt(req.params.id)}).toArray(function(err, results) {			if (err || results.length === 0) {				res.send(notFoundError);			}			else {				if (results.length > 0) {					res.send(results[0]);				}			}		})	}};exports.search = function(db) {	return function(req, res) {		var regex = req.params.query;		if (req.params.query.indexOf('+') >= 0) {			var regex = new RegExp(req.params.query.split('+').join('|'));		}		db.collection('recipes').find({ $or: [				{ 					name: {						$regex: regex,						$options: 'i'					}				},				{					"ingredientGroups.ingredients.type": {						$regex: regex,						$options: 'i'					}				},				{					tags: {						$in: [req.params.query]					}				}			]}).toArray(function(err, results) {			if (err) {				res.send(notFoundError);			}			else {				res.send(results);			}		})	}};exports.getRandom = function(db) {	return function(req, res) {		db.collection('recipes').count(function(err, count) {			if (err || count === 0) {				res.send(notFoundError);			}			var rand = Math.floor(Math.random() * (count - 1));			db.collection('recipes').find().limit(-1).skip(rand).nextObject(function(err, result) {				if (err || !result || !result.recipeid) {					res.send(notFoundError);				}				res.send({recipeid:result.recipeid})			});		});	}};exports.validateUser = function(db) {	return function(req, res) {		User.findOne({ username: req.body.username }, function(err, user) {			if (err) {				res.send({error: 'Data error', isValid:false});			}			if (user === null) {				res.send({error: 'Username not found', isValid:false});			}			else {				user.comparePassword(req.body.password, function(err, isMatch) {			        if (err || !isMatch) {			        	res.send({error: 'Invalid password', isValid:false});			        }			        res.send({isValid:true});			    });			}		});	}};