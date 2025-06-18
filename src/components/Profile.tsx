'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

interface ProfileProps {
  user: User;
  onSignOut: () => void;
}

export default function Profile({ user, onSignOut }: ProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updates = {
        id: user.id,
        email: user.email,
        username: formData.username || null,
        full_name: formData.full_name || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  if (loading) {
    return <div className="text-center">Loading profile...</div>;
  }

  return (
    <div className="mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Your Profile</h2>
        <div className="space-x-2">
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Sign Out
          </button>
          <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Home
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Tell us about yourself"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Email</h3>
            <p className="text-gray-900">{user.email}</p>
          </div>

          {profile?.username && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Username</h3>
              <p className="text-gray-900">@{profile.username}</p>
            </div>
          )}

          {profile?.full_name && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Full Name</h3>
              <p className="text-gray-900">{profile.full_name}</p>
            </div>
          )}

          {profile?.bio && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Bio</h3>
              <p className="text-gray-900">{profile.bio}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700">Member Since</h3>
            <p className="text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 