// 'use strict';



// const loopback = require('loopback');
// const promisify = require('util').promisify;
// const fs = require('fs');
// const writeFile = promisify(fs.writeFile);
// const readFile = promisify(fs.readFile);
// const mkdirp = promisify(require('mkdirp'));

// const DATASOURCE_NAME = 'msql';
// const dataSourceConfig = require('../datasources.json');
// const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME]);
// const mysql = require('mysql');

// const databaseName = "subteacher";
// const con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "z10mz10m",
//     database: "subteacher"
// });

// var tables = [];

// function isObject(item) {
//     return (item && typeof item === 'object' && !Array.isArray(item));
// }
// function mergeDeep(target, source) { // this function merges objects. it also merges the sub-objects.
//     let output = Object.assign({}, target);
//     if (isObject(target) && isObject(source)) {
//         Object.keys(source).forEach(key => {
//             if (isObject(source[key])) {
//                 if (!(key in target))
//                     Object.assign(output, { [key]: source[key] });
//                 else
//                     output[key] = mergeDeep(target[key], source[key]);
//             } else {
//                 Object.assign(output, { [key]: source[key] });
//             }
//         });
//     }
//     return output;
// }

// module.exports = function (app, callback) {


//     function getTables(cb) {

//         try {
//             con.connect((err) => {
//                 if (err) throw err;
//                 con.query("show tables", (err, mres, fields) => {
//                     if (err) throw err;
//                     tables = mres.map((val, i, arr) => {
//                         return val['Tables_in_' + databaseName]
//                     }
//                     );
//                     cb();
//                 });
//             });

//         } catch (err) {
//             console.error("err", err);
//         }
//     }

//     async function asyncForEach(array, callback) {
//         for (let index = 0; index < array.length; index++) {
//             await callback(array[index], index, array)
//         }
//     }

//     async function handleJsonsMergeAndWrite(existing, incoming, filename) {
//         if (incoming["properties"]["id"]) {
//             incoming["properties"]["id"]["required"] = false;
//         }
//         let dataToWrite = mergeDeep(JSON.parse(existing), incoming);
//         await writeFile(filename, JSON.stringify(dataToWrite, null, 2));
//     }

//     async function discover() {
//         const configJson = await readFile('server/model-config.json', 'utf8');
//         const config = JSON.parse(configJson);
//         await asyncForEach(tables, async (table) => {
//             if (table != "User" && table != "ACL" && table != "AccessToken" && table != "RoleMapping" && table != "Role" && table != "CustomUser") {
//                 console.log("Syncing table: " + table);
//                 const options = { relations: true };
//                 const schemas = await db.discoverSchemas(table, options);
//                 let fileName = 'common/models/' + table.toLowerCase().replace('_','') + '.json';

//                 await mkdirp('common/models'); //creates directory (won't delete existing one).
//                 await fs.exists(fileName, async function (exists) {
//                     console.log(fileName + " exists?", exists);
//                     if (exists) {
//                         console.log("reading data....");
//                         try {
//                             let data = fs.readFileSync(fileName, 'utf8');
//                             await handleJsonsMergeAndWrite(data, schemas[databaseName + '.' + table], fileName);
//                         }
//                         catch (e) { console.log('Error:', e); }
//                     } else {
//                         // console.log("file not found, writing new file.json");
//                         await writeFile(fileName, JSON.stringify(schemas[databaseName + '.' + table], null, 2));
//                     }
//                 });
//                 // Expose models via REST API

//                 config[schemas[databaseName + '.' + table]['name']] = { dataSource: DATASOURCE_NAME, public: true, expose: true };
//             }
//         });
//         await writeFile('server/model-config.json', JSON.stringify(config, null, 2));
//     }


//     getTables(() => {

//         discover().then(success => process.exit(), error => {
//             console.error('UNHANDLED ERROR:\n', error);
//             process.exit(1);
//         });


//     });



//     //let Items=app.models.Items;
//     //Items.find({include:'userrel',limit: 1}, function(err, items) { 
//     //  console.log("item",items);
//     //});




// };
