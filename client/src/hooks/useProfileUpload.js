// 📁 hooks/useProfileUpload.js
import { useUser } from '@/pages/context/UserContext';
import axios from 'axios';

const useProfileUpload = () => {
  const { user, setUser } = useUser();

  const uploadProfile = async (file) => {
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profile', file);

    try {
      // ✅ 1. 서버에 이미지 업로드
      const res = await axios.post('/api/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const newProfileUrl = res.data.url;

      // ✅ 2. DB에 반영
      await axios.patch(`/api/user/${user._id}`, { profile: newProfileUrl }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ 3. 최신 DB 상태 다시 fetch해서 전역 상태 동기화
      const refreshed = await axios.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(refreshed.data);
      localStorage.setItem('user', JSON.stringify(refreshed.data));

      return { success: true, url: newProfileUrl };
    } catch (err) {
      console.error('프로필 업로드 실패:', err);
      return { success: false, message: '업로드 실패' };
    }
  };

  return { uploadProfile };
};

export default useProfileUpload;
