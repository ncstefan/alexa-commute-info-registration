
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { appTitle: 'Commute Info Registration', theme:'united'});

console.log("routes/index()" );

};
