var mysql  = require('mysql');

var pool = mysql.createPool({
	  host     : 'localhost',
	  user     : 'root',
	  database : 'escenic',
	  password : ''
});

var sqlSections = "select sectionID, uniqueName from Section where uniqueName like '%config%'";

var sqlConfigSections = "select distinct t.codeText as widget, s.uniqueName as configsection, l.lastModified, ";
	sqlConfigSections += "pub.publicationName as publication, secp.sectionPath as path ";
	sqlConfigSections += "from Section s, ArticleList l, Articletype t, PoolEntry pe, SectionPool sp, Pool p, Publication pub, SectionPath secp "; 
	sqlConfigSections += "where s.uniqueName like '%config%' "; 
	sqlConfigSections += "and s.sectionID = l.sectionID and l.articleType = t.codeID and pe.articleID = l.articleID ";
	sqlConfigSections += "and sp.sectionID = s.sectionID and sp.poolID = pe.poolID and p.poolID = sp.poolID ";
	sqlConfigSections += "and pub.referenceID = s.referenceID and s.sectionID = secp.sectionID "
	//sqlConfigSections += "group by s.uniqueName";
	sqlConfigSections += "order by widget, publication, configsection";

exports.fetchSections = function(cb) {
	var sections = {};
	pool.getConnection(function(err,connection) {
		if (err) console.log(err);
		connection.query(sqlSections, function(err,rows,fields){
		 	if (err) throw err;
			for (row in rows) {
				var d = rows[row];
				sections[d.sectionID] = d.uniqueName;
			}
			cb(sections);
		});
		setTimeout(connection.release(),5000);
	});
};

exports.fetchWidgetConfigs = function (cb) {
	pool.getConnection(function(err,connection) {
		connection.query(sqlConfigSections, function(err, rows, fields) {
			  if (err) throw err;
			  cb(rows);
		});
		setTimeout(connection.release(),5000);
	});
};

/*TODO: 1) check out connection.end bug.
		2) deep copy result...
*/
