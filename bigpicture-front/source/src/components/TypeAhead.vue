<template lang="html">
  <div class="field has-addons">
    <div class="control has-icons-left" :class="inputClasses">
      <input class="input type-ahead-input-field"
             name="typeAhead"
             type="text"
             :placeholder="placeholder"
             @input="onInput($event.target.value)"
             @keyup.esc="isOpen = false"
             @keydown.tab="handleTab($event)"
             @blur="isOpen = false"
             @keydown.down="moveDown"
             @keydown.up="moveUp"
             @keydown.enter="select"
             v-model="keyword">
      </input>
      <span class="icon is-left"><i class="fa" :class="icon" aria-hidden="true"></i></span>
      <ul class="options-list beefCake" v-show="isOpen">
        <li class="top bun" v-show="filterOpts.length >= 1"></li>
        <li v-for="(option, index) in filterOpts"
            class="option"
            :class="{'highlighted': index === highlightedPosition}"
            @mouseenter="highlightedPosition = index"
            @mousedown="select">
          {{ option }}
        </li>
        <li class="bottom bun" v-show="filterOpts.length >= 1"></li>
      </ul>
    </div>
    <div class="control" v-if="terminalButton">
      <button class="button"
              :disabled="buttonStatus"
              @click="submit"
              :title="tooltip">
        <i class="fa"
           :class="terminalButton"></i>
      </button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isOpen: false,
        highlightedPosition: 0,
        keyword: '',
      }
    },
    props: {
      buttonStatus: {
        type: Boolean,
        required: false,
      },
      tooltip: {
        type: String,
        required: false,
      },
      placeholder: {
        type: String,
        required: false,
      },
      icon: {
        type: String,
        required: false,
      },
      options: {
        type: Array,
        required: true,
      },
      limit: {
        type: Number,
        required: true,
      },
      inputClasses: {
        type: String,
        required: false,
        default:  'is-expanded'
      },
      terminalButton: {
        type: String,
        required: false,
        default: '',
      },
    },
    methods: {
      submit() {
        this.$emit('submit', this.keyword);
        this.keyword = '';
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
          this.highlightedPosition = (this.highlightedPosition + 1) % this.filterOpts.length;
        }
      },
      moveUp () {
        if (!this.isOpen) {
          return;
        }else {
          this.highlightedPosition = this.highlightedPosition - 1 < 0
            ? this.filterOpts.length - 1
            : this.highlightedPosition -1
        }
      },
      select () {
        var self = this;
        if (self.filterOpts.length >= 1 && self.isOpen) {
          var selectedOption = self.filterOpts[self.highlightedPosition];
          self.$emit('select', selectedOption);
          self.isOpen = false;
          self.keyword = '';
        }
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
      handleTab (event) {
        let self = this;
        if (self.filterOpts.length >= 1 && self.isOpen) {
          event.preventDefault();
          self.select();
          event.stopPropagation();
        }else {
          return true;
        }
      },
    },
    computed: {
      filterOpts () {
        let filtered = this.bloodhoundSearch(this.keyword, this.options);
        return filtered.slice(0,5);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .type-ahead-input-field {
    outline: none;
  }
  .options-list {
    position: absolute;
    background-color: rgba(255, 254, 231, 1);
    border-radius: 5px;
    z-index: 30;
    color: #4a4a4a;
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
</style>
