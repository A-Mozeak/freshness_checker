/*
import React, { useState, useEffect } from 'react';
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'firebase/auth';
import { auth } from '../services/firebase';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [linkSent, setLinkSent] = useState(false);

    useEffect(() => {
        // This effect handles the case where the user comes back to the app from the email link.
        const completeSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                setLoading(true);
                let savedEmail = window.localStorage.getItem('emailForSignIn');
                if (!savedEmail) {
                    // User opened the link on a different device. To prevent session fixation
                    // attacks, ask for the email again.
                    savedEmail = window.prompt('Please provide your email for confirmation');
                }
                
                if (savedEmail) {
                    try {
                        await signInWithEmailLink(auth, savedEmail, window.location.href);
                        window.localStorage.removeItem('emailForSignIn');
                    } catch (err) {
                        setError((err as Error).message);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setError("Could not complete sign-in without an email address.");
                    setLoading(false);
                }
            }
        };
        completeSignIn();
    }, []);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setLinkSent(false);

        const actionCodeSettings = {
            // URL you want to redirect back to. The domain must be authorized in the Firebase console.
            url: window.location.href,
            // This must be true.
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            // The link was successfully sent. Inform the user.
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            window.localStorage.setItem('emailForSignIn', email);
            setLinkSent(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isSignInWithEmailLink(auth, window.location.href)) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
                <div className="w-full max-w-sm p-8 space-y-6 bg-slate-800 rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-white">Signing In...</h2>
                    <p className="text-slate-400">Please wait while we verify your sign-in link.</p>
                </div>
            </div>
        );
    }
    
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
                <h2 className="text-2xl font-bold text-center text-white">Passwordless Sign-In</h2>
                
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm text-center">{error}</p>}
                
                {linkSent ? (
                    <div className="text-center p-4 bg-green-900/50 border border-green-500 rounded-lg">
                        <p className="font-semibold text-green-300">Link Sent!</p>
                        <p className="text-slate-300 mt-1">Please check your email at <strong className="text-white">{email}</strong> for a link to sign in.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSignIn} className="space-y-4">
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
                                placeholder="Enter your email"
                            />
                        </div>
                        <button type="submit" disabled={loading || !email} className="w-full py-2 px-4 text-white font-semibold bg-violet-600 rounded-md hover:bg-violet-500 disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500">
                            {loading ? 'Sending...' : 'Send Sign-in Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
*/