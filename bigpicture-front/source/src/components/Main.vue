<template>
  <div class="container" id="main">
    <display-updates :updates="updates"
                     :disablePrev="disablePrev"
                     :disableNext="disableNext"
                     :activeTab="activeTab"
                     :defaultUnreaders="defaultUnreaders"
                     :currentAuthor="currentAuthor"
                     :tags="tags"
                     :showSwapTags="showSwapTags"
                     :isMobile="isMobile"
                     :allAuthors="allAuthors"
                     :isLoading="isLoading"
                     :noResultsFound="noResultsFound"
                     :searchIsActive="searchIsActive"
                     :searchTags="searchTags"
                     :searchAuthor="searchAuthor"
                     :searchDateBefore="searchDateBefore"
                     :searchDateAfter="searchDateAfter"
                     @setActiveTab="setActiveTab"
                     @addSearchTag="addSearchTag"
                     @removeAuthor="removeAuthor"
                     @removeSearchTag="removeSearchTag"
                     @submitSearch="submitSearch"
                     @chooseAuthor="chooseAuthor"
                     @chooseAfterDate="chooseAfterDate"
                     @chooseBeforeDate="chooseBeforeDate"
                     @deactivateDropdowns="deactivateDropdowns"
                     @toggleSearch="toggleSearch"
                     @reload="reload"
                     @activate="changeActiveTab"
                     @toggleRender="toggleRender"
                     @insertMessage="insertMessage"
                     @markPostAsRead="markPostAsRead"
                     @toggleReplyArea="toggleReplyArea"
                     @toggleEditTags="toggleEditTags"
                     @goBack="goBack"
                     @goForward="goForward"
                     @submitNewTags="submitNewTags"
                     @submitReply="submitReply">
    </display-updates>
    <compose-update @submitUpdate="submitUpdate"
                    @loadTags="loadTags"
                    @changeActiveTab="changeActiveTab"
                    @insertMessage="insertMessage"
                    @done="done"
                    @saveNewTag="saveNewTag"
                    @selectTag="selectTag"
                    @removeSelected="removeSelected"
                    @getStoredTags="getStoredTags"
                    :updateTags="updateTags"
                    :isMobile="isMobile"
                    :status="status"
                    :tags="tags"
                    :defaultUnreaders="defaultUnreaders"
                    :currentAuthor="currentAuthor"
                    class="composeUpdateArea"></compose-update>
    <div class="scrollSpace">

    </div>
    <!-- <footer>
      Did you know the airspeed velocity of an unlaiden swallow is between 31 and 40 miles per hour?
    </footer> -->
  </div>
</template>

<script>
  import ComposeUpdate from '@/components/ComposeUpdate'
  import DisplayUpdates from '@/components/DisplayUpdates'
  import TypeAhead from '@/components/TypeAhead'

  import util from '../mixins/util.js'
  import forEach from 'lodash.foreach'
  import forOwn from 'lodash.forown'
  import dateformat from 'dateformat'


  export default {
    data () {
      return {
        checking: {
          currentPage: 0,
          totalPages: 0,
          totalUpdates: 0,
          updates: [],
        },
        refreshTimer: null,
      }
    },
    props: {
      searchIsActive: {
        type: Boolean,
        required: true,
      },
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
      noResultsFound: {
        type: Boolean,
        required: true,
      },
      isLoading: {
        type: Boolean,
        required: true,
      },
      updateTags: {
        type: Array,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      tags: {
        type: Array,
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
      updates: {
        type: Array,
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
      pageToken: {
        type: String,
        required: true,
      },
      showSwapTags: {
        type: Boolean,
        required: true,
      },
      isMobile: {
        type: Boolean,
        required: true,
      }
    },
    components: {
      ComposeUpdate,
      DisplayUpdates,
      TypeAhead,
    },
    methods: {
      setActiveTab(tabId) {
        this.$emit('setActiveTab', tabId);
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
      deactivateDropdowns() {
        this.$emit('deactivateDropdowns');
      },
      toggleSearch() {
        this.$emit('toggleSearch');
      },
      getStoredTags() {
        this.$emit('getStoredTags');
      },
      removeSelected(idx) {
        this.$emit('removeSelected', idx);
      },
      selectTag(tag) {
        this.$emit('selectTag', tag);
      },
      saveNewTag(value) {
        this.$emit('saveNewTag', value);
      },
      insertMessage(obj){
        this.$emit('insertMessage', obj);
      },
      reload () {
        this.$emit('reload');
      },
      changeActiveTab(tabId){
        this.$emit('changeActiveTab', tabId);
      },
      loadTags () {
        this.$emit('loadTags');
      },
      markPostAsRead(postId, index){
        this.$emit('markPostAsRead', postId, index);
      },
      goBack() {
        this.$emit('goBack');
      },
      goForward() {
        this.$emit('goForward');
      },
      submitUpdate(update) {
        this.$emit('submitUpdate', update);
      },
      submitReply(replyObj, index) {
        this.$emit('submitReply', replyObj, index);
      },
      toggleRender(index) {
        this.$emit('toggleRender', index);
      },
      toggleReplyArea(index) {
        this.$emit('toggleReplyArea', index);
      },
      toggleEditTags(index) {
        this.$emit('toggleEditTags', index);
      },
      submitNewTags(tags, id, index) {
        this.$emit('submitNewTags', tags, id, index);
      },
      done() {
        this.$emit('done');
      },
    },
  }
</script>

<style scoped>
#main {
  /*padding-top: 20px;*/
}

.radio input[type=radio]{
  display: none;
}

.container {
  padding-bottom: 20px;
}

.scrollSpace{
  min-height: 90px;
}

.composeUpdateArea {
  position: relative;
  z-index: 0;
}
</style>
