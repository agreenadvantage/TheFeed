// Author: Adam Coster
var redis_lib  = require( 'redis');
var cache = {};
module.exports = cache ;

cache.connected = false ;

cache.connect = ()=>{
  return new Promise((resolve,reject)=>{
    if( cache.connected ){ return resolve(true); }
    cache.redis = redis_lib.createClient({
        host:'redis',
        port:6379,
        db:1
    });
    cache.redis.on('connect',()=>{
      cache.connected = true;
      console.log("Connected to redis cache");
      return resolve(true);
    });
  });
};

var cache_key_value_expires_call = (key,value,expiresIn,method)=>{
  return new Promise((resolve,reject)=>{
    cache.redis[method](key,value,(err,replies)=>{
      if(err){
        return resolve(false);
      }
      else if(expiresIn){
        cache.setTTL(key,expiresIn)
        .then(succeeded=>{
          return resolve(succeeded);
        });
      }
      else{ return resolve(true); }
    });
  });
};

cache.updateMap=(key,value,expiresIn)=>{
  return cache_key_value_expires_call(key,value,expiresIn,'hmset');
};

cache.update=(key,value,expiresIn)=>{
  return cache_key_value_expires_call(key,value,expiresIn,'set');
};

cache.setTTL=(key,expiresIn)=>{
  return new Promise((resolve,reject)=>{
    cache.redis.expire(key,expiresIn,(err,reply)=>{
      if(err){
        return resolve(false);
      }
      else{
        return resolve(true);
      }
    });
  });
};

cache.getTTL=key=>{
  return new Promise((resolve,reject)=>{
    cache.redis.ttl(key,(err,reply)=>{
      if(err){
        return resolve(-1); // Means "no TTL exists for this key"
      }
      else{
        // Either TTL in seconds, -1 if no TTL, or -2 if the key DNE
        return resolve(Number(reply));
      }
    });
  });
};

cache.deleteIfTTLNotSet=key=>{
  return new Promise((resolve,reject)=>{
    cache.getTTL(key)
    .then(ttl=>{
      if(ttl==-1){
        cache.invalidate(key)
        .then(invalidated=>{
          if(invalidated[0]){
            return resolve(true);
          }
          else{
            return resolve(false);
          }
        });
      }
      else{ return resolve(false); }
    });
  });
};

var cache_call = (key,method)=>{
  return new Promise((resolve,reject)=>{
    cache.redis[method](key,(err,replies)=>{
      if(err){
        return resolve(null);
      }
      else{ return resolve(replies); }
    });
  });
};

cache.get = key=>{ return cache_call(key,'get'); };

cache.getMap = key=>{ return cache_call(key,'hgetall'); };

cache.getMapValue = (key,field)=>{
  return new Promise((resolve,reject)=>{
    cache.redis.hget(key,field,(err,replies)=>{
      if(err){
        return resolve(null);
      }
      else{ return resolve(replies); }
    });
  });
};

cache.increment=key=>{ return cache_call(key,'incr'); };

cache.invalidate = keys=>{
  if( ! Array.isArray(keys)){ keys = [keys];}
  var promises = [];
  for(let i=0;i<keys.length;i++){
    promises.push(new Promise((resolve,reject)=>{
      cache.redis.del(keys[i],err=>{
        if(err){
          return resolve(false);
        }
        return resolve(true);
      });
    }));
  }
  return Promise.all(promises);
};
cache.delete = cache.invalidate;
cache.remove = cache.invalidate;

cache.invalidateFields=(key,fields)=>{
  if( ! Array.isArray(fields)){ fields = [fields];}
  var promises = [];
  for(let i=0;i<fields.length;i++){
    promises.push(new Promise((resolve,reject)=>{
      cache.redis.hdel(key,fields[i],err=>{
        if(err){
          return resolve(false);
        }
        return resolve(true);
      });
    }));
  }
  return Promise.all(promises);
};
cache.deleteFields = cache.invalidateFields;
cache.removeFields = cache.invalidateFields;
