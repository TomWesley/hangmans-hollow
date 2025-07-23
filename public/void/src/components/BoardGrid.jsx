import '../styles/boardGrid.css';
import { useState } from 'react';
import { Shield, Eye, Target, Zap, Crosshair } from 'lucide-react';

const BOARD_SIZE = 25;

const TEAM_COLORS = {
  1: '#0077ff',   // Royal Blue
  2: '#ff8c42',   // Creamsicle Orange
  3: '#00ffab',   // Mint Green
  4: '#ff2ec3',   // Fuchsia
};

const PIECE_ICONS = {
  'sage': <Zap size={14} strokeWidth={2} />,
  'well': <Shield size={14} strokeWidth={2} />,
  'rogue': <Eye size={14} strokeWidth={2} />,
  'fiend': <Crosshair size={14} strokeWidth={2} />,
  'proxy': <Target size={14} strokeWidth={2} />
};

const STARTING_PIECES = [
  { x: 6, y: 6, type: 'sage', team: 1 },
  { x: 6, y: 7, type: 'well', team: 1 },
  { x: 7, y: 6, type: 'rogue', team: 1 },
  { x: 7, y: 7, type: 'proxy', team: 1 },
  { x: 6, y: 8, type: 'fiend', team: 1 },
  { x: 18, y: 6, type: 'sage', team: 2 },
  { x: 18, y: 7, type: 'well', team: 2 },
  { x: 17, y: 6, type: 'rogue', team: 2 },
  { x: 17, y: 7, type: 'proxy', team: 2 },
  { x: 18, y: 8, type: 'fiend', team: 2 },
  { x: 6, y: 18, type: 'sage', team: 3 },
  { x: 6, y: 17, type: 'well', team: 3 },
  { x: 7, y: 18, type: 'rogue', team: 3 },
  { x: 7, y: 17, type: 'proxy', team: 3 },
  { x: 6, y: 16, type: 'fiend', team: 3 },
  { x: 18, y: 18, type: 'sage', team: 4 },
  { x: 18, y: 17, type: 'well', team: 4 },
  { x: 17, y: 18, type: 'rogue', team: 4 },
  { x: 17, y: 17, type: 'proxy', team: 4 },
  { x: 18, y: 16, type: 'fiend', team: 4 },
];

function generateBoard(pieces) {
  const board = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = pieces.find(p => p.x === x && p.y === y);
      let owner = null;
      if (x < 12.5 && y < 12.5) owner = 1;
      else if (x >= 12.5 && y < 12.5) owner = 2;
      else if (x < 12.5 && y >= 12.5) owner = 3;
      else owner = 4;
      row.push({ x, y, owner, piece });
    }
    board.push(row);
  }
  return board;
}

export default function BoardGrid() {
  const [pieces, setPieces] = useState(STARTING_PIECES);
  const [selected, setSelected] = useState(null);
  const board = generateBoard(pieces);

  const handleTileClick = (x, y) => {
    if (selected) {
      const updated = pieces.map(p =>
        p.x === selected.x && p.y === selected.y ? { ...p, x, y } : p
      );
      setPieces(updated);
      setSelected(null);
    } else {
      const piece = pieces.find(p => p.x === x && p.y === y);
      if (piece) setSelected(piece);
    }
  };

  return (
    <section className="grid-section">
      <h1 className="grid-title">Interactive Board with Piece Selection</h1>
      <div className="board-wrapper">
        <div className="board-grid">
          {board.map((row, y) => (
            <div className="row" key={y}>
              {row.map((tile, x) => {
                const isGray = (x + y) % 2 === 0;
                const bg = isGray ? '#2b2b2b' : TEAM_COLORS[tile.owner];
                const isSelected = selected && selected.x === x && selected.y === y;
                return (
                  <div
                    key={x}
                    className={`tile ${isGray ? 'tile-light' : 'tile-colored'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTileClick(x, y)}
                    style={{ backgroundColor: bg }}
                  >
                    {tile.piece && (
                      <div className="icon-wrapper" style={{ '--outline': TEAM_COLORS[tile.piece.team] }}>
                      {PIECE_ICONS[tile.piece.type]}
                    </div>
                    
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
