'use strict';

//console.log("prebuild is launched");

//modules loader
const fs=require('fs');
const path = require('path');

(async()=>{

	
	const loadModuleModels=(rPath,module,configObj)=>{

		try{
		//console.log("loadModuleModels, Predefined models paths",configObj._meta.sources);
		//"../src/modules/fileshandler/server/mixins"
		let modelsPath=path.join(module.path,rPath);
		//console.log("modelsPath",modelsPath);

		if (configObj._meta.sources.indexOf(modelsPath)==-1){
			configObj._meta.sources.push(modelsPath);
			
			//console.log("Rewriting model-config.json ...");
			//console.log("In order to load module you should re-run the project again with node .");

			fs.writeFileSync(path.join(__dirname,'/../server/','model-config.json'),JSON.stringify(configObj,null,2));
				
		}else{
			//console.log("Module (%s) models should be already loaded with boot",module.name);
		}


		let allFiles=fs.readdirSync(path.join(__dirname,modelsPath),{encoding:'utf8'});
		//console.log("allFiles",allFiles);
		
		let modelJson={},override=false;

		for (let i=0;i<allFiles.length;i++){
			let file=allFiles[i];
			
			if (file.indexOf('.json')==-1){
				//console.log("%s Not a json, continue",file);
				continue;
			}	
			//console.log("%s is a json",file);
			let jsonFile=path.join(__dirname,modelsPath,file);
			
			//console.log("\nTrying to parse model json ",jsonFile);
			modelJson = JSON.parse(fs.readFileSync(path.join(__dirname,modelsPath,file)));

			//console.log("modelJson for file %s",file,modelJson);
			//console.log("Model name?",modelJson.name);
			let isPublic=modelJson.isPublic && modelJson.isPublic===true;
			let dataSource=modelJson.dataSource ? modelJson.dataSource : "msql";
			
			//console.log("configObj[modelJson.name]?",(configObj[modelJson.name] ? "TRUE" : "FALSE"));
			//console.log("isPublic?",isPublic);
			//console.log("configObj[modelJson.name]",configObj[modelJson.name]);
			//console.log("configObj[modelJson.name].public===false?",configObj[modelJson.name].public===false);
			//console.log("configObj[modelJson.name].public===isPublic?",configObj[modelJson.name].public===isPublic);

			if (configObj[modelJson.name] && configObj[modelJson.name].public===isPublic
				&& configObj[modelJson.name].dataSource==dataSource){

				//console.log("model-config already has model (%s) set up with .public",modelJson.name);
			
			}else{
				console.log("Adding new entry to model-config models");
				
				configObj[modelJson.name]={public:isPublic,dataSource:dataSource};
				override=true
				
			}

			
		}

		if (override){
			console.log("Overriding model-config.json");
			fs.writeFileSync(path.join(__dirname,'/../server/','model-config.json'),JSON.stringify(configObj,null,2));
		}

		//console.log("final configObj",configObj);

		}catch(err){
			console.log("loadModuleModels has failed with err",err);

		}
		
		//const configJson = await fs.readFileSync(path.join(__dirname,'/../','model-config.json'),'utf-8');
		// /home/popeye/projects/myproject/src/modules/fileshandler/server/mixins

	}

	const loadModuleMixins=(rPath,module,configObj)=>{

		//console.log("loadModuleMixins, Predefined mixins",configObj._meta.mixins);
		//"../src/modules/fileshandler/server/mixins"
		let mixinsPath=path.join(module.path,rPath);
		//console.log("mixinsPath",mixinsPath);

		if (configObj._meta.mixins.indexOf(mixinsPath)==-1){
			configObj._meta.mixins.push(mixinsPath);
			
			//console.log("Rewriting model-config.json ...");
			//console.log("In order to load module you should re-run the project again with node .");

			fs.writeFileSync(path.join(__dirname,'/../server/','model-config.json'),JSON.stringify(configObj,null,2));
				
		}else{
			//console.log("Module (%s) mixins should be already loaded with boot",module.name);
		}
		

		//const configJson = await fs.readFileSync(path.join(__dirname,'/../','model-config.json'),'utf-8');
		
		// /home/popeye/projects/myproject/src/modules/fileshandler/server/mixins

	}

	const loadModuleRoutes=(rPath,module)=>{
		
		//console.log("loadModuleRoutes is launched with args rPath",rPath);
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


	let configObj={};
	
	try 
	{
        
        const configJson = fs.readFileSync(path.join(__dirname,'/../server','model-config.json'),'utf-8');
        
        configObj = JSON.parse(configJson);
        

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
        				//loadModuleRoutes(module[keys[ii]],module);
        			break;
        			case 'mixins':
        				loadModuleMixins(module[keys[ii]],module,configObj);
        			break;
        			case 'models':
        				loadModuleModels(module[keys[ii]],module,configObj);
        			break;
        		}
        	}
        }
    }catch (err){
    	console.log("Error parsing model-config.json",err);
    }

})();