<!-- WARNING: THIS IS REPLY -->
<template lang="html">
  <div class="replyForm">
    <div class="form">
      <div class="control">
        <bscotch-text-area class="composeReply"
                           :placeholder="placeholder"
                           v-model="content">
        </bscotch-text-area>
      </div>
    </div>
    <div class="form">
      <div class="control columns">
        <div class="column is-half is-offset-one-quarter">
          <button @click="emitSubmit"
             class="submit button is-fullwidth"
             :disabled="disableReplySubmit"
             :title="tooltip">
            <i class="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BscotchTextArea from '@/components/BscotchTextArea'

import util from '../mixins/util.js'

export default {
  props: {
    postId: {
      type: String,
      required: true,
    },
    defaultUnreaders: {
      type: Array,
      required: true,
    },
    allAuthors: {
      type: Array,
      required: true,
    },
    updateAuthor: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      content: '',
      placeholder: 'Type up a sassy reply here!',
      regExp: /@([a-z]+)/ig,
      groups: {
        everyone:     this.allAuthors,
        ateam:        ['andy', 'adam'],
        webdev:       ['andy', 'adam'],
        programmers:  ['andy', 'adam', 'seth', 'shi'],
        artists:      ['tiffa', 'sam'],
        art:          ['tiffa', 'sam'],
        operations:   ['seth', 'sam', 'adam', 'monique'],
        ops:          ['seth', 'sam', 'adam', 'monique'],
        gamedev:      ['seth', 'sam', 'shi', 'tiffa'],
        bros:         ['seth', 'sam', 'adam'],
      },
    }
  },
  components: {
    BscotchTextArea,
  },
  computed: {
    replyAuthor() {
      return util.getCookie('DashUserName');
    },
    replyAuthorId() {
      return util.getCookie('DashId');
    },
    unrepliers() {
      let self = this;
      let listOfRepliers = self.content.match(self.regExp);
      let cleanList = [];

      // tag the update author by default unless they are making the post
      if (self.updateAuthor != this.replyAuthor) {
        cleanList.push(self.updateAuthor);
      }

      // if there were @ tags in the post process them here
      if (listOfRepliers) {
        //loop through all matches where there is an @.
        listOfRepliers.forEach(function (mention, idx) {
          let cleanedMention = mention.split('@')[1].toLowerCase();
          //if the mention is in the current list of authors
          if (self.allAuthors.indexOf(cleanedMention) !== -1){
            //if that mention hasn't already been added elsewhere in the post
            if (cleanList.indexOf(cleanedMention) === -1) {
              cleanList.push(cleanedMention);
            }
            //if the mention is in the list of groups
          }else if (Object.keys(self.groups).indexOf(cleanedMention) !== -1) {
            // get the group array from the group obj by key
            self.groups[cleanedMention].forEach(function(author) {
              //push that list IF they're not in the list already
              if ( cleanList.indexOf(author) === -1 ) {
                cleanList.push(author);
              }
            });
          }
        });
      }else { // if no one was tagged Tag everyone except the author of the comment, or the update author if they the one are making the comment on their own post.
        self.groups.everyone.forEach(function(author) {
          if (cleanList.indexOf(author) === -1 && author !== self.updateAuthor && author !== self.replyAuthor) {
            cleanList.push(author);
          }
        });
      }
      console.log('Tagged list:', cleanList);
      return cleanList;
    },
    reply() {
      return {
        postId: this.postId,
        reply: {
          text: this.content.trim(),
          author: this.replyAuthor,
          authorId: this.replyAuthorId,
          unreplies: this.unrepliers,
        },
      };
    },
    disableReplySubmit() {
      if (this.content.trim().length >= 3) {
        return false;
      }else {
        return true;
      }
    },
    tooltip() {
      if (this.disableReplySubmit) {
        return 'You gotta have at least 3 charcters to submit!';
      }else {
        return 'SUBMIT!';
      }
    },
  },
  methods: {
    emitSubmit() {
      this.$emit('submit', this.reply);
      this.content = '';
    },
  },
}
</script>

<style lang="css" scoped>
  .composeReply {
    resize: vertical;
    max-height: 7000px;
    height: auto;
  }
</style>
