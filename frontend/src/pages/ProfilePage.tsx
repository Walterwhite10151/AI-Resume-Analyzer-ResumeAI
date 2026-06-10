import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Calendar, Save, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  })

  const updateMutation = useMutation({
    mutationFn: () => api.put('/users/me', form),
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Update failed'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar + info */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{user?.name}</p>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Mail size={13} /> {user?.email}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <Calendar size={12} />
            Member since {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : '—'}
          </p>
          {user?.is_admin && (
            <span className="inline-flex items-center gap-1 mt-2 badge badge-yellow">
              <Shield size={11} /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-200">Edit Profile</h2>
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea
            className="input min-h-[100px] resize-none"
            placeholder="Tell us about yourself…"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {updateMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Save Changes
        </button>
      </div>

      {/* Account info */}
      <div className="card p-6 space-y-3">
        <h2 className="text-base font-semibold text-slate-200">Account Info</h2>
        {[
          { label: 'Email', value: user?.email },
          { label: 'Account Status', value: user?.is_active ? 'Active' : 'Inactive' },
          { label: 'Role', value: user?.is_admin ? 'Administrator' : 'User' },
          { label: 'User ID', value: `#${user?.id}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-white/6 last:border-0">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-sm text-slate-200 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
