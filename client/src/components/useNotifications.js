import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { io } from 'socket.io-client';

const notifications = ref([]);
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');

export function useNotifications() {
  const userStore = useUserStore();

  const initNotifications = () => {
    if (!userStore.user || !userStore.user._id) return;
    socket.emit('join', userStore.user._id);

    socket.on('notification', (data) => {
      notifications.value.unshift({ ...data, createdAt: new Date() });
    });
  };

  const fetchNotifications = async () => {
    const res = await fetch(`/api/notifications/${userStore.user._id}`);
    const json = await res.json();
    notifications.value = json;
  };

  return { notifications, initNotifications, fetchNotifications };
}
