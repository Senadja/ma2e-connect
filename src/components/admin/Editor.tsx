import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Undo,
  Redo,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton = ({ onClick, active, children, title }: any) => (
  <Button
    variant={active ? "default" : "ghost"}
    size="sm"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="h-8 w-8 p-0"
    title={title}
  >
    {children}
  </Button>
);

export const Editor = ({ content, onChange, placeholder }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-border bg-secondary/30">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive('bold')}
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive('italic')}
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          active={editor.isActive('underline')}
          title="Souligné"
        >
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          active={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive('orderedList')}
          title="Liste ordonnée"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-4 bg-border mx-1" />

        <MenuButton 
          onClick={() => {
            const url = window.prompt('URL du lien :');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} 
          active={editor.isActive('link')}
          title="Lien"
        >
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        
        <MenuButton 
          onClick={() => {
            const url = window.prompt('URL de l\'image :');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </MenuButton>

        <div className="ml-auto flex items-center gap-1">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>
      
      <div className="p-4 min-h-[300px] prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
