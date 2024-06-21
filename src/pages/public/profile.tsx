import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { supabase } from '../../supabaseClient';
import styles from '../styles/Profile.module.css'; 
import * as Dialog from '@radix-ui/react-dialog';

interface FormData {
  userName: string;
  email: string;
  nickname: string;
  gender: string;
  ageGroup: string;
  region: string;
  profileImage: string;
}

export default function Profile() {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    email: '',
    nickname: '',
    gender: '',
    ageGroup: '',
    region: '',
    profileImage: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFields, setLoadingFields] = useState({
    userName: true,
    email: true,
    nickname: true,
    gender: true,
    ageGroup: true,
    region: true,
    profileImage: true,
  });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
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

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          setError('사용자 정보를 가져오는 중 오류가 발생했습니다.');
        } else if (data) {
          setFormData({
            userName: data.userName,
            email: data.email,
            nickname: data.nickname,
            gender: data.gender,
            ageGroup: data.ageGroup,
            region: data.region,
            profileImage: data.profileImage ? `${data.profileImage}?${Date.now()}` : '',
          });
          setLoadingFields({
            userName: false,
            email: false,
            nickname: false,
            gender: false,
            ageGroup: false,
            region: false,
            profileImage: false,
          });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async () => {
    const session = await getSession();
    const user = session?.user;
    if (!user) return;

    let profileImageUrl = formData.profileImage;

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
        userName: formData.userName,
        email: formData.email,
        nickname: formData.nickname,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        region: formData.region,
        profileImage: profileImageUrl,
      })
      .eq('id', user.id);

    if (updateError) {
      setError('프로필을 업데이트하는 중 오류가 발생했습니다.');
    } else {
      alert('프로필이 업데이트되었습니다.');
      router.reload();
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
          <h1>Profile Page</h1>
          <div className={styles.profileImageContainer}>
            {loadingFields.profileImage ? (
              <div>Loading...</div>
            ) : formData.profileImage ? (
              <img src={formData.profileImage} alt="Profile Image" className={styles.profileImage} />
            ) : (
              <img src="/default-profile.png" alt="Default Profile" className={styles.profileImage} />
            )}
            <input type="file" onChange={handleProfileImageChange} />
          </div>
          <p>Username: {loadingFields.userName ? 'Loading...' : formData.userName}</p>
          <p>Email: {loadingFields.email ? 'Loading...' : formData.email}</p>
          <p>Nickname: {loadingFields.nickname ? 'Loading...' : formData.nickname}</p>
          <p>Gender: {loadingFields.gender ? 'Loading...' : formData.gender}</p>
          <p>Age Group: {loadingFields.ageGroup ? 'Loading...' : formData.ageGroup}</p>
          <p>Region: {loadingFields.region ? 'Loading...' : formData.region}</p>
          <button onClick={handleUpdateProfile}>Update Profile</button>
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
}
