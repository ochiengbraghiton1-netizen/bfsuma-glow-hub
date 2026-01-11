import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Shield, User, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'editor' | 'viewer';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
}

interface Profile {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const roleIcons: Record<AppRole, typeof Shield> = {
  admin: Shield,
  editor: Edit,
  viewer: Eye,
};

const Admins = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'editor' as AppRole,
  });

  const fetchUsers = async () => {
    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch profiles to get emails
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name');

      if (profilesError) throw profilesError;

      // Create a lookup map for profiles
      const profileMap: Record<string, Profile> = {};
      profilesData?.forEach((profile) => {
        profileMap[profile.user_id] = profile;
      });

      setProfiles(profileMap);
      setUsers(rolesData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!formData.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSubmitting(true);
    try {
      // First, find the user by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (profileError || !profileData) {
        toast.error('User not found. They must sign up first.');
        setSubmitting(false);
        return;
      }

      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profileData.user_id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', profileData.user_id);

        if (updateError) throw updateError;
        toast.success('User role updated successfully');
      } else {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profileData.user_id,
            role: formData.role,
          });

        if (insertError) throw insertError;
        toast.success('User added successfully');
      }

      setDialogOpen(false);
      setFormData({ email: '', role: 'editor' });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot remove your own admin access");
      return;
    }

    if (!confirm('Are you sure you want to remove this user\'s access?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User access removed');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to remove user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--admin-text))]">Manage Admins</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">
            Add and manage users with admin access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-glow))] text-white gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
            <DialogHeader>
              <DialogTitle>Add Admin User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text-muted))]">Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))]"
                />
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                  The user must have already signed up on the website
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text-muted))]">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as AppRole })}
                >
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    <SelectItem value="admin" className="text-[hsl(var(--admin-text))]">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-400" />
                        Admin - Full access
                      </div>
                    </SelectItem>
                    <SelectItem value="editor" className="text-[hsl(var(--admin-text))]">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4 text-blue-400" />
                        Editor - Can edit content
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer" className="text-[hsl(var(--admin-text))]">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-400" />
                        Viewer - Read only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-card-hover))]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={submitting}
                  className="flex-1 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-glow))] text-white"
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-3">
        {(['admin', 'editor', 'viewer'] as AppRole[]).map((role) => {
          const Icon = roleIcons[role];
          return (
            <div
              key={role}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm capitalize',
                roleColors[role]
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {role}
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[hsl(var(--admin-border))] hover:bg-transparent">
              <TableHead className="text-[hsl(var(--admin-text-muted))]">User</TableHead>
              <TableHead className="text-[hsl(var(--admin-text-muted))]">Role</TableHead>
              <TableHead className="text-[hsl(var(--admin-text-muted))]">Added</TableHead>
              <TableHead className="text-right text-[hsl(var(--admin-text-muted))]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-[hsl(var(--admin-text-muted))]">
                  No admin users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((userRole) => {
                const profile = profiles[userRole.user_id];
                const Icon = roleIcons[userRole.role];
                const isCurrentUser = userRole.user_id === user?.id;

                return (
                  <TableRow 
                    key={userRole.id} 
                    className="border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-card-hover))]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--admin-accent)_/_0.2)] flex items-center justify-center">
                          <User className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--admin-text))]">
                            {profile?.full_name || 'Unknown'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-[hsl(var(--admin-accent))]">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                            {profile?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={userRole.role}
                        onValueChange={(value) => handleUpdateRole(userRole.user_id, value as AppRole)}
                        disabled={isCurrentUser}
                      >
                        <SelectTrigger 
                          className={cn(
                            'w-32 border',
                            roleColors[userRole.role],
                            'bg-transparent'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{userRole.role}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                          <SelectItem value="admin" className="text-[hsl(var(--admin-text))]">Admin</SelectItem>
                          <SelectItem value="editor" className="text-[hsl(var(--admin-text))]">Editor</SelectItem>
                          <SelectItem value="viewer" className="text-[hsl(var(--admin-text))]">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-text-muted))]">
                      {format(new Date(userRole.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(userRole.user_id)}
                        disabled={isCurrentUser}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info Box */}
      <div className="bg-[hsl(var(--admin-accent)_/_0.1)] border border-[hsl(var(--admin-accent)_/_0.3)] rounded-xl p-4">
        <h3 className="font-semibold text-[hsl(var(--admin-accent))] mb-2">Role Permissions</h3>
        <ul className="text-sm text-[hsl(var(--admin-text-muted))] space-y-1">
          <li><strong className="text-red-400">Admin:</strong> Full access to all features, can manage other admins</li>
          <li><strong className="text-blue-400">Editor:</strong> Can create, edit, and delete content, products, orders</li>
          <li><strong className="text-gray-400">Viewer:</strong> Read-only access to dashboard and reports</li>
        </ul>
      </div>
    </div>
  );
};

export default Admins;
