import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { supabase } from '../../../supabaseClient';
import { useUserStore } from '../../store/useStore'; 
import * as Dialog from '@radix-ui/react-dialog';

export default function UpdateProfile() {
  const {
    username,
    setUsername,
    role,
    setRole,
    profileImage,
    setProfileImage,
    currentProfileImage,
    setCurrentProfileImage,
  } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();

      if (!session) {
        setDialogMessage('회원가입이 필요합니다.');
        setShowDialog(true);
        setLoading(false);
        return;
      }

      const user = session.user;
      if (user) {
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          setDialogMessage('회원가입이 필요합니다.');
          setShowDialog(true);
          setLoading(false);
          return;
        } else if (['public', 'user', 'admin'].includes(roleData.role)) {
          setIsAuthorized(true);
          setRole(roleData.role);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            setError('사용자 정보를 가져오는 중 오류가 발생했습니다.');
          } else if (data) {
            setUsername(data.userName);
            setCurrentProfileImage(data.profileImage ? `${data.profileImage}?${Date.now()}` : null);
          }
        } else if (roleData.role === 'block') {
          setDialogMessage('차단된 회원입니다. 관리자에게 문의하세요.');
          setShowDialog(true);
          setLoading(false);
          return;
        } else {
          setDialogMessage('회원가입이 필요합니다.');
          setShowDialog(true);
          setLoading(false);
          return;
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUser();
  }, [router, setCurrentProfileImage, setRole, setUsername]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await getSession();
    const user = session?.user;
    if (!user) return;

    let profileImageUrl = currentProfileImage;

    if (profileImage) {
      const { data, error } = await supabase.storage
        .from('user_profiles')
        .upload(`public/${user.id}-${profileImage.name}`, profileImage);

      if (error) {
        setError('프로필 이미지를 업로드하는 중 오류가 발생했습니다.');
        return;
      }

      profileImageUrl = data?.Key;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        userName: username,
        role: role,
        profileImage: profileImageUrl,
      })
      .eq('id', user.id);

    if (updateError) {
      setError('프로필을 업데이트하는 중 오류가 발생했습니다.');
    } else {
      alert('프로필이 업데이트되었습니다.');
      router.push('/profile');
    }
  };

  const handleDeleteProfileImage = async () => {
    const session = await getSession();
    const user = session?.user;
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from('user_profiles')
        .remove([`public/${user.id}-${profileImage?.name}`]);

      if (error) {
        setError('프로필 이미지를 삭제하는 중 오류가 발생했습니다.');
      } else {
        await supabase
          .from('profiles')
          .update({ profileImage: null })
          .eq('id', user.id);

        setCurrentProfileImage(null);
        setError(null);
        alert('프로필 이미지가 삭제되었습니다.');
      }
    } catch (error) {
      setError('서버 에러가 발생했습니다. 나중에 다시 시도해 주세요.');
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    router.push('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {showDialog && (
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
      )}
      {isAuthorized && (
        <div>
          <h1>Update Profile</h1>
          {currentProfileImage ? (
            <img src={currentProfileImage} alt="Profile Image" width={150} height={150} />
          ) : (
            <img src="/default-profile.png" alt="Default Profile" width={150} height={150} />
          )}
          <form onSubmit={handleUpdateProfile}>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="role">Role:</label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profileImage">Profile Image:</label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </div>
            <button type="submit">Update Profile</button>
          </form>
          {currentProfileImage && (
            <button onClick={handleDeleteProfileImage}>Delete Profile Image</button>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
