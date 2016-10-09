
/*
 * GET train page.
 */

exports.list_intercurrences = function(req, res){
  res.render('list_intercurrences.html', { title: 'E-Health' });
};