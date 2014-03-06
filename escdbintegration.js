var mysql  = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'escenic',
  password : ''
});

var sqlConfigSections = "select distinct t.codeText as widget, s.uniqueName as configsection, l.lastModified ";
	sqlConfigSections += "from section s, articleList l, articleType t, PoolEntry pe, SectionPool sp, Pool p "; 
	sqlConfigSections += "where s.uniqueName like '%config%' "; 
	sqlConfigSections += "and s.sectionID = l.sectionID and l.articleType = t.codeID and pe.articleID = l.articleID ";
	sqlConfigSections += "and sp.sectionID = s.sectionID and sp.poolID = pe.poolID and p.poolID = sp.poolID and s.uniqueName = p.name";
//	sqlConfigSections += " group by s.uniqueName";
	sqlConfigSections += " order by widget, configsection";


exports.fetchWidgetConfigs = function (cb) {
	//connection.connect();
	connection.query(sqlConfigSections, function(err, rows, fields) {
		  if (err) throw err;
		  console.log("Rows: " + rows.length);
		  cb(rows);
	});
	
	connection.end();	
};

/*TODO: 1) check out connection.end bug.
		2) deep copy result...
*/