import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";

const MyEditor = ({ setDraftArea }) => {
  const handleState = () => {
    const savedState = localStorage.getItem("draft");
    if (savedState) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedState))
      );
    } else {
      return EditorState.createEmpty();
    }
  };
  const [editorState, setEditorState] = useState(handleState);

  const handleChange = (newEditorState) => {
    const contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
    const currentBlock = contentState.getBlockForKey(
      selectionState.getStartKey()
    );
    const currentLine = currentBlock.getText();

    // Check if the line starts with #, *, **, or ***
    if (currentLine.startsWith("# ")) {
      // Apply Heading format
      newEditorState = RichUtils.toggleBlockType(newEditorState, "header-one");
    } else if (currentLine.startsWith("* ")) {
      // Apply Bold format
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
    } else if (currentLine.startsWith("** ")) {
      // Apply Red line format
      newEditorState = RichUtils.toggleInlineStyle(
        newEditorState,
        "STRIKETHROUGH"
      );
    } else if (currentLine.startsWith("*** ")) {
      // Apply Red underline format
      const selection = newEditorState.getSelection();
      const currentContent = newEditorState.getCurrentContent();
      const newContentState = Modifier.applyInlineStyle(
        currentContent,
        selection,
        "UNDERLINE"
      );
      newEditorState = EditorState.push(
        newEditorState,
        newContentState,
        "change-inline-style"
      );
    }

    setEditorState(newEditorState);
    setDraftArea(convertToRaw(editorState.getCurrentContent()));
  };

  return (
    <div>
      <Editor editorState={editorState} onChange={handleChange} />
    </div>
  );
};

export default MyEditor;
