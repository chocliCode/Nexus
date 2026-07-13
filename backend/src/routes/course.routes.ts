import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listCourses,
  getMyCourses,
  getCourseDetail,
  createCourse,
  openCourse,
  closeCourse,
  joinCourse,
  leaveCourse,
} from '../controllers/course.controller';
import {
  getCourseFeed,
  createCoursePost,
  deleteCoursePost,
  toggleCoursePin,
  addCourseComment,
  deleteCourseComment,
  getCourseStudents,
  getCourseGrades,
  exportCourseGrades,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} from '../controllers/course-classroom.controller';
import { uploadMiddleware, postUploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Catalog & detail
router.get('/', listCourses);
router.get('/mine', getMyCourses);
router.get('/:courseId', getCourseDetail);

// Jedi (teacher) actions
router.post('/', createCourse);
router.post('/:courseId/open', openCourse);
router.post('/:courseId/close', closeCourse);

// Padawan (student) actions
router.post('/:courseId/join', joinCourse);
router.delete('/:courseId/leave', leaveCourse);

// Course Classroom (feed, posts, comments, students)
router.get('/:courseId/feed', getCourseFeed);
router.get('/:courseId/students', getCourseStudents);
router.post('/:courseId/posts', postUploadMiddleware.array('archivos', 5), createCoursePost);
router.delete('/posts/:postId', deleteCoursePost);
router.post('/posts/:postId/pin', toggleCoursePin);
router.post('/posts/:postId/comments', addCourseComment);
router.delete('/comments/:commentId', deleteCourseComment);

// Course Assignments (tareas)
router.post('/posts/:postId/submissions', uploadMiddleware.single('archivo'), submitAssignment);
router.get('/posts/:postId/submissions', getAssignmentSubmissions);
router.put('/submissions/:submissionId/grade', gradeSubmission);

// Course Grades (calificaciones)
router.get('/:courseId/grades', getCourseGrades);
router.get('/:courseId/grades/export', exportCourseGrades);

export default router;

