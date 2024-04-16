const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0.2)'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

const boundaries = []
const offset = {
    x: -600,
    y: -1050
}

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


const image = new Image()
image.src = 'assets/GameMap.png'

const playerImage = new Image()
playerImage.src = 'assets/playerDown.png'


class Sprite {
    constructor({position, velocity, image, frames = { max: 1} }) {
        this.position = position
        this.image = image
        this.frames = frames

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
    }

    draw() {
        context.drawImage(
            this.image,
            0,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
    }
}


    

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 2, 
        y: canvas.height / 2 - 68 / 2
    },
    image: playerImage,
    frames: {
        max: 4
    }
})


const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const movables = [background, ...boundaries]

function rectangularCollision({rectangle1, rectangle2}) {
    return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}
function animate() {
    window.requestAnimationFrame(animate)    
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()        
    })    
    player.draw()
    

   
    let moving = true
    if (keys.w.pressed && lastKey === 'ArrowUp') {
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
    } else if (keys.a.pressed && lastKey === 'ArrowLeft') {
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
    } else if (keys.s.pressed && lastKey === 'ArrowDown') {
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
    } else if (keys.d.pressed && lastKey === 'ArrowRight') {
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
let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.w.pressed = true
            lastKey = 'ArrowUp'
            break
        case 'ArrowLeft':
            keys.a.pressed = true
            lastKey = 'ArrowLeft'
            break
        case 'ArrowDown':
            keys.s.pressed = true
            lastKey = 'ArrowDown'
            break
        case 'ArrowRight':
           keys.d.pressed = true
            lastKey = 'ArrowRight'
            break
    }
    // console.log(keys)
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.w.pressed = false
            break
        case 'ArrowLeft':
            keys.a.pressed = false
            break
        case 'ArrowDown':
            keys.s.pressed = false
            break
        case 'ArrowRight':
            keys.d.pressed = false
            break
    }
    // console.log(keys)
})

