const users = []


// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => { // Only allow unique rooms and usernames in that room:
        return user.room === room && user.username === username
    })

    // If it's true then existingUser will get populated with data
        
    // Although we don't want it so we will do so:


    // Validate username
    if (existingUser) {  // If a username exists with the same name, don't let em allow in the chat and give error
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}


// Remove User by id[ When the leave]

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)  // get position of array item

    if (index !== -1) {   // -1 if we don't find match others are 0 and greater if we find
        return users.splice(index, 1)[0] //take the index and remove that user[1 per se]
        //  [0] access first user by it's id
    }  // remove item by index
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}