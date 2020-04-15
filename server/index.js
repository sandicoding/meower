const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost/meower');
const mews = db.get('mews');


const filter = new Filter();
filter.addWords('dancok', 'tempek', 'kontol');

app.use(cors());
app.use(express.json());


app.get('/', (req,res) => {
    res.json({
        message : 'Meoww' 
    });
});

app.get('/mews', (req,res,next) => {
    

    mews.find() // dapatkan semua data dari mews
    .then(mews => { // selanjutnya 
        res.json(mews); //isi res dengan json dari data mews yang sudah di dapatkan
    }).catch(next);
});

app.get('/v2/mews', (req,res,next) => {
    let skip = Number(req.query.skip) || 0;
    let limit = Number(req.query.limit) || 10;
    
    mews.find({},{
        skip,
        limit
    }) // dapatkan semua data dari mews
    .then(mews => { // selanjutnya 
        res.json(mews); //isi res dengan json dari data mews yang sudah di dapatkan
    }).catch(next);
});


function isValidMew(mew)
{
    return mew.name && mew.name.toString().trim() !== '' &&
    mew.content && mew.content.toString().trim() !== '';
};

app.use(rateLimit({
    windowMs: 30 * 1000, // 30 second
    max : 1
}));

app.post('/mews', (req,res) => {
    if(isValidMew(req.body))
    {
        // insert to db...
        const mew = {
            name : filter.clean(req.body.name.toString()),
            content : filter.clean(req.body.content.toString()),
            created : new Date()
        };

        
        mews.insert(mew)
            .then(createdMew => {
                res.json(createdMew);
            });
    }else {
        res.status(422);
        res.json({
            message : 'Hey! name and content are required!'
        });
    }
    

});

app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
});