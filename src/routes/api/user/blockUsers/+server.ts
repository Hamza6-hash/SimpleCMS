import mongoose from 'mongoose';
import type { RequestHandler } from './$types';
import { auth } from '../../db';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	// admins count
	const AUTH_USER = mongoose.models['auth_user'];
	let adminLength = (await AUTH_USER.find({ role: 'admin' })).length;
	let flag = false;

	data.forEach(async (user: any) => {
		if (user.role == 'admin' && adminLength == 1) {
			flag = true;
			return;
		}
		adminLength -= user.role == 'admin' ? 1 : 0;

		// block user
		await auth.invalidateAllUserSessions(user.id);
		await auth.updateUserAttributes(user.id, { blocked: true });
	});

	if (flag) return new Response(JSON.stringify({ success: false, message: 'Cannot block all admins' }), { status: 400 });

	return new Response(JSON.stringify({ success: true }), { status: 200 });
};
