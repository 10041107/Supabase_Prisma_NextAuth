import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const session = await getSession();
      if (session) {
        // 로그인된 상태라면 메인 페이지로 리디렉션
        router.push('/');
      } else {
        // 로그인되지 않은 상태라면 로딩 완료
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('email', { email, password, redirect: false });

    if (result?.error) {
      alert(result.error);
    } else {
      router.push('/');
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    const result = await signIn(provider, { redirect: false });

    if (result?.error) {
      alert(result.error);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={handleEmailLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit">Login with Email</button>
      </form>

      <div>
        <button onClick={() => handleOAuthLogin('google')}>Login with Google</button>
      </div>
    </div>
  );
}
