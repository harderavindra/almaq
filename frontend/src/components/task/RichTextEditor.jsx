
          

    import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
             "rich-content min-h-[120px] border rounded-b p-3 focus:outline-none " +
          "prose max-w-none " +
          "prose-ul:list-disc prose-ul:pl-6 " +
          "prose-ol:list-decimal prose-ol:pl-6 " +
          "prose-li:my-1",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
        <ToolbarButton
          label="B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="• List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Clear"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />
    </div>
  );
};

const ToolbarButton = ({ label, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 text-sm border rounded ${
      active
        ? "bg-blue-600 text-white"
        : "bg-white hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

export default RichTextEditor;
