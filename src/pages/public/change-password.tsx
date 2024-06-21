import { useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import { supabase } from '../../../supabaseClient';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const session = await getSession();

    if (!session) {
      setError('사용자가 인증되지 않았습니다.');
      setLoading(false);
      return;
    }

    const user = session.user;

    // 현재 비밀번호 확인을 위해 사용자 재인증
    const { error: signInError } = await fetch('/api/auth/signin/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: currentPassword,
      }),
    }).then(res => res.json());

    if (signInError) {
      setError('현재 비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 비밀번호 변경
    const { error: updateError } = await supabase.auth.api.updateUser(user.accessToken, {
      password: newPassword,
    });

    if (updateError) {
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } else {
      alert('비밀번호가 변경되었습니다.');
      router.push('/profile');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleChangePassword}>
      <div>
        <label htmlFor="currentPassword">현재 비밀번호:</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword">새 비밀번호:</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
