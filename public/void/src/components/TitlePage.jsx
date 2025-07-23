import '../styles/titlePage.css';

export default function TitlePage() {
  return (
    <section className="title-page">
      <div className="void-title">VOID</div>
      <div className="tagline">A Four-Player Strategy Game of Territorial Acquisition</div>

      <div className="section-divider" />

      <div className="manifesto">
        <h2>Visual Inspirations</h2>
        <ul>
          <li>Chessboard</li>
          <li>Electromagnetism</li>
          <li>Halo 2</li>
         
        </ul>

        <h2>Piece Design</h2>
        <ul>
          <p>Overall Aesthetic:

Stark black and white color scheme with no gradients or shading
Clean, vector-style graphics with precise, mathematical precision
Contemporary, modernist design language

Pattern Categories:

Radial/Concentric Designs: Many shapes feature radiating lines, concentric circles, or spiral patterns (shapes 49, 50, 54, 59, 65, 67, 71)
Geometric Abstractions: Angular, faceted forms with sharp edges and geometric relationships (shapes 51, 56, 63, 72)
Linear Patterns: Flowing lines, waves, and directional elements (shapes 52, 55, 57, 71)
Modular/Grid Systems: Pixelated or tessellated patterns (shapes 53, 57, 64)
Organic Geometrics: Simplified natural forms reduced to geometric essence (shapes 60, 68)
Symbolic Forms: Recognizable symbols abstracted into pure geometry (shape 70's recycling arrows)

Technical Characteristics:

High contrast with solid fills and negative space
Symmetrical or radially balanced compositions
Scalable vector-style construction
No texture or dimensional effects
Consistent line weights and geometric precision</p>
        
         
        </ul>



        <h2>Intended Player Experience</h2>
        <ul>
          <li>Deep Thought</li>
          <li>Strategic Planning</li>
          <li>Bewilderment</li>
          <li>Epic Intellectual Discovery</li>
        </ul>
      </div>
    </section>
  );
}