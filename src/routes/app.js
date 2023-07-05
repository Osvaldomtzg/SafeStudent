const express = require('express');
const router = express.Router();

const pool = require('../database');
const helpers = require('../lib/handlebars');
const path = require('path');

const  { isLoggedIn } = require('../lib/auth');
const { Console } = require('console');
const e = require('connect-flash');

//ABRIR RUTA ESTUDIANTE
router.get('/student', isLoggedIn, async (req, res)=>{
    let fecha = new Date();
    const avisos = await pool.query('SELECT * FROM reportes_avisos WHERE id_alumno = ? OR tipo_aviso = "aviso" OR tipo_aviso = "bienvenidaApp" ORDER BY fecha_enviada DESC ', [req.user.id_alumno]);
    const inout = await pool.query('SELECT * FROM registros WHERE id_alumno = ? AND fecha = ?', [req.user.id_alumno, fecha]);
    const inoutArr = inout[0];

    const pdfRoute = `${path.join(__dirname, "../")}boletas/${req.user.id_alumno}/2023/Enero-Junio/`;
    res.render('app/padreHome', { avisos: avisos, inoutArr, pdfRoute });
})

//ABRIR RUTA MENU
router.get('/instituto/menu', isLoggedIn, async (req, res)=>{
    res.render('app/instituto/escuelaHome',);
})

//ABRIR RUTA AVISOS
router.get('/instituto/aviso', isLoggedIn, async (req, res)=>{
    res.render('app/instituto/avisoGeneral',);
})

//ABRIR RUTA REPORTE
router.get('/instituto/reporte', isLoggedIn, (req, res)=>{
    res.render('app/instituto/reporteAlumno',);
})

//ENVIANDO REPORTES O AVISOS
router.post('/instituto/send', isLoggedIn, async (req, res) => {
    let fecha_enviada = new Date();
    let {titulo, contenido, id_alumno} = req.body;
    let tipo_aviso = "";
    if (id_alumno === undefined){
        tipo_aviso = "aviso";
        id_alumno = null;
    }else{
        tipo_aviso = "reporte";
        id_alumno = Number(id_alumno);
    }
    const newAviso = {
        titulo,
        contenido,
        fecha_enviada,
        tipo_aviso,
        id_alumno
    };
    pool.query('INSERT INTO reportes_avisos SET ? ', [newAviso]);
    /* ENVIA SMS */
    /*const telefonos = await pool.query('SELECT telefono FROM padres_tutores');
    let telefonosFinal = [];
    telefonos.forEach((telef) => telefonosFinal.push(telef['telefono']));
    helpers.sendSMS(telefonosFinal, `Estimado padre de familia, ha recibido un nuevo aviso general del CECyTE con el titulo: ${titulo}, para mas informacion ingrese a la plataforma de SafeStudent`);*/
    
    if(id_alumno === null) {
        req.flash('success', 'Aviso Enviado correctamente');
        res.redirect('./aviso')
    }else {
        req.flash('success', 'Reporte Enviado correctamente');
        res.redirect('./reporte');
    }
}); 

//ABRIR RUTA SUBIR BOLETA
router.get('/instituto/boleta', isLoggedIn, (req, res)=>{
    res.render('app/instituto/subirBoleta',);
})

//SUBIENDO BOLETAS
router.post('/instituto/upload', isLoggedIn, (req,res) => {
    let sampleFile;
    let uploadPath;
    let {anio, ciclo_escolar, id_alumno} = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.file;

    uploadPath = `${path.join(__dirname, "../")}boletas/${id_alumno}/${anio}/${ciclo_escolar}/${sampleFile.name}`;
    console.log(uploadPath);
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, async function(err) {
            if (err){
                console.log(err);
              if(err.errno === -2){
                  await helpers.createDir(`${path.join(__dirname, "../")}/boletas/${id_alumno}`); //CREA LA CARPETA, TOCA VOLVER A INTENTAR EL UPLOAD
                  await helpers.createDir(`${path.join(__dirname, "../")}/boletas/${id_alumno}/${anio}`);
                  await helpers.createDir(`${path.join(__dirname, "../")}/boletas/${id_alumno}/${anio}/${ciclo_escolar}`);
                  sampleFile.mv(uploadPath);
                  res.status(200);
                }
/*               console.log('error');
              return res.status(500).send(err); */
            }
        req.flash('success', 'Boleta guardada correctamente');
        res.redirect(`./boleta`);
    });
});

//HISTORIAL ENTRADAS Y SALIDAS
router.get('/student/historial/entradasysalidas', isLoggedIn, (req, res)=>{
    let fecha = new Date();
    res.render('app/historialentradasysalidas');
})

router.post('/student/historial/entradasysalidas', isLoggedIn, async (req, res)=>{
    
    let {fecha} = req.body;

    if (fecha) {
        let resultado = await pool.query('select * from registros where id_alumno = ? AND fecha = ?', [req.user.id_alumno, fecha]);
        console.log(resultado);
        if(resultado.length > 0) {
            resultado[0].fecha = resultado[0].fecha.toDateString();
        }
        res.render('app/historialentradasysalidas', {resultado});
    }else{
        req.flash('message','No ha seleccionado una fecha valida');
        res.redirect('/student/historial/entradasysalidas');
    }


})


module.exports = router;