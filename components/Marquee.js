// Den rullande textremsan under menyn.

export default function Marquee({ text }) {
  // Texten upprepas så att remsan aldrig tar slut.
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
