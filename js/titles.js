
export function activate(shader, index) {
    index = index-1
    $('#titles').show()
    console.log('activate', index)
    $('#titles').children().each((i, elem)=> {
        $(elem).hide()
        if(i == index) {
            console.log('show', elem)
            $(elem).show()
        }
    })
}

export function deactivate() {
    $('#titles').hide()
}

export function render(event) {

}

export function noteOn(event) {

}

export function noteOff(event) {

}