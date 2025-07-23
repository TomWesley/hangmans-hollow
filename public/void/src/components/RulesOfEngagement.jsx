import '../styles/rulesOfEngagement.css';
import {
  Users,
  SquareStack,
  Trophy,
  EyeOff,
  Clock,
  MapPin,
  Shield,
  Radar,
  Target,
  Ghost,
  Zap,
  Move,
  Eye,
  Crosshair
} from 'lucide-react';

export default function RulesOfEngagement() {
  return (
    <section className="rules-section">
      <h1 className="glow-title">Rules of Engagement</h1>

      <div className="section-block">
        <div className="icon-title"><Users size={20} /> Game Overview</div>
        <ul>
          <li><strong>Players:</strong> 4</li>
          <li><strong>Board:</strong> 25x25 square grid (custom layouts may apply)</li>
          <li><strong>Territory:</strong> Each player starts with 1 quadrant</li>
          <li><strong>Colors:</strong> Royal Blue, Creamsicle Orange, Mint Green, Fuchsia</li>
        </ul>
      </div>

      <div className="section-block">
        <div className="icon-title"><Trophy size={20} /> Victory Conditions</div>
        <ul>
          <li>Control 70% of the board</li>
          <li>Or: control the most tiles after 50 full turns</li>
          <li>Tiebreaker: ends when next player breaks the tie via territory swing</li>
        </ul>
      </div>

      <div className="section-block">
        <div className="icon-title"><EyeOff size={20} /> Fog of War</div>
        <ul>
          <li>Players see tiles they own + adjacent to their units (except Fiend)</li>
          <li>Fiend is completely blind — no visibility</li>
          <li>Old information persists, but may be inaccurate</li>
          <li>Player names/colors hidden until game ends</li>
          <li>No scoreboard — players must deduce score by scouting</li>
        </ul>
      </div>

      <div className="section-block">
        <div className="icon-title"><Clock size={20} /> Turn Structure</div>
        <ol>
          <li><strong>Imp Phase:</strong> Spend up to 10 diagonal movement points across imps</li>
          <li><strong>Major Piece Phase:</strong> Move exactly 2 major pieces orthogonally</li>
          <li><strong>Sage Phase:</strong> Fire projectiles if within Well range</li>
        </ol>
      </div>

      <div className="section-block">
  <div className="icon-title"><SquareStack size={20} /> Tile Conversion</div>
  <ul>
    <li><strong>Rogue:</strong> converts enemy tile if it ends turn on it & is within 3 tiles of its own Well</li>
    <li><strong>Sage:</strong> converts tile when projectile kills an imp on unowned or enemy tile</li>
    <li><strong>Fiend:</strong> converts an "X" of 5 tiles (center + 4 diagonals) by killing enemy Imp</li>
    <li><strong>Imps(This is called "A Void"):</strong> if 4 imps surround an enemy tile on all 4 diagonals, instantly convert it to their color</li>
  </ul>
</div>


      <div className="section-block">
        <div className="icon-title"><Radar size={20} /> Pieces</div>
        <h3>Minor Pieces: Imps</h3>
        <ul>
          <li>Start with 3; spawn every other turn (max 7)</li>
          <li>Used for scouting — move <strong>diagonally only</strong></li>
          <li>Max 10 diagonal movement points per turn to distribute</li>
          <li>4 imps occupying the diagonals around a tile converts it</li>
        </ul>

        <h3>Major Pieces: (1 of each per player)</h3>
        <p><Zap size={16} /> <strong>Sage</strong> — <em>3 orthogonal moves</em><br />
          Most powerful piece. Fires up to 3 projectiles if within 3 tiles of any Well.<br />
          Range increases if near 2+ Wells; full-board access near 4.<br />
          Converts tiles by killing imps on neutral/enemy ground.</p>

        <p><Shield size={16} /> <strong>Well</strong> — <em>2 orthogonal moves</em><br />
          Powers nearby Sages and Rogues. Careful positioning is key — opponents benefit from proximity too.</p>

        <p><Eye size={16} /> <strong>Rogue</strong> — <em>1 orthogonal move</em><br />
          Converts tiles by ending turn on enemy tile while within 3 tiles of own Well. Stealth conversion role.</p>

        <p><Target size={16} /> <strong>Proxy</strong> — <em>5 orthogonal moves</em><br />
          Enables Sage to shoot from Proxy’s location if both are near any Well.<br />
          Inherits Sage range/bonus. Perfect for surprise flanks.</p>

        <p><Crosshair size={16} /> <strong>Fiend</strong> — <em>3 orthogonal moves</em><br />
          Blind attacker. Converts a 5-tile X pattern when it kills an enemy Imp.<br />
          Cannot pass through major pieces or allied imps. Must be guided by scouting.</p>
      </div>

      <div className="section-block">
        <div className="icon-title"><MapPin size={20} /> Starting Positions</div>
        <p>Players assign major pieces to 5 fixed tiles at game start: 4 in the center of their quadrant + 1 diagonal toward board center.</p>
      </div>

      <div className="section-block">
        <div className="icon-title"><Ghost size={20} /> Hidden Info Philosophy</div>
        <ul>
          <li>Player identities and colors hidden until match ends</li>
          <li>Prevents bullying skilled players mid-match</li>
          <li>Reinforces importance of scouting and prediction</li>
        </ul>
      </div>
    </section>
  );
}
