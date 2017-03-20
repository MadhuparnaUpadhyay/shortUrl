var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var code = require('./codelogic.js');

var Urlmodel = require('./models/url');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/api/shorter', function(req, res){
  var longUrl = req.body.url;
  var shortUrl = '';

  Urlmodel.findOne({long_url: longUrl}, function (err, doc){
    if (doc){
      shortUrl = config.webhost + code.encode(doc._id);
      res.send({'shorterUrl': shortUrl});
    } else {
      var newUrl = Urlmodel({
        long_url: longUrl
      });
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }
        shortUrl = config.webhost + code.encode(newUrl._id);
        res.send({'shorterUrl': shortUrl});
      });
    }

  });

});

app.get('/:id', function(req, res){

  var convertId = req.params.id;
  var id = code.decode(convertId);

  Urlmodel.findOne({_id: id}, function (err, doc){
    if (doc) {
      res.redirect(doc.long_url);
    } else {
      res.redirect(config.webhost);
    }
  });

});

var server = app.listen(8000, function(){
  console.log('Server listening on port 8000');
});