const socket =io()        // Run connection


//Form Elements in consts:

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('#msg')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages');   // For rendering temps

// Template script:
const messageTemplate = document.querySelector('#message-template').innerHTML;

// Template script: For location
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

// Template script: For SideBar
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// Options
const {username, room} =Qs.parse(location.search, {ignoreQueryPrefix: true}) // Get query params data
// ignoreQueryPrefix: For question mark to go away
 




// For AutoScroll:

const autoscroll = () =>{
    // Get new message Element
    
    const $newMessage = $messages.lastElementChild  // last message sent

    // Height of last/ new message:

    const newMessageStyles = getComputedStyle($newMessage)  // default function
    // contains all the styles applied in our CSS files

    // Get Margin from CSS:

    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // or const lastMessageHeight

    // Visible Height

    const visibleHeight = $messages.offsetHeight

    // Height of messages container:

    const containerHeight = $messages.scrollHeight // get total height we r able to scroll

    //How far have you scrolled:

    const scrollOffset = $messages.scrollTop + visibleHeight // gives the amount of distance we have scrolled from the top


    // See video again for this
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight    // SCroll down
    }
}



socket.on('message', (message) =>{   // Recieve data from server 
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, // Provide value to message in html to display dynamic messages
        createdAt: moment(message.createdAt).format('h:mm a')   // Using moments for a good time format
    })   // Render Template
    $messages.insertAdjacentHTML('beforeend', html)  // Add template stuff inside the div
    autoscroll()    // autoScroll
})

// For location

socket.on('locationMessage', (message) =>{
 
    console.log(message)

    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()    // autoScroll
})



// For sideBar:
// Get all users data
socket.on('roomData',({room, users}) =>{ 
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html;
})


$messageForm.addEventListener("submit", (event) =>{
    event.preventDefault();

    // Disable button while the location loads
    $messageFormButton.setAttribute('disabled', 'disabled') // 'disabled' 2nd args is value name
    
    const welcomeMsg = event.target.elements.msg.value;
    // const welcomeMsg = document.querySelector('#msg').value // Value of input stored in a Const
    
    // socket.emit('sendMsg', welcomeMsg)  // Client sends data to Server this time

    // Same as above with Event acknowledgement
    socket.emit('sendMsg', welcomeMsg, (error) =>{ // 3rd arg for Event Acknowledgement
        
        // Remove the disabled attri. and Enable the button after msg send
        $messageFormButton.removeAttribute('disabled')

        $messageFormInput.value = ''; // clear value of Input after msg send
        $messageFormInput.focus()
        
        if(error) {
            return console.log(error)
        }
        console.log('The message was delievered');
    })
})


// Get Location:

$sendLocationButton.addEventListener('click', () =>{

    if(!navigator.geolocation){
        return alert("Geolocation not supported in your browser");
    }   // Checking if the geoloctn. API is upported in user's browser

    $sendLocationButton.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position) =>{  // Get user's location
        // console.log(position);

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () =>{

            $sendLocationButton.removeAttribute('disabled')

            console.log('Location shared')
        })

    })
    
})

// For Join page:

socket.emit('join', {username, room}, (error) =>{
    if (error) {
        alert(error)
        location.href= "/"      // send them to root html page if error occurs
    }
})


