/**
 * 認証コンテキスト（AuthContext）
 * 
 * 役割:
 * - アプリケーション全体で認証状態を管理するグローバルなReact Context
 * - ログイン/ログアウト状態、ユーザー情報、JWTトークンを管理
 * - プロフィール更新時のリアルタイム反映（ヘッダーの表示名など）
 * 
 * 使用場所:
 * - app/layout.tsx: アプリケーション全体をAuthProviderでラップ
 * - presentation/components/layout/navigation.tsx: ヘッダーでユーザー情報表示
 * - app/(auth)/login/page.tsx: ログイン処理
 * - app/profile/page.tsx: プロフィール更新
 * 
 * 設計上の位置づけ:
 * - DDDの層構造を超えた「横断的関心事」
 * - プレゼンテーション層とアプリケーション層の間をつなぐ
 * - React固有の状態管理メカニズム
 * 
 * セキュリティに関する注意:
 * - 現在はlocalStorageを使用（XSS攻撃のリスクあり）
 * - 本番環境ではHttpOnly Cookieへの移行を推奨
 * - 詳細はREADME.mdの「セキュリティに関する既知の課題」を参照
 */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * ユーザー情報の型定義
 * 
 * 注意: パスワードなどの機密情報は含まない
 */
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * 認証コンテキストの型定義
 * 
 * 提供される機能:
 * - isLoggedIn: ログイン状態のフラグ
 * - user: ログイン中のユーザー情報
 * - token: JWT認証トークン
 * - login: ログイン処理
 * - logout: ログアウト処理
 * - updateUser: ユーザー情報の更新（プロフィール編集後など）
 */
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// コンテキストを作成（初期値はundefined）
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証プロバイダーコンポーネント
 * 
 * アプリケーション全体をラップして認証状態を提供する
 * 
 * 処理の流れ:
 * 1. 初回レンダリング時にlocalStorageから認証情報を復元
 * 2. 認証状態（token, user, isLoggedIn）をReact Stateで管理
 * 3. login/logout/updateUser関数を提供
 * 4. 子コンポーネントに認証情報を提供
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // 認証状態の管理
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /**
   * 初期化処理（コンポーネントのマウント時に1回だけ実行）
   * 
   * 処理内容:
   * 1. localStorageからtokenとuserを取得
   * 2. 両方存在する場合、認証状態を復元
   * 3. JSON.parseに失敗した場合、localStorageをクリア
   */
  useEffect(() => {
    // localStorageから保存された認証情報を取得
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // 両方の値が存在し、userが有効な場合
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        // JSON文字列をユーザーオブジェクトにパース
        const parsedUser = JSON.parse(storedUser);
        
        // 認証状態を復元
        setToken(storedToken);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        // パースに失敗した場合（データが壊れている）
        console.error('Failed to parse user data:', error);
        
        // 不正なデータを削除
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []); // 空の依存配列 = マウント時のみ実行

  /**
   * ログイン処理
   * 
   * 処理内容:
   * 1. localStorageにtokenとuserを保存
   * 2. Reactのstateを更新
   * 3. isLoggedInをtrueに設定
   * 
   * 呼び出し元: app/(auth)/login/page.tsx
   */
  const login = (newToken: string, newUser: User) => {
    // localStorageに永続化（ブラウザを閉じても保持される）
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // React Stateを更新（UIに即座に反映）
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  /**
   * ログアウト処理
   * 
   * 処理内容:
   * 1. localStorageから認証情報を削除
   * 2. Reactのstateをクリア
   * 3. isLoggedInをfalseに設定
   * 
   * 呼び出し元: presentation/components/layout/navigation.tsx
   */
  const logout = () => {
    // localStorageから削除
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // React Stateをクリア
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  /**
   * ユーザー情報の更新
   * 
   * 処理内容:
   * 1. localStorageのユーザー情報を更新
   * 2. Reactのstateを更新（ヘッダーなどのUIに即座に反映）
   * 
   * 使用場面:
   * - プロフィール編集後に名前をリアルタイム更新
   * 
   * 呼び出し元: app/profile/page.tsx
   */
  const updateUser = (updatedUser: User) => {
    // localStorageを更新
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // React Stateを更新（ヘッダーの表示名などが即座に更新される）
    setUser(updatedUser);
  };

  /**
   * Context Providerでラップ
   * 
   * 子コンポーネント全体に以下を提供:
   * - 認証状態（isLoggedIn, user, token）
   * - 認証操作（login, logout, updateUser）
   */
  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するカスタムフック
 * 
 * 使用方法:
 * ```tsx
 * const { isLoggedIn, user, login, logout } = useAuth();
 * ```
 * 
 * エラー処理:
 * - AuthProvider外で使用した場合はエラーをスロー
 * - これにより、誤った使用を防ぐ
 * 
 * 呼び出し元の例:
 * - presentation/components/layout/navigation.tsx
 * - app/(auth)/login/page.tsx
 * - app/profile/page.tsx
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  // AuthProvider外で使用された場合
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

