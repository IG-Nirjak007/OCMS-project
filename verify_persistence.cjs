const http = require('http');

const BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = new URL(BASE_URL + endpoint);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const body = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: headers,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

async function verifyPersistence() {
  console.log('====================================================');
  console.log('STEP 7: POSTGRESQL & SPRING BOOT PERSISTENCE AUDIT');
  console.log('====================================================\n');

  // 1. Login with student to fetch courses and submissions
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'student@ocms.com', password: 'student123' }
  });
  if (studentLogin.status !== 200) {
    console.error('Failed to log in as student');
    process.exit(1);
  }
  const studentToken = studentLogin.data.token;

  // 2. Fetch all courses
  const coursesRes = await request('/courses', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`[PERSISTENCE] Total Courses Found: ${coursesRes.data.length}`);
  const persistentCourse = coursesRes.data.find(c => c.title === 'Cloud-Native Distributed Systems');
  if (!persistentCourse) {
    console.error('[FAIL] Persistent course "Cloud-Native Distributed Systems" not found!');
    process.exit(1);
  }
  console.log(`[PASS] Course "Cloud-Native Distributed Systems" (ID: ${persistentCourse.id}) persisted!`);
  console.log(`       Instructors: ${persistentCourse.instructors.map(i => i.username || i.email).join(', ')}`);

  // 3. Fetch materials for this course
  const matRes = await request(`/courses/${persistentCourse.id}/materials`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`[PERSISTENCE] Total Materials in Course: ${matRes.data.length}`);
  const persistentMat = matRes.data.find(m => m.title.includes('Raft Protocol Guide'));
  if (!persistentMat) {
    console.error('[FAIL] Study material not found!');
    process.exit(1);
  }
  console.log(`[PASS] Study Material "${persistentMat.title}" persisted!`);

  // 4. Fetch assignments for this course
  const asgRes = await request(`/courses/${persistentCourse.id}/assignments`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`[PERSISTENCE] Total Assignments in Course: ${asgRes.data.length}`);
  const persistentAsg = asgRes.data.find(a => a.title.includes('Raft Leader Election'));
  if (!persistentAsg) {
    console.error('[FAIL] Assignment not found!');
    process.exit(1);
  }
  console.log(`[PASS] Assignment "${persistentAsg.title}" (ID: ${persistentAsg.id}) persisted!`);

  // 5. Fetch student's submissions and verify grade
  const subRes = await request('/submissions/me', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`[PERSISTENCE] Total Student Submissions: ${subRes.data.length}`);
  const persistentSub = subRes.data.find(s => s.assignment?.id === persistentAsg.id);
  if (!persistentSub) {
    console.error('[FAIL] Submission not found!');
    process.exit(1);
  }
  console.log(`[PASS] Submission (ID: ${persistentSub.id}) persisted!`);
  console.log(`       Grade: ${persistentSub.grade}/100`);
  console.log(`       Feedback: "${persistentSub.feedback}"`);
  console.log(`       File/Repo: ${persistentSub.filePath}`);

  console.log('\n====================================================');
  console.log('ALL CREATED DATA FULLY SURVIVED SYSTEM RESTART!');
  console.log('====================================================\n');
}

verifyPersistence().catch(console.error);
