const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')




// dimentions for canvas on screen 
canvas.width = 1024
canvas.height = 576

// values for the map, length is 70 as that is how wide the map is that i made in Tiled so there are 40 rows of 70 tiles each.
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const exitZonesMap = []
for (let i = 0; i < exitZonesData.length; i += 70) {
    exitZonesMap.push(exitZonesData.slice(i, 70 + i))
}


// Setting up boundary for collision blocks
class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}
// Setting up where on the map the character starts
const boundaries = []
const offset = {
    x: -600,
    y: -1050
}

// this states which blocks are Boundaries (collisions)
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 2049)
        boundaries.push(
            new Boundary(
                {position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y
                }
            })
        )
    })
})

const exitZones = []

// this is the Boundaries for the two blocks that are the exit
exitZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 2049)
            exitZones.push(
                new Boundary(
                    {
                        position: {
                            x: j * Boundary.width + offset.x,
                            y: i * Boundary.height + offset.y
                        }
                    })
            )
    })
})


// links to map and character
const image = new Image()
image.src = 'assets/GameMap.png'

const playerUpImage = new Image()
playerUpImage.src = 'assets/playerUp.png'

const playerDownImage = new Image()
playerDownImage.src = 'assets/playerDown.png'

const playerLeftImage = new Image()
playerLeftImage.src = 'assets/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = 'assets/playerRight.png'

// setting up Sprite for character
class Sprite {
    constructor({position, velocity, image, frames = { max: 1}, sprites }) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false
        this.sprites = sprites
    }

    draw() {
        context.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )

        if (!this.moving) return

        
            if (this.frames.max > 1) {
                this.frames.elapsed++
            }

            if (this.frames.elapsed % 15 === 0) {
                if (this.frames.val < this.frames.max - 1) this.frames.val++
                else this.frames.val = 0
            }
        
    }
}


    
// creates Sprite for character and each direction it is facing
const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 2, 
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage,
    }
})


// creates background (map)
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

// this const is to define the keys as not pressed so eventListenrs can detect presses
const keys = {
    ArrowUp: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

const movables = [background, ...boundaries, ...exitZones]

// this function turns the player and exit zone into rectagles that i can ue to activate the exit
function rectangularCollision({rectangle1, rectangle2}) {
    return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}

const exit = {
    initiated: false
}

// *******animation function *********
function animate() {
    const animationId = window.requestAnimationFrame(animate)    
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()        
    })    
    exitZones.forEach(exitZones => {
        exitZones.draw()
    })
    player.draw()

    let moving = true
    player.moving = false

   
    if (exit.initiated) return

     // collision detection exitZones
    if (keys.ArrowUp.pressed || keys.ArrowDown.pressed || keys.ArrowLeft.pressed || keys.ArrowRight.pressed) {        
        for (let i = 0; i < exitZones.length; i++) {
            const exitZone = exitZones[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: exitZone
                })
            ) {
                console.log('activate exit')
                // deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                exit.initiated = true
                gsap.to('#overlappingDiv', { /* This is the activation of the exit scene using the gsap library */
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                // activate a new animation loop
                                animateExit()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4,                                    
                                })
                            }
                        })
                    }
                })
                break
            }
        }
    }
    
    //    player movment
    if (keys.ArrowUp.pressed && lastKey === 'ArrowUp') {
        player.moving = true
        player.image = player.sprites.up

            // collision detection boundaries
        for (let i = 0; i < boundaries.length; i ++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary, 
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 2
                        }
                    }
                })
            ) {
                console.log('colliding')
                moving = false
                break
            }
        }
      

        if (moving)
        movables.forEach(movable => {
            movable.position.y += 2
        })
    } else if (keys.ArrowLeft.pressed && lastKey === 'ArrowLeft') {
        player.moving = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 2,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                console.log('colliding')
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach(movable => {
            movable.position.x += 2
        })
    } else if (keys.ArrowDown.pressed && lastKey === 'ArrowDown') {
        player.moving = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 2
                        }
                    }
                })
            ) {
                console.log('colliding')
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach(movable => {
            movable.position.y -= 2
        })    
    } else if (keys.ArrowRight.pressed && lastKey === 'ArrowRight') {
        player.moving = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x -2,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                console.log('colliding')
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach(movable => {
            movable.position.x -= 2
        })
    }
}
animate()

// Exit cut scene Image
const characterOnBoatImage = new Image()
characterOnBoatImage.src = 'assets/characterOnBoat.png'
const characterOnBoat = new Sprite({
    position: {
        x:0,
        y:0
    },
    image: characterOnBoatImage
})
function animateExit() {
    window.requestAnimationFrame(animateExit)
    characterOnBoat.draw()
}

// EventListener for keyUp
let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.ArrowUp.pressed = true
            lastKey = 'ArrowUp'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            lastKey = 'ArrowLeft'
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = true
            lastKey = 'ArrowDown'
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            lastKey = 'ArrowRight'
            break
    }
    // console.log(keys)
})
// EventListener for keyDown
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = false
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
    }
    // console.log(keys)
})

