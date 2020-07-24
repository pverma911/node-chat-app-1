// To generate TimeStamp and store Welcome MEssage individually:
const generateMessage = (username,text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}


// Function for location:

const generateLocationMessage = (username, url) =>{
    return{
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}