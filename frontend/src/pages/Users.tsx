import { useEffect, useState } from 'react';
import { Users as UsersIcon } from 'lucide-react';

interface RegisteredUser {
    id: number;
    username: string;
    role: string;
}

const Users = () => {
    const [users, setUsers] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8000/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-24 px-6 md:px-12 h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center"><UsersIcon className="w-8 h-8 mr-3 text-blue-600" /> Registered Citizens</h1>
                <p className="text-slate-600 font-medium mt-2">Active portal accounts available for verification.</p>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/40 text-sm font-bold text-slate-700 uppercase tracking-wider bg-white/40">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Aadhaar (Username)</div>
                    <div className="col-span-1 border-gray">System Role</div>
                </div>

                <div className="divide-y divide-white/10 max-h-[60vh] overflow-y-auto w-full">
                    {loading ? (
                        <div className="p-8 text-center text-slate-600 font-medium animate-pulse">Fetching records...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-slate-600 font-medium">No citizens registered yet.</div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-white/40 transition">
                                <div className="col-span-1 font-bold text-slate-500">#{user.id}</div>
                                <div className="col-span-2 font-mono text-sm tracking-widest text-slate-900 font-semibold">{user.username}</div>
                                <div className="col-span-1"><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wide">{user.role}</span></div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
