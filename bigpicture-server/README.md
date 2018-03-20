# Studio Dashboard #

Purpose
---
The purpose of this tool is to act as a centralized location from which members of the studio can
quickly get an idea of where the studio is. By pulling information in from the four corners of
Butterscotch Shenanigans and displaying them in one place we are hoping to increase our efficiency
and productivity.

License
---
©2017 Butterscotch Shenanigans, LLC. All rights reserved.

Contributors
---
 + Andy Green
 + Adam Coster

# Change Log #
___
### 5/1/17 ###
+ Removed the collapse/expand button for each update.
    + It now works by just clicking the update header.
    + The cursor changes to a magnifying +/- depending on expansion
+ Preview text inserted in place of the update button.
    + the update ***preview*** text is NOT selectable. This is just to prevent weirdness when the updates are opening and closing
    + the update text (text not in the panel-header) is still selectable.
+ Tags work COMPLETELY DIFFERENTLY
    + The old drop-down system has been replaced by the typeahead system completely.
    + Now when you want to add a tag you just type it like you normally would. If it exists it adds it to the selected tags. OR if it doesn't exist, it adds it to the database if it checks out otherwise it throws you some feedback about the tag specs and a guess about why its wrong.
___



Project Setup
---
The project has been organized according to the build pipeline specifications.

+ **feed** - the entire unified ensemble of the project.
    + **app** - 'production level' code (e.g. the stuff that makes it do website).
        + **middleware**
        + **models** - schema for mongoose.
        + **public** - business end stuff (front and back end).
            + **css**
            + **favicon**
            + **fonts**
            + **js**
            + **.plugins** - from bower install.
            + *index.html*
            + *.bowerrc* - points to bower to your plug-ins location (.plugins).
            + *bower.json* - tells the server what it needs to download from bower.
            + *package.json* - npm central. Holds commands for compiling the project.
                + `npm run build`  this prepares the JavaScript for the front end. (*concatenate* -> *browserify*).
            + *routes.js* - this is the api for the feed and holds all the interactions that one can have with the feed db.
            + *server.js* - starts everything off server-wise.
    + **local** - this should contain local save data that is relevant for testing.
    + **source** - this holds any and all pre-production code that is compiled into the app folder.
        + **js_pre** - this holds all of the JavaScript files separated for easier editing.
    + **dockerfile** - docker file for development.
    + **production.dockerfile** - docker file for production.
    + **version.major** - this is set by the dev and only changes when fundamental changes have been made.
    + **version.minor** - this is automatically incremented and appended to the major version for the docker upload.
+ **.env** -should be on the same level as the project container.
+ **build-push.sh** - script that wraps up the docker container and pushes it to the docker repo.
+ **docker-compose.production.yml** - production level docker compose with only necessary info.
+ **docker-compose.yml** - development level docker-compose that has dev mode set to true with other information for testing as well.
+ **production.deploy.sh** - this should be put on the server that will host the docker container you built.
