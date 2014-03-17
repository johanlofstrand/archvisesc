/* Archvis tool developed by Johan Löfstrand*/

var http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5002;

app.use(express.urlencoded());
app.use(express.json());   
app.use('/public', express.static(__dirname + '/public'));
app.use(express.logger()); //access log

var server = http.createServer(app);
server.listen(port);

app.locals({  //to get a link to the bootstrap - service visualization tool (https://bitbucket.org/svtidevelopers/svtutil-archvis)
  title: 'Architecture visualization tool (node/express + d3)',
  bootstrap_url: "http://nyjenkins:5001/"
});

var escdbintegration = require("./escdbintegration");

//console.log('Web server started now..., listening on %d', port);

/*------------------------------------------------------------*/
					/*Web access*/
/*------------------------------------------------------------*/
app.get('/',function(req,res) {
	escdbintegration.fetchSections(function(sections) {
		escdbintegration.fetchWidgetConfigs(function(data) {
			filterData(sections, data,function(cb){
				var widgetdata = cb;
				res.render("index.ejs",{widgets:widgetdata});
			});	
		});
	});
})

/*------------------------------------------------------------*/
				/*Call and use Escenic db*/
/*------------------------------------------------------------*/

var filterData = function(sections, data,cb) {
	var root = {"name":"Widgets","children":[]};
	var roota = [];

	var widgets = {};
	var values = data;
	//find all widgets
	for (d in data) {
		var widgetname = data[d].widget;
		//console.log("widgetname" + widgetname);
		widgets[widgetname] = [];
	}
	var keys = Object.keys(widgets);
	for (key in keys){
		var keyd = keys[key];
		if(widgets[keyd].length == 0) {
			for (d in data) {
				var datav = data[d];
				//loop over all config sections and get the ones that match the widget
				if (keyd = datav.widget) {
					/*Find the complete path for the config section*/
					var path = datav.path;
					var pathS = path.split("-");
					var csp = "";
					for (p in pathS) {
						var pS = sections[pathS[p]];
						if (pS) csp = csp + " -> " + pS;
					}
					/*Every configsection is a new child element for the widget*/
					widgets[keyd].push({"name":datav.configsection, "publication":datav.publication, "path":csp});
				}
			}
		}
	}

	for (w in widgets) {
		/*Pagination - this part is really a ugly hack, but couldn't put in more time to do a nicer solution...*/
		var wjson;
		if (widgets[w].length>120) {
			var newarr = widgets[w].splice(0,120);
			wjson = {"name":w}
			var first = {"name":"1"};
			first["children"] = newarr;
			var second = {"name":"2"};
			second["children"] = widgets[w];
			wjson = {"name":w};
			wjson["children"] = [];
			wjson["children"].push(first);
			wjson["children"].push(second);
		}
		else {
			wjson = {"name":w,"children":widgets[w]}
		}
		roota.push(wjson);
	}
	root.children = roota;
	cb(root);
}; 

