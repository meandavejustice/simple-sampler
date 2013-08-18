var connect = require("connect");

var app = connect().use(connect.static(__dirname + '/app'));

app.listen(8180);
console.log('server running on port 8180');
