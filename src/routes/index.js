const userRoutes = require('./UserRoute');
const authRoutes = require('./AuthRoute');
const hospitalRoutes = require('./HospitalRoute');
const specialRoutes = require('./SpecialtyRoute');
const doctorRoutes = require('./DoctorRoute');
const workingScheduleRoutes = require('./WorkingScheduleRoute');
const routes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/hospitals', hospitalRoutes);
    app.use('/api/specialties', specialRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/working-schedules', workingScheduleRoutes);
}
module.exports = routes;