export interface Ad {
  redirect_url: string;
  text: string;
}

const adsMap: { [key: string]: Ad[] } = {
  clothing: [
    {
      redirect_url: '/product/66VCHSJNUP',
      text: 'Tank top for sale. 20% off.',
    },
  ],
  accessories: [
    {
      redirect_url: '/product/1YMWWN1N4O',
      text: 'Watch for sale. Buy one, get second kit for free',
    },
  ],
  footwear: [
    {
      redirect_url: '/product/L9ECAV7KIM',
      text: 'Loafers for sale. Buy one, get second one for free',
    },
  ],
  hair: [
    {
      redirect_url: '/product/2ZYFJ3GM2N',
      text: 'Hairdryer for sale. 50% off.',
    },
  ],
  decor: [
    {
      redirect_url: '/product/0PUK6V6EV0',
      text: 'Candle holder for sale. 30% off.',
    },
  ],
  kitchen: [
    {
      redirect_url: '/product/9SIQT8TOJO',
      text: 'Bamboo glass jar for sale. 10% off.',
    },
    {
      redirect_url: '/product/6E92ZMYYFZ',
      text: 'Mug for sale. Buy two, get third one for free',
    },
  ],
};

export function getAdsByCategory(category: string): Ad[] {
  return adsMap[category] || [];
}

export function getRandomAds(): Ad[] {
  const allAds = Object.values(adsMap).flat();
  const randomAds: Ad[] = [];
  const numAdsToServe = 2;

  for (let i = 0; i < numAdsToServe; i++) {
    const randomIndex = Math.floor(Math.random() * allAds.length);
    randomAds.push(allAds[randomIndex]);
  }

  return randomAds;
}
