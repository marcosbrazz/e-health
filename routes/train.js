
/*
 * GET train page.
 */

exports.train = function(req, res){
  res.render('train.html', { title: 'E-Health' });
};