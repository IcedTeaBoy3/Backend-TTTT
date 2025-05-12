const userRoutes = require('./UserRoute');
const authRoutes = require('./AuthRoute');
const routes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
}
module.exports = routes;