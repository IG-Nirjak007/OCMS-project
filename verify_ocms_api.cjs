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

async function runTests() {
  console.log('====================================================');
  console.log('OCMS COMPREHENSIVE SEQUENTIAL VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Detail:`, detail);
      failed++;
    }
  }

  // 1. Test All Three Logins
  console.log('\n--- Step 1: Test Teacher, Admin, and Student Logins ---');

  // Teacher Login
  const teacherLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'prakashteacher1@gmail.com', password: 'prakashteacher' }
  });
  assert(teacherLogin.status === 200 && teacherLogin.data.token, 
    'Teacher prakashteacher1@gmail.com login succeeds (HTTP 200)', teacherLogin.data);
  const teacherToken = teacherLogin.data?.token;
  const teacherId = teacherLogin.data?.user?.id;
  const teacherRoles = teacherLogin.data?.user?.roles?.map(r => r.name || r) || [];
  assert(teacherRoles.includes('ROLE_TEACHER'), 'Teacher account has ROLE_TEACHER', teacherRoles);

  // Admin Login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@ocms.com', password: 'admin123' }
  });
  assert(adminLogin.status === 200 && adminLogin.data.token, 
    'Admin admin@ocms.com login succeeds (HTTP 200)', adminLogin.data);
  const adminToken = adminLogin.data?.token;
  const adminId = adminLogin.data?.user?.id;
  const adminRoles = adminLogin.data?.user?.roles?.map(r => r.name || r) || [];
  assert(adminRoles.includes('ROLE_ADMIN'), 'Admin account has ROLE_ADMIN', adminRoles);

  // Student Login
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'student@ocms.com', password: 'student123' }
  });
  assert(studentLogin.status === 200 && studentLogin.data.token, 
    'Student student@ocms.com login succeeds (HTTP 200)', studentLogin.data);
  const studentToken = studentLogin.data?.token;
  const studentId = studentLogin.data?.user?.id;
  const studentRoles = studentLogin.data?.user?.roles?.map(r => r.name || r) || [];
  assert(studentRoles.includes('ROLE_STUDENT'), 'Student account has ROLE_STUDENT', studentRoles);

  // Test Invalid Credentials
  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'prakashteacher1@gmail.com', password: 'wrongpassword' }
  });
  assert(badLogin.status === 401, 'Invalid credentials rejected with HTTP 401', badLogin.status);

  // 2. Create Classroom as Admin & Assign Teacher
  console.log('\n--- Step 2: Create Classroom as Admin & Assign Teacher ---');
  const uniqueCourseTitle = 'Cloud-Native Distributed Systems ' + Date.now();
  const coursePayload = {
    title: uniqueCourseTitle,
    description: 'Advanced distributed architecture with microservices, messaging, and containerization.',
    schedule: 'Tue/Thu 11:00 AM - 12:30 PM',
    instructorId: teacherId,
    studentIds: []
  };
  const createCourseRes = await request('/courses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: coursePayload
  });
  assert(createCourseRes.status === 200 && createCourseRes.data?.id, 
    'Admin creates classroom and assigns teacher', createCourseRes.data);
  const courseId = createCourseRes.data?.id;

  const assignedInstructors = (createCourseRes.data?.instructors || []).map(i => i.email);
  assert(assignedInstructors.includes('prakashteacher1@gmail.com'), 
    'prakashteacher1@gmail.com is assigned instructor for the course', assignedInstructors);

  // 3. Add Study Material & Assignment as that Teacher
  console.log('\n--- Step 3: Add Study Material & Assignment as Teacher ---');

  // Study material
  const materialPayload = {
    title: 'Distributed Consensus & Raft Protocol Guide',
    contentDescription: 'Core lecture notes on Raft consensus algorithm, leader election, and log replication.',
    contentData: '# Raft Consensus Algorithm\n\nLeader election and log replication in distributed state machines.',
    contentType: 'NOTE'
  };
  const createMaterialRes = await request(`/courses/${courseId}/materials/content`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: materialPayload
  });
  assert(createMaterialRes.status === 200 && createMaterialRes.data?.id, 
    'Teacher adds study material note into course', createMaterialRes.data);
  const materialId = createMaterialRes.data?.id;

  // Active Assignment with future deadline (+7 days)
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const assignmentPayload = {
    courseId: courseId,
    title: 'Lab 1: Implement Raft Leader Election',
    description: 'Implement heartbeat timers and candidate vote requests. Submit your GitHub link or written report.',
    dueDate: futureDate
  };
  const createAssignmentRes = await request('/assignments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: assignmentPayload
  });
  assert(createAssignmentRes.status === 200 && createAssignmentRes.data?.id, 
    'Teacher creates active assignment with future deadline', createAssignmentRes.data);
  const assignmentId = createAssignmentRes.data?.id;

  // Expired Assignment with past deadline (-2 days) to test deadline enforcement
  const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const pastAssignmentPayload = {
    courseId: courseId,
    title: 'Lab 0: System Environment Setup (Closed)',
    description: 'Past deadline assignment for verifying strict submission lock enforcement.',
    dueDate: pastDate
  };
  const createPastAssignmentRes = await request('/assignments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: pastAssignmentPayload
  });
  assert(createPastAssignmentRes.status === 200 && createPastAssignmentRes.data?.id, 
    'Teacher creates past-deadline assignment for enforcement testing', createPastAssignmentRes.data);
  const pastAssignmentId = createPastAssignmentRes.data?.id;

  // 4. Admit Student & Submit Assignment
  console.log('\n--- Step 4: Admit Student & Submit Assignment ---');

  // Admit student
  const admitRes = await request(`/enrollments/course/${courseId}/students/${studentId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(admitRes.status === 200, 'Admin/Teacher admits student to classroom (HTTP 200)', admitRes.data);

  // Student views course materials
  const studentMaterialsRes = await request(`/courses/${courseId}/materials`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentMaterialsRes.status === 200 && studentMaterialsRes.data.length > 0, 
    'Student views study materials of enrolled classroom', studentMaterialsRes.data);

  // Student submits assignment before deadline
  const submissionPayload = {
    assignmentId: assignmentId,
    description: 'Here is my initial Raft election implementation and unit test suite.',
    fileUrl: 'https://github.com/student-ocms/raft-election'
  };
  const submitRes = await request('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: submissionPayload
  });
  assert(submitRes.status === 200 && submitRes.data?.submission?.id, 
    'Student submits assignment before deadline (HTTP 200)', submitRes.data);
  const submissionId = submitRes.data?.submission?.id;

  // Student edits the submission before deadline
  const editSubmissionPayload = {
    assignmentId: assignmentId,
    description: 'Updated Raft election implementation with split-vote randomized backoff fix.',
    fileUrl: 'https://github.com/student-ocms/raft-election-v2'
  };
  const editSubmitRes = await request('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: editSubmissionPayload
  });
  assert(editSubmitRes.status === 200 && editSubmitRes.data?.submission?.description.includes('split-vote'), 
    'Student successfully edits submission before deadline', editSubmitRes.data);

  // Student tests deleting submission before deadline
  const deleteSubRes = await request(`/submissions/${submissionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(deleteSubRes.status === 200, 
    'Student successfully deletes submission before deadline', deleteSubRes.data);

  // Student resubmits so it can be graded
  const reSubmitRes = await request('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: submissionPayload
  });
  assert(reSubmitRes.status === 200 && reSubmitRes.data?.submission?.id, 
    'Student resubmits assignment cleanly', reSubmitRes.data);
  const activeSubmissionId = reSubmitRes.data?.submission?.id;

  // 5. Grade Submission as the Teacher
  console.log('\n--- Step 5: Grade Submission as Assigned Teacher ---');
  const gradePayload = {
    grade: 96,
    feedback: 'Outstanding consensus algorithm implementation and clean test coverage!'
  };
  const gradeRes = await request(`/submissions/${activeSubmissionId}/grade`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${teacherToken}` },
    body: gradePayload
  });
  assert(gradeRes.status === 200 && gradeRes.data?.grade === 96, 
    'Assigned teacher grades submission (score: 96)', gradeRes.data);

  // Student views their graded submission
  const mySubmissionsRes = await request('/submissions/me', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const mySub = (mySubmissionsRes.data || []).find(s => s.id === activeSubmissionId);
  assert(mySub && mySub.grade === 96, 
    'Student views their score (96) and instructor feedback on submissions', mySub);

  // 6. Test Deadline Enforcement and Unauthorized API Access
  console.log('\n--- Step 6: Test Deadline Enforcement & Unauthorized API Access ---');

  // A. Deadline Enforcement: Student attempts to submit to expired assignment
  const expiredSubmitRes = await request('/submissions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      assignmentId: pastAssignmentId,
      description: 'Attempting to submit after deadline.',
      fileUrl: 'https://example.com/late'
    }
  });
  assert(expiredSubmitRes.status === 400, 
    'Submission after deadline is REJECTED with HTTP 400 Bad Request', expiredSubmitRes.data);

  // B. Role Security: Student attempts to call Admin API
  const studentAdminAttempt = await request('/admin/users', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentAdminAttempt.status === 403, 
    'Student calling /api/admin/users is REJECTED with HTTP 403 Forbidden', studentAdminAttempt.status);

  // C. Role Security: Student attempts to create a Course
  const studentCourseAttempt = await request('/courses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: { title: 'Unauthorized Course' }
  });
  assert(studentCourseAttempt.status === 403, 
    'Student calling POST /api/courses is REJECTED with HTTP 403 Forbidden', studentCourseAttempt.status);

  // D. Role Security: Student attempts to delete material
  const studentMaterialDelete = await request(`/materials/${materialId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentMaterialDelete.status === 403, 
    'Student calling DELETE /api/materials/{id} is REJECTED with HTTP 403 Forbidden', studentMaterialDelete.status);

  // E. Ownership Security: Cross-classroom teacher grading
  // Register another teacher who is NOT assigned to this classroom
  const secondTeacherUsername = 'mariateacher_' + Date.now();
  const secondTeacherEmail = `maria_${Date.now()}@example.com`;
  const registerSecondTeacher = await request('/auth/register', {
    method: 'POST',
    body: {
      username: secondTeacherUsername,
      email: secondTeacherEmail,
      password: 'password123',
      role: 'TEACHER'
    }
  });
  assert(registerSecondTeacher.status === 200, 
    'Registered second teacher (not assigned to this classroom)', registerSecondTeacher.data);

  const secondTeacherLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: secondTeacherEmail, password: 'password123' }
  });
  const secondTeacherToken = secondTeacherLogin.data?.token;

  // Second teacher attempts to grade Prakash's classroom submission
  const unauthorizedGradeRes = await request(`/submissions/${activeSubmissionId}/grade`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${secondTeacherToken}` },
    body: { grade: 50, feedback: 'Unauthorized grading' }
  });
  assert(unauthorizedGradeRes.status === 403, 
    'Teacher B grading Teacher A classroom submission is REJECTED with HTTP 403 Forbidden', 
    unauthorizedGradeRes.status);

  // Second teacher attempts to view Prakash's classroom submissions
  const unauthorizedViewSubs = await request(`/assignments/${assignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${secondTeacherToken}` }
  });
  assert(unauthorizedViewSubs.status === 403, 
    'Teacher B viewing Teacher A classroom submissions is REJECTED with HTTP 403 Forbidden', 
    unauthorizedViewSubs.status);

  // F. Admin Controls: Admin can manage users, roles, and classroom materials
  console.log('\n--- Admin Controls Verification ---');
  const allUsersRes = await request('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(allUsersRes.status === 200 && allUsersRes.data.length >= 3, 
    'Admin retrieves list of all users and roles', allUsersRes.data.length);

  const statsRes = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(statsRes.status === 200 && statsRes.data?.report, 
    'Admin retrieves system summary stats report', statsRes.data);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
