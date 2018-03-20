<template>
  <div class="box" :class="{'less-padding-mobile': isMobile}">
    <div class="clickCatcher" v-show="searchIsActive" @click="deactivateDropdowns"></div>
    <div class="controls">
      <tabs :active="activeTab" :tabs="tabs" @tab-click="onTabClick"></tabs>
      <a class="button is-fullwidth refresh" title="Refresh" @click="reload" v-if="activeTab !== 'searchResults'"><i class="fa fa-refresh"></i></a>
      <a class="button is-fullwidth new-search" title="Make a new search!" @click="toggleSearch" v-else><i class="fa fa-plus"></i><span class="spaced"></span><i class="fa fa-search"></i></a>
      <search :isActive="searchIsActive"
              :isMobile="isMobile"
              :authors="allAuthors"
              :tags="tags"
              :searchAuthor="searchAuthor"
              :searchTags="searchTags"
              :searchDateBefore="searchDateBefore"
              :searchDateAfter="searchDateAfter"
              @setActiveTab="setActiveTab"
              @addSearchTag="addSearchTag"
              @chooseAuthor="chooseAuthor"
              @removeAuthor="removeAuthor"
              @chooseAfterDate="chooseAfterDate"
              @chooseBeforeDate="chooseBeforeDate"
              @removeSearchTag="removeSearchTag"
              @submitSearch="submitSearch"
              class="searchDropdownContainer">
      </search>
    </div>
    <div class="display-updates">
      <div v-if="!hasUpdates && !isLoading && activeTab !== 'searchResults'" class="no-update-info-holder">
          <img :src="caughtUp" alt="You're all caught up!">
      </div>
      <div class="no-update-info-holder" v-if="!hasUpdates && activeTab === 'searchResults' && !isLoading">
        <img :src="iGotNothing" v-if="noResultsFound">

        <p class="caughtUpMessage" v-else>
          Do a search!
        </p>
      </div>
      <div v-if="isLoading" class="display-filler ">
        <div class="loading">
          <i class="loading-icon fa fa-refresh fa-spin fa-6"></i>
        </div>
      </div>
      <update v-for="(ud, index) in updates"
              :author="ud.author"
              :mainText="ud.mainText"
              :tags="ud.tags"
              :unreaders="ud.unreaders"
              :unreplies="ud.unreplies"
              :replies="ud.replies"
              :date="ud.date"
              :postId="ud.postId"
              :key="ud.key"
              :showReplyTA="ud.showReplyTA"
              :renderUpdate="ud.renderUpdate"
              :showSwapTags="ud.showSwapTags"
              :index="index"
              :defaultUnreaders="defaultUnreaders"
              :allAuthors="allAuthors"
              :currentAuthor="currentAuthor"
              :allTags="tags"
              @insertMessage="insertMessage"
              @read="markPostAsRead"
              @toggleRender="toggleRender"
              @toggleReplyArea="toggleReplyArea"
              @toggleEditTags="toggleEditTags"
              @submitNewTags="submitNewTags"
              @submitReply="submitReply">
            </update>
    </div>
    <paging :disablePrev="disablePrev"
            :disableNext="disableNext"
            @goBack="goBack"
            @goForward="goForward"
            >
    </paging>
  </div>
</template>

<script>
  // components
  import Tabs from '@/components/Tabs'
  import Update from '@/components/Update'
  import Paging from '@/components/Paging'
  import Search from '@/components/SearchUtil'
  import caughtUp from '../assets/big_picture_caughtup.png'
  import iGotNothing from '../assets/no_results.png'

  // functions n'stuff

  export default {
    components: {
      Tabs,
      Update,
      Search,
      Paging,
    },
    props: {
      searchTags: {
        type: Array,
        required: true,
      },
      searchAuthor: {
        type: Array,
        required: true,
      },
      searchDateBefore: {
        type: String,
        required: true,
      },
      searchDateAfter:{
        type: String,
        required: true,
      },
      searchIsActive: {
        type: Boolean,
        required: true,
      },
      noResultsFound: {
        type: Boolean,
        required: true,
      },
      isLoading: {
        type: Boolean,
        required: true,
      },
      isMobile: {
        type: Boolean,
        required: true,
      },
      allAuthors: {
        type: Array,
        required: true,
      },
      activeTab: {
        type: String,
        required: true,
      },
      showSwapTags: {
        type: Boolean,
        required: true,
      },
      currentAuthor: {
        type: String,
        required: true,
      },
      defaultUnreaders: {
        type: Array,
        required: true,
      },
      disableNext: {
        type: Boolean,
        required: true,
      },
      disablePrev: {
        type: Boolean,
        required: true,
      },
      updates: {
        type: Array,
        required: true,
      },
      tags: {
        type: Array,
        required: true,
      }
    },
    data () {
      return {
        caughtUp: caughtUp,
        iGotNothing: iGotNothing,
        tabs: [
          {id: 'unread', name: 'Unread Updates', icon: 'fa-bell', title: 'Updates just waiting to be read or replied to!'},
          {id: 'all', name: 'All Updates', icon: 'fa-archive', title: 'Archive of every update that ever there was!'},
          {id: 'searchResults', name: 'Search Results', icon: 'fa-search', title: 'Search Results will show up here now!'},
        ],
        timer: null,
      }
    },
    methods: {
      deactivateDropdowns() {
        this.$emit('deactivateDropdowns');
      },
      addSearchTag(tag) {
        this.$emit('addSearchTag', tag);
      },
      removeAuthor() {
        this.$emit('removeAuthor');
      },
      removeSearchTag(idx) {
        this.$emit('removeSearchTag', idx);
      },
      submitSearch() {
        this.$emit('submitSearch');
      },
      chooseAuthor(author) {
        this.$emit('chooseAuthor', author)
      },
      chooseAfterDate(date) {
        this.$emit('chooseAfterDate', date);
      },
      chooseBeforeDate(date) {
        this.$emit('chooseBeforeDate', date);
      },
      setActiveTab(tabId) {
        this.$emit('setActiveTab', tabId);
      },
      toggleSearch() {
        this.$emit('toggleSearch');
      },
      chooseAfterDate(date) {
        this.$emit('chooseAfterDate', date);
      },
      chooseBeforeDate(date) {
        this.$emit('chooseBeforeDate', date);
      },
      submitSearch() {
        this.$emit('submitSearch');
        this.$emit('toggleSearch');
      },
      addSearchTag(tag) {
        this.$emit('addSearchTag', tag);
      },
      removeSearchTag(idx) {
        this.$emit('removeSearchTag', idx);
      },
      removeAuthor() {
        this.$emit('removeAuthor')
      },
      chooseAuthor(author) {
        this.$emit('chooseAuthor', author);
      },
      toggleSearch() {
        this.$emit('toggleSearch');
      },
      insertMessage(msg, color) {
        this.$emit('insertMessage', msg, color);
      },
      reload () {
        this.$emit('reload');
      },
      goBack () {
        this.$emit('goBack');
      },
      goForward () {
        this.$emit('goForward');
      },
      markPostAsRead (postId, index) {
        var self = this;
        self.$emit('markPostAsRead', postId, index);
      },
      onTabClick (id) {
        var self = this;
        if (self.activeTab != id) {
          self.$emit('activate', id);
        }
      },
      submitReply (reply, index) {
        this.$emit('submitReply', reply, index);
      },
      toggleRender (index) {
        this.$emit('toggleRender', index);
      },
      toggleReplyArea (index) {
        this.$emit('toggleReplyArea', index);
      },
      toggleEditTags(index) {
        this.$emit('toggleEditTags', index);
      },
      submitNewTags(tags, id, index) {
        this.$emit('submitNewTags', tags, id, index);
      }
    },
    computed: {
      hasUpdates() {
        return this.updates.length >= 1;
      }
    },

  }
</script>

<style>
  .less-padding-mobile {
    padding-left: 1px;
    padding-right: 1px;
  }
  .no-update-info-holder{
    max-height: 680px;
  }
  .spaced {
    margin: 0 3px;
  }
  .refresh {
    background-color: rgba(0,0,0,0);
    color: #fffee7;
  }
  .refresh:hover {
    color: #ffe700;
    border-color: #ffba00;
    background-color: rgba(48, 44, 47, .8);
  }
  .display-updates {
    overflow-y: hidden;
    min-height: 680px;
  }
  .controls {
    position: relative;
    padding-bottom: 10px;
  }
  .display-filler {
    padding-top: 25%;
    min-width: 100%;
    min-height: 100%;
    text-align: center;
    /*font-size: 2em;*/
    color: #fffee7;
    position: relative;
  }
  .loading-icon {
    font-size: 40px;
  }
  .caughtUpMessage {
    /*padding-top: 25%;*/
    min-width: 100%;
    max-height: 680px;
    /*min-height: 100%;*/
    text-align: center;
    font-size: 2em;
    color: #fffee7;
    position: relative;
    margin: 23.76% 0;
  }
  .searchDropdownContainer {
    top: 80px !important;
    background-color: rgb(78, 75, 77);
  }
  @media only screen and (max-width: 768px) {
    .loading {
      padding-top: 50%;
    }
    .display-updates {
      min-height: 153px;
    }
  }
</style>
