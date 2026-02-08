export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
    }

  const { email } = req.body;

  if (!email) {
        return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;

  if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
  }

  try {
        const response = await fetch(
                `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`
              );

      if (!response.ok) {
              return res.status(response.status).json({ error: 'Email verification failed' });
      }

            const data = await response.json();

      return res.status(200).json({
              email,
              verified: data.deliverability === 'DELIVERABLE',
              status: data.deliverability,
              statusDetail: data.quality_score ? `Quality: ${data.quality_score}` : 'No quality score'
      });
  } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
  }
}
