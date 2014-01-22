exports.index = function(req, res){
  res.render('index', {title: 'babiez'});
};

exports.recipe = function(db) {
	return function(req, res) {
		var title = req.params.id.split('-').join(' ');
		res.render('index', {title:title});
	}
}

exports.new = function(req, res) {
	res.render('index', {title:'expand nomsbase'});
}

exports.edit = function(db) {
	return function(req, res) {
		res.render('index', {title:'update nomsbase'});
	}
}

exports.recipes = function(req, res) {
	var title = req.params.id.split('-').join(' ');
	res.render('index', {title:title + ' recipes'});
}

exports.add = function(db) {
	return function(req, res) {
		var collection = db.collection('nomsbase');
		collection.insert(req.body, function(err, doc) {
			if (err) {
				res.send('shit!');
			}
			else {
				res.send('OK');
			}
		});
	}
};

exports.get = function(db) {
	return function(req, res) {
		var collection = db.collection('nomsbase');
		collection.find({name: {$regex: req.params.id, $options: 'i'}}).toArray(function(err, results) {
			if (err) {
				res.send('shit!');
			}
			else {
				res.send(results[0]);
			}
		})
	}
}

exports.search = function(db) {
	return function(req, res) {
		var collection = db.collection('nomsbase');
		collection.find({ $or: [{name: {$regex: req.params.id, $options: 'i'}},{"ingredients.name" : {$regex: req.params.id, $options: 'i'}}]}).toArray(function(err, results) {
			if (err) {
				res.send('shit!');
			}
			else {
				res.send(results);
			}
		})
	}
}

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name, {
	  layout: false
  });
};

