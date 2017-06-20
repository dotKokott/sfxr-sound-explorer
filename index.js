
var express = require('express');
var app = express();
var http = require('http').Server(app);
var serve = require('serve-index');

app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/images', express.static('public/images'));
app.use('/tsne', serve('public/data/tsne'));
app.use('/tsne', express.static('public/data/tsne'));
app.use('/audio',express.static('public/data/audio'));

http.listen(1000, function() {
    console.log('listening on *:1000');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
