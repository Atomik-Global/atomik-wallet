<script setup lang="ts">
import {
  IonItem,
  IonLabel,
  IonList,
  IonSegmentContent,
  IonSkeletonText,
} from '@ionic/vue'

const emit = defineEmits<{
  (e: 'click', item: any): void
}>()

defineProps<{
  id: string
  items: any[]
  loading: boolean
}>()
</script>

<template>
  <IonSegmentContent
    :id="id"
    class="expand-scroll ion-content-scroll-host mt-4"
  >
    <IonList v-if="loading">
      <IonItem v-for="i in 5" :key="i">
        <IonSkeletonText animated class="skeleton-icon" slot="start" />
        <IonLabel class="content-body">
          <div class="content-body-header">
            <IonSkeletonText animated class="skeleton-header-items" />
            <IonSkeletonText animated class="skeleton-header-items" />
          </div>
          <div class="content-body font-mono">
            <IonSkeletonText animated class="skeleton-content-signature" />
          </div>
        </IonLabel>
      </IonItem>
    </IonList>
    <div v-else-if="items.length === 0" class="empty">
      <div class="empty-text">No Records</div>
    </div>
    <IonList v-else>
      <DynamicScroller
        key-field="transaction_id"
        :min-item-size="100"
        :items="items"
      >
        <template #default="{ item }">
          <IonItem button @click="emit('click', item)">
            <slot name="content-icon" :item="item" />
            <IonLabel class="content-body">
              <div class="content-body-header">
                <slot name="content-header-left" :item="item" />
                <div style="text-align: right">
                  <slot name="content-header-right" :item="item" />
                </div>
              </div>
              <div class="content-body font-mono">
                <slot name="content" :item="item" />
              </div>
            </IonLabel>
          </IonItem>
        </template>
      </DynamicScroller>
    </IonList>
  </IonSegmentContent>
</template>

<style scoped>
.skeleton-icon {
  border-radius: 20px;
  height: 16px;
  width: 5%;
}

.skeleton-header-items {
  border-radius: 20px;
  height: 16px;
  width: 25%;
}

.skeleton-content-signature {
  border-radius: 20px;
  height: 16px;
  width: 100%;
}

.content-body {
  font-size: 16px;
}

.content-body > :not(:first-child) {
  margin-block-start: 0.5rem;
  margin-block-end: 0.5rem;
}

.content-body-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.content-body {
  color: var(--ion-text-color-step-400);
}

.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.expand-scroll {
  flex-grow: 1;
  overflow-y: auto;
}

.ion-content-scroll-host::before,
.ion-content-scroll-host::after {
  position: absolute;

  width: 1px;
  height: 1px;

  content: '';
}

.ion-content-scroll-host::before {
  bottom: -1px;
}

.ion-content-scroll-host::after {
  top: -1px;
}
</style>
