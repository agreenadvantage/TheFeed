const express = require('express'),
  expressStaticGzip = require("express-static-gzip"),
  app = express() ;


  app.use('/dash', function (req, res) {
    res.redirect("/feed");
  });

app.use("/feed",expressStaticGzip("./dist/"));

app.listen(8080) ;
