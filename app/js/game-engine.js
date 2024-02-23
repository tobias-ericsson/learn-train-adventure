class GameEngine {
  constructor () {
    this.outputElement = document.getElementById('output')
    this.inputElement = document.getElementById('input')
    this.commands = []
    this.currentCommandIndex = -1
    this.gameContent = null
  }

  start () {
    this.print('Welcome to the Text Adventure Game!')
    this.print("Type 'help' for available commands.")
    this.inputElement.focus()
  }

  print (message) {
    this.outputElement.innerHTML += `<p>${message}</p>`
  }

  clearInput () {
    this.inputElement.value = ''
  }

  processCommand (command) {
    this.print(`> ${command}`)
    // Process the command based on game content
    // Example: this.gameContent.processCommand(command);
    this.clearInput()
  }

  handleInput (e) {
    if (e.key === 'Enter') {
      const command = this.inputElement.value.trim()
      if (command !== '') {
        this.commands.push(command)
        this.currentCommandIndex = this.commands.length
        this.processCommand(command)
      }
    } else if (e.key === 'ArrowUp') {
      if (this.currentCommandIndex > 0) {
        this.currentCommandIndex--
        this.inputElement.value = this.commands[this.currentCommandIndex]
      }
    } else if (e.key === 'ArrowDown') {
      if (this.currentCommandIndex < this.commands.length - 1) {
        this.currentCommandIndex++
        this.inputElement.value = this.commands[this.currentCommandIndex]
      } else {
        this.currentCommandIndex = this.commands.length
        this.clearInput()
      }
    }
  }
}

function submitCommand () {
  game.processCommand(document.getElementById('input').value)
}
