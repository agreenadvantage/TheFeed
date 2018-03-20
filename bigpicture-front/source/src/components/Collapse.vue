<template lang="html">
      <transition name="collapse">
        <slot></slot>
      </transition>
</template>

<script>
export default {

}
</script>

<style lang="css" scoped>
.collapse-enter {
  max-height: 0px;
  opacity: 0;
}

.collapse-enter-active {
  transition: max-height 0.6s ease, opacity 0.4s;
}

.collapse-enter-to {
  max-height: 2000px;
  opacity: 1;
}

.collapse-leave{
  opacity: 1;
  max-height: 2000px;
}

.collapse-leave-to {
  opacity: 0;
  max-height: 0px;
}

.collapse-leave-active {
  transition: max-height 0.4s ease, opacity 0.4s;
}

</style>
