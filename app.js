const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dishRouter = require('./src/routes/DishRouter');
const authRouter = require('./src/routes/AuthRouter');
const userRouter = require('./src/routes/UserRouter');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());

app.use('/dishes', dishRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error(err);
});