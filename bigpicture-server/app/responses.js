// Author: Adam Coster
const forEach = require('lodash/forEach');

module.exports = (req, res, next)=>{

  res.respond = (status,response)=>{
    let send = res.succeed ;
    if(status < 200 || status>299){
      send = res.fail ;
    }
    return send(status,response);
  };

  res.succeed = (status=200,output)=>{
    if(Number(status)<100||Number(status)>299){
      return res.fail(500,"Someone did some bad programming in here...");
    }
    if(output){
      return res.status(status).send(output);
    }
    else{ return res.sendStatus(status); }
  };

  res.fail = (status=400,message)=>{
    if(Number(status)<400||Number(status)>599){
      // Invalid Status code!
      return res.fail(500,"Someone did some bad programming in here...");
    }
    const output = {message:'Unspecified error.',error:status} ;
    if( message && typeof message == 'string' ){
      output.message = message ;
    }
    return res.status(status).send(output);
  };

  next();
};
