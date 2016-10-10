
/*
 * GET home page.
 */

exports.menu = function(req, res){
  res.render('menu.html', { title: 'E-Health' });
};