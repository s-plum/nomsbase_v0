var path = require('path');

exports.index = function(req, res){
  res.sendfile(path.resolve(__dirname + '/../dist/index.html'));
};

