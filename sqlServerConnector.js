var dateFormat = require('dateformat');

var sql = require('mssql/msnodesqlv8');
var config = {
    user: 'login',
    password: 'xGcm9Fyh0GKp',
    server: 'HKCPU03896\\BOTSQL',
    port: 1433,
    driver: 'msnodesqlv8',
    database: 'ChatBot',
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
}

function insertDialog(conversationID, sender, recipient, message, now) {
    var conn = new sql.ConnectionPool(config);

    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        var req = new sql.Request(conn);
        req.input('ConversationID', sql.NVarChar, conversationID);
        req.input('Sender', sql.NVarChar, sender);
        req.input('Recipient', sql.NVarChar, recipient);
        req.input('Message', sql.NVarChar, message);
        req.input('Date', sql.NVarChar, (dateFormat(now, "yyyy-mm-dd")));
        req.input('Time', sql.NVarChar, (dateFormat(now, "HH:MM:ss")));

        req.query("INSERT INTO Dialog (ConversationID, Sender, Recipient, Message, Date, Time) VALUES (@ConversationID, @Sender, @Recipient, @Message, @Date, @Time);", function (err, recordset) {
            if (err) {
                console.log(err);
                return;
            }
            conn.close();
        });
    });
}
module.exports = {
    insertDialog
};