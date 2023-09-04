const express = require('express');
// const crypto = require('crypto');
const { stringify } = require('querystring');
const { userInfo } = require('os');
const cors = require('cors');

// routers
const usersRouter = require('./routes/user');
const noteRouter = require('./routes/note');
const tagRouter = require('./routes/tag');

const app = express();
const port = 3000;


app.use(cors({
    origin: 'http://localhost:5173'
}));

// body-parser 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(usersRouter);
app.use(noteRouter);
app.use(tagRouter);

app.get('/', (req, res) => {
    res.send('Hello, World');
});


app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});

