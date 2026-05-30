import api from "./api";

const CourseService = {
  getAll: (params = {}) =>
    api.get("/courses", { params }).then(r => r.data.data),

  getOne: (id) =>
    api.get(`/courses/${id}`).then(r => r.data.data),

  create: (data) =>
    api.post("/courses", data).then(r => r.data),

  update: (id, data) =>
    api.put(`/courses/${id}`, data).then(r => r.data),

  delete: (id) =>
    api.delete(`/courses/${id}`).then(r => r.data),

  enroll: (courseId, studentId) =>
    api.post(`/courses/${courseId}/enroll`, { student_id: studentId }).then(r => r.data),

  unenroll: (courseId, studentId) =>
    api.delete(`/courses/${courseId}/enroll/${studentId}`).then(r => r.data),

  getAvailableStudents: (courseId) =>
    api.get(`/courses/${courseId}/available-students`).then(r => r.data.data.students),
};

export default CourseService;
