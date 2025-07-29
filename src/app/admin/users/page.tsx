
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2, Shield, User } from 'lucide-react';
import { db } from '@/lib/db';
import type { UserWithRole, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useLanguage } from '@/app/(public)/LanguageProvider';

const content = {
    en: {
        title: "User Management",
        description: "View all registered users and manage their roles.",
        tableHeaders: {
            email: "Email",
            role: "Role",
            registered: "Registered",
            actions: "Actions",
        },
        actions: {
            label: "Actions",
            makeAdmin: "Make Admin",
            makeParent: "Make Parent"
        },
        noUsers: "No users found.",
        toast: {
            success: {
                title: "Success",
                description: "User role has been updated."
            },
            error: {
                title: "Error",
                description: "Failed to update user role."
            }
        }
    },
    cy: {
        title: "Rheoli Defnyddwyr",
        description: "Gweld pob defnyddiwr cofrestredig a rheoli eu rolau.",
        tableHeaders: {
            email: "E-bost",
            role: "Rôl",
            registered: "Cofrestwyd",
            actions: "Gweithredoedd",
        },
        actions: {
            label: "Gweithredoedd",
            makeAdmin: "Gwneud yn Weinyddwr",
            makeParent: "Gwneud yn Rhiant"
        },
        noUsers: "Ni chanfuwyd unrhyw ddefnyddwyr.",
        toast: {
            success: {
                title: "Llwyddiant",
                description: "Mae rôl y defnyddiwr wedi'i diweddaru."
            },
            error: {
                title: "Gwall",
                description: "Wedi methu diweddaru rôl y defnyddiwr."
            }
        }
    }
}

export default function UsersAdminPage() {
    const { language } = useLanguage();
    const t = content[language];
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const usersData = await db.getUsersWithRoles();
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({
                title: t.toast.error.title,
                description: "Could not load user data.",
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await db.updateUserRole(userId, newRole);
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
            toast(t.toast.success);
        } catch (error) {
            console.error("Failed to update role:", error);
            toast(t.toast.error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                <p className="text-muted-foreground">{t.description}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all users who have signed up to the portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.tableHeaders.email}</TableHead>
                                    <TableHead>{t.tableHeaders.role}</TableHead>
                                    <TableHead>{t.tableHeaders.registered}</TableHead>
                                    <TableHead className="text-right">{t.tableHeaders.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role === 'admin' ? <Shield className="mr-2 h-3 w-3"/> : <User className="mr-2 h-3 w-3" />}
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{format(new Date(user.created_at), 'dd MMM yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>{t.actions.label}</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                                            disabled={user.role === 'admin'}
                                                        >
                                                            {t.actions.makeAdmin}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRoleChange(user.id, 'parent')}
                                                            disabled={user.role === 'parent'}
                                                        >
                                                            {t.actions.makeParent}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {t.noUsers}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
