<template>
  <div id="app">
    <nav-bar :authors="authors"
             :currentAuthor="currentAuthor"
             :tags="tags"
             :find="find"
             :replace="replace"
             :viewPortWidth="viewPortWidth"
             :findReplaceIsActive="findReplaceIsActive"
             @setActiveTab="setActiveTab"
             @chooseFind="chooseFind"
             @removeFind="removeFind"
             @chooseReplace="chooseReplace"
             @removeReplace="removeReplace"
             @insertMessage="insertMessage"

             @submitFindReplace="submitFindReplace"
             @deactivateDropdowns="deactivateDropdowns"
             @toggleFindReplace="toggleFindReplace"
             class="airborn"></nav-bar>
    <notifications :messages="messages"
                   @close="removeMessage"
                   v-if="messages.length >= 1"
                   class='notifications'
                   ref='notifications'></notifications>
    <main-area @loadTags="loadTags"
               @changeActiveTab="changeActiveTab"
               @submitUpdate="submitUpdate"
               @submitReply="submitReply"
               @insertMessage="insertMessage"
               @goBack="goBack"
               @goForward="goForward"
               @markPostAsRead="markPostAsRead"
               @toggleRender="toggleRender"
               @toggleReplyArea="toggleReplyArea"
               @toggleEditTags="toggleEditTags"
               @submitNewTags="submitNewTags"
               @reload="reload"
               @done="done"
               @saveNewTag="saveTag"
               @selectTag="selectTag"
               @removeSelected="removeSelected"
               @getStoredTags="getStoredTags"
               @toggleSearch="toggleSearch"
               @deactivateDropdowns="deactivateDropdowns"
               @setActiveTab="setActiveTab"
               @addSearchTag="addSearchTag"
               @removeAuthor="removeAuthor"
               @removeSearchTag="removeSearchTag"
               @submitSearch="submitSearch"
               @chooseAuthor="chooseAuthor"
               @chooseAfterDate="chooseAfterDate"
               @chooseBeforeDate="chooseBeforeDate"
               :searchIsActive="searchIsActive"
               :searchTags="searchTags"
               :searchAuthor="searchAuthor"
               :searchDateBefore="searchDateBefore"
               :searchDateAfter="searchDateAfter"
               :noResultsFound="noResultsFound"
               :isLoading="isLoading"
               :updateTags="updateTags"
               :isMobile="isMobile"
               :status="status"
               :activeTab="activeTab"
               :allAuthors="authors"
               :currentAuthor="currentAuthor"
               :disableNext="disableNext"
               :disablePrev="disablePrev"
               :defaultUnreaders="defaultUnreaders"
               :pageToken="pageToken"
               :tags="tags"
               :showSwapTags="showSwapTags"
               :updates="updates"
               class="main-area"
               ></main-area>
  </div>
</template>

<script>
  import NavBar from '@/components/NavBar';
  import MainArea from '@/components/Main';
  import Notifications from '@/components/NotificationDisplay';

  import qs from 'querystringify';
  import forEach from 'lodash.foreach';
  import forOwn from 'lodash.forown';
  import cloneDeep from 'lodash.clonedeep'
  import util from './mixins/util.js';
  import dateformat from 'dateformat';

  export default {
    name: 'app',
    components: {
      MainArea,
      NavBar,
      Notifications,
    },
    data () {
      return {
        status: '',
        activeTab: 'unread',
        authors: [],
        disablePrev: true,
        disableNext: false,
        searchIsActive: false,
        findReplaceIsActive: false,
        lastPagingDirection: '',
        find: [],
        replace: [],
        messages: [],
        pageToken: '',
        refreshTimer: null,
        searchTags: [],
        searchAuthor: [],
        searchDateBefore: '',
        searchDateAfter: '',
        showSwapTags: false,
        tags: [],
        unprocessedUpdates: [],
        updates: [],
        lastQuery: '',
        firstUDid: '',
        updateTags: [],
        localStorage: window.localStorage,
        isLoading: false,
        noResultsFound: false,
        previousSearchResults: [],
      }
    },
    methods: {
      toggleFindReplace() {
        this.findReplaceIsActive = !this.findReplaceIsActive;
      },
      chooseFind(find) {
        this.removeFind();
        this.find.push(find);
      },
      removeFind() {
        this.find = [];
      },
      chooseReplace(replace) {
        this.removeReplace();
        this.replace.push(replace);
      },
      removeReplace() {
        this.replace = [];
      },
      submitFindReplace() {
        if (this.find.length === 1 && this.replace.length === 1) {
          let self = this;
          let query = {
            find: self.find[0],
            replace: self.replace[0],
          };

          self.$http.patch('/updates' + qs.stringify(query, true))
          .then(function (res) {
            if (res.data.success && res.data.data.results) {
              let updateNumber = res.data.data.results[0].all.length;
              self.removeReplace();
              self.removeFind();
              self.toggleFindReplace();
              self.insertMessage({ message: 'Successfully changed ' + updateNumber + ' status updates!', type: 'is-success' });
              self.reload();
            }else {
              if (res.data.error === 'no status found to update') {
                self.insertMessage({ message: 'No updates found to change!', type: 'is-warning' });
              }else {
                self.insertMessage({ message: 'Something got broken on the server side!', type: 'is-danger' });
              }
            }
          })
          .catch(function (res) {
            self.insertMessage({ message: 'Something got broken on the server side!', type: 'is-danger' });
          });
        }else {
          self.insertMessage({ message: 'You\'re missing your arguments for find & replace!', type: 'is-warning' });
        }
      },
      done() {
        this.status = '';
      },
      deactivateDropdowns() {
        this.searchIsActive = false;
        this.findReplaceIsActive = false;
      },
      insertMessage(obj) {
        this.$scrollTo(document.querySelector('.notifications'), 600);
        this.messages.push(obj);
      },
      removeMessage(idx) {
        this.messages.splice(idx, 1);
      },
      reload() {
        this.disablePrev = true;
        this.disableNext = false;
        if (this.lastQuery) {
          if (this.lastQuery.pageToken) {
            delete this.lastQuery.pageToken;
          }
          this.loadUpdates(null, null, this.lastQuery);
        }else {
          this.loadUpdates(null, null, {});
        }
      },
      addSearchTag(tag) {
        this.searchTags.push(tag);
      },
      removeSearchTag(idx) {
        this.searchTags.splice(idx, 1);
      },
      chooseAuthor(author) {
        this.removeAuthor();
        this.searchAuthor.push(author);
      },
      removeAuthor() {
        this.searchAuthor.splice(0, this.searchAuthor.length);
      },
      chooseAfterDate(date) {
        this.searchDateAfter = date;
      },
      chooseBeforeDate(date) {
        this.searchDateBefore = date;
      },
      formatDateTime(date) {
        return dateformat(date, "mm/dd/yyyy hh:MM tt");
      },
      toggleSearch () {
        this.searchIsActive = !this.searchIsActive;
      },
      changeActiveTab(tabId){
        this.activeTab = tabId;
        this.noResultsFound = false;
        if (tabId !== 'searchResults') {
          this.loadUpdates();
        }else {
          this.updates = this.previousSearchResults;
        }
      },
      setActiveTab(tabId) {
        this.activeTab = tabId;
      },
      getAuthors() {
        var self = this;
        self.$http.get('/users')
        .then(function(response) {
          if (response.data.success && response.data.data){
            forEach(response.data.data.results, function (author, index) {
              self.$set(self.authors, index, author);
            });
          }else {
            let message = response.message || response.data.error || response.data.message;
            self.insertMessage({message: 'Unable to get authors from the server!', type: 'is-danger'})
            console.log('Something went wrong while trying to get authors:', response.data.error);
          }
        })
        .catch(function(response) {
          self.insertMessage({message: 'Unable to get authors from the server!', type: 'is-danger'})
          let message = response.message || response.data.error || response.data.error;
          console.log('Get authors(Error):', message);
        })

      },
      goBack() {
        this.firstUDid = this.updates[0].postId;
        this.disableNext = false;
        this.loadUpdates(this.pageToken, 'previous');
      },
      goForward() {
        this.disablePrev = false;
        this.loadUpdates(this.pageToken, 'next');
      },
      insertUpdate(rawUd) {
        let self = this;
        let prepped = self.parseUpdate(rawUd);
        self.updates.pop();
        self.updates.unshift(prepped);
        self.totalUpdates += 1;
      },
      getUniqueArray(array) {
        return array.filter(function(elem, pos, arr){
          return arr.indexOf(elem) == pos;
        });
      },
      alpabetizeArray(array) {
        return array.sort();
      },
      tagIsSelected (tag) {
        let selected = false;
        if (this.updateTags.indexOf(tag) >= 0) {
          selected = true;
        }
        return selected;
      },
      tagIsAvalable (tag) {
        let exists = false;
        if (this.tags.indexOf(tag) >= 0) {
          exists = true;
        }
        return exists;
      },
      handleTagPostProcessing(tag) {
        this.loadTags();
        this.updateTags.push(tag);
        this.selectTag(tag);
      },
      selectTag(tag) {
        if (this.updateTags.indexOf(tag) == -1){
          this.updateTags.push(tag);
          this.localStorage.setItem('tags', JSON.stringify(this.updateTags));
        }
      },
      saveTag (value) {
        var self = this;
        var preparedTag = value.toLowerCase().trim();
        if (!self.tagIsSelected(preparedTag)) {
          if (self.tagIsAvalable(preparedTag)) {
            self.updateTags.push(preparedTag);
            self.clearTagInput();
          } else {
            self.$http.post('/tags', {
              tag: preparedTag,
            })
            .then(function (res) {
              if (res.data.success) {
                self.handleTagPostProcessing(preparedTag);
              } else {
                self.$emit('insertMessage', { message: 'Something broke serverside. :( Try Again in a little bit!', type: 'is-error' });
              }
            })
            .catch(function (res) {
              let message = res.message || res.data.error || 'no message recieved';
              console.log('Result of failed save attempt', message);
            });
          }
        } else {
          self.dupedSelection();
        }
      },
      removeSelected(idx) {
        this.updateTags.splice(idx, 1);
        this.localStorage.setItem('tags', JSON.stringify(this.selectedTags));
      },
      loadTags () {
        var self = this;
        self.$http.get('/tags')
        .then(function (res) {
          var tags = [];
          if (res.data) {
            if (res.data.success && res.data.data.results) {
              tags = res.data.data.results;
              if (tags.length >=1) {
                forEach(tags, function (tag, idx) {
                  tags[idx] = tag.toLowerCase();
                });
                tags = self.getUniqueArray(tags);
                tags = self.alpabetizeArray(tags);
              }else {
                self.insertMessage({message: 'Error getting tags! Try reloading!', type: 'is-warning'});
              }
            } else {
              self.insertMessage({ message: 'Couldn\'t load the tags! Try refreshing!', type: 'is-danger' });
            }
          }

          self.tags = tags;
        })
        .catch(function (err) {
          self.insertMessage({ message: 'There was an issue with the server! Try again later.', type: 'is-danger' });
        });
      },
      disablePaging () {
        this.disablePrev = true;
        this.disableNext = true;
      },
      loadUpdates(searchToken=null, direction=null, searchQ=null) {
        let query = '';
        let tempUpdateHolder = cloneDeep(this.updates);
        this.updates = [];
        this.isLoading = true;


        if (this.activeTab === 'unread') {
          query = { unreader: this.currentAuthor};
        }
        if (searchToken) {
          query = { pageToken: searchToken};
        }
        if (direction !== null) {
          query.direction = direction;
        }
        if (searchQ) {
          if (!query.unreader) {
            this.activeTab = 'searchResults';
          }
          query = searchQ;
        }

        var self = this;
        this.$http.get('/updates' + qs.stringify(query, true))
        .then(function (result) {
          if (result.data && result.data.success) {
            if (result.data.data && result.data.data.results) {
              if (result.data.data.results.length >= 1) {
                self.updates = self.prepareUpdates(result.data.data.results);
                if (result.data.data.pageToken) {
                  self.processPagingInfo(result.data.data.pageToken);
                }

                if (direction) {
                  self.lastPagingDirection = direction;
                }else {
                  self.lastQuery = query;
                }

                if (result.data.data.results.length === 10) {
                  self.disableNext = false;
                }

                if (self.activeTab === 'searchResults') {
                  self.previousSearchResults = self.updates;
                }

              }else {
                self.updates = tempUpdateHolder;
                if (result.data.data.info === 'last page') {
                  if (self.lastPagingDirection === 'previous') {
                    self.disablePrev = true;
                  }else if (self.lastPagingDirection === 'next') {
                    self.disableNext = true;
                  }
                }else {
                  self.noResultsFound = true;
                  self.lastQuery = query;
                  self.updates = [];
                  self.disablePaging();
                }
              }
            }else {
              self.insertMessage({message: 'Got a broken response from the server :( Try refreshing', type: 'is-danger'});
              self.disablePaging();
            }
          }else {
            if (self.lastPagingDirection === 'previous') {
              self.disablePrev = true;
            }else if (self.lastPagingDirection === 'next') {
              self.disableNext = true;
            }else {
              self.insertMessage({message: 'I\'m having trouble getting the updates, try refreshing!', type: 'is-danger'});
            }
          }
          self.isLoading = false;
        }).catch(function (result) {
          let message = result.message || result.data.error || result.data.message;
          console.log('Catch result: ', message );
          self.insertMessage({message: 'Something went terribly wrong while trying to get the updates!:(', type: 'is-danger'});
          self.isLoading = false;
        });
      },
      markPostAsRead(postId, index){
        let args = {
          reader: this.currentAuthor,
        };
        let self = this;

        self.$http.put('/updates/' + postId + '/unreaders', args)
        .then(function (result){
          if (result.data.success) {
            let unreaderNum = self.updates[index].unreaders.indexOf(args.reader);
            self.updates[index].unreaders.splice(unreaderNum, 1);
          }else {
            self.insertMessage({message: 'Couldn\'t mark this post as read :( try refreshing the page'})
          }
        })
        .catch(function (result) {
          let message = result.message || result.data.message || result.data.error;
          console.log('markAsRead Failed with message', result.message);
          self.insertMessage({message: 'Couldn\'t mark this post as read :( try refreshing the page'})
        });
      },
      parseUpdate(ud) {
        return {
          author:       util.capFirst(ud.author.name),
          mainText:     ud.update,
          tags:         ud.tags,
          unreaders:    ud.unreaders,
          unreplies:    ud.unreplies,
          replies:      ud.replies,
          date:         this.formatDateTime(ud.date),
          postId:       ud._id,
          showReplyTA:  false,
          renderUpdate: false,
          showSwapTags: false,
        };
      },
      prepareUpdates(rawUpdates) {
        let self = this;
        let preparedUpdates = [];

        forEach(rawUpdates, function (ud){
          let prepped = self.parseUpdate(ud);
          preparedUpdates.push(prepped);
        });

        return preparedUpdates;
      },
      processPagingInfo(pageToken) {
        if (pageToken) {
          this.pageToken = pageToken;
        }else {
          this.insertMessage({ message: 'Paging error :( Please refresh and try again', type: 'is-danger' })
        }
      },
      submitUpdate(update) {
        this.status = 'waiting';
        let self = this;
        self.$http.post('/updates', {
          update: update,
        })
        .then(function(result) {
          if (result.data.success) {
            self.insertUpdate(result.data.data.results[0]);
            self.updateTags = [];
            self.status = 'success';
          }else {
            self.insertMessage({ message: 'Your update wasn\'t properly saved!', type: 'is-danger' });
            self.status = 'fail';
          }
        })
        .catch(function(result) {
          self.status = 'fail';
          self.insertMessage({ message: 'Something went wrong with the server! D: Try again later'})
        });
      },
      submitReply(replyObj, index) {
        let self = this;
        let id = replyObj.postId;
        let reply = replyObj.reply;

        this.$http.put('/updates/' + id, {reply: reply })
        .then(function(res) {
          if (res.data.success && res.data.data) {
            let num = res.data.data.results.length;
            let freshReply = res.data.data.results[num - 1];
            self.updates[index].replies.push(freshReply);
          }
        })
        .catch(function(result) {
          let message = result.message || result.data.error || result.data.message;
          console.log('Failed to post reply!', message);
          self.insertMessage({message:'Couldn\'t save your reply!', type: 'is-danger'})
        });
      },
      submitSearch() {
        this.loadUpdates(null, null, this.SearchQuery);
        this.clearSearch();
      },
      clearSearch() {
        let self = this;
        if (this.searchTags.length >= 1) {
          self.searchTags.splice(0, self.searchTags.length);
        }
        if (this.searchAuthor.length >= 1) {
          self.removeAuthor();
        }
        this.searchDateBefore = '';
        this.searchDateAfter = '';
      },
      submitNewTags(tags, postId, index) {
        let self = this;

        self.$http.put('/updates/' + postId, { tags: tags })
        .then(function (res) {
          if (res.data.success) {
            let update = self.updates[index];
            update.tags = tags;
            update.showSwapTags = false;
          }else {
            self.insertMessage({ message: 'Unable to save tag! It may already exist', type: 'is-warning' });
          }
        })
        .catch(function (result) {
          let message = result.message || result.data.error || result.data.message;
          console.log('fail message', message);
          self.insertMessage({ message: 'Unable to save your tag! Something bad happened with the server!', type: 'is-danger'});
        });
      },
      toggleRender(index) {
        this.updates[index].renderUpdate = !this.updates[index].renderUpdate;
      },
      toggleReplyArea(index) {
        this.updates[index].showReplyTA = !this.updates[index].showReplyTA;
      },
      toggleEditTags(index) {
        this.updates[index].showSwapTags = !this.updates[index].showSwapTags;
      },
      getStoredTags() {
        let tagString = this.localStorage.getItem('tags');
        if (tagString) {
          if(tagString !== 'undefined') {
            let tagArray = JSON.parse(tagString);
            if (tagArray.length > 0 && Array.isArray(tagArray)) {
              this.updateTags = tagArray;
            }
          }
        }
      },
    },
    computed: {
      currentAuthor() {
          if (util.getCookie('DashUserName')) {
            return util.getCookie('DashUserName');
          }else {
            this.insertMessage({message:'There was a problem loading your user information! Please refresh before you go about your business!', type: 'is-danger'});
          }

      },
      defaultUnreaders() {
        let unreaders = cloneDeep(this.authors);
        let idx = unreaders.indexOf(this.currentAuthor);
        unreaders.splice(idx, 1);
        return unreaders
      },
      SearchQuery() {
        let self = this;
        let query = {};
        if (self.searchTags.length >= 1) {
          query.tags = cloneDeep(self.searchTags);
        }
        if (self.searchAuthor.length == 1) {
          query.author = cloneDeep(self.searchAuthor[0]);
        }
        if (self.searchDateBefore) {
          query.before = self.searchDateBefore + 'T23:59:59.000Z';
        }
        if (self.searchDateAfter) {
          query.after = self.searchDateAfter + 'T00:00:00.000Z';
        }
        return query;
      },
      viewPortWidth() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      },
      viewPortHeight() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      },
      isMobile() {
        return this.viewPortWidth < 768;
      }
    },
    mounted() {
      this.getAuthors();
      this.loadTags();
      this.loadUpdates();
    },
  }
</script>


<style src="../static/css/bulma.css"></style>

<style lang="scss">
  .clickCatcher {
    position: fixed;
    z-index: 10;
    bottom: 0px;
    right: 0px;
    left: 0px;
    top: 0px;
  }
  :root {
    --bg: rgb(48, 44, 47);
    --bg-dark: rgb(31, 28, 30);
    --content-text: #d4d4be;
    --text: #fffee7;
    --title: #17bbc2;
    --border: #e901a5;
    --link: #00e2c6;
    --link-visited: #e901a5;
    --nav-item-bg-hover: #ffba00;
  }

  @font-face {
      font-family: beanbag;
      src:  local("Yanone Kaffeesatz-Regular"),
            url('../static/css/fonts/YanoneKaffeesatz-Regular.ttf');
  }

  body {
    background: url(https://i.imgur.com/poa77tE.jpg) no-repeat center center fixed;
    background-color: rgb(48, 44, 47);
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
  }
  hr {
    background-color: rgba(255, 186, 0, 0.65);
  }
  #app {
    font-family: Helvetica;
    font-size: 1.3em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .label {
    color: #fffee7;
  }
  .button {
    background-color: rgba(0,0,0,0);
    color: #fffee7;
  }
  .button:hover {
    color: #ffe700;
    border-color: #ffba00;
    background-color: rgba(48, 44, 47, .8);
  }
  .button:disabled {
    background-color: rgba(48, 44, 47, .8);;
  }
  .button:disabled:hover {
    color: #7a7a7a;
    border-color: #dbdbdb;
  }
  .button:active {
    border-color: #ffba00;
    box-shadow: 0 0 0.5em rgba(255, 231, 0, 1);
  }
  .button:focus {
    outline: 0;
    box-shadow: none;
    color: #fffee7;
    border-color: #ffba00;
  }
  .submit {
    margin-top: 5px;
  }
  .submit:disabled{
    background-color: rgba(48, 44, 47, .8);
  }
  .submit:not(:disabled) {
    color: rgb(70, 242, 35);
    border-color: rgb(70, 242, 35);
  }
  .submit:not(:disabled):hover {
    box-shadow: 0 0 0.5em rgba(70, 242, 35, .8);
  }
  .thumb-nail {
    width: 64px;
    height: 64px;
  }
  .airborn {
    z-index: 1;
  }
  .surface {
    z-index: 0;
  }
  .fake-body {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 5px;
    overflow-y: hidden;
  }
  .box {
    background-color: rgba(40, 31, 37, 1);
    border: 1px solid rgb(102, 102, 102);
  }
  p > img {
    max-width: 100%;
    padding: 4px;
    border: 1px solid #ffba00 !important;
    margin: 5px 3px;
    display: inline-block;
    cursor: pointer;
  }
  .noDistract {
    box-shadow: 2px 2px 1px #aaaaaa;
    height: 64px;
    width: 64px;
  }
  a[href="#dontChangeMe"] {
    color: #e901a5;
    cursor: help;
  }
  .relative {
    position: relative;
    overflow: visible;
    z-index: 100;
  }
  .right-side {
    display: flex;
    margin-right: 0px;
    margin-left: auto;
  }
  .dropdownContainer {
    position: absolute;
    top: 60px;
    z-index: 21;
    max-width: 350px;
    right: 0;
    margin: 0 5px;
    background-color: rgb(48, 44, 47);
  }
  .date {
    color: rgb(152, 148, 148);
  }
  .btn-wrap {
    display: flex;
  }
</style>
<style src="../node_modules/highlight.js/styles/default.css"></style>
<!-- <style src="../static/css/style.css"></style> -->
