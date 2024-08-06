const INITIAL_BOARD_SIZE = 4
const PLAYER_COUNT = 2
let pawnPerPlayer = 1

const PAWN_COLORS = [
  '#7f60fb',
  '#f6c90e',
]

const boardSizeInputElement = document.getElementById('board-size-input')
const pawnPerPlayerInputElement = document.getElementById('pawn-input')
const is2PlayerCheckboxElement = document.getElementById('two-player-checkbox')
const resetButtonElement = document.getElementById('reset-button')

const boardElement = document.querySelector('.board')
const cellElements = []
/** @type {HTMLDivElement[]} */
const currentAdjacentCellElements = []
const movePresets = []
const pawnElements = []

let is2Player = false

let isPawnMoving = false
let isPawnSelected = false
let selectedPawnId = -1

function generateMovePresets(boardSize = INITIAL_BOARD_SIZE) {
  let adjacentCellIds = []
  for (let cellId = 0; cellId < boardSize * boardSize; cellId++) {
    if (cellId % boardSize !== 0) adjacentCellIds.push(cellId - 1)
    if (cellId % boardSize !== boardSize - 1) adjacentCellIds.push(cellId + 1)
    if (cellId - boardSize >= 0) adjacentCellIds.push(cellId - boardSize)
    if (cellId + boardSize < boardSize * boardSize) adjacentCellIds.push(cellId + boardSize)
    movePresets.push(adjacentCellIds)
    adjacentCellIds = []
  }
}

function removeHighlightedAdjacentCellElements() {
  currentAdjacentCellElements.forEach(cell => {
    cell?.classList.remove('highlighted')
    cell?.removeEventListener('click', handlePawnMove)
  })
  currentAdjacentCellElements.splice(0, currentAdjacentCellElements.length)
}

function highlightAdjacentCellElements() {
  currentAdjacentCellElements.forEach(cell => {
    if (cell.childElementCount > 0 && cell.firstElementChild.dataset.teamId === pawnElements[selectedPawnId].dataset.teamId) return
    cell.classList.add('highlighted')
    cell.addEventListener('click', handlePawnMove)
  })
}

const handlePawnMove = (event) => {
  const pawnElement = pawnElements[selectedPawnId]
  const slideX = event.target.offsetLeft - pawnElement.offsetLeft + ((event.target.offsetWidth - pawnElement.offsetWidth) / 2)
  const slideY = event.target.offsetTop - pawnElement.offsetTop + ((event.target.offsetHeight - pawnElement.offsetHeight) / 2)
  
  removeHighlightedAdjacentCellElements()
  
  isPawnMoving = true
  pawnElement.style.transform = `translate(${slideX}px, ${slideY}px)`
  
  setTimeout(() => {
    pawnElement.style.transform = ''
    pawnElement.dataset.currentCellId = event.target.dataset.cellId

    if (event.target.childElementCount > 0 && event.target.firstElementChild.dataset.teamId !== pawnElement.dataset.teamId) {
      event.target.firstElementChild.remove()
    }

    event.target.append(pawnElement)
    isPawnMoving = false
    pawnElements[selectedPawnId].classList.remove('selected')
    pawnElements.forEach(pawnElement => {
      pawnElement.style.pointerEvents = 'auto'
    })
    isPawnSelected = false
    selectedPawnId = -1
  }, 300)
}

const handlePawnClick = (event) => {
  if (isPawnMoving) return

  if (isPawnSelected) {
    removeHighlightedAdjacentCellElements()
    pawnElements[selectedPawnId].classList.remove('selected')
    pawnElements.forEach(pawnElement => {
      pawnElement.style.pointerEvents = 'auto'
    })
    isPawnSelected = false
    selectedPawnId = -1
    return
  }

  const currentCellId = event.target.dataset.currentCellId

  pawnElements.forEach(pawnElement => {
    if (pawnElement.dataset.teamId !== event.target.dataset.teamId) {
      pawnElement.style.pointerEvents = 'none'
    }
  })
  
  movePresets[currentCellId].forEach(cellId => {
    currentAdjacentCellElements.push(cellElements[cellId])
  })

  console.log(movePresets[currentCellId])
  
  selectedPawnId = event.target.dataset.pawnId
  highlightAdjacentCellElements()
  isPawnSelected = true
  event.target.classList.add('selected')
}

function renderBoard(boardSize = INITIAL_BOARD_SIZE) {

  movePresets.splice(0, movePresets.length)
  generateMovePresets(boardSize)
  cellElements.splice(0, cellElements.length)
  boardElement.innerHTML = ''
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 5rem)`
  boardElement.style.gridTemplateRows = `repeat(${boardSize}, 5rem)`

  for (let i = 0; i < boardSize * boardSize; i++) {
    const cellElement = document.createElement('div')
    cellElement.dataset.cellId = i
    cellElement.classList.add('cell')
    cellElements.push(cellElement)
    boardElement.append(cellElement)
  }

  pawnElements.forEach(pawnElement => {
    pawnElement.remove()
  })

  pawnElements.splice(0, pawnElements.length)

  if (is2Player) {
    for (let i = 0; i < pawnPerPlayer * PLAYER_COUNT; i++) {
      const pawnElement = document.createElement('div')
      pawnElement.classList.add('pawn')
      pawnElement.dataset.pawnId = i
      pawnElement.dataset.teamId = Math.floor(i / pawnPerPlayer)
      pawnElement.style.backgroundColor = PAWN_COLORS[pawnElement.dataset.teamId]
      pawnElement.dataset.currentCellId = i
      pawnElement.addEventListener('click', handlePawnClick)
      pawnElements.push(pawnElement)
      cellElements[i].append(pawnElement)
    }
  } else {
    for (let i = 0; i < pawnPerPlayer; i++) {
      const pawnElement = document.createElement('div')
      pawnElement.classList.add('pawn')
      pawnElement.dataset.pawnId = i
      pawnElement.dataset.teamId = 0
      pawnElement.style.backgroundColor = PAWN_COLORS[pawnElement.dataset.teamId]
      pawnElement.dataset.currentCellId = i
      pawnElement.addEventListener('click', handlePawnClick)
      pawnElements.push(pawnElement)
      cellElements[i].append(pawnElement)
    }
  }
}

boardSizeInputElement.value = INITIAL_BOARD_SIZE

boardSizeInputElement.addEventListener('input', (event) => {  
  const boardSize = parseInt(event.target.value)
  if (boardSize < 3) {
    event.target.value = 3
    return
  }
  if (boardSize > 5) {
    event.target.value = 5
    return
  }
  renderBoard(boardSize)
})

pawnPerPlayerInputElement.value = pawnPerPlayer

pawnPerPlayerInputElement.addEventListener('input', (event) => {
  const newPawnPerPlayer = parseInt(event.target.value)
  if (newPawnPerPlayer < 1) {
    event.target.value = 1
    return
  }
  if (newPawnPerPlayer > 3) {
    event.target.value = 3
    return
  }
  pawnPerPlayer = newPawnPerPlayer
  renderBoard(parseInt(boardSizeInputElement.value))
})

is2PlayerCheckboxElement.addEventListener('change', (event) => {
  is2Player = event.target.checked
  renderBoard(parseInt(boardSizeInputElement.value))
})

resetButtonElement.addEventListener('click', () => {
  renderBoard(parseInt(boardSizeInputElement.value))
})

renderBoard(INITIAL_BOARD_SIZE)