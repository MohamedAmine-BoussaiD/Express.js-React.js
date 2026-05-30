import api from "./api";

const StudentService = {
  getAll: (params = {}) =>
    api.get("/students", { params }).then(r => r.data.data),

  getOne: (id) =>
    api.get(`/students/${id}`).then(r => r.data.data.student),

  create: (data) =>
    api.post("/students", data).then(r => r.data),

  update: (id, data) =>
    api.put(`/students/${id}`, data).then(r => r.data),

  delete: (id) =>
    api.delete(`/students/${id}`).then(r => r.data),

  getMajors: () =>
    api.get("/students/majors").then(r => r.data.data.majors),
};

export default StudentService;
