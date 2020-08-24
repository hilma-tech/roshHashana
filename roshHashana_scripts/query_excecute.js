
let mysql = require('mysql');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "z10mz10m",
    database: "roshHashana"
});

module.exports = useQuery = (query, cb) => {
    con.connect(err => {
        if (err) throw err
        con.query(query, cb);
    });
}