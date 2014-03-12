/* Archvis tool developed by Johan Löfstrand*/

var http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5002;

app.use(express.urlencoded());
app.use(express.json());   
app.use('/public', express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(port);

app.locals({
  title: 'Architecture visualization tool (node/express + d3)',
  bootstrap_url: "http://localhost:5001/"
});

var bbfulldata;
var bbdata = bbfulldata;
var sonarnodes = {};

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

app.get('/circle',function(req,res) {
	escdbintegration.fetchSections(function(sections) {
		escdbintegration.fetchWidgetConfigs(function(data) {
			filterData(sections, data,function(cb){
				var widgetdata = cb;
				res.render("fullcircle.ejs",{widgets:widgetdata});
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
						var pD = pathS[p];
						var pS = sections[pD];
						//If the configsection and the first section in the path missmatch then we'd like to know what that path leads to
						//if (pS != datav.configsection) {
							if (pS) csp = csp + " -> " + pS;
						//}
						//else break;						
					}
					/**/
					widgets[keyd].push({"name":datav.configsection, "publication":datav.publication, "path":csp});
				}
			}
		}
	}

	for (w in widgets) {
		var wjson = {"name":w,"children":widgets[w]}
		roota.push(wjson);
	}
	root.children = roota;
	cb(root);
}; 

