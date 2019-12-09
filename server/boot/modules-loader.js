//modules loader
const fs=require('fs');
const path = require('path');

'use strict';
module.exports = async(app)=> {

	
	const loadModuleRoutes=(rPath,module)=>{
		
//		console.log("loadModuleRoutes is launched with args rPath",rPath);
		//console.log("loadModuleRoutes is launched with args module",module);

		let routesPath=path.join(__dirname,'../',module.path,rPath);
		//console.log("routesPath",routesPath);

		if (!fs.existsSync(path.join(routesPath,'index.js'))){
			console.log("Could not find index.js inside routes path (%s), aborting loadModuleRoutes",path.join(routesPath,'index.js'));
			return;
		}
		//console.log("Requiring module routes");
		require(routesPath)(app);
	}

	

	try 
	{
        
        const configJson = await fs.readFileSync(path.join(__dirname,'/../','model-config.json'),'utf-8');
        configObj = JSON.parse(configJson);
        //console.log("configObj",configObj);

        //let keys = Object.keys(list);

        if (!configObj._meta.modules){
        	console.log("No such key .modules inside model-config.json, aborting..");
        	return;
        }

        let modules=configObj._meta.modules;
        //console.log("modules",modules);
        for (let i=0;i<modules.length;i++){
        	let module=modules[i];
        	let keys=Object.keys(module);
        	for (let ii=0;ii<keys.length;ii++){
        		//console.log("module (%s) KEYS["+ii+"]:%s",module.name, keys[ii],module[keys[ii]]);
        		switch (keys[ii]){
        			case 'routes':
        				loadModuleRoutes(module[keys[ii]],module);
        			break;
        		}
        	}
        }
    }catch (err){
    	console.log("Error parsing model-config.json",err);
    }
}