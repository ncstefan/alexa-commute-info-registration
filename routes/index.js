
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { appTitle: 'Commute Info Service Registration', theme:'united'});

console.log("routes/index()" );

};

/*
 * GET privacy policy page.
 */

exports.privacy = function(req, res){
  res.render('privacy');

console.log("routes/privacy()" );

};
