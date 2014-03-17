# Archvisesc #
Archvisesc is an architecture visualisation tool focused on showing escenic widgets and the config sections that uses them. 

##Install
	npm install

##Run
	node web.js  
will start server at port 5002.

##Use 
Click on the nodes to expand a widget and see the config sections where it's used. 

##Tecnical details
The tool is build with nodejs and d3js and works by: 

 1. Accessing escenic db (on localhost)

 2. Parsing all data and figure out all dependencies

 3. Sending data to a d3js client to visualize the dependencies