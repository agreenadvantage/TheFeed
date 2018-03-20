<template>
  <div class="card" :id="postId">
    <header class="card-header columns updateSummary"
            @click="toggleRender">
      <div class="author column is-1 is-full-mobile">{{ author }}</div>
      <div class="date column summary is-narrow is-full-mobile">{{ date }}</div>
      <div class="tags column summary is-narrow is-full-mobile">
        <span class="tag" v-for="tag in tags">
          {{ tag }}
        </span>
      </div>
      <div class="preview column summary is-full-mobile">
        <div class="previewText" >{{ previewText }}</div>
      </div>
      <div class="summary column is-narrow reply-count" v-if="hasUnread">
        <i class="fa fa-comment icon-stats"></i>
        <div class="floatyNums">{{ unreadReplies }}</div>
      </div>

    </header>
    <collapse>
      <div class="update-bod" v-if="renderUpdate">
        <div class="card-content">
          <div ref="updateBod" class="content" v-html="markedText"></div>
          <hr v-if="hasReplies"/>
          <div class="replies" v-if="hasReplies">
            <reply v-for="(reply, index) in replies"
                   :key="reply._id"
                   :replyText="markIt(reply.text)"
                   :date="reply.date"
                   :replyAuthorName="reply.author.name"
                   :replyAuthorId="reply.author.id"></reply>
          </div>
        </div>
        <collapse>
          <compose-reply @submit="submitReply"
                         v-if="showReplyTA"
                         :postIndex="index"
                         :updateAuthor="author.toLowerCase()"
                         :allAuthors="allAuthors"
                         :defaultUnreaders="defaultUnreaders"
                         :postId="postId"
                         ref="composeReply">
          </compose-reply>
        </collapse>
        <collapse>
          <swap-tags v-if="showSwapTags"
                     :postTags="tags"
                     :author="author"
                     :allTags="allTags"
                     @insertMessage="insertMessage"
                     @submitNewTags="submitNewTags">
          </swap-tags>
        </collapse>
        <footer class="card-footer">
          <div class="btn-wrap column is-narrow">
            <button class="button edit" @click="toggleReplyArea">
              <i class="fa fa-fw fa-comment"></i>
            </button>
            <button class="button edit" @click="toggleEditTags">
              <i class="fa fa-fw fa-tags"></i>
            </button>
          </div>
          <div class="column is-hidden-mobile"></div>
          <div class="column btn-wrap column is-narrow">
            <button class="button close" @click="toggleRender">
              <i class="fa fa-fw fa-close"></i>
            </button>
          </div>
        </footer>
      </div>
    </collapse>
  </div>
</template>

<script>
  import Reply from '@/components/Reply'
  import ComposeReply from '@/components/ComposeReply'
  import Collapse from '@/components/Collapse'
  import SwapTags from '@/components/SwapTags'

  import highlightjs from 'highlight.js'
  import util from '../mixins/util.js'
  import marked from 'marked'
  import forEach from 'lodash.foreach'

  marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    renderer: new marked.Renderer(),
    highlight: function (code) {
      return highlightjs.highlightAuto(code).value;
    },
  });

  export default {
    components: {
      Reply,
      ComposeReply,
      Collapse,
      SwapTags,
    },
    props: {
      allAuthors: {
        type: Array,
        required: true,
      },
      allTags: {
        type: Array,
        required: true,
      },
      showReplyTA: {
        type: Boolean,
        required: true,
      },
      showSwapTags: {
        type: Boolean,
        required: true,
      },
      renderUpdate: {
        type: Boolean,
        required: true,
      },
      defaultUnreaders: {
        type: Array,
        required: true,
      },
      author: {
        type: String,
        required: true,
      },
      mainText: {
        type: String,
        required: true,
      },
      tags: {
        type: Array,
        required: true,
      },
      unreaders: {
        type: Array,
        required: true,
      },
      unreplies: {
        type: Array,
        required: true,
      },
      replies: {
        type: Array,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      postId: {
        type: String,
        required: true,
      },
      index: {
        type: Number,
        required: true,
      },
      currentAuthor: {
        type: String,
        required: true,
      },
    },
    data: function() {
      return {
        justClicked: false,
      }
    },
    methods: {
      processImgs() {
        let self = this;
        if (self.$refs.updateBod) {
          var images = self.$refs.updateBod.getElementsByTagName('img');
          forEach(images, function (img) {
            img.addEventListener('click', self.toggleDistraction);
          });
        }
      },
      processATags() {
        let self = this;
        if (self.$refs.updateBod) {
          var anchors = self.$refs.updateBod.getElementsByTagName('a');
          forEach(anchors, function (a) {
            a.target = '_blank';
          });
        }
      },
      toggleDistraction(el) {
        let imgClasses = el.target.classList.value.split(' ');
        let idxNoDistract = imgClasses.indexOf('noDistract');
        let newClassVal = '';

        if (idxNoDistract == -1) {
          imgClasses.push('noDistract');
        }else {
          imgClasses.splice(idxNoDistract, 1);
        }

        newClassVal = imgClasses.join(' ');
        el.target.classList.value = newClassVal;
      },
      insertMessage(msg, color) {
        this.$emit('insertMessage', msg, color);
      },
      markAsRead () {
        var self = this;
        var user = this.currentAuthor;
        if (this.unreaders.indexOf(user) != -1 || this.unreplies.indexOf(user) != -1) {
          self.$emit('read', self.postId, self.index);
        }
      },
      submitReply(reply) {
        this.$emit('submitReply', reply, this.index);
      },
      toggleRender () {
        this.$emit('toggleRender', this.index);
        this.markAsRead();
        this.$nextTick(this.processImgs);
        this.$nextTick(this.processATags);
      },
      toggleReplyArea () {
        let self = this;
        if (self.showSwapTags) {
          self.toggleEditTags();
        }
        self.$emit('toggleReplyArea', self.index);
        self.$nextTick(function () {
          if (self.showReplyTA) {
            self.focusOnTa()
          }
        });
      },
      focusOnTa() {
        this.$refs.composeReply.$el.querySelector('textarea').focus();
      },
      toggleEditTags() {
        if (this.showReplyTA) {
          this.toggleReplyArea();
        }
        this.$emit('toggleEditTags', this.index);
      },
      toTheComments (event) {
        var replySection = event.target.parentElement.getElementsByClassName('replies')[0];
        var box = replySection.getBoundingClientRect();
        window.scrollBy(0, box.top - 70);
      },
      submitNewTags (tags) {
        this.$emit('submitNewTags', tags, this.postId, this.index);
      },
      markIt(reply) {
        return marked(reply);
      }
    },
    computed: {
      previewText () {
        return this.markedText.slice(0, 175).replace(/\<.*?\>/g, '');
      },
      markedText () {
        return marked(this.mainText);
      },
      hasReplies () {
        return this.replies.length >= 1;
      },
      unreadReplies() {
        var self = this;
        return this.unreplies.filter(function (value) {
          return value === self.currentAuthor;
        }).length;
      },
      hasUnread() {
        return this.unreadReplies >= 1;
      }
    },
  }
</script>

<style lang="scss">
  .card {
    max-width: 100%;
    margin-top: 5px;
    overflow-y: visible;
    overflow-x: visible;
    cursor: pointer;
    background-color: rgba(48, 44, 47, .4);
  }

  .card-header {
    background-color: rgba(57, 52, 56, 0.8);
    color: var(--content-text);
    display: block;
    min-height: 100%;
    margin: 0px !important;
    max-width: 100%;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  .reply > .card-header {
    overflow-y: hidden;
  }

  .card-header:hover {
    background-color: rgba(66, 60, 65, 0.8);
  }

  .card-footer {
    background-color: rgba(48, 44, 47, .8);
    border-top: 0px;
    margin-top: 4px;
  }

  .column {
    overflow-x: visible;
  }

  .updateSummary {
    max-width: 100%;
    margin: 0px;
    padding: 5px 2px;
  }

  .author {
    color: #ffba00;
    font-size: 1.6em;
    font-family: beanbag;
    line-height: 100%;
    padding: 6px;
  }

  .summary {
    font-size: .8em;
    line-height: 250%;
    padding: 6px;
  }

  .tag {
    margin-left: 5px;
    border-radius: 8px;
    padding: 0px 8px;
    background-color: #0ea7ae;
    color: rgba(0, 0, 0, 1);
    font-size: .9em;
  }

  .tags {
    max-width: 100%;
    text-overflow: ellipsis;
    display: inline-block;
  }

  .preview {
    overflow-x: hidden;
  }

  .previewText {
    overflow: hidden;
    max-width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .reply-count {
    position: relative
  }

  .icon-stats {
    font-size: 35px;
    color: #ff2b56;
  }

  .floatyNums {
    position: absolute;
    left: 18px;
    top: 3px;
    color: var(--content-text);
    font-size: 20px;
  }
  .update-bod {
    overflow-wrap: break-word;
    color: var(--content-text);
    cursor: default;
    font-size: 0.90em;
  }
  .content p {
    font-family: serif;
  }
  .content ol {
    font-family: serif;
  }
  .content ul {
    font-family: serif;
  }
  .content h1 {
    color: var(--text);
  }
  .content h2 {
    color: var(--text);
  }
  .content h3 {
    color: var(--text);
  }
  .content h4 {
    color: var(--text);
  }
  .content h5 {
    color: var(--text);
  }
  .content h6 {
    color: var(--text);
  }
  .content strong {
    color: var(--content-text);
  }
  .content blockquote {
    background-color: rgba(12, 131, 136, 0.6);
    border-color: #00e2c6;
    color: var(--content-text);
  }
  .content hr {
    background-color: rgba(14, 166, 173, 1);
  }
  .content a:hover {
    color: #ffba00;
  }
  .replyForm {
    padding: 15px;
    overflow-y: hidden;
  }
  .close{
    margin-right: 0px;
    margin-left: auto;
  }
  .edit:not(:last-child){
    margin-right: 3px;
  }
</style>
