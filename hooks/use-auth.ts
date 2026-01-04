import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  passkey,
  signIn,
  signOut,
  signUp,
  useSession,
} from "@/lib/auth/auth-client";

type SignInWithEmailDto = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

type CreateAccountWithEmailDto = {
  name: string;
  email: string;
  password: string;
};

export const useAuth = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signInWithEmail = async ({
    email,
    password,
    rememberMe = true,
    callbackURL = "/dashboard",
  }: SignInWithEmailDto) => {
    await signIn.email(
      {
        email,
        password,
        rememberMe,
        callbackURL,
      },
      {
        onRequest(_context) {
          setIsLoading(true);
          setError(null);
          toast.loading("ログイン中", { id: "login-loading" });
        },
        onSuccess(_context) {
          setIsLoading(false);
          toast.success("ログイン成功", { id: "login-loading" });
        },
        onError(context) {
          setError(context.error.message);
          setIsLoading(false);
          toast.error("ログイン失敗", { id: "login-loading" });
        },
      },
    );
  };

  const createAccountWithEmail = async ({
    name,
    email,
    password,
  }: CreateAccountWithEmailDto) => {
    await signUp.email(
      {
        name,
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onRequest(_context) {
          setIsLoading(true);
          setError(null);
          toast.loading("アカウント作成中", { id: "create-account-loading" });
        },
        onSuccess(_context) {
          setIsLoading(false);
          toast.success("アカウント作成成功", { id: "create-account-loading" });
        },
        onError(context) {
          setError(context.error.message);
          setIsLoading(false);
          toast.error("アカウント作成失敗", { id: "create-account-loading" });
        },
      },
    );
  };

  const logout = async ({
    callback = "/login",
  }: {
    callback?: string;
  } = {}) => {
    if (session) {
      await signOut({
        fetchOptions: {
          onRequest(_context) {
            setIsLoading(true);
            setError(null);
            toast.loading("ログアウト中", { id: "logout-loading" });
          },
          onSuccess(_context) {
            setIsLoading(false);
            toast.success("ログアウトしました", { id: "logout-loading" });
            router.push(callback);
          },
          onError(context) {
            setError(context.error.message);
            setIsLoading(false);
            toast.error("ログアウトに失敗しました", { id: "logout-loading" });
          },
        },
      });
    }
  };

  const signInWithPasskey = async () => {
    await signIn.passkey(
      {},
      {
        onRequest(_context) {
          setIsLoading(true);
          setError(null);
          toast.loading("ログイン中", { id: "login-loading" });
        },
        onSuccess(_context) {
          setIsLoading(false);
          toast.success("ログイン成功", { id: "login-loading" });
          router.refresh();
        },
        onError(context) {
          setError(context.error.message);
          setIsLoading(false);
          toast.error("ログイン失敗", { id: "login-loading" });
        },
      },
    );
  };

  const addPasskey = async ({ passkeyName }: { passkeyName: string }) => {
    await passkey.addPasskey(
      {
        name: passkeyName,
      },
      {
        onRequest(_context) {
          setIsLoading(true);
          setError(null);
          toast.loading("パスキー登録中", { id: "add-passkey-loading" });
        },
        onSuccess(_context) {
          setIsLoading(false);
          toast.success("パスキー登録成功", { id: "add-passkey-loading" });
        },
        onError(context) {
          setError(context.error.message);
          setIsLoading(false);
          toast.error("パスキー登録失敗", { id: "add-passkey-loading" });
        },
      },
    );
  };

  const deletePasskey = async ({ passkeyId }: { passkeyId: string }) => {
    await passkey.deletePasskey(
      {
        id: passkeyId,
      },
      {
        onRequest(_context) {
          setIsLoading(true);
          setError(null);
          toast.loading("パスキー削除中", { id: "delete-passkey-loading" });
        },
        onSuccess(_context) {
          setIsLoading(false);
          toast.success("パスキー削除成功", { id: "delete-passkey-loading" });
          router.refresh();
        },
        onError(context) {
          setError(context.error.message);
          setIsLoading(false);
          toast.error("パスキー削除失敗", { id: "delete-passkey-loading" });
        },
      },
    );
  };

  return {
    signInWithEmail,
    signInWithPasskey,
    createAccountWithEmail,
    addPasskey,
    deletePasskey,
    logout,
    error,
    isLoading,
  };
};
