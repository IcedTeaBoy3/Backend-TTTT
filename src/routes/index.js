const userRoutes = require('./UserRoute');

const routes = (app) => {
    app.use('/api/users', userRoutes);
}
module.exports = routes;