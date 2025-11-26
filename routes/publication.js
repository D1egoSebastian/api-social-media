const express = require("express");
const router = express.Router();
const UserController = require("../controllers/publication")

//definir rutas
router.get("/prueba-publication", UserController.pruebaPublication)

//Exportar router

module.exports = router;