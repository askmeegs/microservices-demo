import express from 'express';
import { Ad, getAdsByCategory, getRandomAds } from './AdService';

const app = express();
const port = process.env.PORT || 8080;

app.get('/ads', (req, res) => {
  const { context_keys } = req.query;
  let ads: Ad[] = [];

  if (context_keys && typeof context_keys === 'string') {
    ads = getAdsByCategory(context_keys);
  } else if (Array.isArray(context_keys)) {
    const allAds: Ad[] = [];
    context_keys.forEach(key => {
        allAds.push(...getAdsByCategory(key as string));
    });
    ads = allAds;
  }

  if (ads.length === 0) {
    ads = getRandomAds();
  }
  
  res.status(200).json({ ads });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`AdService listening on port ${port}`);
  });
}

export default app;
