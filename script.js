const INITIAL_BOARD_SIZE = 3

const boardSizeInputElement = document.getElementById('board-size-input')

const boardElement = document.querySelector('.board')
const cellElements = []
const currentAdjacentCellElements = []
const movePresets = []
let pawnElement

let isPawnMoving = false
let isPawnSelected = false

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
  console.log(movePresets)
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
    cell.classList.add('highlighted')
    cell.addEventListener('click', handlePawnMove)
  })
}

const handlePawnMove = (event) => {
  const slideX = event.target.offsetLeft - pawnElement.offsetLeft + ((event.target.offsetWidth - pawnElement.offsetWidth) / 2)
  const slideY = event.target.offsetTop - pawnElement.offsetTop + ((event.target.offsetHeight - pawnElement.offsetHeight) / 2)
  
  removeHighlightedAdjacentCellElements()

  isPawnMoving = true
  pawnElement.style.transform = `translate(${slideX}px, ${slideY}px)`
  
  setTimeout(() => {
    pawnElement.style.transform = ''
    pawnElement.dataset.currentCellId = event.target.dataset.cellId
    event.target.append(pawnElement)
    isPawnMoving = false
  }, 300)
}

const handlePawnClick = () => {
  if (isPawnMoving) return

  if (isPawnSelected) {
    removeHighlightedAdjacentCellElements()
    isPawnSelected = false
    return
  }

  const currentCellId = pawnElement.dataset.currentCellId
  
  movePresets[currentCellId].forEach(cellId => {
    currentAdjacentCellElements.push(cellElements[cellId])
  })

  highlightAdjacentCellElements()
}

function renderBoard(boardSize = INITIAL_BOARD_SIZE) {
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cellElement = document.createElement('div')
    cellElement.dataset.cellId = i
    cellElement.classList.add('cell')
    cellElements.push(cellElement)
    boardElement.append(cellElement)
  }

  const initialPawnCellId = Math.floor((boardSize * boardSize) / 2)

  pawnElement = document.createElement('div')
  pawnElement.classList.add('pawn')
  pawnElement.dataset.currentCellId = initialPawnCellId
  pawnElement.addEventListener('click', handlePawnClick)
  cellElements[initialPawnCellId].append(pawnElement)
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
  movePresets.splice(0, movePresets.length)
  generateMovePresets(boardSize)
  cellElements.splice(0, cellElements.length)
  boardElement.innerHTML = ''
  boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 5rem)`
  boardElement.style.gridTemplateRows = `repeat(${boardSize}, 5rem)`
  renderBoard(boardSize)
})

generateMovePresets(INITIAL_BOARD_SIZE)
renderBoard(INITIAL_BOARD_SIZE)