import React, { useState } from 'react';
import {
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        try {
            // Using v9 style `signInWithPopup(auth, provider)`.
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLoginView) {
                // Using v9 style `signInWithEmailAndPassword(auth, email, password)`.
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Using v9 style `createUserWithEmailAndPassword(auth, email, password)`.
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
             <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
                    Freshness Checker AI
                    </span>
                </h1>
                <p className="mt-2 text-lg text-slate-400">Please sign in to continue.</p>
            </div>
            <div className="w-full max-w-sm p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">{isLoginView ? 'Sign In' : 'Create Account'}</h2>
                
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm text-center">{error}</p>}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-300 sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="text-sm font-medium text-slate-300 sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Password"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2 px-4 text-white font-semibold bg-violet-600 rounded-md hover:bg-violet-500 disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500">
                        {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                    </div>
                </div>

                <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex justify-center items-center py-2 px-4 text-white font-semibold bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">
                    <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.3-26.1-63.3-42.3-102.3-42.3-84.5 0-153.2 68.7-153.2 153.2s68.7 153.2 153.2 153.2c92.8 0 135.2-61.2 142.3-93.6H248v-97h239.1c1.3 12.8 2.4 25.8 2.9 39.8z"></path></svg>
                    Sign in with Google
                </button>
                
                <p className="text-sm text-center text-slate-400">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="ml-1 font-medium text-cyan-400 hover:text-cyan-300">
                        {isLoginView ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;