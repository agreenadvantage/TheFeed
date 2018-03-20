<template>
  <div class="box relative">
    <md-toolbar :buttons="buttons"
                :secondaryButtons="secondaryButtons"
                :isMobile="isMobile"
                @handleButtonInput="handleButtonInput"
                @activateFunction="activateFunction">
    </md-toolbar>
    <div class="bloop">
      <div class="field no-margin">
        <div class="control">
          <textarea v-model="updateText"
                    class="textarea"
                    :class="{'desktopCompose': !isMobile}"
                    :placeholder = "placeholder || placeholderText"
                    @keyup="handleInput($event)"
                    @keyup.enter="insertChar"
                    @mouseup="getCursorPos"
                    @keydown.shift.tab.prevent.stop=""
                    @keydown.tab="tabIt($event)"
                    @keydown.ctrl.73="hotkey(0, $event)"
                    @keydown.ctrl.66="hotkey(1, $event)"
                    @keydown.ctrl.83="hotkey(2, $event)"
                    @keydown.ctrl.72="hotkey(3, $event)"
                    @keydown.ctrl.81="hotkey(4, $event)"
                    @keydown.alt.67="hotkey(5, $event)"
                    @keydown.ctrl.85="hotkey(6, $event)"
                    @keydown.ctrl.79="hotkey(7, $event)"
                    @keydown.ctrl.75="hotkey(8, $event)"
                    @keydown.alt.73="hotkey(9, $event)"
                    @keydown.alt.66="hotkey(10, $event)"
                    :disabled="submitStatus"
                    :style="{height: updateTextHeight + 'px'}"
                    v-if="!hideTextArea"
                    ref="area">
          </textarea>
        </div>
      </div>
      <div class="content preview"
           ref="previewArea"
           v-if="showPreview">
        <div v-html="processedMarked"></div>
      </div>
    </div>
    <type-ahead :icon="'fa-tags'"
                :options="tags"
                name="tags"
                :limit="5"
                :terminalButton="'fa-floppy-o'"
                :inputClasses="'is-expanded'"
                :buttonStatus="tagButtonStatus"
                :tooltip="tagTooltip"
                @select="selectTag"
                @submit="saveNewTag"
                v-model="tagText"
                class="tags-select-bloodhound"></type-ahead>
    <type-ahead-handler :display="updateTags"
                        @remove="removeSelected"
                        ></type-ahead-handler>
    <div class="columns">
      <div class="column"></div>
      <div class="column is-narrow">
        <div class="btn-wrap">
          <button class="button submit right-side"
                  :disabled="submitButtonStatus"
                  @click="submitUpdate"
                  :title="submitTooltip"
                  :class="{'is-loading': buttonStatus}"
                  id="submitUpdate">
            <i class="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  //components
  import tagInput from '@/components/Tags';
  import BscotchTextArea from '@/components/BscotchTextArea';
  import submitButton from '@/components/SubmitButton'
  import MdToolbar from '@/components/MdToolbar'
  import TypeAhead from '@/components/TypeAhead'
  import TypeAheadHandler from '@/components/TypeAheadHandler'
  //function imports
  import marked from 'marked'
  import forEach from 'lodash.foreach'
  import isArray from 'lodash.isarray'
  import util from '../mixins/util.js'

  export default {
    data () {
      return {
        placeholderText: 'Tell us about your day!',
        localStorage: window.localStorage,
        updateText: '',
        tagText: '',
        tagButtonStatus: true,
        cursorAfter: '',
        interval: null,
        timeout: null,
        cursorBefore: '',
        onEnterBtnIdx: '',
        showPreview: false,
        updateTextHeight: 150,
        buttons: [
          /*0*/{ name: 'italics (ctrl+i)', icon: 'fa-italic',        before: '*',        after: '*',                      repeat: false,  max: false, regex: false , disabled: false},
          /*1*/{ name: 'bold (ctrl+b)',    icon: 'fa-bold',          before: '**',       after: '**',                     repeat: false,  max: false, regex: false , disabled: false },
          /*2*/{ name: 'strike (ctrl+s)',  icon: 'fa-strikethrough', before: '~~',       after: '~~',                     repeat: false,  max: false, regex: false , disabled: false },
          /*3*/{ name: 'header (ctrl+h)',  icon: 'fa-header',        before: '#',        after: false,                    repeat: false,  max: 6,     regex: /^(\#{1,7} )/mg , disabled: false },
          /*4*/{ name: 'quote (ctrl+q)',   icon: 'fa-quote-left',    before: '>',        after: false,                    repeat: true,   max: 1,     regex: /^(\>{1,2} )/mg , disabled: false },
          /*5*/{ name: 'code (alt+c)',     icon: 'fa-code',          before: '`',        after: '`',                      repeat: false,  max: false, regex: false , disabled: false },
          /*6*/{ name: 'Ulist (ctrl+u)',   icon: 'fa-list-ul',       before: '+',        after: false,                    repeat: true,   max: 1,     regex: /(\+{1,2} )/mg , disabled: false },
          /*7*/{ name: 'Olist (ctrl+o)',   icon: 'fa-list-ol',       before: '1.',       after: false,                    repeat: true,   max: 1,     regex: /(1\.){1,2} /mg , disabled: false },
          /*8*/{ name: 'link (ctrl+k)',    icon: 'fa-link',          before: '[',        after: '](link)', repeat: false,  max: false, regex: false , disabled: false },
          /*9*/{ name: 'image (alt+i)',    icon: 'fa-picture-o',     before: '![',       after: '](link)', repeat: false,  max: false, regex: false , disabled: false },
         /*10*/{ name: 'h-bar (alt+b)',    icon: 'fa-minus',         before: '\n-----',  after: '',                       repeat: false,  max: false, regex: false , disabled: false },
         /*10*/{ name: 'tooltip text', icon: 'fa-question-circle', before: '[', after: '](#dontChangeMe "this text will be a popup dialog!")', repeat:false, max:false, regex:false},
        ],
        secondaryButtons: [
          { name: 'preview', icon: 'fa-eye', func: this.togglePreview },
        ],
      }
    },
    props: {
      isMobile: {
        type: Boolean,
        required: true,
      },
      updateTags: {
        type: Array,
        required: true,
      },
      defaultUnreaders: {
        type: Array,
        required: true,
      },
      currentAuthor: {
        type: String,
        required: false,
      },
      tags: {
        type: Array,
        required: true,
      },
      status: {
        type: String,
        required: true,
      }
    },
    methods: {
      toggleButtons() {
        let self = this;
        forEach(self.buttons, function (button, idx) {
          button.disabled = self.showPreview;
        });
      },
      tabIt(event) {
        event.preventDefault();
        let self = this;
        self.getCursorPos();
        let taObj = self.getTAInfoObj();
        let startingLine = taObj.selLineStart ;
        let lineLength = taObj.lines[startingLine].length;
        let selectionStartModifier = 0;
        let selectionEndModifier = -2;
        if (event.shiftKey) {
          if (taObj.lines[startingLine].substring(0,2) == '  ') {
            taObj.lines[startingLine] = taObj.lines[startingLine].substring(2, lineLength);
          }else{
            return
          }
        }else {
          taObj.lines[startingLine] = "  " + taObj.lines[startingLine];
          selectionEndModifier = selectionEndModifier * -1;
          selectionStartModifier = 2;
        }
        self.$refs.area.value = taObj.lines.join('\n');
        self.$refs.area.setSelectionRange(taObj.bTextLen + selectionStartModifier,  taObj.bTextLen + taObj.selectedText.length + selectionEndModifier);
        event.stopPropagation();
      },
      hotkey(btnIdx, event) {
        event.preventDefault();
        this.getCursorPos();
        this.handleButtonInput(btnIdx);
        event.stopPropagation();
      },
      insertMessage(obj) {
        this.$emit('insertMessage', obj );
      },
      getStoredText() {
        let UDText = this.localStorage.getItem('updateText');
        if (UDText && UDText.length > 0) {
          this.updateText = UDText;
        }
      },
      getStoredTags() {
        this.$emit('getStoredTags');
      },
      handleInput(event) {
        this.getCursorPos();
        this.localStorage.setItem('updateText', this.$refs.area.value);
      },
      activateFunction(index) {
        this.secondaryButtons[index].func();
      },
      togglePreview() {
        if (this.$refs.area) {
          this.updateText = this.$refs.area.value;
          this.updateTextHeight = this.$refs.area.clientHeight;
        }
        this.showPreview = !this.showPreview;
        this.toggleButtons();
        this.$nextTick(this.processImgs);
      },
      processImgs() {
        let self = this;
        if (self.$refs.previewArea) {
          var images = self.$refs.previewArea.getElementsByTagName('img');
          forEach(images, function (img) {
            img.addEventListener('click', self.toggleDistraction)
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
      insertChar() {
        let self = this;
        let taInfo = self.getTAInfoObj();
        if (self.onEnterBtnIdx !== '') {
          self.getCursorPos();
          let lines = taInfo.lines;
          let checkline = taInfo.selLineStart -1;
          if (checkline == -1) {
            checkline = 0;
          }

          if (lines[checkline].trim().length <= 2) {
            self.onEnterBtnIdx = '';
            lines[checkline] = '';
            self.$refs.area.value = lines.join('\n');
          }else {
            self.handleButtonInput(self.onEnterBtnIdx);
          }
        }
      },
      getLines(val) {
        return val.split('\n');
      },
      getTAInfoObj() {
        let self = this;
        let obj = {};
        obj.taVal = self.$refs.area.value;
        obj.beforeText = obj.taVal.substring(0, self.cursorBefore);
        obj.afterText = obj.taVal.substring(self.cursorAfter, obj.taVal.length);

        obj.selectedText = obj.taVal.substring(self.cursorBefore, self.cursorAfter);
        obj.bTextLen = obj.beforeText.length || 0;
        obj.aTextLen = obj.afterText.length || 0;
        obj.selLineStart = obj.beforeText.split('\n').length - 1;
        obj.linesSelected = obj.selectedText.split('\n').length - 1;
        obj.lines = self.getLines(obj.taVal);

        return obj;
      },
      handleButtonInput(index) {
        this.getCursorPos();
        let self = this;
        let taInfo = self.getTAInfoObj();
        let btnObj = this.buttons[index];
        let bObjLen = btnObj.before.length || 0;
        let aObjLen = btnObj.after.length || 0;
        let ss = taInfo.bTextLen + bObjLen;
        let se = taInfo.bTextLen + bObjLen + taInfo.selectedText.length;
        let newVal = taInfo.taVal;
        let newSs = 0;
        let newSe = 0;

        if (btnObj.repeat) {
          this.onEnterBtnIdx = index;
        }else {
          this.onEnterBtnIdx = '';
        }

        //if the button has insertable text before and after the cursor
        if (btnObj.before && btnObj.after) {
          let after = btnObj.after;
          if (btnObj.before.length != btnObj.after.length) {
            if (ss == se) {
              after = 'title' + after;
              se += 5;
            }
          }
          newVal = taInfo.beforeText + btnObj.before + taInfo.selectedText + after + taInfo.afterText;
        }else if (btnObj.before && !btnObj.after ) {
          // if the button only has beggining text
          let currentLine = taInfo.linesSelected+taInfo.selLineStart;
          for (let i = taInfo.selLineStart; currentLine >= i; i++){
            let lineString = '';
            if (taInfo.lines[i].substring(0,2) == btnObj.before || taInfo.lines[i].substring(0,1) == btnObj.before){
              lineString = btnObj.before + taInfo.lines[i];
              let matches = lineString.match(btnObj.regex);
              if (matches[0].length-1 > btnObj.max) {
                lineString = lineString.replace(btnObj.regex, '');
                this.onEnterBtnIdx = '';
              }

            } else {
              if (!(/\r|\n/.test(btnObj.before) != '\n')) {
                lineString = btnObj.before + ' ' + taInfo.lines[i];
              }else {
                let repositionedNewLine = taInfo.lines[i] + btnObj.before;
                if (taInfo.lines[i].length == 0) {
                  repositionedNewLine = btnObj.before.trim() + '\n';
                }
                lineString = repositionedNewLine;
              }
            }
            taInfo.lines[i] = lineString;
          }


          newVal = taInfo.lines.join('\n');
        }

        self.$refs.area.value = newVal;

        if (btnObj.after) {
          // move the cursor to after the selected text
          newSs = ss
          newSe = se
        }else if (taInfo.selectedText.length >= 1 && !btnObj.after) {
          //high light the selected text
          newSs = ss - bObjLen;
          newSe = se + ((taInfo.linesSelected+1) * (bObjLen + 1));
        }else if (taInfo.selectedText.length == 0 && !btnObj.after) {
          //put the cursor at the end of the line
          let sse = taInfo.selLineStart;
          for (let idx = 0; taInfo.selLineStart >= idx; idx++ ){
            sse += (taInfo.lines[idx].length);
          }
          newSs = sse;
          newSe = sse;
        }
        self.$refs.area.setSelectionRange(newSs, newSe);
        self.$refs.area.focus();
      },
      getCursorPos() {
        this.cursorBefore = this.$refs.area.selectionStart;
        this.cursorAfter = this.$refs.area.selectionEnd;
      },
      loadTags () {
        var self = this;
        self.$emit('loadTags');
      },
      removeSelected (idx) {
        this.$emit('removeSelected', idx);
      },
      selectTag (tag) {
        this.tagButtonStatus = true;
        this.$emit('selectTag', tag);
      },
      saveNewTag(value) {
        this.$emit('saveNewTag', value);
        this.$nextTick(function () {this.tagText = '';});
      },
      checkStatus(type) {
        let self = this;
        if (type == 'interval'){
          if (self.status === 'success') {
            clearInterval(self.interval);
            clearTimeout(self.timeout);
            self.$emit('changeActiveTab', 'all');
            self.updateText = '';
            self.localStorage.setItem('updateText', '');
            self.localStorage.setItem('tags', '');
            self.updateTextHeight = 150;
            self.$emit('done');
          }else if (self.status === 'fail') {
            self.$emit('insertMessage', {message:'Something went wrong while trying to save your update', type:'is-danger'});
            self.$emit('done');
          }else if (self.status == 'waiting'){
            console.log('waiting');
          }
        }else {
          clearInterval(self.interval);
          self.$emit('insertMessage', {message:'Something went wrong while trying to save your update', type:'is-danger'});
          self.$emit('done');
        }
      },
      submitUpdate () {
        let self = this;
        self.$emit('submitUpdate', self.update);
        self.interval = setInterval(function () {self.checkStatus('interval')}, 500);
        self.timeout = setTimeout(function () {self.checkStatus('timeout')}, 10000);

      },
    },
    watch: {
      tagText (val) {
        //This deactivates the button when TRUE. Since this goes to the 'disabled' property. This may not be the ONLY time this is true, but its certainly the LAST. 
        // this checks that the value is between 2 and 32 and only contains a-z and spaces.
        this.tagButtonStatus = (val.length < 2 || val.length > 32) || !(/^[A-Z ]+$/ig.test(val));
      },
    },
    computed: {
      hasForgottenTag() {
        if (this.tagText.length >= 1) {
          return true;
        }else {
          return false;
        }
      },
      styleProperty () {
        return { height: this.updateTextHeight + ';' };
      },
      update () {
        var updateObj = {
          update: this.updateText,
          author:{ name: this.currentAuthor, id:util.getCookie('DashId') } ,
          tags: this.updateTags,
          unreaders: this.defaultUnreaders,
        };
        return updateObj;
      },
      placeholder() {
        return this.currentAuthor.toUpperCase() + '! ' + this.placeholderText
      },
      submitButtonStatus() {
        var self = this;
        if (self.updateText.length < 16 || self.updateTags.length == 0 ) {
          return true;
        }else {
          return false;
        }
      },
      submitTooltip () {
        if (this.submitButtonStatus) {
          return 'You gotta have Text and tags to submit an update!';
        }else{
          return 'Submit Update!';
        }
      },
      tagTooltip () {
        if (!this.saveTagButtonStatus) {
          return 'Tags have to be between 2-32 characters without special characters!';
        }else{
          return 'SAVE IT!';
        }
      },
      processedMarked() {
        return marked(this.updateText);
      },
      hideTextArea() {
        if (this.showPreview) {
          return true;
        }else {
          return false;
        }
      },
      submitStatus() {
        if (this.status == '') {
          return false;
        }else {
          return true;
        }
      },
      buttonStatus() {
        if (this.status === 'waiting') {
          return true;
        }else {
          return false;
        }
      }
    },
    components: {
      MdToolbar,
      BscotchTextArea,
      submitButton,
      TypeAhead,
      TypeAheadHandler,
    },
    mounted() {
      this.getStoredText();
      this.getStoredTags();
    }
  }

</script>

<style scoped>
  .tags-select-bloodhound {
    margin-top: 15px;
  }
  .box {
    overflow: visible;
    position: relative;
  }
  .no-margin {
    margin: 0px;
  }
  .preview {
    border: 1px solid rgb(75, 75, 75);
    border-radius: 5px;
    background-color: rgba(48, 44, 47, .4);
    min-height: 900px;
    width: 100%;
    color: #fffee7;
    padding: 5px;
  }
  .preview h1{
    color: #fffee7 !important;
  }
  .preview h2{
    color: #fffee7 !important;
  }
  .preview h3{
    color: #fffee7 !important;
  }
  .preview h4{
    color: #fffee7 !important;
  }
  .preview h5{
    color: #fffee7 !important;
  }
  .preview h6{
    color: #fffee7 !important;
  }
  .preview strong {
    color: #fffee7 !important;
  }
  .preview blockquote {
    background-color: rgba(12, 131, 136, 0.6) !important;
    border-color: #00e2c6 !important;
    color: #fffee7 !important;
  }
  .preview hr {
    background-color: rgba(14, 166, 173, 1) !important;
  }
  .preview a:hover {
    color: #ffba00 !important;
  }
  .textarea{
    min-height: 130px;
    max-height: 1800px;
  }
  .desktopCompose {
    min-height: 900px;
  }
</style>
