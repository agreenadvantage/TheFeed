<template lang="html">
  <div class="toolbar">
    <md-button v-for="(btn, index) in buttons"
               @handleButtonInput="handleButtonInput"
               :key="index"
               :index="index"
               :disabled="btn.disabled"
               :name="btn.name"
               :icon="btn.icon">
    </md-button>
    <span class="spacer">|</span>
    <md-button v-for="(btn, index) in secondaryButtons"
               @handleButtonInput="activateFunction"
               :key="index"
               :index="index"
               :name="btn.name"
               :icon="btn.icon">
    </md-button>
  </div>
</template>

<script>
  import MdButton from '@/components/MdButton'

  export default {
    data() {
      return {

      }
    },
    methods: {
      handleButtonInput(index) {
        this.$emit('handleButtonInput', index);
      },
      activateFunction(index) {
        this.$emit('activateFunction', index);
      }
    },
    props: {
      isMobile: {
        type: Boolean,
        required: true,
      },
      buttons: {
        type: Array,
        required: true,
      },
      secondaryButtons: {
        type: Array,
        required: false,
      },
    },
    components: {
      MdButton,
    }
  }
</script>

<style lang="css">
  .toolbar {
    margin-bottom: 5px;
    padding: 5px;
    justify-content: flex-start;
  }
  .toolbar > :nth-last-child(2) {
    margin-left: 3px;
  }



</style>
