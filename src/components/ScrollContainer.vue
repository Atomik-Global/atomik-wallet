<template>
  <div class="scroll-container">
    <slot />
  </div>
</template>

<style scoped>
.scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* padding-bottom: var(--ion-safe-area-bottom, 0); */
}
</style>
