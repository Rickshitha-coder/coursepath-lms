require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Course, Enrollment, Progress, Notification, Message } = require('./models');
const { buildModule } = require('./utils/resourceLibrary');
const { generateCourseHandout } = require('./utils/pdfGenerator');

const mkModules = (defs, category) => defs.map((d, i) => buildModule({ title: d.title }, i + 1, category, {
  content: d.content, videoId: d.videoId, materials: d.materials,
}));

async function run() {
  await sequelize.sync({ force: true }); // fresh demo DB every time you run `npm run seed`
  console.log('Database synced. Seeding...');

  const adminHash = await bcrypt.hash('Admin@123', 10);
  await User.create({
    name: 'Priya Menon', email: 'admin@coursepath.edu', password: adminHash,
    department: 'Administration', role: 'admin',
  });

  const studentHash = await bcrypt.hash('Student@123', 10);
  const demoStudent = await User.create({
    name: 'Rahul Verma', email: 'student@coursepath.edu', password: studentHash,
    department: 'Computer Science', role: 'student',
  });

  const courseDefs = [
    { name: 'Full Stack Web Development', instructor: 'Arun Kumar', duration: 12, category: 'Web',
      description: 'Build and ship a complete MERN application: semantic HTML, responsive CSS, JavaScript, React, a Node/Express API, and a real database.',
      modules: [
        { title: 'HTML', videoId: 'UB1O30fR-EE', content: 'Semantic HTML5 structure: document layout, headings, links, images, lists, tables, and forms — the markup skeleton every page in this project is built on.',
          materials: [{ title: 'MDN — HTML reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }, { title: 'W3Schools — HTML tutorial', url: 'https://www.w3schools.com/html/' }] },
        { title: 'CSS', videoId: 'yfoY53QXEnI', content: 'Selectors, the box model, Flexbox and Grid, and responsive media queries — everything used to style and lay out this app.',
          materials: [{ title: 'MDN — CSS reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }, { title: 'W3Schools — CSS tutorial', url: 'https://www.w3schools.com/css/' }] },
        { title: 'JavaScript', videoId: 'hdI2bqOjy3c', content: 'Core JavaScript: variables, functions, DOM manipulation, events, and async code with fetch/promises.',
          materials: [{ title: 'MDN — JavaScript guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }, { title: 'javascript.info — modern tutorial', url: 'https://javascript.info/' }] },
        { title: 'React', videoId: 'w7ejDZ8SWv8', content: 'Components, props, state, and hooks — building interactive UIs by composing small reusable pieces.',
          materials: [{ title: 'react.dev — Learn React', url: 'https://react.dev/learn' }] },
        { title: 'Node.js & Express', videoId: 'fBNz5xF-Kx4', content: 'Running JavaScript on the server: core modules, HTTP servers, REST routing with Express, and npm packages.',
          materials: [{ title: 'Node.js — official docs', url: 'https://nodejs.org/en/docs' }, { title: 'Express.js docs', url: 'https://expressjs.com/' }] },
        { title: 'Databases & Deployment', videoId: '-56x56UppqQ', content: 'Modeling data, CRUD against a real database, JWT authentication, and deploying frontend + backend to production.',
          materials: [{ title: 'MongoDB — official manual', url: 'https://www.mongodb.com/docs/manual/' }] },
      ] },
    { name: 'Python for Data Analysis', instructor: 'Sandhya Rao', duration: 8, category: 'Programming',
      description: 'Core Python syntax, NumPy, pandas, and data-visualization workflows for real datasets.',
      modules: [
        { title: 'Python Basics', videoId: 'rfscVS0vtbw', content: 'Variables, data types, control flow, and functions — the Python fundamentals everything else in this course builds on.',
          materials: [{ title: 'Python — official tutorial', url: 'https://docs.python.org/3/tutorial/' }] },
        { title: 'Data Structures', videoId: 'rfscVS0vtbw', content: 'Lists, tuples, dictionaries, and sets, and when to reach for each one while working with real data.',
          materials: [{ title: 'Python — data structures', url: 'https://docs.python.org/3/tutorial/datastructures.html' }] },
        { title: 'NumPy', videoId: 'oWHGAOiq2zQ', content: 'Arrays and vectorized operations with NumPy — the numerical foundation pandas is built on.',
          materials: [{ title: 'NumPy — quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html' }] },
        { title: 'Pandas', videoId: 'oWHGAOiq2zQ', content: 'DataFrames, filtering, grouping, and cleaning real, messy datasets with pandas.',
          materials: [{ title: 'pandas — user guide', url: 'https://pandas.pydata.org/docs/user_guide/index.html' }] },
        { title: 'Visualization', videoId: 'oWHGAOiq2zQ', content: 'Turning a cleaned dataset into charts that tell a clear story, using Matplotlib.',
          materials: [{ title: 'Matplotlib — tutorials', url: 'https://matplotlib.org/stable/tutorials/index.html' }] },
      ] },
    { name: 'Machine Learning Foundations', instructor: 'Dr. Kabir Shah', duration: 10, category: 'AI',
      description: 'Supervised and unsupervised learning fundamentals, model evaluation, and a capstone project.',
      modules: [
        { title: 'Linear Regression', videoId: 'i_LwzRVP7bg', content: 'Fitting a line to data, cost functions, and gradient descent — the simplest supervised model and the one every other model builds intuition from.',
          materials: [{ title: 'scikit-learn — user guide', url: 'https://scikit-learn.org/stable/user_guide.html' }] },
        { title: 'Classification', videoId: 'i_LwzRVP7bg', content: 'Logistic regression, k-nearest neighbours, and naive Bayes for predicting categories instead of numbers.',
          materials: [{ title: 'scikit-learn — user guide', url: 'https://scikit-learn.org/stable/user_guide.html' }] },
        { title: 'Clustering', videoId: 'i_LwzRVP7bg', content: 'Unsupervised learning: grouping unlabeled data with K-Means and reducing dimensions with PCA.',
          materials: [{ title: 'scikit-learn — clustering', url: 'https://scikit-learn.org/stable/modules/clustering.html' }] },
        { title: 'Model Evaluation', videoId: 'i_LwzRVP7bg', content: 'Train/validation/test splits, accuracy vs. precision/recall, and avoiding overfitting.',
          materials: [{ title: 'scikit-learn — model evaluation', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' }] },
        { title: 'Capstone Project', videoId: 'i_LwzRVP7bg', content: 'An end-to-end project: load a real dataset, train a model, and evaluate it — pulling every earlier module together.',
          materials: [{ title: 'TensorFlow — tutorials', url: 'https://www.tensorflow.org/tutorials' }] },
      ] },
    { name: 'Database Management Systems', instructor: 'Meera Iyer', duration: 6, category: 'Databases',
      description: 'Relational modelling, SQL, normalization, and transactions, with a NoSQL comparison.',
      modules: [
        { title: 'ER Modelling', videoId: 'HXV3zeQKqGY', content: 'Entities, relationships, and keys — designing a schema on paper before writing a single CREATE TABLE.',
          materials: [{ title: 'W3Schools — SQL tutorial', url: 'https://www.w3schools.com/sql/' }] },
        { title: 'SQL Basics', videoId: 'HXV3zeQKqGY', content: 'SELECT, INSERT, UPDATE, DELETE, and filtering with WHERE — the everyday SQL vocabulary.',
          materials: [{ title: 'W3Schools — SQL tutorial', url: 'https://www.w3schools.com/sql/' }] },
        { title: 'Joins & Subqueries', videoId: 'HXV3zeQKqGY', content: 'Combining rows across tables with INNER/LEFT/RIGHT joins, and nesting queries inside queries.',
          materials: [{ title: 'W3Schools — SQL joins', url: 'https://www.w3schools.com/sql/sql_join.asp' }] },
        { title: 'Normalization', videoId: 'HXV3zeQKqGY', content: '1NF through 3NF — removing redundancy so updates and deletes can\'t corrupt your data.',
          materials: [{ title: 'W3Schools — SQL tutorial', url: 'https://www.w3schools.com/sql/' }] },
        { title: 'Transactions', videoId: 'HXV3zeQKqGY', content: 'ACID properties, COMMIT/ROLLBACK, and why transactions matter the moment two people write at once.',
          materials: [{ title: 'W3Schools — SQL tutorial', url: 'https://www.w3schools.com/sql/' }] },
        { title: 'NoSQL Overview', videoId: '-56x56UppqQ', content: 'Document databases like MongoDB versus relational databases — what changes, and when to pick each.',
          materials: [{ title: 'MongoDB — official manual', url: 'https://www.mongodb.com/docs/manual/' }] },
      ] },
    { name: 'React & Modern Frontend', instructor: 'Arun Kumar', duration: 7, category: 'Web',
      description: 'Component architecture, hooks, routing, and state management with the Context API.',
      modules: [
        { title: 'Components & Props', videoId: 'w7ejDZ8SWv8', content: 'Breaking a UI into small, reusable components and passing data down through props.',
          materials: [{ title: 'react.dev — Your first component', url: 'https://react.dev/learn/your-first-component' }] },
        { title: 'Hooks', videoId: 'w7ejDZ8SWv8', content: 'useState and useEffect — giving function components memory and side effects.',
          materials: [{ title: 'react.dev — Using hooks', url: 'https://react.dev/reference/react' }] },
        { title: 'React Router', videoId: 'w7ejDZ8SWv8', content: 'Client-side routing: multiple pages, one page load, with Link/NavLink and route params.',
          materials: [{ title: 'React Router — docs', url: 'https://reactrouter.com/en/main' }] },
        { title: 'Context API', videoId: 'w7ejDZ8SWv8', content: 'Sharing state (like the logged-in user) across the component tree without prop-drilling.',
          materials: [{ title: 'react.dev — passing data deeply with context', url: 'https://react.dev/learn/passing-data-deeply-with-context' }] },
        { title: 'Testing', videoId: 'w7ejDZ8SWv8', content: 'Writing basic component tests so refactors don\'t silently break the UI.',
          materials: [{ title: 'react.dev — Learn React', url: 'https://react.dev/learn' }] },
      ] },
  ];

  const createdCourses = [];
  for (const def of courseDefs) {
    const modules = mkModules(def.modules, def.category);
    const course = await Course.create({
      name: def.name, instructor: def.instructor, duration: def.duration,
      category: def.category, description: def.description, modules,
    });
    const pdfPath = generateCourseHandout(course);
    course.pdfPath = pdfPath;
    await course.save();
    createdCourses.push(course);
    console.log(`  + course: ${course.name} (${modules.length} modules, PDF handout generated)`);
  }

  // Enroll the demo student in the first course, with the first module
  // already marked complete, so the dashboard/progress pages have
  // something to show immediately after seeding.
  const firstCourse = createdCourses[0];
  await Enrollment.create({ studentId: demoStudent.id, courseId: firstCourse.id });
  await Progress.create({
    studentId: demoStudent.id, courseId: firstCourse.id,
    completedModules: [firstCourse.modules[0].id],
    percentage: Math.round((1 / firstCourse.modules.length) * 100),
  });

  await Notification.create({ userId: 'all', message: 'Welcome to Coursepath — browse courses to get started.' });
  await Notification.create({ userId: demoStudent.id, message: `You're enrolled in ${firstCourse.name}. Happy learning!` });

  console.log('\nSeed complete.');
  console.log('  Admin login:   admin@coursepath.edu / Admin@123');
  console.log('  Student login: student@coursepath.edu / Student@123\n');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
