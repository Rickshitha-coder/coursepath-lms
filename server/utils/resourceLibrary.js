/* Server-side mirror of the module-building logic: whenever an admin
   creates or edits a course with a list of module titles, each module is
   matched against this library so it resolves to a real, working YouTube
   video + reference links — not placeholder text. */
const { v4: uuidv4 } = require('uuid');

const RESOURCE_LIBRARY = [
  { match: /html/i, videoId: 'UB1O30fR-EE', videoTitle: 'HTML Tutorial – Website Crash Course for Beginners',
    materials: [{ title: 'MDN — HTML reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }] },
  { match: /css/i, videoId: 'yfoY53QXEnI', videoTitle: 'CSS Crash Course for Beginners',
    materials: [{ title: 'MDN — CSS reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }] },
  { match: /javascript|js\b/i, videoId: 'hdI2bqOjy3c', videoTitle: 'JavaScript Crash Course For Beginners',
    materials: [{ title: 'MDN — JavaScript guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' }] },
  { match: /react|component|props|hook|router|context api|jsx|frontend testing|^testing$/i, videoId: 'w7ejDZ8SWv8', videoTitle: 'React Crash Course',
    materials: [{ title: 'react.dev — Learn React', url: 'https://react.dev/learn' }, { title: 'React Router docs', url: 'https://reactrouter.com/en/main' }] },
  { match: /node/i, videoId: 'fBNz5xF-Kx4', videoTitle: 'Node.js Crash Course',
    materials: [{ title: 'Node.js — official docs', url: 'https://nodejs.org/en/docs' }, { title: 'Express.js docs', url: 'https://expressjs.com/' }] },
  { match: /mongodb|nosql/i, videoId: '-56x56UppqQ', videoTitle: 'MongoDB Crash Course',
    materials: [{ title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' }] },
  { match: /numpy/i, videoId: 'oWHGAOiq2zQ', videoTitle: 'NumPy Crash Course',
    materials: [{ title: 'NumPy quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html' }] },
  { match: /pandas|visualization/i, videoId: 'oWHGAOiq2zQ', videoTitle: 'NumPy & Pandas Crash Course',
    materials: [{ title: 'pandas — Getting started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' }, { title: 'Matplotlib tutorials', url: 'https://matplotlib.org/stable/tutorials/index.html' }] },
  { match: /python|data structures/i, videoId: 'rfscVS0vtbw', videoTitle: 'Python Crash Course For Beginners',
    materials: [{ title: 'Python official tutorial', url: 'https://docs.python.org/3/tutorial/' }] },
  { match: /sql|join|normal|transaction|er modelling|database/i, videoId: 'HXV3zeQKqGY', videoTitle: 'SQL Crash Course',
    materials: [{ title: 'W3Schools — SQL', url: 'https://www.w3schools.com/sql/' }] },
  { match: /regression|classification|clustering|model evaluation|capstone|machine learning/i, videoId: 'i_LwzRVP7bg', videoTitle: 'Machine Learning for Everybody – Full Course',
    materials: [{ title: 'scikit-learn — user guide', url: 'https://scikit-learn.org/stable/user_guide.html' }] },
];

const CATEGORY_FALLBACK = {
  Web: RESOURCE_LIBRARY[0], Programming: RESOURCE_LIBRARY[8], AI: RESOURCE_LIBRARY[10],
  Databases: RESOURCE_LIBRARY[9], Design: RESOURCE_LIBRARY[1],
};

function resolveResource(title, category) {
  const hit = RESOURCE_LIBRARY.find(r => r.match.test(title));
  if (hit) return hit;
  const fallback = CATEGORY_FALLBACK[category];
  if (fallback) return fallback;
  return { videoId: null, videoTitle: null, materials: [{ title: `Search "${title}" on YouTube`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' tutorial')}` }] };
}

// title: string OR {id, title} (id present when editing an existing module)
function buildModule(title, order, category, existing) {
  const t = typeof title === 'object' ? title.title : title;
  const res = resolveResource(t, category);
  return {
    id: (existing && existing.id) || 'mod_' + uuidv4(),
    title: t,
    order,
    content: (existing && existing.content) || `This module covers "${t}". Watch the linked video, work through the linked materials, then mark this module complete.`,
    videoId: existing && existing.videoId !== undefined ? existing.videoId : res.videoId,
    videoTitle: (existing && existing.videoTitle) || res.videoTitle,
    materials: (existing && existing.materials) || res.materials,
  };
}

module.exports = { resolveResource, buildModule };
