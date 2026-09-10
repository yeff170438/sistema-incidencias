const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes/index.routes');

const app = express();


// Middleware global

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));


// Todas las rutas
app.use(
    '/api',
    routes
);


// 404

app.use((req,res)=>{

    res.status(404).json({

        mensaje:"Ruta no encontrada"

    });

});


module.exports = app;