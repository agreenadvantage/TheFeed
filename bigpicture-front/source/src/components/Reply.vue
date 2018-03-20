<template>
  <div class="reply card">
    <header class="card-header reply-top">
      <div class="info"><span class="author">{{ author }}</span> - </div>
      <div class="info"><span class="date">{{ formatedTime }}</span></div>
    </header>
    <div class="textContent content" v-html="replyText"></div>
  </div>
</template>

<script>
import util from '../mixins/util.js'
import dateformat from 'dateformat'

export default {
  props: {
    replyAuthorName: {
      type: String,
      reqired: true,
    },
    replyAuthorId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      reqired: true,
    },
    replyText: {
      type: String,
      required: true,
    }
  },
  data() {
    return {

    }
  },
  computed: {
    author() {
      return util.capFirst(this.replyAuthorName);
    },
    formatedTime() {
      return dateformat(this.date, "mm/dd/yyyy hh:mm tt");
    },
  },
}
</script>

<style scoped>
  .reply {
    font-size: .9em;
    color: #fffee7;
    cursor: default;
  }
  .reply-top:hover{
    background-color: rgba(57, 52, 56, 0.8);
  }

  .info {
    margin-left: 5px;
    max-width: 100%;
    display: inline-block;
  }

  .textContent {
    padding: 8px;
  }
</style>
