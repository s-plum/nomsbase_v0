
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {title: 'babiez'});
};

exports.recipe = function(req, res){
	res.render('recipe', {title:'test'});
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

exports.show = function(db) {
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

