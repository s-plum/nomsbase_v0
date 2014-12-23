exports.index = function(req, res){
  res.render('index', {title: 'nomsbase'});
};

exports.recipe = function(db) {
	return function(req, res) {
		var title = req.params.id.split('-').join(' ');
		res.render('edit', {title:title});
	}
}

exports.new = function(req, res) {
	res.render('edit', {title:'expand nomsbase'});
}

exports.edit = function(db) {
	return function(req, res) {
		res.render('edit', {title:'update nomsbase'});
	}
}

exports.recipes = function(req, res) {
	if (req.query && req.query.q) var title = req.query.q;
	else var title = req.params.query.split('-').join(' ');
	res.render('edit', {title:title + ' recipes'});
}

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name, {
	  layout: false
  });
};

