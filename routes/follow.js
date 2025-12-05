const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow")
const check = require("../middlewares/auth")


//definir rutas
router.post("/save", check.auth, FollowController.Save)
router.delete("/unfollow/:id", check.auth, FollowController.unfollow)
router.get("/following/:id/:page",check.auth, FollowController.following)
router.get("/following", check.auth,FollowController.following)
router.get("/followers/:id/:page", check.auth,FollowController.followers)
router.get("/followers", check.auth,FollowController.followers)

//Exportar router

module.exports = router;