"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { supabase } from '../../supabaseClient';
import { CldUploadWidget, CldImage } from 'next-cloudinary';

interface FormData {
  userName: string;
  password: string;
  confirmPassword: string;
  email: string;
  nickname: string;
  gender: string;
  ageGroup: string;
  region: string;
  profileImage: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
    gender: '',
    ageGroup: '',
    region: '',
    profileImage: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('email', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      let profileImageUrl = formData.profileImage;

      // Insert user profile details
      const { error: profileError } = await supabase.from('profiles').insert({
        id: result.user.id,
        userName: formData.userName,
        nickname: formData.nickname,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        region: formData.region,
        profileImage: profileImageUrl,
      });

      if (profileError) {
        setError(profileError.message);
      } else {
        router.push('/login');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (result: any) => {
    if (result.event !== "success") return;
    const info = result.info;
    setFormData((prevData) => ({ ...prevData, profileImage: info.public_id }));
  };

  return (
    <div className="hide-scrollbar" style={{ height: '100vh', overflowY: 'scroll' }}>
      <div className="flex flex-col items-center w-full h-screen py-6 my-10 text-center bg-center bg-no-repeat bg-summonersRift sm:py-8 lg:py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-9 text-neutral-700">회원가입</h1>
        </div>
        {error && <p className="text-center text-red-500">{error}</p>}
        {loading ? <p className="text-center">Loading...</p> : (
          <form className="grid w-full max-w-screen-md gap-4 mx-auto sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <label htmlFor="userName" className="inline-block mb-2 text-sm text-gray-800 sm:text-base text-neutral-700">이름</label>
              <input id="userName" name="userName" type="text" value={formData.userName} onChange={handleChange} autoComplete="username" required className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring" />
            </div>
            <hr className="sm:col-span-2"/>
            <div>
              <label htmlFor="password" className="inline-block mb-2 text-sm text-gray-800 sm:text-base text-neutral-700">비밀번호</label>
              <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} autoComplete="new-password" required className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="inline-block mb-2 text-sm text-gray-800 sm:text-base text-neutral-700">비밀번호 확인</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" required className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring" />
            </div>
            <hr className="sm:col-span-2"/>
            <div className="sm:col-span-2">
              <label htmlFor="email" className="inline-block mb-2 text-sm text-gray-800 sm:text-base text-neutral-700">이메일</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" required className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring" />
            </div>
            <hr className="sm:col-span-2"/>
            <div className="sm:col-span-2">
              <label htmlFor="nickname" className="inline-block mb-2 text-sm text-gray-800 sm:text-base text-neutral-700">닉네임</label>
              <input id="nickname" name="nickname" type="text" value={formData.nickname} onChange={handleChange} required className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring" />
            </div>
            <hr className="sm:col-span-2"/>
            <div className="sm:col-span-2">
              <label htmlFor="profileImage" className="inline-block mb-2 text-sm text-gray-800 sm:text-base text-neutral-700">프로필 이미지</label>
              <div className="flex justify-center">
                {formData.profileImage && (
                  <div className="m-2 overflow-hidden rounded-full">
                    <CldImage
                      src={formData.profileImage}
                      width={200}
                      height={200}
                      alt="Uploaded Image Not Found"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
              <CldUploadWidget uploadPreset="your_upload_preset" onUpload={handleImageUpload}>
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="block w-full px-4 py-2 mt-4 text-white rounded bg-neutral-500 ring-neutral-300 hover:bg-neutral-400">
                    프로필 이미지 업로드
                  </button>
                )}
              </CldUploadWidget>
              {imageError && <p className="text-red-500">{imageError}</p>}
            </div>
            <hr className="sm:col-span-2"/>
            <div>
              <label htmlFor="gender" className="inline-block mb-2 text-sm text-gray-800 sm:text-base">성별</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring">
                <option value="">성별 선택</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">그외</option>
              </select>
            </div>
            <div>
              <label htmlFor="ageGroup" className="inline-block mb-2 text-sm text-gray-800 sm:text-base">나이</label>
              <select id="ageGroup" name="ageGroup" value={formData.ageGroup} onChange={handleChange} className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring">
                <option value="">나이 선택</option>
                <option value="10대">10대</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대">50대</option>
                <option value="60대 이상">60대 이상</option>
              </select>
            </div>
            <hr className="sm:col-span-2"/>
            <div className="sm:col-span-2">
              <label htmlFor="region" className="inline-block mb-2 text-sm text-gray-800 sm:text-base">지역</label>
              <input id="region" name="region" type="text" value={formData.region} onChange={handleChange} required className="w-full px-3 py-2 text-gray-800 transition duration-100 border rounded outline-none bg-gray-50 ring-neutral-300 focus:ring" />
            </div>
            <hr className="sm:col-span-2"/>
            <div className="flex justify-center sm:col-span-2">
              <button type="submit" disabled={loading} className="w-full max-w-xs px-8 py-3 mt-10 mb-20 text-sm font-semibold text-center text-white transition duration-100 rounded-lg outline-none bg-neutral-500 ring-neutral-300 hover:bg-neutral-400 focus-visible:ring active:bg-neutral-600 md:text-base">
                {loading ? '회원가입중...' : '가입하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
