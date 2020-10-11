
let mysql = require('mysql');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "CarmelBot1010",
    database: "roshHashana"
});

module.exports = useQuery = (query, cb) => {
    con.connect(err => {
        if (err) throw err
        con.query(query, cb);
    });
}
