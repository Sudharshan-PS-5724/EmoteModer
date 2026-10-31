export default function BoardPieces({ items = [] }) {
  if (!items.length) return null;
  return <div className="board-piece-preview">{items.slice(0, 4).map((item, index) => (
    item.type === 'image'
      ? <img key={`${item._id || item.id || index}`} src={item.content} alt={item.name || 'Moodboard image'} loading="lazy" referrerPolicy="no-referrer" />
      : item.type === 'color'
        ? <span key={`${item._id || item.id || index}`} className="board-piece-color" style={{ backgroundColor: item.content }} aria-label={`Color ${item.content}`} />
        : <span key={`${item._id || item.id || index}`} className="board-piece-note">{item.content.slice(0, 80)}</span>
  ))}</div>;
}
