<template>
  <div class="tags-autocomplete">
    <div class="selectedTagsHolder">
      <button v-for="(tag, index) in selectedTags"
           class="selectedTag button"
           :class="{'is-danger': index === dangerHover}"
           @click="removeSelection"
           @mouseenter="dangerHover = index"
           @mouseleave="dangerHover = null">
        {{ tag }}<i class="remove fa fa-times-circle-o"></i>
      </button>
    </div>
    <div class="field has-addons">
      <div class="control has-icons-left is-expanded">
        <input v-validate="'alpha_spaces'"
               :class="{'input': true, 'is-danger': errors.has('tags') }"
               name="tags"
               type="text"
               placeholder="Tags"
               id="tagsInput"
               @input="onInput($event.target.value)"
               @keyup.esc="isOpen = false"
               @blur="isOpen = false"
               @keydown.down="moveDown"
               @keydown.up="moveUp"
               @keydown.enter="select"
               @keydown.tab="handleTab($event)"
               v-model="keyword">
        </input>
        <span class="icon is-left"><i class="fa fa-tags" aria-hidden="true"></i></span>
        <ul class="options-list" v-show="isOpen && !isDuplicate">
          <li class="top bun" v-show="filterTags.length >= 1"></li>
          <li v-for="(option, index) in filterTags"
              class="option"
              :class="{'highlighted': index === highlightedPosition}"
              @mouseenter="highlightedPosition = index"
              @mousedown="select"
              >
            {{ option }}
          </li>
          <li class="bottom bun" v-show="filterTags.length >= 1"></li>
        </ul>
        <div class="errorContainer">
          <p class="error" v-if="isDuplicate">That tag has been selected already!</p>
          <p v-if="errors.has('tags')" class="error">{{ errors.first('tags') }}</p>
        </div>
      </div>
      <div class="control">
        <button class="button"
                :disabled="buttonStatus"
                @click="saveTag"
                :title="tooltip">
          <i class="fa fa-floppy-o"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import { Validator } from 'vee-validate';
const validator = new Validator({
  alpha_spaces: 'alpha_spaces',
});

export default {
  props: {
    selectedTags: {
      type: Array,
      required: true,
    },
    tooltip: {
      type: String,
      required: false,
      default: '',
    },
    buttonStatus: {
      type: Boolean,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    }
  },
  data () {
    return {
      isOpen: false,
      highlightedPosition: 0,
      keyword: '',
      isDuplicate: false,
      dangerHover: null,
    }
  },
  methods: {
    handleTab (event) {
      let self = this;
      if (self.filterTags.length >= 1) {
        event.preventDefault();
        self.select();
        event.stopPropagation();
      }else {
        return true;
      }
    },
    saveTag () {
      var self = this;
      var preparedTag = self.keyword.toLowerCase().trim();
      if (!self.tagIsSelected(preparedTag)) {
        if (self.tagIsAvalable(preparedTag)) {
          self.selectTagForUpdate(preparedTag);
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
            let message = res.data.message || res.data.error || res.message || 'no message recieved';
            console.log('Result of failed save attempt', message);
          });
        }
      } else {
        self.dupedSelection();
      }
    },
    tagIsSelected (tag) {
      let selected = false;
      if (this.selectedTags.indexOf(tag) >= 0) {
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
    selectTagForUpdate (tag) {
      this.$emit('select', tag);
    },
    updateAvailableTagsList (tag) {
      this.$emit('loadTags');
    },
    clearTagInput () {
      this.keyword = '';
    },
    handleTagPostProcessing (tag) {
      this.updateAvailableTagsList(tag);
      this.selectTagForUpdate(tag);
      this.clearTagInput();
    },
    onInput (value) {
      this.isOpen = !!value;
      this.highlightedPosition = 0;
      this.$emit('input', value);
    },
    moveDown () {
      if (!this.isOpen) {
        return;
      }else {
        this.highlightedPosition = (this.highlightedPosition + 1) % this.filterTags.length;
      }
    },
    moveUp () {
      if (!this.isOpen) {
        return;
      }else {
        this.highlightedPosition = this.highlightedPosition - 1 < 0
          ? this.filterTags.length - 1
          : this.highlightedPosition -1
      }
    },
    select () {
      var self = this;
      if (self.filterTags.length >= 1) {
        var selectedOption = self.filterTags[self.highlightedPosition];
        var selectedIndex = self.selectedTags.indexOf(selectedOption);
        if (selectedIndex == -1) {
          self.keyword = selectedOption.trim() || self.keyword;
          self.isOpen = false;
          self.$emit('select', selectedOption);
        }else {
          self.dupedSelection();
        }
        self.keyword = '';
      }else {
        return
      }
    },
    removeSelection (e) {
      var self = this;
      var tagVal = e.target.outerText;
      var idx = this.selectedTags.indexOf(tagVal);
      self.dangerHover = null;
      self.$emit('removeSelected', idx);
    },
    loadTags () {
      var self = this;
      self.$emit('loadTags');
    },
    dupedSelection () {
      this.isDuplicate = true;
      setTimeout(this.removeDupeWarning, 3000);
    },
    removeDupeWarning () {
      this.isDuplicate = false;
    },
    internalMatchBadness(matchResult) {
      let badness = 0;
      for (let i=1; i<matchResult.length; i++) {
        badness += matchResult[i].length;
      }
      return badness;
    },
    bloodhoundSearch(searchTerm, targetList ) {
      // get back subset of targetlist, in RANK ORDER (0th is best)

      // convert search term to regex
      let badGroup = '(.*)' ;
      let asRegex = badGroup+(searchTerm.toLowerCase().split('').join(badGroup))+badGroup;
      let searchRegex = new RegExp(asRegex);
      // find matches for this regex
      let allMatches = [] ;
      targetList.forEach(target=>{
        let match = target.match(searchRegex);
        if(match){
          allMatches.push(match);
        }
      });
      // sort matches
      allMatches.sort((a,b)=>{
        if(a[0]==searchTerm){ return -1;}
        else if(b[0]==searchTerm){ return 1;}
        else if(a[1]=="" && b[1]!=""){ return -1; }
        else if(a[1]!="" && b[1]==""){return  1;}
        else{
          return this.internalMatchBadness(a) > this.internalMatchBadness(b);
        }
      });
      return allMatches.map(x=>x[0]) ;
    },
  },
  computed: {
    filterTags () {
      let filtered = this.bloodhoundSearch(this.keyword, this.tags);
      return filtered.slice(0,5);
    }
  },
}
</script>

<style >
  /*.options-list {
    position: absolute;
    background-color: rgba(255, 254, 231, 1);
    border-radius: 5px;
    z-index: 30;
    color: #4a4a4a;
  }
  .errorContainer {
    min-height: 24px;
  }
  .error {
    color: rgb(224, 34, 34);
  }
  .highlighted.option {
    background-color: rgb(189, 178, 111);
  }
  .option {
    padding-left: 3px;
    padding-right: 3px;
    min-width: 250px;
    font-size: 1.3em;
    border: 1px solid rgb(177, 177, 177);
    border-bottom: none;
  }
  .bun {
    height: 20px;
    border: 1px solid rgb(177, 177, 177);
  }
  .top {
    border-bottom: none;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
  }
  .bottom {
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .selectedTag {
    display: inline;
    position: relative;
    padding-right: 30px;
    margin-right: 3px;
    margin-bottom: 2px;
    border-color: rgba(0, 226, 198, 1);
    height: 36px !important;
  }
  .selectedTagsHolder {
    min-height: 38px;
    margin-top: 10px;
    margin-bottom: 5px;
  }
  .selectedTag {
    margin-right: 3px;
    margin-bottom: 2px;
  }
  .remove {
    position: absolute;
    right: 3px;
    bottom: 7px;
  }*/
</style>
