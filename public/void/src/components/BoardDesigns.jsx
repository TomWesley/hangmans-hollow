import '../styles/boardDesigns.css';

export default function BoardDesigns() {
  return (
    <section className="board-section">
      <h1 className="glow-title">Board Design Concepts</h1>
      <p className="intro">
        Each board below is balanced so that all four players start with an equal number of tiles.
        In some layouts, neutral gray tiles introduce tactical ambiguity and central contention zones.
        Below are eight experimental board configurations, each offering unique strategic dynamics.
      </p>

      {boards.map((board, idx) => (
        <div className="board-block" key={idx}>
          <h2>{board.title}</h2>
          <div className="board-description">{board.description}</div>
          <div className="board-analysis"><strong>Analysis:</strong> {board.analysis}</div>
        </div>
      ))}
    </section>
  );
}

const boards = [
  {
    title: "1. Classic Quadrant",
    description:
      "Each player begins in one quadrant of the 25x25 board. Borders are crisp and clean, and no neutral tiles exist.",
    analysis:
      "A pure strategy baseline. Territorial expansion begins at the edges and converges at the center. Fog-of-war favors aggressive scouting into enemy lanes."
  },
  {
    title: "2. Neutral Center Zone",
    description:
      "Players begin in quadrants, but a 5x5 neutral zone dominates the center. All must pass through this high-conflict area to reach opposing zones.",
    analysis:
      "Forces early confrontation. Rogues can convert neutral center tiles quickly if supported, while imps scout the midline. Great for proxy flanks."
  },
  {
    title: "3. Cross-Shaped Corridor",
    description:
      "Each player starts in a quadrant, connected by narrow 3-tile wide corridors intersecting in a central hub. Center tiles are neutral.",
    analysis:
      "Creates bottlenecks. Fiends may struggle to navigate, while Sages and Proxies thrive on long-range planning. Positioning becomes paramount."
  },
  {
    title: "4. Spiral Convergence",
    description:
      "Each territory spirals inward with colored lanes wrapping clockwise toward a neutral center spiral.",
    analysis:
      "Encourages non-linear movement. Imp scouting is vital. Sages get creative with firing arcs. Disorients players unfamiliar with radial layouts."
  },
  {
    title: "5. Offset Quadrants",
    description:
      "Quadrants remain, but their inner corners do not touch — leaving a diamond-shaped neutral field at the center.",
    analysis:
      "Early-game avoidance is common. Players can build up stealthily. Great layout for deceptive Fiend strikes or hidden Proxy positioning."
  },
  {
    title: "6. Center Isolation Field",
    description:
      "Each quadrant pushes deep into the center, but a 5-tile-thick gray 'dead zone' cuts off direct contact early on.",
    analysis:
      "Delays mid-game conflict. Forces players to scout and stretch their movement economy. Useful for slow-burn strategies."
  },
  {
    title: "7. Interlocking Teeth",
    description:
      "Each territory juts into others like a sawtooth pattern. There are no neutral tiles; every space belongs to a player.",
    analysis:
      "Maximizes early engagement. Fog-of-war is chaotic. Sages shine when flanked, and Fiends may accidentally overreach."
  },
  {
    title: "8. Centralized Symmetry",
    description:
      "All players start equidistant from a small neutral center cluster surrounded symmetrically by their territories.",
    analysis:
      "Fast-paced control map. Imp mobility and Proxy-Sage synergies define the early skirmishes. Feels like a battle for the throne."
  }
];
