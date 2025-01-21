import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supabase.auth.signInWithPassword({ email, password });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleAnonymousSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Sign out any existing user
      await supabase.auth.signOut();
  
      // Sign in anonymously (with a random email/password)
      const randomEmail = `anonymous_${Date.now()}@example.com`;
      const randomPassword = Math.random().toString(36).slice(-8);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: randomEmail,
        password: randomPassword,
      });
  
      if (signUpError) throw signUpError;

    // Insert default profile for the new anonymous user
    if (signUpData?.user) {
      console.log('User data:', signUpData);
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          points: 0,
          profile_image: '/path/to/default/User.jpg'
        })
        .select('*');

      if (profileError) throw profileError;
  
        console.log('Inserted profile data:', data);
  
        if (data) {
          console.log('Anonymous user created:', signUpData);
        } else {
          console.error('No data returned after inserting profile');
        }
      } else {
        console.error('No user data returned from signUp');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error('Error in handleAnonymousSignIn:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-8">
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn} className="space-y-4 mt-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="mt-4">Or sign in anonymously:</p>
      <button
        onClick={handleAnonymousSignIn}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Anonymous Sign In'}
      </button>
      <p className="mt-4">
        Don't have an account?{' '}
        <Link to="/sign-up" className="text-blue-600 hover:underline">Sign Up</Link>
      </p>
    </div>
  );
};

export default SignIn;