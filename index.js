//Importar
const connection = require("./database/connection")
const express = require("express")
const cors = require("cors")

//Mensaje de bienvenida
console.log("API Node para Red Social Iniciada.")



//Crear servidor Node
const app = express();
const puerto = 3900;

//Configurar cors
app.use(cors())

//Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}))

//Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes)
app.use("/api/publication", PublicationRoutes)
app.use("/api/follow", FollowRoutes)

//Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json({
        status: "success",
        mensaje: "Ruta de prueba funcionando!"
    })
})

//Poner servidor en listen (usare metodo asincrono)
async function StartServer() {
    try {
        await connection();
        app.listen(puerto, () => {
            console.log("Servidor en modo listen en el puerto : " + puerto)
        })
    } catch(e){
        console.log("error : " + e)

    }
}

StartServer();