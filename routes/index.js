
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.addrecipe = function(db) {
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