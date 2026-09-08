// Shared LinkedIn posting helpers — used by shareNewPostsToLinkedin and
// crossPostInsightToLinkedin so the API payload lives in one place.

// Resolve the member URN (urn:li:person:<sub>) used as the post author.
export async function resolveAuthorUrn(accessToken) {
  const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meRes.ok) {
    throw new Error(`Failed to fetch LinkedIn profile: ${await meRes.text()}`);
  }
  const me = await meRes.json();
  return `urn:li:person:${me.sub}`;
}

// Publish a text post to the member's feed (public visibility).
export async function postToLinkedIn(accessToken, authorUrn, text) {
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Method': 'CREATE',
    },
    body: JSON.stringify({
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  if (!res.ok) {
    throw new Error(`LinkedIn API rejected the post: ${await res.text()}`);
  }
  return res.json();
}