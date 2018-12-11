let parameters = {
    circleSize: 50,
    circleStrokeWidth: 6
}

let noteMin = 21
let noteMax = 108
let noteNumber = 88

let circles = []


export function activate() {
    $(paper.view.element).show()
    paper.project.clear()
}

export function deactivate() {
    paper.project.clear()
    $(paper.view.element).hide()
}

export function render(event) {
    for(let circle of circles) {
        circle.scale(1.01)
    }
}

export function noteOn(event) {
    let data = event.detail
    let circle = new paper.Path.Circle(paper.view.bounds.leftCenter.add(paper.view.size.width * ((data.note.number - noteMin) / noteNumber), 0), data.velocity * parameters.circleSize)
    circle.strokeColor = 'black'
    circle.strokeWidth = data.velocity * parameters.circleStrokeWidth
    circle.data.noteNumber = data.note.number
    circles.push(circle)

    setTimeout(()=> circle.remove(), 5000)
}

export function noteOff(event) {
    let data = event.detail
    // let findNote = (circle)=> {
    //     return circle.data.noteNumber == data.note.number
    // }
    // let circleIndex = circles.findIndex(findNote)
    // if(circleIndex >= 0) {
    //     circles[circleIndex].remove()
    //     circles.splice(circleIndex, 1)
    // }

}
