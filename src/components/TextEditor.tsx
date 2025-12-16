interface TextEditorProps {
  text: string;
  setText: (text: string) => void;
}

function TextEditor({ text, setText }: TextEditorProps) {
  return (
    <div className="w-full h-[60vh] bg-transparent">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Empieza a escribir tu historia..."
        className="w-full h-full p-4 bg-transparent text-gray-800 placeholder-gray-500 font-serif text-lg focus:outline-none resize-none"
        style={{ fontFamily: 'Georgia, Garamond, serif' }}
      />
    </div>
  );
}

export default TextEditor;
