/*
Handles bitbucket integration. 
 - Coded in an elaborative manner with the purpose to be used for archvis, an internal architecture visualisation tool. H
@author Johan Löfstrand
*/
var bitbucket = require('bitbucket-api');
var credentials = {username: 'architecturevisualizer', password: 'VfAvApSVTi1'}; //read only account... 
var client = bitbucket.createClient(credentials);
var cached;
var keepTime=0;
var merged = [];

exports.bbInitiate = function(callback) {
    //console.log("bbInitiate");
   
    //'svtlib-bootstrap̈́', - not ok

   	var services = [
	'barnkanalen-play', 
	'play5-beta',
	'play-234'
    ];
	var svtlibs = [
    'svtlib-playerplugins',
    'svtlib-bootstrap',
    'svtlib-carousel',
    'svtlib-observable',
    'svtlib-messagechannel',
    'svtlib-cssit',
    'svtlib-toggle-visibility',
    'svtlib-slidablelist',
    'svtlib-svtplayer',
    ];

    var items  = svtlibs.concat(services);
    
	bbCacheCheck(function(ready) {

		if (cached){
			//console.log("Returning cached data");
			return callback(merged);
		}
		else {
		    //console.log("Fetching data from bitbucket");
		    var async = require("async");

		     /*
		        Run bitbucket access in parallell but merge result in order to feed d3 all data at the same time... 
		     */
		    async.map(items,bbRepoRun, function(err,repores) {
		        if (err) {
		           // console.log(err);
		        }
		        
		        merged = merged.concat.apply(merged, repores);
		        callback(merged);
		    });
		}
	
	});

}

var bbCacheCheck = function(ready) {
	//https://bitbucket.org/api/1.0/user/follows/
	client.user().follows(function(err,result){
		if (err) console.log(err);
		if (result) {
			//sort result...
			var dhigh=0;
			for (i=0;i<result.length;i++){
				var d = new Date((result[i])['last_updated']);
				if (d.getTime() > dhigh) {
					 dhigh = d.getTime();
				}
			}	
			if (dhigh > keepTime) {
				cached = false;
				keepTime = dhigh;
			}
			else  {
				 cached = true;
			}	
		}
	ready();
	});
}
/*
    Runs REST call to bitbucket for the repo. 
    callback param is just for async to work, see call from bbInitiate
*/
var bbRepoRun = function(repo,callback) {

    var svtlib = new Array();
    
    client.getRepository({slug: repo, owner: 'svtidevelopers'}, function (err, repository) {
            
        if (repository) {

           // console.log("Try to fetch repo: " + repository.slug + " of type: " + repository.scm);

            if (repository.scm == "git") {
                revision = "master";
            }
            else {
                revision = "default";
            }
            
            var bower = repository.sources('/bower.json', revision).info(function (err, result) {

                if (result) { 
                    resjsonb = JSON.parse(result.data);
                    var deps = resjsonb.dependencies;
                    if (deps) {
                        var keys = Object.keys(deps);

                        if (keys) {
                            for (i=0;i<keys.length;i++) {
                                if (keys[i].match('^svtlib')) { 
                                    svtlib.push({source: repository.slug, target: keys[i], type: "dependency"});               
                                }
                                else {
                                	var depskey = deps[keys[i]];
                                	var deps_filtered = depskey.replace(/~/g, '')
                                    if (deps_filtered.length > 10) { 
                                		deps_filtered = (deps_filtered).match("[0-9]\.[0-9]\.[0-9]");
                                  	}
                                    svtlib.push({source: repository.slug, target: (keys[i] + ' ' + deps_filtered), type: "framework"});     
                                }
                            }
                        }
                    }
                    callback(err,svtlib);
                }
                if (err) {
                  //  console.log("Error when reading from repo: " + repo + " err: " + err);
                }        
            });
        }
        if (err) {
           // console.log("Error when trying to fetch repo: " + repo + " err: " + err);
        }
    });
    return;

}

/*bitbucket rest api test
//GIT EX:
https://bitbucket.org/api/1.0/repositories/svtidevelopers/svtlib-messagechannel/src/master/bower.json

//MERCURIAL EX: (note default instead of master as revision...)
https://bitbucket.org/api/1.0/repositories/svtidevelopers/barnkanalen-play/src/default/bower.json
*/