<template lang="html">
  <div>
    <span v-for="(item, index) in display"
          class="selectedItem button"
          :index="index"
          :class="{'is-danger': index === dangerHover}"
          @click="removeSelection"
          @mouseenter="dangerHover = index"
          @mouseleave="dangerHover = null">
      {{ item }}  <i class="remove fa fa-times-circle-o"></i>
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dangerHover: null,
    }
  },
  props: {
    display: {
      type: Array,
      required: true,
    }
  },
  methods: {
    removeSelection (e) {
      var self = this;
      var itemVal = e.target.outerText;
      var idx = self.display.indexOf(itemVal);
      self.dangerHover = null;
      self.$emit('remove', idx);
    },
  }
}
</script>

<style lang="css" scoped>
  .selectedItem{
    position: relative;
    padding-right: 30px;
    display: inline-block;
    margin-right: 3px;
    margin-bottom: 2px;
    border-color: rgba(0, 226, 198, 1);
  }
  .remove {
    position: absolute;
    right: 3px;
    bottom: 7px;
  }
</style>
