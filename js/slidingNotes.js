
export let slidingNotes = []


let nSynths = 4
let portamento = 1

let background = null
export function initializeSN() {
	paper.project.clear()


	if(background == null || background.parent != paper.project.activeLayer) {
		background = new paper.Path.Rectangle(paper.view.bounds);
		background.fillColor = 'whitesmoke'
	}

	for(let slidingNote of slidingNotes) {
		slidingNote.path.remove()
	}
	slidingNotes = []

	for(let i=0 ; i<nSynths ; i++) {

		let synth = new Tone.Synth().toMaster()
		synth.portamento = portamento
		synth.envelope.attack = 1
		synth.envelope.sustain = 1
		synth.volume.value = -10

		let slidingNote = new paper.Path()
		slidingNote.strokeColor = 'black'
		slidingNote.strokeWidth = 1

	    let sn = { path: slidingNote, note: 0, on: false, synth: synth, lastUpdate: Date.now() } 
	    slidingNotes.push(sn)
	}

}

let noteMin = Tone.Frequency('A1').toMidi()
let noteMax = Tone.Frequency('C7').toMidi()

let notesToPlay = []
let startTime = null
export function noteOnSN(event) {
	let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    notesToPlay.push({note: noteNumber, velocity: velocity, event: event})

    if(notesToPlay.length < slidingNotes.length) {    	
    	return
    } else {
    	let i = 0
    	
    	console.log("current notes before play:")
    	for(let slidingNote of slidingNotes) {
    		// slidingNote.synth.triggerRelease()
			slidingNote.on = false
			console.log(slidingNote.note)
    	}

    	for(let noteToPlay of notesToPlay) {
    		noteNumber = noteToPlay.note

    		console.log('play ', noteToPlay.note)
    		// find closest note
			let closestNote = null
			let minDist = Number.MAX_VALUE
			
			for(let slidingNote of slidingNotes) {
				if(!slidingNote.on) {
					let dist = Math.abs(slidingNote.note - noteNumber)
					if(dist < minDist) {
						minDist = dist
						closestNote = slidingNote
					}
				}
			}
			console.log('closestNote: ', closestNote.note)
			
		    noteNumber = Math.max(noteNumber, noteMin)
		    noteNumber = Math.min(noteNumber, noteMax)

			closestNote.synth.triggerAttack(Tone.Frequency(noteNumber, 'midi'))
		    closestNote.on = true
		    closestNote.note = noteNumber
			
			let y = (noteNumber-noteMin)/(noteMax-noteMin)
			y = paper.view.bounds.top + y * paper.view.bounds.height

			if(closestNote.y == null) {
				closestNote.y = y
			}

		    var tween = new TWEEN.Tween(closestNote).to({ y: y }, 1000*portamento).easing(TWEEN.Easing.Quadratic.InOut).start()
		    
		  //   tween.onUpdate(()=> {
		  //   	// let now = Date.now()
		  //   	// if( now - closestNote.lastUpdate < 10 ) {
		  //   	// 	return
		  //   	// }
		  //   	// closestNote.lastUpdate = now

				// // closestNote.path.lastSegment.y = closestNote.y

		  //   })

			i++
    	}
    	if(startTime == null) {
    		startTime = Date.now()
    	}
    	notesToPlay = []
    }
}

let notesToRelease = []

export function noteOffSN(event) {
	let data = event.detail
    let noteNumber = data.note.number
    let velocity = data.velocity

    notesToRelease.push({note: noteNumber, velocity: velocity, event: event})

    if(notesToRelease.length < slidingNotes.length) {
    	return
    } else {

    	notesToRelease = []
    }
}

let period = 10.0


export function updateSN() {
    
    if(startTime == null) {
    	return
    }
    let now = Date.now()
    let time = (now - startTime) / 1000
    if(time > period) {
	    for(let slidingNote of slidingNotes) {
	    	slidingNote.path.removeSegments()
	    }
	    startTime = now
	    time = 0
	}
				
	let x = time / period

	x = paper.view.bounds.left + x * paper.view.bounds.width

    for(let slidingNote of slidingNotes) {

		// let y = null
		// if(slidingNote.path.lastSegment != null) {
		// 	y = slidingNote.path.lastSegment.point.y
		// } else {
		// 	y = (slidingNote.note - noteMin)/(noteMax-noteMin)
		// 	y = paper.view.bounds.top + y * paper.view.bounds.height
		// }

		slidingNote.path.add(x, slidingNote.y)
    }


}

export function deactivateSN() {
	startTime = null
    for(let slidingNote of slidingNotes) {
        slidingNote.synth.triggerRelease()
        slidingNote.path.remove()
    }
	if(background) {
		background.remove()
	}
	background = null
}

export function clearSN(){
	paper.project.clear()
	for(let slidingNote of slidingNotes) {
		paper.project.activeLayer.addChild(slidingNote.path)
	}
}