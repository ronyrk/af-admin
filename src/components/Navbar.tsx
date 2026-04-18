'use client';

import React, { Suspense } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Button } from './ui/button';
import { LogOut, Settings, User, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/components/auth-provider';

function NavbarContent() {
	const { user, isLoading, logout } = useAuthContext();

	// Get user initials for avatar fallback
	const getUserInitials = () => {
		if (user?.name) {
			return user.name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2);
		}
		return 'AD';
	};

	if (isLoading) {
		return (
			<nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">AF</span>
							</div>
							<span className="font-semibold text-foreground hidden sm:inline">
								Arafat Foundation
							</span>
						</div>
						<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
					</div>
				</div>
			</nav>
		);
	}

	return (
		<nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo/Brand */}
					<div className="flex items-center gap-2">
						<Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">AF</span>
							</div>
							<span className="font-semibold text-foreground hidden sm:inline">
								Arafat Foundation
							</span>
						</Link>
					</div>

					{/* Navigation Links */}
					{user && (
						<div className="hidden md:flex items-center gap-8">
							<Link
								href="/dashboard"
								className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								Dashboard
							</Link>
						</div>
					)}

					{/* User Menu */}
					<div className="flex items-center gap-4">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-accent">
										<Avatar className="h-10 w-10">
											<AvatarImage src={user.email ? `https://avatar.vercel.sh/${user.email}` : undefined} />
											<AvatarFallback className="bg-primary text-primary-foreground font-medium">
												{getUserInitials()}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end" className="w-56">
									{/* User Info */}
									<div className="px-2 py-1.5">
										<p className="text-sm font-medium text-foreground">{user.name || 'Admin User'}</p>
										<p className="text-xs text-muted-foreground">{user.email}</p>
										{user.role && (
											<p className="text-xs text-muted-foreground capitalize mt-1">
												Role: {user.role}
											</p>
										)}
									</div>

									<DropdownMenuSeparator />

									{/* User Actions */}
									<DropdownMenuGroup>
										<DropdownMenuItem asChild>
											<Link href="/dashboard/password" className="flex items-center gap-2 cursor-pointer">
												<Settings className="w-4 h-4" />
												<span>Password Change</span>
											</Link>
										</DropdownMenuItem>
									</DropdownMenuGroup>

									<DropdownMenuSeparator />

									{/* Logout */}
									<DropdownMenuGroup>
										<DropdownMenuItem
											onClick={logout}
											className="flex items-center gap-2 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
										>
											<LogOut className="w-4 h-4" />
											<span>Log out</span>
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button asChild variant="default" size="sm">
								<Link href="/">Login</Link>
							</Button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

// Navbar component with Suspense boundary
export default function Navbar() {
	return (
		<Suspense fallback={<NavbarFallback />}>
			<NavbarContent />
		</Suspense>
	);
}

// Fallback component for loading state
function NavbarFallback() {
	return (
		<nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">AF</span>
						</div>
						<span className="font-semibold text-foreground hidden sm:inline">
							Arafat Foundation
						</span>
					</div>
					<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
				</div>
			</div>
		</nav>
	);
}
