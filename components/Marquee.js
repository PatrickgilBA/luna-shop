// The scrolling text strip under the menu.

export default function Marquee({ text }) {
  // The text is repeated so the strip never runs out.
  const repeated = Array(8).fill(text).join("  ✿  ");
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{repeated}  ✿  </span>
        <span>{repeated}  ✿  </span>
      </div>
    </div>
  );
}
