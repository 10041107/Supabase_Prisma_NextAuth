import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../supabaseClient';
import * as Dialog from '@radix-ui/react-dialog';

export default function PublicPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { user } = session;
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setDialogMessage('회원가입이 필요합니다.');
          setShowDialog(true);
        } else if ([ 'user', 'admin'].includes(data.role)) {
          setIsAuthorized(true);
        } else if (data.role === 'block') {
          setDialogMessage('차단된 회원입니다. 관리자에게 문의하세요.');
          setShowDialog(true);
        } else {
          setDialogMessage('인증된 회원만 접근 가능한 페이지입니다.');
          setShowDialog(true);
        }
      } else {
        setDialogMessage('회원가입이 필요합니다.');
        setShowDialog(true);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleClose = () => {
    setShowDialog(false);
    router.push('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Public Page</h1>
      {/* Public page content */}
      <Dialog.Root open={showDialog} onOpenChange={handleClose}>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className="dialogContent">
          <Dialog.Title className="dialogTitle">접근 제한</Dialog.Title>
          <Dialog.Description className="dialogDescription">{dialogMessage}</Dialog.Description>
          <Dialog.Close asChild>
            <button onClick={handleClose} className="dialogCloseButton">확인</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
