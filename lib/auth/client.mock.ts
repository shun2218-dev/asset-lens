// lib/auth/client.mock.ts

export const authClient = {
  signIn: {
    email: async () => ({ data: {}, error: null }),
    passkey: async () => ({ data: {}, error: null }),
  },
  signUp: {
    email: async () => ({ data: {}, error: null }),
  },
  signOut: async () => ({ data: {}, error: null }),
  passkey: {
    addPasskey: async () => ({ data: {}, error: null }),
    deletePasskey: async () => ({ data: {}, error: null }),
    listUserPasskeys: async () => ({ data: [], error: null }),
  },
  useSession: () => {
    // Storybook環境でwindowオブジェクト経由でセッション状態を制御できるようにする
    const mockSession =
      typeof window !== "undefined"
        ? (window as any).__STORYBOOK_SESSION__
        : undefined;

    // デフォルトはログイン状態（undefinedの場合はデフォルトを使用）
    const sessionData = mockSession !== undefined ? mockSession : {
      user: {
        id: "mock-user-id",
        email: "mock@example.com",
        name: "Mock User",
        image: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "mock-session-id",
        userId: "mock-user-id",
        expiresAt: new Date(Date.now() + 86400000),
        token: "mock-token",
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      },
    };

    return {
      data: sessionData,
      isPending: false,
      error: null,
    };
  },
  getSession: async () => ({
    data: {
      user: {
        id: "mock-user-id",
        email: "mock@example.com",
        name: "Mock User",
      },
      session: {
        id: "mock-session-id",
        userId: "mock-user-id",
        expiresAt: new Date(Date.now() + 86400000),
        token: "mock-token",
      },
    },
    error: null,
  }),
  forgetPassword: {
    emailOtp: async () => ({ data: {}, error: null }),
  },
  emailOtp: {
    checkVerificationOtp: async () => ({ data: {}, error: null }),
    resetPassword: async () => ({ data: {}, error: null }),
  },
  changePassword: async () => ({ data: {}, error: null }),
};

export const { signIn, signUp, signOut, passkey, useSession, getSession } =
  authClient;
