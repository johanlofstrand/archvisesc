var mysql  = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'escenic',
  password : ''
});

var sqlSections = "select sectionID, uniqueName from section where uniqueName like '%config%'";

var sqlConfigSections = "select distinct t.codeText as widget, s.uniqueName as configsection, l.lastModified, ";
	sqlConfigSections += "pub.publicationName as publication, secp.sectionPath as path ";
	sqlConfigSections += "from section s, articleList l, articleType t, PoolEntry pe, SectionPool sp, Pool p, publication pub, SectionPath secp "; 
	sqlConfigSections += "where s.uniqueName like '%config%' "; 
	sqlConfigSections += "and s.sectionID = l.sectionID and l.articleType = t.codeID and pe.articleID = l.articleID ";
	sqlConfigSections += "and sp.sectionID = s.sectionID and sp.poolID = pe.poolID and p.poolID = sp.poolID and s.uniqueName = p.name ";
	sqlConfigSections += "and pub.referenceID = s.referenceID and s.sectionID = secp.sectionID "
	//sqlConfigSections += "group by s.uniqueName";
	sqlConfigSections += "order by widget, publication, configsection";

exports.fetchSections = function(cb) {
	var sections = {};
	connection.query(sqlSections, function(err,rows,fields){
	 	if (err) throw err;
		for (row in rows) {
			var d = rows[row];
			sections[d.sectionID] = d.uniqueName;
		}
		cb(sections);
	});
};

exports.fetchWidgetConfigs = function (cb) {
	//connection.connect();	
	connection.query(sqlConfigSections, function(err, rows, fields) {
		  if (err) throw err;
		  cb(rows);
	});
	
	//connection.end();	
};

/*TODO: 1) check out connection.end bug.
		2) deep copy result...
*/