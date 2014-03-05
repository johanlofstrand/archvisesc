var mysql  = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'escenic',
  password : ''
});

var sqlConfigSections = "select distinct t.codeText as widget, s.uniqueName as configsection, l.lastModified ";
	sqlConfigSections += "from section s, articleList l, articleType t "; 
	sqlConfigSections += "where s.uniqueName like '%config%' "; 
	sqlConfigSections += "and s.sectionID = l.sectionID and l.articleType = t.codeID ";
	sqlConfigSections += " group by s.uniqueName";
	sqlConfigSections += " order by t.codeText, l.lastModified desc;";

exports.fetchWidgetConfigs = function (cb) {
	var result;
	//connection.connect();
	connection.query(sqlConfigSections, function(err, rows, fields) {
		  if (err) throw err;
		  result = rows;
		  cb(result);
	});
	//connection.end();	
};

/*TODO: 1) check out connection.end bug.
		2) deep copy result...
*/