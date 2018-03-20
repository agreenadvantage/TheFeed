<template>
  <div class="field">
    <div class="control">
      <textarea :value="value"
                v-on:input="onInput($event.target.value)"
                class="textarea"
                :placeholder="placeholder"
                ref="area">
      </textarea>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      html: '',
    }
  },
  components: {

  },
  methods: {
    onInput (value) {
      var self = this;
      self.$emit('input', value);
    },
  },
  props: {
    value: {
      type: String,
      required: true,
      default: '',
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Enter sass here!',
    },
    autofocus: {
      type: Boolean,
    },
  },
  computed: {

  },
};
</script>

<style>
  #cke_1_top {
    border-radius: 3px;
  }
</style>
