const Follow = require ("../models/follow")

const followuserIds = async (identityUserId) => {

    //sacar info de seguimiento
    let following = await Follow.find({"user": identityUserId})
    .select({"followed" : 1, "_id": 0});


    let followers = await Follow.find({"followed": identityUserId})
    .select({"user" : 1, "_id": 0});

    //procesar array de identificadores

    let followingClean = [];

    following.forEach(element => {
        followingClean.push(element.followed)
    });

    let followersClean = [];

        followers.forEach(element => {
        followingClean.push(element.user)
    });

    return {
        following: followingClean,
        followers: followersClean
    }
}

const followThisUser = async(identityUserId, profileUserId) => {

        //sacar info de seguimiento
    let following = await Follow.findOne({"user": identityUserId, "followed": profileUserId})


    let follower = await Follow.findOne({"user": profileUserId, "followed": identityUserId})



    return {
        following,
        follower
    }
}


module.exports = {
    followuserIds,
    followThisUser
}