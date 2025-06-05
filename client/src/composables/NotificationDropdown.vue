<template>
  <div class="relative">
    <button @click="toggle">
      <span class="icon">🔔</span>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>
    <div v-if="visible" class="dropdown">
      <ul>
        <li v-for="n in notifications" :key="n._id">
          <router-link :to="n.url">{{ n.message }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifications } from '@/composables/useNotifications';

const visible = ref(false);
const { notifications, initNotifications, fetchNotifications } = useNotifications();

const toggle = () => (visible.value = !visible.value);

const unreadCount = computed(() => notifications.value.length); // 단순 예시

onMounted(() => {
  initNotifications();
  fetchNotifications();
});
</script>

<style scoped>
.badge {
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}
.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  width: 250px;
  z-index: 999;
}
</style>