const Publication = require ("../models/publication")

//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controllers/publication.js"
    });
}


//Guardar publicacion
const save = async (req, res) => {
    try {

        //recoger datos del body
        let params = req.body;

        //si no llegan mandar error
        if(!params.text){
            return res.status(400).send({
                status: "error",
                message: "debes enviar algun texto."
            })
        }

        //crear y rellenar el objeto del modelo
        let newPublication = new Publication(params);

        //usuario identificado
        newPublication.user = req.user.id
        

        //Guardar objeto en bd
        let newPost = await newPublication.save();
        if(!newPost){
                return res.status(400).send({
                status: "error",
                message: "No se guardo la publicacion."
            })
        }

        //Devolver respuestas
        return res.status(200).send({
            status: "succed",
            message: "Publicacion Guardada.",
            Post: newPost
        })
    }catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }
}
//Sacar una publicacion

//Eliminar publicaciones

//Listar las publicaciones (de quienes sigo)

//Listar publicaciones de un usuario

//Subir ficheros

//Devolver archivos multimedia imagenes



//Exportar
module.exports = {
    pruebaPublication,
    save
}