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
const detail = async (req, res) => {
try {
        //Sacar el id de la publicacion de la url
    const publicationId = req.params.id;

    //un find sacar la publicacion con el id de la url
    let findPublication = await Publication.findById(publicationId)

    if(!findPublication){
        return res.status(400).send({
                status: "error",
                message: "No se encontro esa publicacion"
            })
    }

    return res.status(200).send({
            status: "succed",
            message: "Ruta de details",
            Publication: findPublication
        })

} catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }


}

//Eliminar publicaciones
const remove = async (req, res) => {

    try {
        //Sacar el id de la publicacion
        const publicationId = req.params.id;

        //Find luego remove.
        let PublicationToRemove = await Publication.findOneAndDelete({"user": req.user.id, "_id": publicationId})

        return res.status(200).send({
                status: "succed",
                message: "Se elimino esta publicacion.",
                Eliminado: PublicationToRemove
            })
    } catch(e){
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        }); 
    }

}

//Listar publicaciones de un usuario

const user = async (req, res) => {

    //sacar el id de usuario
    const userId = req.user.id;

    //Controlar la pagina
    let page = 1

    if(req.params.page){
        page = req.params.page
    }

    let maxperpage = 5;

    //Find, populate, ordenar, paginar

    let Publicaciones = await Publication.find({user: userId})
    .sort("-created_at")
    .populate("user", "-password")

    if(!Publicaciones || Publicaciones.length == 0) {
        return res.status(500).json({
            status: "error",
            message: "No hay publicaciones para mostrar.",
        }); 
    }

    //Devolver res
    return res.status(200).send({
                status: "succed",
                message: "Publicacion del perfil.",
                user: req.user,
                Publicaciones
            })
             
}

//Listar las publicaciones (de quienes sigo) (feed)


//Subir ficheros

//Devolver archivos multimedia imagenes



//Exportar
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user
}