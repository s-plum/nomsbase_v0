var mongoose = require('mongoose'),	notFoundError = { error: 'Not found.'},	User = require('../models/user'),	fs = require('fs-extra'),	multiparty = require('multiparty'),	db = mongoose.connection,	im = require('imagemagick'),	async = require('async'),	del = require('del'),	Upload = require('s3-uploader');var saveRecipeImage = function(res, file, recipe, cb) {	var imgRoot = '/img/recipe-img/';	fs.readFile(file.path, function(err, data) {		if (err) {			cb(recipe);		}		else {			var defaultDirs = [				'./tmp' + imgRoot,				'./dist' + imgRoot,				'./dist' + imgRoot + 'thumb/'			];			async.each(defaultDirs, function(dir, cb) {				fs.ensureDir(dir, function (err) {					cb(err);				});			}, function(err) {				if (err) {					console.log(err);				}				//save to temp folder for resizing				var date = new Date();				var filename = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + recipe.name.replace(/\s/g, '-').replace(/'/g, '').toLowerCase() + '.' + file.originalFilename.split('.').reverse()[0];				var tmpFilePath = './tmp' + imgRoot + filename;				fs.writeFile(tmpFilePath, data, function(err) {					if (err) {						console.log(err);						return res.send(err);					}					else {						var client = new Upload('nomsbase', {							aws: {								region: 'us-west-2'							},							resize: {								quality: 100							},							cleanup: {								versions: true,								original: true							},							versions: [								{									maxWidth: 500,									maxHeight: 500,									format: 'jpg',									suffix: '-thumb',									quality: 100								},								{									maxWidth: 1000,									maxHeight: 1000,									format: 'jpg',									suffix: '-full',									quality: 100								},								{									maxWidth: 3000,									maxHeight: 3000,									format: 'jpg',									suffix: '-orig',									quality: 100								}							]						});						client.upload(tmpFilePath, {}, function(err, versions, meta) {							del.sync(tmpFilePath);							if (err) {								console.log(err);								return res.send(err);							}							recipe.imageUrl = versions[1].url;							recipe.thumbUrl = versions[0].url;							return cb(recipe);						});						// var sizes = [						// 	{						// 		src: imgRoot + 'thumb/' + filename,						// 		width: 500						// 	},						// 	{						// 		src: imgRoot + filename,						// 		width: 1000						// 	}						// ];						// async.each(sizes, function(img, cb) {						// 		im.resize({						// 			srcPath: tmpFilePath,						// 			dstPath: './dist' + img.src,						// 			width: img.width						// 		}, function(err) {						// 			cb(err);						// 		});						// 	}, function(err, results) {						// 	if (err) {						// 		return res.send(err);						// 	}						// 	recipe.imageUrl = sizes[1].src;						// 	recipe.thumbUrl = sizes[0].src;						// 	cb(recipe);						// 	//clean up temp file						// 	del.sync(tmpFilePath);						// });					}				});			});		}	});};var createRecipe = function(res, recipe) {	db.collection('counters').findAndModify({"_id": "recipeid"}, [], {$inc: {"seq": 1}}, {}, function(err, doc) {		if (!doc) {			recipe['recipeid'] = new Date().getTime();		}		else {			recipe['recipeid'] = doc.seq;		}		db.collection('recipes').insert(recipe, function(err, doc) {			if (err || doc.length === 0) {				res.send(err);			}			else {				res.send(doc[0]);			}		});	});		};var updateRecipe = function(res, recipe) {	if (typeof recipe._id == 'string') {		recipe._id = mongoose.Types.ObjectId(recipe._id);	}	db.collection('recipes').save(recipe, function(err, type, response) {		if (err) {			res.send(err);		}		else {			res.send(response);		}	});};exports.update = function(req, res) {	var form = new multiparty.Form();    form.parse(req, function(err, fields, files) {    	if (err) {    		console.log(err);		}		else {			var recipe = JSON.parse(fields.recipe[0]);			var callback = recipe._id ? updateRecipe : createRecipe;			//save image file, if one is available			if (files && files.file0 && files.file0.length === 1) {				saveRecipeImage(res, files.file0[0], recipe, function() {					callback(res, recipe);				});			}			else {				callback(res, recipe);			}		}    });};exports.get = function(db) {	return function(req, res) {		var collection = db.collection('recipes');		collection.find({recipeid: parseInt(req.params.id)}).toArray(function(err, results) {			if (err || results.length === 0) {				res.send(notFoundError);			}			else {				if (results.length > 0) {					res.send(results[0]);				}			}		})	}};exports.search = function(db) {	return function(req, res) {		var regex = req.params.query;		if (req.params.query.indexOf('+') >= 0) {			var regex = new RegExp(req.params.query.split('+').join('|'));		}		db.collection('recipes').find({ $or: [				{ 					name: {						$regex: regex,						$options: 'i'					}				},				{					"ingredientGroups.ingredients.type": {						$regex: regex,						$options: 'i'					}				},				{					tags: {						$in: [req.params.query]					}				}			]}).toArray(function(err, results) {			if (err) {				res.send(notFoundError);			}			else {				res.send(results);			}		})	}};exports.getRandom = function(db) {	return function(req, res) {		db.collection('recipes').count(function(err, count) {			if (err || count === 0) {				res.send(notFoundError);			}			var rand = Math.floor(Math.random() * (count - 1));			db.collection('recipes').find().limit(-1).skip(rand).nextObject(function(err, result) {				if (err || !result || !result.recipeid) {					res.send(notFoundError);				}				res.send({recipeid:result.recipeid})			});		});	}};exports.validateUser = function(db) {	return function(req, res) {		User.findOne({ username: req.body.username }, function(err, user) {			if (err) {				res.send({error: 'Data error', isValid:false});			}			if (user === null) {				res.send({error: 'Username not found', isValid:false});			}			else {				user.comparePassword(req.body.password, function(err, isMatch) {			        if (err || !isMatch) {			        	res.send({error: 'Invalid password', isValid:false});			        }			        res.send({isValid:true});			    });			}		});	}};