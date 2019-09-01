const to=require('./../to');

async function exeQuery(sql, app) {
    return await to(new Promise(function (resolve, reject) { //is await needed?!
        let ds = app.dataSources['msql'];
        ds.connector.execute(sql, [], function (err, res) {
            if (err) reject(res);
            else resolve(res);
        });
    }));
}


module.exports={
    exeQuery:exeQuery
}