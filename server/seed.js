require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const samplePosts = [
  {
    title: 'The Rise of Drone Warfare: How UAVs Are Reshaping Modern Conflict',
    content: `A decade ago, drones were mostly used for surveillance. Today, low-cost UAVs are changing how wars are fought on the ground.

Cheap, expendable drones can take out vehicles costing millions of dollars, forcing militaries to rethink armor, air defense, and even basic troop movement. Electronic warfare and counter-drone systems have become some of the fastest-growing areas of defense spending.

What's striking is how quickly commercial drone technology has been adapted for military use — the gap between consumer tech and battlefield tech has never been smaller.`,
    tags: ['defence', 'technology', 'military'],
  },
  {
    title: 'Inside the Submarine Arms Race: Why Stealth Still Matters',
    content: `Despite advances in satellite surveillance, submarines remain one of the hardest assets to detect — and that's exactly why nations keep investing in them.

Modern nuclear-powered submarines can stay submerged for months, carrying enough firepower to act as a deterrent on their own. The push toward quieter propulsion, better sonar, and unmanned underwater vehicles is quietly one of the most expensive technology races in the world.

For smaller navies, even a handful of modern submarines can shift the balance of power in a region.`,
    tags: ['defence', 'military', 'navy'],
  },
  {
    title: 'How National Security Budgets Shape Global Tech Innovation',
    content: `A surprising amount of everyday technology — GPS, the internet, jet engines, even microwaves — traces back to defense research.

Today, defense budgets are quietly funding breakthroughs in AI, materials science, and cybersecurity that eventually trickle down into commercial products. The relationship works both ways too: militaries increasingly rely on commercial cloud computing and chips originally built for consumer markets.

It's a reminder that the line between "defense tech" and "everyday tech" is much blurrier than most people realize.`,
    tags: ['defence', 'technology', 'innovation'],
  },
  {
    title: 'Why Underdog Teams Win More Than the Stats Say They Should',
    content: `Every season, at least one team with a fraction of the budget of its rivals ends up punching way above its weight.

Tactical discipline, a tight-knit squad, and a manager willing to take risks can outweigh raw talent more often than analysts predict. Some of the most memorable matches in football history come down to a heavily favored team failing to adapt when their game plan stops working.

It's part of why upsets are so satisfying — they're a reminder that sport isn't just a spreadsheet of player ratings.`,
    tags: ['sports', 'football', 'analysis'],
  },
  {
    title: 'The Science Behind Marginal Gains in Elite Sport',
    content: `A 1% improvement in sleep quality, recovery, nutrition, and equipment doesn't sound like much — until you stack a dozen of them together.

This "aggregation of marginal gains" approach, famously used by cycling teams, has spread across nearly every sport. Teams now employ data scientists, sports psychologists, and recovery specialists alongside traditional coaches.

The interesting part is that most of these gains aren't secret — they're publicly known. The advantage comes from consistency in applying them, not from discovering something new.`,
    tags: ['sports', 'science', 'fitness'],
  },
  {
    title: 'From Local Pitch to World Stage: Scouting in the Modern Game',
    content: `Scouting used to mean a coach watching a few matches in person and trusting their gut. Now it's a global data operation.

Clubs track tens of thousands of players across leagues most fans have never heard of, using performance data to flag talent years before they're household names. Yet for all the data, the human element still matters — character, attitude, and how a player handles pressure are notoriously hard to quantify.

The best scouting departments combine both: the numbers to find the player, and the eye to know if they'll actually fit.`,
    tags: ['sports', 'football', 'analysis'],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const user = await User.findOne({ email: 'vedant@gmail.com' });
    if (!user) {
      console.error('No user found with email vedant@gmail.com. Aborting.');
      process.exit(1);
    }

    const docs = samplePosts.map(p => ({
      ...p,
      author: user._id,
      authorName: user.username,
    }));

    const created = await Post.insertMany(docs);
    console.log(`Inserted ${created.length} posts authored by ${user.username}.`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
