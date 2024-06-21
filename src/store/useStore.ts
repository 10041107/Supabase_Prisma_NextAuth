import create from 'zustand';

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

interface UserStore {
  formData: FormData;
  setFormData: (formData: Partial<FormData>) => void;
  username: string;
  setUsername: (username: string) => void;
  role: string;
  setRole: (role: string) => void;
  profileImage: File | null;
  setProfileImage: (file: File | null) => void;
  currentProfileImage: string | null;
  setCurrentProfileImage: (url: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  formData: {
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
    gender: '',
    ageGroup: '',
    region: '',
    profileImage: '',
  },
  setFormData: (formData) => set((state) => ({
    formData: { ...state.formData, ...formData },
  })),
  username: '',
  setUsername: (username) => set({ username }),
  role: '',
  setRole: (role) => set({ role }),
  profileImage: null,
  setProfileImage: (file) => set({ profileImage: file }),
  currentProfileImage: null,
  setCurrentProfileImage: (url) => set({ currentProfileImage: url }),
}));
