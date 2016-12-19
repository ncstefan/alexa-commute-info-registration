
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { appTitle: 'Commute Info Registration'});

console.log("routes/index()" );

};
