import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Deletes the calling user's own account. Verifies the caller is signed in
// first — the endpoint is publicly reachable, so no caller means no deletion.
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the user's own record via service role
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}