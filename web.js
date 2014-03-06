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
	escdbintegration.fetchWidgetConfigs(function(data) {
		filterData(data,function(cb){
			var widgetdata = cb;
			res.render("index.ejs",{widgets:widgetdata});
		});	
	});
})
app.get('/circle',function(req,res) {
	escdbintegration.fetchWidgetConfigs(function(data) {
		filterData(data,function(cb){
			var widgetdata = cb;
			res.render("fullcircle.ejs",{widgets:widgetdata});
		});	
	});
})

/*------------------------------------------------------------*/
				/*Call and use Escenic db*/
/*------------------------------------------------------------*/

var filterData = function(data,cb) {
	var root = {"name":"Widgets","children":[]};
	var roota = [];

	var widgets = {};
	var sections = {};
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
				if (keyd = datav.widget) {
					var sectionname = datav.configsection;
					widgets[keyd].push({"name":sectionname});
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

