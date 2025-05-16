const userRoutes = require('./UserRoute');
const authRoutes = require('./AuthRoute');
const hospitalRoutes = require('./HospitalRoute');
// const doctorRoutes = require('./DoctorRoute');
const routes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/hospitals', hospitalRoutes);
    // app.use('/api/doctors', doctorRoutes);
}
module.exports = routes;